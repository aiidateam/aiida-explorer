import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList, Brush } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = [
  // Green shades
  '#8FBC8F', '#90EE90', '#3CB371', '#2E8B57', '#006400',
  // Blue shades
  '#87CEFA', '#1E90FF', '#0000CD', '#00008B', '#191970',
  // Orange shades
  '#FFA07A', '#FF7F50', '#FF6347', '#FF4500', '#FF8C00'
];
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Statistics = () => {
  const [data, setData] = useState([]);
  const [types, setTypes] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2019-06-28'));
  const [endDate, setEndDate] = useState(new Date('2019-12-10'));

  useEffect(() => {
    fetch('https://aiida.materialscloud.org/mc3d/api/v4/nodes/statistics')
      .then(response => response.json())
      .then(data => {
        const formattedData = Object.entries(data.data.ctime_by_day).map(([date, nodes]) => ({
          date,
          nodes
        }));
        setData(formattedData);

        const formattedTypes = Object.entries(data.data.types).map(([type, count]) => ({
          type,
          count
        }));
        setTypes(formattedTypes);
      })
      .catch(error => console.error('Error fetching statistics:', error));
  }, []);

  const filteredData = data.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  return (
    <div className="mt-2 p-2 border-2 border-gray-300">
      <h2 className="text-lg font-bold mb-4">Statistics</h2>
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded p-2"
          />
        </div>
      </div>
      <div className="flex  space-x-4">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="nodes" fill="#8884d8" />
              <Brush dataKey="date" height={30} stroke="#8884d8"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1">
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={types}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {
                  types.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
