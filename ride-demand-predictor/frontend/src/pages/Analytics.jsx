import { useState } from 'react';
import AnalyticsMap from '../components/AnalyticsMap';
import TopZonesChart from '../components/charts/TopZonesChart';
import HourlyDemandChart from '../components/charts/HourlyDemandChart';
import DailyDemandChart from '../components/charts/DailyDemandChart'; // Import the new chart
import '../App.css';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('map');

    return (
        <div className="analytics-container bg-gray-900 text-white p-6 h-full overflow-y-auto">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                Historical Data Analytics
            </h2>

            <div className="tab-buttons mb-6">
                <button onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'active' : ''}>
                    Hotspot Map
                </button>
                <button onClick={() => setActiveTab('top_zones')} className={activeTab === 'top_zones' ? 'active' : ''}>
                    Top Zones
                </button>
                <button onClick={() => setActiveTab('hourly_demand')} className={activeTab === 'hourly_demand' ? 'active' : ''}>
                    Demand by Hour
                </button>
                {/* --- NEW TAB BUTTON --- */}
                <button onClick={() => setActiveTab('daily_demand')} className={activeTab === 'daily_demand' ? 'active' : ''}>
                    Demand by Day
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'map' && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-cyan-300">Map of Core Hotspot Zones</h3>
                        <p className="text-gray-400 mb-4">This map shows the top 10 historical hotspots based on the total number of rides in our dataset.</p>
                        <AnalyticsMap />
                    </div>
                )}
                {activeTab === 'top_zones' && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <TopZonesChart />
                    </div>
                )}
                {activeTab === 'hourly_demand' && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <HourlyDemandChart />
                    </div>
                )}
                {/* --- NEW TAB CONTENT --- */}
                {activeTab === 'daily_demand' && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <DailyDemandChart />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
