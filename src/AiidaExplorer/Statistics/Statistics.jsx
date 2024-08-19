import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Brush, Sector } from 'recharts';
import DatePicker from 'react-datepicker';
import { ClipLoader } from 'react-spinners';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = [
  '#8FBC8F', '#90EE90', '#3CB371', '#2E8B57', '#006400',
  '#87CEFA', '#1E90FF', '#0000CD', '#00008B', '#191970',
  '#FFA07A', '#FF7F50', '#FF6347', '#FF4500', '#FF8C00'
];

const extractLabel = (nodeType) => {
  if (!nodeType) return '';
  const parts = nodeType.split('.');
  return parts[parts.length - 2];
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize="12" fontWeight="bold">
        {`${extractLabel(payload.type)} ${(percent * 100).toFixed(1)}%`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize="10">
        {`(${value} entries)`}
      </text>
    </g>
  );
};
const Statistics = ({ apiUrl }) => {
  const [data, setData] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date('2019-06-28'));
  const [endDate, setEndDate] = useState(new Date('2019-12-10'));
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState('everybody');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const userData = await response.json();
        setUsers([
          { id: 'everybody', name: 'Everybody' },
          ...userData.data.users.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`.trim()
          }))
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = selectedUser === 'everybody' 
          ? `${apiUrl}/nodes/statistics` 
          : `${apiUrl}/nodes/statistics?user=${selectedUser}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();

        if (responseData && responseData.data) {
          // Update timeline data
          const formattedData = Object.entries(responseData.data.ctime_by_day || {}).map(([date, nodes]) => ({
            date,
            nodes
          }));
          setData(formattedData);

          // Update types data
          if (responseData.data.types) {
            const formattedTypes = Object.entries(responseData.data.types).map(([type, count]) => ({
              type,
              count
            }));
            setTypes(formattedTypes);
          } else {
            setTypes([]);
          }
        } else {
          setData([]);
          setTypes([]);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError(error.message);
        setData([]);
        setTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, selectedUser]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };


  return (
    <div className="mt-2 p-4 border-2 border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Statistics</h2>
      <div className="flex justify-center space-x-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Select User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}

          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader size={50} color="#007bff" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-4">
          Error: {error}. Please try again later.
        </div>
      ) : data.length === 0 && types.length === 0 ? (
        <div className="text-center p-4">
          No data available for the selected user. Please try a different selection.
        </div>
      ) : (
        <div className="flex flex-col space-y-8">
          {/* Bar Chart */}
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h3 className="text-center text-xl font-semibold mb-4">Number of Nodes Created Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="nodes" fill="#4299E1" />
              <Brush dataKey="date" height={30} stroke="#8884d8" />
            </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          {types.length > 0 && (
            <div className="flex-1 bg-white p-4 rounded-lg shadow">
              <h3 className="text-center text-xl font-semibold mb-4">Distribution of Node Types</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={types}
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    onMouseEnter={onPieEnter}
                  >
                    {types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;