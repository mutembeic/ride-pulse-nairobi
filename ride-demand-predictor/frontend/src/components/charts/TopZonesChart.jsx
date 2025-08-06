import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import coreHotspots from '../../core_hotspots.json';

const TopZonesChart = () => {
  // Prepare data for the chart by simplifying names
  const chartData = coreHotspots.map(spot => ({
    name: spot.name.replace(': ', '\n').replace(' Area', ''), // Make names shorter for the chart
    'Total Rides in Dataset': spot.ride_count,
  }));

  return (
    <div className="chart-container">
      <h3 className="text-xl font-semibold mb-4 text-cyan-300">Top 10 Busiest Zones (Historical Data)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 60 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fill: '#A0AEC0', fontSize: 12 }} 
          />
          <YAxis tick={{ fill: '#A0AEC0', fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
            contentStyle={{
              background: '#2D3748',
              border: '1px solid #4A5568',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0' }} />
          <Bar dataKey="Total Rides in Dataset" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopZonesChart;