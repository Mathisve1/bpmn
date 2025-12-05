import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { StudentData } from '../types';
import { Users, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

interface DashboardProps {
  data: StudentData[];
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];
const PIE_COLORS = ['#3B82F6', '#EF4444', '#F59E0B'];

const KPICard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const DashboardBasic: React.FC<DashboardProps> = ({ data }) => {
  const total = data.length;
  const enrolled = data.filter(d => d.Final_Outcome === 'Enrolled').length;
  const fraud = data.filter(d => d.Final_Outcome === 'Fraud_Blacklist').length;
  const avgValidationTime = Math.round(data.reduce((acc, curr) => acc + curr.Institution_Validation_Time, 0) / total);

  const outcomeData = [
    { name: 'Enrolled', value: enrolled },
    { name: 'Rejected', value: data.filter(d => d.Final_Outcome === 'Rejected').length },
    { name: 'Fraud', value: fraud },
    { name: 'Expired', value: data.filter(d => d.Final_Outcome === 'Expired').length },
  ];

  const capacityData = [
    { name: 'Accepted', value: data.filter(d => d.Capacity_Status === 'Accepted').length },
    { name: 'Rejected', value: data.filter(d => d.Capacity_Status === 'Rejected').length },
    { name: 'Waitlisted', value: data.filter(d => d.Capacity_Status === 'Waitlisted').length },
  ];

  const scatterData = data.map(d => ({
    x: d.Document_Submission_Time,
    y: d.Institution_Validation_Time,
    status: d.Final_Outcome
  }));

  return (
    <div className="space-y-6">
      {/* V1 Header */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700 text-sm font-medium">Dashboard V1: Operational Overview</p>
        <p className="text-blue-600 text-xs">Focus on volume, basic status distribution, and active alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Applicants" value={total} icon={Users} color="bg-blue-500" subtext="Last 6 months" />
        <KPICard title="Enrolled" value={enrolled} icon={CheckCircle2} color="bg-emerald-500" subtext={`${((enrolled/total)*100).toFixed(1)}% Conversion`} />
        <KPICard title="Fraud Detects" value={fraud} icon={AlertOctagon} color="bg-red-500" subtext="Blacklisted IDs" />
        <KPICard title="Avg. Valid. Time" value={`${avgValidationTime} Days`} icon={Clock} color="bg-purple-500" subtext="Goal: < 30 Days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Final Enrollment Outcome</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Capacity & Demand</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={capacityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Process Efficiency (Student vs School)</h3>
           </div>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Doc Submission" unit=" days" />
                <YAxis type="number" dataKey="y" name="Inst Validation" unit=" days" />
                <ZAxis type="category" dataKey="status" name="Outcome" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Applications" data={scatterData} fill="#8884d8">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'Enrolled' ? '#10B981' : entry.status === 'Rejected' ? '#EF4444' : '#6B7280'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-y-auto max-h-[350px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertOctagon size={20} className="text-red-500" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {data.filter(d => d.Payment_Status === 'Delayed' && d.Months_Delayed >= 2).map(d => (
              <div key={d.Applicant_ID} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                <div className="flex justify-between items-start">
                   <span className="font-semibold text-red-700 text-sm">{d.Applicant_ID}</span>
                   <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded-full">{d.Months_Delayed >= 4 ? 'COLLECTION' : 'DUNNING'}</span>
                </div>
                <p className="text-xs text-red-600 mt-1">Payment delayed by {d.Months_Delayed} months.</p>
              </div>
            ))}
            {data.filter(d => d.Days_On_Waitlist > 14).map(d => (
              <div key={d.Applicant_ID} className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
                <span className="font-semibold text-amber-700 text-sm">{d.Applicant_ID}</span>
                <p className="text-xs text-amber-600 mt-1">Waitlist expired ({d.Days_On_Waitlist} days).</p>
              </div>
            ))}
            {data.filter(d => d.Integrity_Check_Duration > 10).map(d => (
              <div key={d.Applicant_ID} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-r-md">
                <span className="font-semibold text-orange-700 text-sm">{d.Applicant_ID}</span>
                <p className="text-xs text-orange-600 mt-1">Integrity check > 10 days ({d.Integrity_Check_Duration}).</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBasic;