import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dailyData from '../../daily_demand.json';

const DailyDemandChart = () => {
  const chartData = dailyData.map(day => ({
    name: day.day_name,
    'Average Rides': parseFloat(day.average_demand.toFixed(2))
  }));

  return (
    <div className="chart-container">
      <h3 className="text-xl font-semibold mb-4 text-cyan-300">Average Daily Ride Demand</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#A0AEC0', fontSize: 12 }} 
          />
          <YAxis tick={{ fill: '#A0AEC0', fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
            contentStyle={{ background: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0' }} />
          <Bar dataKey="Average Rides" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyDemandChart;