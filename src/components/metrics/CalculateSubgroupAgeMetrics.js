import { CalculateMetrics } from './CalculateMetrics'; 

export async function CalculateSubgroupAgeMetrics(data,score,threshold) {
    const getAgeGroup = (age) => {
        const a = parseInt(age, 10);
        if (a <= 10) return '0-10';
        if (a <= 20) return '11-20';
        if (a <= 30) return '21-30';
        if (a <= 40) return '31-40';
        if (a <= 50) return '41-50';
        if (a <= 60) return '51-60';
        return '61+';
        };
    
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

  const ageGroupedData = {};

    for (const row of latestData) {
        const group = getAgeGroup(row.Age);
        if (!ageGroupedData[group]) ageGroupedData[group] = [];
        ageGroupedData[group].push(row);
    }
    const ageGroupMetrics = [];

    for (const [ageGroup,groupRows] of Object.entries(ageGroupedData)) {

        const yTrue = groupRows.map(row => row.Actual);
        const yPred = groupRows.map(row => row.Prediction);

        const metrics = await CalculateMetrics(yTrue, yPred);

        ageGroupMetrics.push({
            Subgroup: ageGroup,
            ...metrics
        });
    }

  return ageGroupMetrics;
}
