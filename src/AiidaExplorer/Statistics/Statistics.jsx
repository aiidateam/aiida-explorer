import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Brush,
  Sector
} from 'recharts';
import DatePicker from 'react-datepicker';
import { ClipLoader } from 'react-spinners';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

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
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  console.log(payload)

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

const UserProcessNodesPieChart = ({ selectedUser, apiUrl }) => {
  const [processData, setProcessData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const fetchDataForUser = async (userId) => {
    try {
      const endpoint = userId
        ? `${apiUrl}/nodes/full_types_count?user=${userId}`
        : `${apiUrl}/nodes/full_types_count`;
  
      const response = await axios.get(endpoint);
      const data = response.data;
  
      const totalEntries = data.data.subspaces[1].counter; 
      const processedData = [];
  
      const recursiveProcess = (node) => {
        if (node.full_type && node.full_type.trim().includes("process")) {
          const percentage = ((node.counter / totalEntries) * 100).toFixed(2);
          processedData.push({ 
            type: node.full_type, 
            counter: node.counter,
            label: `${node.label} (${percentage}%, ${node.counter} entries)`
          });
        }
  
        if (node.subspaces && node.subspaces.length > 0) {
          node.subspaces.forEach((subspace) => {
            recursiveProcess(subspace);
          });
        }
      };
  
      recursiveProcess(data.data.subspaces[1]);
      return processedData;
    } catch (error) {
      console.error("Error fetching the data", error);
      return [];
    }
  };
  
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const processNodes = await fetchDataForUser(selectedUser === 'everybody' ? null : selectedUser);
      setProcessData(processNodes);

      setLoading(false);
    };

    fetchData();
  }, [selectedUser, apiUrl]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={processData}
          // label={(entry) => entry.label}
          innerRadius={80}
          outerRadius={120}
          fill="#8884d8"
          dataKey="counter"
          onMouseEnter={onPieEnter}
        >
          {processData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {/* <Tooltip formatter={(value, name) => [`${value} entries`, name]} /> */}
      </PieChart>
    </ResponsiveContainer>
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
  }, [apiUrl]);

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
          const formattedData = Object.entries(responseData.data.ctime_by_day || {}).map(([date, nodes]) => ({
            date,
            nodes
          }));
          setData(formattedData);

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
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mb-6">
        {error && <div className="text-red-500">{error}</div>}
        {loading ? (
          <ClipLoader />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Brush dataKey="date" height={30} stroke="#8884d0" />
              <Bar dataKey="nodes" fill="#8884d0" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className='flex flex-row justify-between'>
        <div className="mb-6 w-1/2 border-r-2 border-gray-300">
          <h3 className="text-xl font-semibold mb-4 text-center">Number of Nodes by Type</h3>
          {loading ? (
            <ClipLoader />
          ) : (
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
          )}
        </div>
        <div className="w-1/2">
          <h3 className="text-xl font-semibold mb-4 text-center">User Process Nodes</h3>
          <UserProcessNodesPieChart selectedUser={selectedUser} apiUrl={apiUrl} />
        </div>
</div>

    </div>
  );
};

export default Statistics;
