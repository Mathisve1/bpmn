import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { StudentData } from '../types';
import { Users, ShieldAlert, Clock, DollarSign, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  data: StudentData[];
}

const KPICard = ({ title, value, icon: Icon, color, subtext, progress }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
    {progress !== undefined && (
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2 mb-1">
            <div className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
    )}
    <p className="text-xs text-slate-400 mt-1">{subtext}</p>
  </div>
);

const DashboardKPI: React.FC<DashboardProps> = ({ data }) => {
  const total = data.length;
  const fraudCases = data.filter(d => d.Verification_Attempts > 3 || d.Identity_Verification_Status === 'Failed').length;
  const fraudRate = ((fraudCases / total) * 100).toFixed(1);

  const waitlistedStudents = data.filter(d => d.Days_On_Waitlist > 0);
  const totalWaitlisted = waitlistedStudents.length;
  const waitlistedAndEnrolled = waitlistedStudents.filter(d => d.Final_Outcome === 'Enrolled').length;
  const waitlistConversion = totalWaitlisted > 0 ? ((waitlistedAndEnrolled / totalWaitlisted) * 100).toFixed(1) : '0';

  const cycleTimes = data.map(d => ({
    id: d.Applicant_ID,
    totalTime: d.Document_Submission_Time + d.Institution_Validation_Time,
    outcome: d.Final_Outcome
  }));
  const avgCycleTime = Math.round(cycleTimes.reduce((acc, c) => acc + c.totalTime, 0) / total);
  
  const bins = [
    { name: '< 20 Days', count: 0 },
    { name: '20-40 Days', count: 0 },
    { name: '40-60 Days', count: 0 },
    { name: '> 60 Days', count: 0 },
  ];
  cycleTimes.forEach(c => {
    if (c.totalTime < 20) bins[0].count++;
    else if (c.totalTime < 40) bins[1].count++;
    else if (c.totalTime < 60) bins[2].count++;
    else bins[3].count++;
  });

  const enrolled = data.filter(d => d.Final_Outcome === 'Enrolled');
  const dunningCases = enrolled.filter(d => d.Payment_Status === 'Delayed' && d.Months_Delayed > 2).length;
  const dunningRate = enrolled.length > 0 ? ((dunningCases / enrolled.length) * 100).toFixed(1) : '0';

  const scholarshipRequests = data.filter(d => d.Scholarship_Requested === 'Yes');
  const avgScholarshipTime = Math.round(scholarshipRequests.reduce((acc, c) => acc + c.Scholarship_Approval_Time, 0) / (scholarshipRequests.length || 1));

  return (
    <div className="space-y-6">
       <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
        <p className="text-purple-700 text-sm font-medium">Dashboard V2: Strategic KPIs</p>
        <p className="text-purple-600 text-xs">Focus on rates, performance ratios, and process efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Identity Fraud Rate" value={`${fraudRate}%`} icon={ShieldAlert} color="bg-red-500 text-red-600" progress={parseFloat(fraudRate)} subtext={`${fraudCases} flagged`} />
        <KPICard title="Waitlist Conversion" value={`${waitlistConversion}%`} icon={Users} color="bg-blue-500 text-blue-600" progress={parseFloat(waitlistConversion)} subtext="Admitted from WL" />
        <KPICard title="Avg Cycle Time" value={`${avgCycleTime} Days`} icon={Clock} color={avgCycleTime > 45 ? "bg-orange-500 text-orange-600" : "bg-emerald-500 text-emerald-600"} subtext="Target: < 45 Days" />
        <KPICard title="Dunning Risk" value={`${dunningRate}%`} icon={AlertTriangle} color={parseFloat(dunningRate) > 5 ? "bg-red-500 text-red-600" : "bg-yellow-500 text-yellow-600"} progress={parseFloat(dunningRate)} subtext="> 2mo arrears" />
        <KPICard title="Schol. Approval" value={`${avgScholarshipTime} Days`} icon={DollarSign} color="bg-purple-500 text-purple-600" subtext="Avg decision time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Process Cycle Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Total time from submission to validation</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <ReferenceLine x="40-60 Days" stroke="red" strokeDasharray="3 3" label="Risk Zone" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Cycle Time vs. Outcome</h3>
          <p className="text-xs text-slate-500 mb-4">Does speed impact acceptance?</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="totalTime" name="Cycle Time" unit="d" />
                <YAxis type="number" dataKey="id" name="ID" hide />
                <ZAxis type="category" dataKey="outcome" name="Status" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Enrolled" data={cycleTimes.filter(c => c.outcome === 'Enrolled')} fill="#10B981" />
                <Scatter name="Rejected/Expired" data={cycleTimes.filter(c => c.outcome !== 'Enrolled')} fill="#EF4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPI;