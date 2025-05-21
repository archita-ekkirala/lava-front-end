import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

const ASCVDPredictionCsvFromFhir = ( {onCsvReady}) => {
  const [loading, setLoading] = useState(true);

  const FHIR_BASE = sessionStorage.getItem("serverUri");
  const BEARER_TOKEN = sessionStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    Accept: "application/fhir+json",
  };

  const fetchAllPatients = async () => {
    let allPatients = [];
    let nextUrl = `${FHIR_BASE}/Patient?_count=500&identifier=lava_test`;
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
      let url = `${FHIR_BASE}/${type}?subject=Patient/${patientId}`;

      const res = await fetch(url, { headers });
      const bundle = await res.json();
      return [type, (bundle.entry || []).map((e) => e.resource)];
    });

    const results = await Promise.all(fetches);
    return Object.fromEntries(results);
  };

  const generateCSV = (patientsWithResources) => {
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

    // Function to check patient condition
    const checkCondition = (conditions, cond_check) => {

      conditions.forEach((c) => {
        const conditionText = c.code?.text || c.code?.coding?.[0]?.display;
        if (conditionText && conditionText.toLowerCase() === cond_check.toLowerCase()) {
          return true;
        }
      });

      return false;
    };

    function getAgeFromBirthDate(birthDateString) {
      if (!birthDateString) return null;

      const birthDate = new Date(birthDateString);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    }

  
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
      const maxRows = Math.max(total_cholesterol.length, hdl_cholesterol.length, systolic_bp.length);
      for (let i = 0; i < maxRows; i++) {
        const row = { ...baseRow };
  
        // Add the values for each observation in the current row
        row["Birthdate"]= patient.birthDate;
        row["GENDER"]= patient.gender;
        row["Race"]= getRaceFromExtensions(patient.extension);
        row["Total_Cholesterol"] = total_cholesterol[i] || "";
        row["HDL_Cholesterol"] = hdl_cholesterol[i] || "";
        row["Systolic_Blood_Pressure"] = systolic_bp[i] || "";
        row["Conditions"]= getStandardizedConditions(resources.Condition || []);
        row["Medications"] = "";
        row["ASCVD_Actual_Outcome"] = actualOutcome;

        // Add ten-year score calculation
        const patientInfo = {
          age: getAgeFromBirthDate(patient.birthDate), // You’ll need to define getAgeFromBirthDate()
          gender: patient.gender,
          totalCholesterol: total_cholesterol[i],
          hdl: hdl_cholesterol[i],
          systolicBloodPressure: systolic_bp[i],
          relatedFactors: {
            smoker: checkCondition(resources.Condition || [], "Smoker"),
            diabetic: checkCondition(resources.Condition || [], "Diabetic"),
            hypertensive: checkCondition(resources.Condition || [], "On Treatment"),
            race: getRaceFromExtensions(patient.extension) === "African American" ? "aa" : "non-aa",
          }
        };

        const calculateScore = () => {
          if (patientInfo.age < 40 || patientInfo.age > 79) return 0;
              const lnAge = Math.log(patientInfo.age);
              const lnTotalChol = Math.log(patientInfo.totalCholesterol);
              const lnHdl = Math.log(patientInfo.hdl);
              const trlnsbp = patientInfo.relatedFactors.hypertensive ?
                Math.log(parseFloat(patientInfo.systolicBloodPressure)) : 0;
              const ntlnsbp = patientInfo.relatedFactors.hypertensive ?
                0 : Math.log(parseFloat(patientInfo.systolicBloodPressure));
              const ageTotalChol = lnAge * lnTotalChol;
              const ageHdl = lnAge * lnHdl;
              const agetSbp = lnAge * trlnsbp;
              const agentSbp = lnAge * ntlnsbp;
              const ageSmoke = patientInfo.relatedFactors.smoker ? lnAge : 0;

              const isAA = patientInfo.relatedFactors.race === 'aa';
              const isMale = patientInfo.gender === 'male';
              let s010Ret = 0;
              let mnxbRet = 0;
              let predictRet = 0;

              if (isAA && !isMale) {
                s010Ret = 0.95334;
                mnxbRet = 86.6081;
                predictRet = (17.1141 * lnAge) + (0.9396 * lnTotalChol) + (-18.9196 * lnHdl)
                  + (4.4748 * ageHdl) + (29.2907 * trlnsbp) + (-6.4321 * agetSbp) + (27.8197 * ntlnsbp) +
                  (-6.0873 * agentSbp) + (0.6908 * Number(patientInfo.relatedFactors.smoker))
                  + (0.8738 * Number(patientInfo.relatedFactors.diabetic));
              } else if (!isAA && !isMale) {
                s010Ret = 0.96652;
                mnxbRet = -29.1817;
                predictRet = (-29.799 * lnAge) + (4.884 * (lnAge ** 2)) + (13.54 * lnTotalChol) +
                  (-3.114 * ageTotalChol) + (-13.578 * lnHdl) + (3.149 * ageHdl) + (2.019 * trlnsbp) +
                  (1.957 * ntlnsbp) + (7.574 * Number(patientInfo.relatedFactors.smoker)) +
                  (-1.665 * ageSmoke) + (0.661 * Number(patientInfo.relatedFactors.diabetic));
              } else if (isAA && isMale) {
                s010Ret = 0.89536;
                mnxbRet = 19.5425;
                predictRet = (2.469 * lnAge) + (0.302 * lnTotalChol) + (-0.307 * lnHdl) +
                  (1.916 * trlnsbp) + (1.809 * ntlnsbp) + (0.549 * Number(patientInfo.relatedFactors.smoker)) +
                  (0.645 * Number(patientInfo.relatedFactors.diabetic));
              } else {
                s010Ret = 0.91436;
                mnxbRet = 61.1816;
                predictRet = (12.344 * lnAge) + (11.853 * lnTotalChol) + (-2.664 * ageTotalChol) +
                  (-7.99 * lnHdl) + (1.769 * ageHdl) + (1.797 * trlnsbp) + (1.764 * ntlnsbp) +
                  (7.837 * Number(patientInfo.relatedFactors.smoker)) + (-1.795 * ageSmoke) +
                  (0.658 * Number(patientInfo.relatedFactors.diabetic));
              }

              const pct = (1 - (s010Ret ** Math.exp(predictRet - mnxbRet)));
              return Math.round((pct * 100) * 10);
            };

            row["TenYearScore"] = calculateScore();
            flatRows.push(row);
          }
      });
  
    // Create CSV headers dynamically
    const headers = ["Patient_ID", "Birthdate", 
      "GENDER", "Race",  "Total_Cholesterol", "HDL_Cholesterol", "Systolic_Blood_Pressure","Conditions","ASCVD_Actual_Outcome", "TenYearScore" ];
  
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

         // Fetch resources in parallel for each batch
         const batchFetch = Promise.all(
            batch.map(async (patient) => {
              console.log(patient);
              const resources = await fetchPatientResources(patient.id);
              return { patient, resources };
            })
          );

          batches.push(batchFetch);
        }
  
        // Wait for all batch fetches to complete
        const results = await Promise.all(batches);
        
        const allPatientsWithResources = results.flat();
        generateCSV(allPatientsWithResources);
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