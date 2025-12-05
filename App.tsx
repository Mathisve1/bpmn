import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Download, 
  Layers,
  Map, // Icon for Journey
} from 'lucide-react';
import { StudentData } from './types';
import { generateMockData, downloadCSV } from './services/dataService';
import DashboardBasic from './components/DashboardBasic';
import DashboardKPI from './components/DashboardKPI';
import DashboardProcess from './components/DashboardProcess';
import StudentTable from './components/StudentTable';
import StudentJourneyExplorer from './components/StudentJourneyExplorer';

type Tab = 'v1' | 'v2' | 'v3' | 'data' | 'journey';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('v3');
  const [data, setData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching/generating data
    const mockData = generateMockData(50);
    setData(mockData);
    setLoading(false);
  }, []);

  const handleDownload = () => {
    downloadCSV(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">University Enrollment BPM</h1>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md text-sm transition-colors border border-slate-700"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Navigation Tabs */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 inline-flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('v1')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'v1'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <LayoutDashboard size={18} />
                V1: Basic
              </button>
              <button
                onClick={() => setActiveTab('v2')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'v2'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Layers size={18} />
                V2: KPI Monitor
              </button>
              <button
                onClick={() => setActiveTab('v3')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'v3'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <LayoutDashboard size={18} />
                V3: Process Owner
              </button>
              <div className="w-px bg-slate-200 mx-1 h-6 self-center hidden sm:block"></div>
              <button
                onClick={() => setActiveTab('journey')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'journey'
                    ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Map size={18} />
                Journey Tracer
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'data'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <TableIcon size={18} />
                Data Table
              </button>
            </div>

            {/* Content Rendering */}
            <div className="animate-fade-in transition-all duration-300">
              {activeTab === 'v1' && <DashboardBasic data={data} />}
              {activeTab === 'v2' && <DashboardKPI data={data} />}
              {activeTab === 'v3' && <DashboardProcess data={data} />}
              {activeTab === 'journey' && <StudentJourneyExplorer data={data} />}
              {activeTab === 'data' && <StudentTable data={data} />}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
