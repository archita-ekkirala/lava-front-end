import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#8dd1e1'];

const prepareChartData = (data) =>
    Object.entries(data).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize the label
        value
      }));

const DistributionPieChart = ({ title, data }) => {
    const chartData = prepareChartData(data);
    console.log(data);
    console.log(chartData);
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Adjust the label position closer to the center
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white" // Text color
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12px"
            >
                {value} {/* Display the value */}
            </text>
        );
    };


    return (
        <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom align="left">
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={renderCustomLabel} // Use the custom label function
                        labelLine={false} // Disable the default label line
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '10px',bottom: '20px' }}/>
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );
};


export default DistributionPieChart;
