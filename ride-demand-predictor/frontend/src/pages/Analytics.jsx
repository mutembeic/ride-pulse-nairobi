// src/pages/Analytics.jsx
import { useState } from 'react';
import AnalyticsMap from '../components/AnalyticsMap';
import '../App.css';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('map');

    return (
        <div className="analytics-container">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 hidden sm:block">
                Analytics Dashboard
            </h2>

            <div className="tab-buttons">
                <button onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'active' : ''}>
                    Hotspot Map
                </button>
                <button onClick={() => setActiveTab('chart1')} className={activeTab === 'chart1' ? 'active' : ''}>
                    Bar Chart 1
                </button>
                <button onClick={() => setActiveTab('chart2')} className={activeTab === 'chart2' ? 'active' : ''}>
                    Bar Chart 2
                </button>
            </div>

            <div className="tab-content mt-6">
                {activeTab === 'map' && (
                    <div>
                        <AnalyticsMap />
                    </div>
                )}

                {activeTab === 'chart1' && (
                    <div className="chart-placeholder">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-300">🟩 Top Zones by Ride Volume</h3>
                        <p>This bar chart will compare ride counts by zone.</p>
                    </div>
                )}

                {activeTab === 'chart2' && (
                    <div className="chart-placeholder">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-300">📅 Demand by Time of Day</h3>
                        <p>This chart will show demand trends across different hours.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
