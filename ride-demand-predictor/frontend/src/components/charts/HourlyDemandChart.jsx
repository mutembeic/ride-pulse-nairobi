import React, { useMemo } from 'react'; // Import useMemo
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import hourlyData from '../../hourly_demand.json';

const formatHour = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const HourlyDemandChart = () => {
  const chartData = useMemo(() => hourlyData.map(item => ({
    ...item,
    hourLabel: formatHour(item.hour),
    'Average Rides': parseFloat(item.average_demand.toFixed(2))
  })).sort((a, b) => a.hour - b.hour), []);

  // --- NEW: Logic to find peak hours ---
  const peakHours = useMemo(() => {
    if (chartData.length === 0) return { morning: '', evening: '' };
    
    // Find morning peak (6 AM - 11 AM)
    const morningData = chartData.filter(d => d.hour >= 6 && d.hour < 12);
    const morningPeak = morningData.reduce((max, item) => item['Average Rides'] > max['Average Rides'] ? item : max, morningData[0]);

    // Find evening peak (3 PM - 7 PM)
    const eveningData = chartData.filter(d => d.hour >= 15 && d.hour < 20);
    const eveningPeak = eveningData.reduce((max, item) => item['Average Rides'] > max['Average Rides'] ? item : max, eveningData[0]);

    return {
      morning: formatHour(morningPeak.hour),
      evening: formatHour(eveningPeak.hour)
    };
  }, [chartData]);

  return (
    <div className="chart-container">
      <h3 className="text-xl font-semibold mb-2 text-cyan-300">Average Ride Demand by Hour of Day</h3>
      
      {/* --- NEW: "At a Glance" Card --- */}
      <div className="p-3 mb-6 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center space-x-4">
        <span className="text-2xl">📈</span>
        <div>
          <p className="text-sm text-gray-400">Peak Demand Hours</p>
          <p className="font-bold text-lg text-white">
            Around {peakHours.morning} & {peakHours.evening}
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="hourLabel" tick={{ fill: '#A0AEC0', fontSize: 12 }} padding={{ left: 20, right: 20 }}/>
          <YAxis tick={{ fill: '#A0AEC0', fontSize: 12 }} />
          <Tooltip
            cursor={{ stroke: '#22d3ee', strokeWidth: 1 }}
            contentStyle={{ background: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0' }} />
          <Line type="monotone" dataKey="Average Rides" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#22d3ee' }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyDemandChart;