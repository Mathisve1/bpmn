import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ReferenceLine, ComposedChart
} from 'recharts';
import { StudentData } from '../types';
import { 
  AlertOctagon, Timer, TrendingUp, Wallet, FileWarning, Clock
} from 'lucide-react';

interface DashboardProps {
  data: StudentData[];
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  neutral: '#6B7280',
};

const SectionHeader = ({ title, icon: Icon, description }: any) => (
  <div className="mb-6 border-b border-slate-200 pb-2">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-1.5 bg-slate-100 rounded-md">
        <Icon size={20} className="text-slate-700" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
    <p className="text-sm text-slate-500 ml-9">{description}</p>
  </div>
);

const KPITile = ({ label, value, subValue, trend }: any) => (
  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    {subValue && <p className={`text-xs mt-1 ${trend === 'bad' ? 'text-red-600' : 'text-slate-400'}`}>{subValue}</p>}
  </div>
);

const DashboardProcess: React.FC<DashboardProps> = ({ data }) => {
  // PIPELINE DATA
  const totalApplied = data.length;
  const stepIdentity = data.filter(d => d.Identity_Verification_Status === 'Success').length;
  const stepSanction = data.filter(d => d.Identity_Verification_Status === 'Success' && d.Sanction_Status === 'Cleared').length;
  const stepCapacity = data.filter(d => d.Identity_Verification_Status === 'Success' && d.Sanction_Status === 'Cleared' && d.Capacity_Status !== 'Rejected').length;
  const stepEnrolled = data.filter(d => d.Final_Outcome === 'Enrolled').length;

  const funnelData = [
    { stage: '1. Applied', count: totalApplied },
    { stage: '2. ID Verified', count: stepIdentity },
    { stage: '3. Sanctions Clr', count: stepSanction },
    { stage: '4. Cap. Accepted', count: stepCapacity },
    { stage: '5. Enrolled', count: stepEnrolled },
  ];

  // OPS DATA
  const slaIntegrity = { target: 10, actual: Math.round(data.reduce((acc, d) => acc + d.Integrity_Check_Duration, 0) / totalApplied) };
  const slaDocSub = { target: 14, actual: Math.round(data.reduce((acc, d) => acc + d.Document_Submission_Time, 0) / totalApplied) };
  const slaInstVal = { target: 30, actual: Math.round(data.reduce((acc, d) => acc + d.Institution_Validation_Time, 0) / totalApplied) };
  const slaData = [
    { name: 'Integrity Check', actual: slaIntegrity.actual, target: slaIntegrity.target },
    { name: 'Doc Submission', actual: slaDocSub.actual, target: slaDocSub.target },
    { name: 'Inst. Validation', actual: slaInstVal.actual, target: slaInstVal.target },
  ];
  const waitlistViolations = data.filter(d => d.Days_On_Waitlist > 14).length;
  const integrityViolations = data.filter(d => d.Integrity_Check_Duration > 10).length;
  const validationViolations = data.filter(d => d.Institution_Validation_Time > 30).length;

  // FINANCE DATA
  const enrolledStudents = data.filter(d => d.Final_Outcome === 'Enrolled');
  const delayedPayments = enrolledStudents.filter(d => d.Payment_Status === 'Delayed');
  const criticalArrears = delayedPayments.filter(d => d.Months_Delayed >= 4).length;
  const dunning = delayedPayments.filter(d => d.Months_Delayed >= 2 && d.Months_Delayed < 4).length;
  const onTime = enrolledStudents.length - delayedPayments.length;
  const paymentData = [
    { name: 'On Time', value: onTime, color: COLORS.success },
    { name: 'Dunning', value: dunning, color: COLORS.warning },
    { name: 'Incasso', value: criticalArrears, color: COLORS.danger },
  ];
  const scholarshipData = data.filter(d => d.Scholarship_Requested === 'Yes').map(d => ({ amount: d.Scholarship_Amount, time: d.Scholarship_Approval_Time }));

  return (
    <div className="space-y-12 pb-12">
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4">
        <p className="text-emerald-700 text-sm font-medium">Dashboard V3: Process Owner View</p>
        <p className="text-emerald-600 text-xs">Full end-to-end pipeline health, bottleneck identification, and risk monitoring.</p>
      </div>

      {/* PIPELINE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Pipeline Health" icon={TrendingUp} description="Monitoring conversion from application to enrollment." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
             <KPITile label="Total Applications" value={totalApplied} subValue="100% Volume" />
             <KPITile label="Identity Success" value={`${((stepIdentity/totalApplied)*100).toFixed(1)}%`} subValue={`-${totalApplied - stepIdentity} Failed`} trend="neutral" />
             <KPITile label="Final Enrollment" value={stepEnrolled} subValue={`${((stepEnrolled/totalApplied)*100).toFixed(1)}% Conversion`} trend="good" />
          </div>
          <div className="lg:col-span-2 h-80 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} barSize={30} radius={[0, 4, 4, 0]}>
                   {funnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 4 ? COLORS.success : COLORS.primary} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* OPS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Operational Bottlenecks" icon={Timer} description="SLA tracking and process stagnation analysis." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Cycle Time vs. Target (Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={slaData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" scale="band" width={100} tick={{fontSize: 11}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" name="Actual" fill={COLORS.primary} barSize={20} />
                <Bar dataKey="target" name="Target" fill={COLORS.neutral} barSize={5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 h-fit">
               <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded"><span className="text-2xl font-bold text-red-800 block">{waitlistViolations}</span><span className="text-xs text-red-600">Waitlist Expired</span></div>
               <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded"><span className="text-2xl font-bold text-orange-800 block">{integrityViolations}</span><span className="text-xs text-orange-600">Slow Integrity</span></div>
               <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded col-span-2"><span className="text-2xl font-bold text-yellow-800 block">{validationViolations}</span><span className="text-xs text-yellow-600">Inst. Validation Delays</span></div>
          </div>
        </div>
      </section>

      {/* FINANCE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Financial & Risk Monitor" icon={Wallet} description="Payment and scholarship risks." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 border-r border-slate-100 pr-4">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="col-span-2 h-64 pl-4">
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="time" name="Days to Approve" unit="d" />
                  <YAxis type="number" dataKey="amount" name="Amount" unit="$" />
                  <Tooltip />
                  <Scatter name="Scholarships" data={scholarshipData} fill={COLORS.primary} />
                  <ReferenceLine y={200} stroke={COLORS.warning} strokeDasharray="3 3" />
                  <ReferenceLine y={300} stroke={COLORS.success} strokeDasharray="3 3" />
                </ScatterChart>
             </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardProcess;