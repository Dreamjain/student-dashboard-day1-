import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

function Charts() {
  const data = [
    { name: "Mon", value: 80 },
    { name: "Tue", value: 90 },
    { name: "Wed", value: 75 }
  ];

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📊 Charts</h2>

      <LineChart width={400} height={250} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#6366f1" />
      </LineChart>
    </div>
  );
}

export default Charts;