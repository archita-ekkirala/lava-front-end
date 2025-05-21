import { CalculateMetrics } from './CalculateMetrics';

export async function CalculateSubgroupMetrics(data, selectedFeature,score,threshold) {
  const latestData = data;

  const cleanedData = latestData.map(row => ({
    ...row,
    [selectedFeature]: String(row[selectedFeature])?.trim() || "Other"
  }));

  const subgroups = [...new Set(cleanedData.map(row => row[selectedFeature]))];

  const subgroupMetrics = [];

  for (const value of subgroups) {
    const filteredRows = cleanedData.filter(row => row[selectedFeature] === value);
    console.log(filteredRows)

    if (filteredRows.length >= 2) {
      console.log(score)
      let metrics;
     
      const yTrue = filteredRows.map(row => row.Actual);
      const yPred = filteredRows.map(row => row.Prediction);

      metrics = await CalculateMetrics(yTrue, yPred);

      subgroupMetrics.push({
        Subgroup: value || 'Other',
        ...metrics
      });
    }
  }

  return subgroupMetrics;
}
