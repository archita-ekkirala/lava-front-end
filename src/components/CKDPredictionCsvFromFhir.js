import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

const CKDPredictionCsvFromFhir = ( {onCsvReady}) => {
  const [loading, setLoading] = useState(true);

  const FHIR_BASE = sessionStorage.getItem("serverUri");
  const BEARER_TOKEN = sessionStorage.getItem("token");
  // const PREDICTION_SERVER = "http://54.166.135.219:5000";
  const PREDICTION_SERVER = "http://localhost:5000";

  const headers = {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    Accept: "application/fhir+json",
  };

  const fetchAllPatients = async () => {
    let allPatients = [];
    let nextUrl = `${FHIR_BASE}/Patient?_count=300`;
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

    // Mapping long condition texts to standardized labels
    const conditionMapping = {
      "Hypertensive disorder, systemic arterial (disorder)": "Hypertension",
    };

    // Function to standardize and filter duplicate conditions
    const getStandardizedConditions = (conditions) => {
      const uniqueConditions = new Set();

      conditions.forEach((c) => {
        const conditionText = c.code?.text || c.code?.coding?.[0]?.display;
        const standardizedText = conditionMapping[conditionText] || conditionText;
        uniqueConditions.add(standardizedText);
      });

      return Array.from(uniqueConditions).join("; ");
    };

  
    patientsWithResources.forEach(({ patient, resources }) => {
      const baseRow = {
        Patient_ID: patient.identifier ? patient.identifier[0].value : patient.id
      };
  
      // Collect observations by type (HbA1c, eGFR, UACR)
      const hbA1cValues = [];
      const eGFRValues = [];
      const uacrValues = [];
      let actualOutcome = 0;

      resources.Condition?.forEach((cond) => {
        if (cond.code?.coding?.[0]?.code === "431855005") {
          actualOutcome = 1;
        }
      });
      const predictions = predictionMap.get(patient.identifier ? patient.identifier[0].value : patient.id) || [];

      resources.Observation?.forEach((obs) => {
        if (obs.code?.coding?.[0]?.code === "4548-4") {
          hbA1cValues.push(obs.valueQuantity?.value);
        }
        if (obs.code?.coding?.[0]?.code === "62238-1") {
          eGFRValues.push(obs.valueQuantity?.value);
        }
        if (obs.code?.coding?.[0]?.code === "32294-1") {
          uacrValues.push(obs.valueQuantity?.value);
        }
      });
  
      // Create rows for each set of observations
      const maxRows = Math.max(predictions.length,hbA1cValues.length, eGFRValues.length, uacrValues.length);
      for (let i = 0; i < maxRows; i++) {
        const prediction = predictions[i] || {};
        const row = { ...baseRow };
  
        // Add the values for each observation in the current row
        row["Prediction_Timestamp"]= prediction.prediction_timestamp ?prediction.prediction_timestamp : "3/15/2024";
        row["Predicted_Probability"]= prediction.predicted_prob ? prediction.predicted_prob : "0.21";
        row["Birthdate"]= patient.birthDate;
        row["GENDER"]= patient.gender;
        row["Race"]= getRaceFromExtensions(patient.extension);
        row["HbA1c (%)"] = hbA1cValues[i] || "";
        row["eGFR"] = eGFRValues[i] || "";
        row["UACR"] = uacrValues[i] || "";
        row["Conditions"]= getStandardizedConditions(resources.Condition || []);
        row["Medications"] = "";
        row["CKD_Actual_Outcome"] = actualOutcome;
        row["Predicted_Outcome"]= prediction.predicted_outcome ? prediction.predicted_outcome : 0;
        
        flatRows.push(row);
      }
    });
  
    // Create CSV headers dynamically
    const headers = ["Patient_ID", 
      "Prediction_Timestamp","Predicted_Probability","Birthdate", 
      "GENDER", "Race",  "HbA1c (%)", "eGFR", "UACR","Conditions","CKD_Actual_Outcome","Predicted_Outcome",  ];
  
    // Generate CSV content
    const csvRows = [
      headers, // Header row
      ...flatRows.map((row) =>
        headers.map((header) => row[header] !== undefined ? row[header] : "")
      ),
    ];
  
    // Convert rows to CSV string
    //const csvString = csvRows.map(row => row.join(",")).join("\n");

    if(onCsvReady){
      onCsvReady(csvRows);
      console.log(csvRows.map(row => row.join(",")).join("\n"));
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
  
        const BATCH_SIZE = 10;
        const batches = [];
  
        for (let i = 0; i < patients.length; i += BATCH_SIZE) {
          const batch = patients.slice(i, i + BATCH_SIZE);
  
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

export default CKDPredictionCsvFromFhir;
