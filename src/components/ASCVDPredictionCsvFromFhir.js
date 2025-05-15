import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

const ASCVDPredictionCsvFromFhir = ( {onCsvReady}) => {
  const [loading, setLoading] = useState(true);

  const FHIR_BASE = sessionStorage.getItem("serverUri");
  const BEARER_TOKEN = sessionStorage.getItem("token");
//   const PREDICTION_SERVER = "http://54.166.135.219:5000";
  const PREDICTION_SERVER = "http://localhost:5000";

  const headers = {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    Accept: "application/fhir+json",
  };

  const fetchAllPatients = async () => {
    let allPatients = [];
    let nextUrl = `${FHIR_BASE}/Patient?_count=500`;
    while (nextUrl) {
      const res = await fetch(nextUrl, { headers });
      const bundle = await res.json();
      const entries = bundle.entry || [];
      allPatients = [...allPatients, ...entries.map((e) => e.resource)];

      const nextLink = bundle.link?.find((l) => l.relation === "next");
      nextUrl = nextLink ? nextLink.url : null;
    }
    return allPatients;
  };

  const fetchPatientResources = async (patientId) => {
    const resourceTypes = ["Observation", "Condition"];
    const fetches = resourceTypes.map(async (type) => {
      const res = await fetch(`${FHIR_BASE}/${type}?subject=Patient/${patientId}`, { headers });
      const bundle = await res.json();
      // console.log(bundle)
      return [type, (bundle.entry || []).map((e) => e.resource)];
    });
  
    const results = await Promise.all(fetches);
    return Object.fromEntries(results);
  };

  const fetchPredictionsForPatient = async (patientId) => {
    try {
      const response = await fetch(PREDICTION_SERVER+"/get_prediction_by_patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      });
  
      if (!response.ok) throw new Error("API error");
  
      const data = await response.json();
      return data; // array of predictions
    } catch (err) {
      console.error(`Prediction fetch failed for ${patientId}`, err);
      return [];
    }
  };
  

  const generateCSV = (patientsWithResources,predictionMap) => {
    console.log(predictionMap)
    const flatRows = [];

    // Function to standardize and filter duplicate conditions
    const getStandardizedConditions = (conditions) => {
      const uniqueConditions = new Set();

      conditions.forEach((c) => {
        const conditionText = c.code?.text || c.code?.coding?.[0]?.display;
        uniqueConditions.add(conditionText);
      });

      return Array.from(uniqueConditions).join("; ");
    };

  
    patientsWithResources.forEach(({ patient, resources }) => {
      const baseRow = {
        Patient_ID: patient.identifier ? patient.identifier[0].value : patient.id
      };
  
      // Collect observations by type (HbA1c, eGFR, UACR)
      const total_cholesterol = [];
      const hdl_cholesterol = [];
      const systolic_bp = [];
      let actualOutcome = 0;

      resources.Condition?.forEach((cond) => {
        if (cond.code?.coding?.[0]?.code === "429493009") {
          actualOutcome = 1;
        }
      });
      const predictions = predictionMap.get(patient.identifier ? patient.identifier[0].value : patient.id) || [];

      resources.Observation?.forEach((obs) => {
        if (obs.code?.coding?.[0]?.code === "2093-3") {
          total_cholesterol.push(obs.valueQuantity?.value);
        }
        if (obs.code?.coding?.[0]?.code === "2085-9") {
          hdl_cholesterol.push(obs.valueQuantity?.value);
        }
        if (obs.code?.coding?.[0]?.code === "8480-6") {
          systolic_bp.push(obs.valueQuantity?.value);
        }
      });
  
      // Create rows for each set of observations
      const maxRows = Math.max(predictions.length,total_cholesterol.length, hdl_cholesterol.length, systolic_bp.length);
      for (let i = 0; i < maxRows; i++) {
        const prediction = predictions[i] || {};
        const row = { ...baseRow };
  
        // Add the values for each observation in the current row
        row["Prediction_Timestamp"]= prediction.prediction_timestamp ?prediction.prediction_timestamp : "3/15/2024";
        row["Birthdate"]= patient.birthDate;
        row["GENDER"]= patient.gender;
        row["Race"]= getRaceFromExtensions(patient.extension);
        row["Total_Cholesterol"] = total_cholesterol[i] || "";
        row["HDL_Cholesterol"] = hdl_cholesterol[i] || "";
        row["Systolic_Blood_Pressure"] = systolic_bp[i] || "";
        row["Conditions"]= getStandardizedConditions(resources.Condition || []);
        row["Medications"] = "";
        row["ASCVD_Actual_Outcome"] = actualOutcome;
        row["Predicted_Outcome"]= prediction.predicted_outcome ? prediction.predicted_outcome : 0;
        
        flatRows.push(row);
      }
    });
  
    // Create CSV headers dynamically
    const headers = ["Patient_ID", 
      "Prediction_Timestamp","Birthdate", 
      "GENDER", "Race",  "Total_Cholesterol", "HDL_Cholesterol", "Systolic_Blood_Pressure","Conditions","ASCVD_Actual_Outcome","Predicted_Outcome",  ];
  
    // Generate CSV content
    const csvRows = [
      headers, // Header row
      ...flatRows.map((row) =>
        headers.map((header) => row[header] !== undefined ? row[header] : "")
      ),
    ];
  
    // Convert rows to CSV string
    // const csvString = csvRows.map(row => row.join(",")).join("\n");

    if(onCsvReady){
      onCsvReady(csvRows);
    }
  
    // Trigger download of the CSV file
    // const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = "patients_with_resources.csv";
    // link.click();
  };
  
  function getRaceFromExtensions(extensions = []) {
    const raceExtension = extensions.find(
      ext => ext.url === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
    );
  
    if (!raceExtension?.extension) return "";
  
    const textExtension = raceExtension.extension.find(ext => ext.url === "text");
  
    return textExtension?.valueString || "";
  }
    
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); 
        
        const patients = await fetchAllPatients();
  
        const filteredPatients = patients.filter((patient) =>
            patient.identifier?.some(
                (id) => id.system === "lava" && id.value === "lava_test"
            )
        );

        console.log(filteredPatients)

        const BATCH_SIZE = 10;
        const batches = [];
  
        for (let i = 0; i < filteredPatients.length; i += BATCH_SIZE) {
          const batch = filteredPatients.slice(i, i + BATCH_SIZE);
  
          // Fetch resources and predictions in parallel for each batch
          const batchFetch = Promise.all(
            batch.map(async (patient) => {
              const resources = await fetchPatientResources(patient.id);
              const predictions = patient.identifier
                ? await fetchPredictionsForPatient(patient.identifier[0].value)
                : [];
              return { patient, resources, predictions };
            })
          );
  
          batches.push(batchFetch);
        }
  
        // Wait for all batch fetches to complete
        const results = await Promise.all(batches);
        
        const allPatientsWithResources = results.flat();
        const predictionMap = new Map();
        allPatientsWithResources.forEach(({ patient, predictions }) => {
          if (patient.identifier) {
            predictionMap.set(patient.identifier[0].value, predictions);
          }
        });
  
        generateCSV(allPatientsWithResources, predictionMap);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    run();
  }, []);
  
  return <div>
    {/* {loading ? "Loading and generating CSV..." : "CSV ready for download!"} */}
    {loading && (
  <div
    style={{
     display:'flex',justifyContent:'center',marginTop:'20px'
    }}
  ><CircularProgress /></div>
)}
    </div>;
};

export default ASCVDPredictionCsvFromFhir;
