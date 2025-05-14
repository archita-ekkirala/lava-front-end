import { CalculateMetrics } from "./CalculateMetrics";

function normalizeAndPredict(data, scoreKey, thresholdPercent = 20) {
    console.log(thresholdPercent);
    return data.map(row => {
      const score = parseFloat(row[scoreKey]) / 100; // Convert to 0–1
      return {
        ...row,
        Prediction: score >= (thresholdPercent / 100) ? 1 : 0
      };
    });
  }

export async function CalculateMetricsForScore(data, scoreKey, thresholdPercent = 20) {
    const predictedData = normalizeAndPredict(data, scoreKey, thresholdPercent);
    console.log("predictedData", predictedData);
    const yTrue = predictedData.map(row => parseInt(row.Actual));
    const yPred = predictedData.map(row => row.Prediction);
    const metrics = await CalculateMetrics(yTrue, yPred);
    return metrics;
  }
