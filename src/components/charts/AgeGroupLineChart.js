import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AgeGroupLineChart = ({ data }) => {
    console.log("AgeGroupLineChart");
    console.log(data);

    const legendFormatter = (value) => (
        <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            {value}
        </span>
    );

    return (
        <div style={{ width: '100%' }}>
            <h3 align="left" >
                Subgroup Analysis across AgeGroup
            </h3>
            <div style={{ marginTop: '15%' }}>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data.sort((a, b) => a.Subgroup.localeCompare(b.Subgroup))} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="Subgroup" 
                        type="category" 
                        label={{ value: "Age Group", position: "insideBottomRight", offset: -5 }}
                    />
                    <YAxis
                        domain={[0, 1.2]} 
                        ticks={[0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2]} 
                        label={{ value: "Rate", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip />
                    <Legend formatter={legendFormatter} /> 
                    <Line type="monotone" dataKey="True Positive Rate" stroke="#ff0000" name="True Positive Rate" />
                    <Line type="monotone" dataKey="True Negative Rate" stroke="#00ff00" name="True Negative Rate" />
                    <Line type="monotone" dataKey="False Positive Rate" stroke="#0000ff" name="False Positive Rate" />
                    <Line type="monotone" dataKey="False Negative Rate" stroke="#ff00ff" name="False Negative Rate" />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AgeGroupLineChart;
