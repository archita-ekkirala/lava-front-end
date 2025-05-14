import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer
} from 'recharts';

function transformSubgroupMetricsData(rawData) {

  console.log(rawData)
  const excludeMetrics = ['True Positive', 'True Negative', 'False Positive', 'False Negative', 'ROC Curve', 'Confusion Matrix'];
  const metrics = Object.keys(rawData[0]).filter(key => key !== 'Subgroup' && !excludeMetrics.includes(key));

  return metrics.map(metric => {
    const row = { Metric: metric };
    rawData.forEach(item => {
      row[item.Subgroup] = item[metric];
    });
    return row;
  });
}

const SubgroupBarChart = ({ rawData, selectedFeature }) => {
  console.log(rawData);
  if (!rawData || rawData.length === 0) return null;

  const chartData = transformSubgroupMetricsData(rawData);
  const subgroups = [...new Set(rawData.map(d => d.Subgroup))];

  // Define color schemes for different selectedFeatures
  const colorSchemes = {
    Gender: ["#FF5733", "#33C1FF"], // Example: Colors for Male and Female
    Race: ["#8E44AD", "#27AE60", "#F1C40F", "#E74C3C"], // Example: Colors for different races
    Default: ["#8884d8", "#82ca9d", "#ffc658"], // Fallback colors
  };

  // Get the appropriate color scheme or fallback to Default
  const colors = colorSchemes[selectedFeature] || colorSchemes.Default;

  return (
    <div style={{ width: '100%' }}>
      <h3 align="left">Subgroup Analysis across {selectedFeature}</h3>
      <ResponsiveContainer width="90%" height={500}>
        <BarChart data={chartData} margin={{ top: 60, right: 30, left: 20, bottom: 100 }} style={{ fontSize: '12px' }} >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Metric" angle={-45} textAnchor="end" interval={0} height={100} />
          <YAxis domain={[0, 1.2]} ticks={[0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2]} />
          <Tooltip />
          <Legend verticalAlign="top" layout="horizontal" align="right" wrapperStyle={{ marginTop: "-30px" }} />
          {subgroups.map((subgroup, i) => (
            <Bar
              key={subgroup}
              dataKey={subgroup}
              fill={colors[i % colors.length]} // Cycle through colors
            >
              <LabelList
                dataKey={subgroup}
                position="top"
                style={{ fontSize: '10px' }}
                formatter={(value) => value.toFixed(2)}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubgroupBarChart;

