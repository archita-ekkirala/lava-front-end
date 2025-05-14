import { CalculateMetrics } from './CalculateMetrics'; // adjust import path as needed
import { CalculateMetricsForScore } from './CalculateMetricsForScore';

export async function CalculateSubgroupMetrics(data, selectedFeature,score,threshold) {
  const deduplicatedMap = new Map();

  data.forEach(row => {
    const patientId = row.Patient_ID;
    const currentTimestamp = new Date(row.Prediction_Timestamp);

    if (!deduplicatedMap.has(patientId)) {
      deduplicatedMap.set(patientId, row);
    } else {
      const existing = deduplicatedMap.get(patientId);
      const existingTimestamp = new Date(existing.Prediction_Timestamp);
      if (currentTimestamp > existingTimestamp) {
        deduplicatedMap.set(patientId, row);
      }
    }
  });

  const latestData = Array.from(deduplicatedMap.values());

  const cleanedData = latestData.map(row => ({
    ...row,
    [selectedFeature]: row[selectedFeature]?.trim() || "Other"
  }));
  console.log(cleanedData+"selectedFeature"+selectedFeature)

  const subgroups = [...new Set(cleanedData.map(row => row[selectedFeature]))];
  console.log("sub----")
  console.log(subgroups)

  const subgroupMetrics = [];

  for (const value of subgroups) {
    console.log(value)
    const filteredRows = cleanedData.filter(row => row[selectedFeature] === value);
    console.log(filteredRows)

    if (filteredRows.length >= 2) {
      let metrics;
      if(score){
        metrics = await CalculateMetricsForScore(filteredRows, "TenYearScore", threshold);
      }else{
        const yTrue = filteredRows.map(row => row.Actual);
        const yPred = filteredRows.map(row => row.Prediction);

        metrics = await CalculateMetrics(yTrue, yPred);
      }
      subgroupMetrics.push({
        Subgroup: value || 'Other',
        ...metrics
      });

    }
  }

  console.log(subgroupMetrics)
  return subgroupMetrics;
}
