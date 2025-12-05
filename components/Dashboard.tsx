import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, AreaChart, Area, ReferenceLine,
  ComposedChart, Line
} from 'recharts';
import { StudentData } from '../types';
import { 
  Users, 
  Filter, 
  AlertOctagon, 
  Timer, 
  TrendingUp, 
  Wallet, 
  FileWarning,
  Clock
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
  slate: '#E2E8F0'
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

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  
  // --- SECTION 1 DATA: PIPELINE ---
  const totalApplied = data.length;
  const stepIdentity = data.filter(d => d.Identity_Verification_Status === 'Success').length;
  const stepSanction = data.filter(d => d.Identity_Verification_Status === 'Success' && d.Sanction_Status === 'Cleared').length;
  const stepCapacity = data.filter(d => d.Identity_Verification_Status === 'Success' && d.Sanction_Status === 'Cleared' && d.Capacity_Status !== 'Rejected').length;
  const stepEnrolled = data.filter(d => d.Final_Outcome === 'Enrolled').length;

  const funnelData = [
    { stage: '1. Applied', count: totalApplied, drop: 0 },
    { stage: '2. ID Verified', count: stepIdentity, drop: totalApplied - stepIdentity },
    { stage: '3. Sanctions Clr', count: stepSanction, drop: stepIdentity - stepSanction },
    { stage: '4. Cap. Accepted', count: stepCapacity, drop: stepSanction - stepCapacity },
    { stage: '5. Enrolled', count: stepEnrolled, drop: stepCapacity - stepEnrolled },
  ];

  // --- SECTION 2 DATA: OPERATIONS ---
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

  // --- SECTION 3 DATA: FINANCE & RISK ---
  const enrolledStudents = data.filter(d => d.Final_Outcome === 'Enrolled');
  const delayedPayments = enrolledStudents.filter(d => d.Payment_Status === 'Delayed');
  const criticalArrears = delayedPayments.filter(d => d.Months_Delayed >= 4).length; // Incasso risk
  const dunning = delayedPayments.filter(d => d.Months_Delayed >= 2 && d.Months_Delayed < 4).length;
  const onTime = enrolledStudents.length - delayedPayments.length;

  const paymentData = [
    { name: 'On Time', value: onTime, color: COLORS.success },
    { name: 'Dunning (1-3mo)', value: dunning, color: COLORS.warning },
    { name: 'Incasso (>4mo)', value: criticalArrears, color: COLORS.danger },
  ];

  const scholarshipData = data
    .filter(d => d.Scholarship_Requested === 'Yes')
    .map(d => ({
      amount: d.Scholarship_Amount,
      time: d.Scholarship_Approval_Time,
      status: d.Final_Outcome
    }));

  return (
    <div className="space-y-12 pb-12">
      
      {/* ---------------- SECTION 1: PIPELINE HEALTH ---------------- */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader 
          title="Pipeline Health" 
          icon={TrendingUp} 
          description="Monitoring the conversion funnel from application to enrollment." 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Funnel KPI Cards */}
          <div className="space-y-4">
             <KPITile 
                label="Total Applications" 
                value={totalApplied} 
                subValue="100% Volume" 
             />
             <KPITile 
                label="Identity Success" 
                value={`${((stepIdentity/totalApplied)*100).toFixed(1)}%`} 
                subValue={`-${totalApplied - stepIdentity} Failed Checks`} 
                trend="neutral"
             />
             <KPITile 
                label="Final Enrollment" 
                value={stepEnrolled} 
                subValue={`${((stepEnrolled/totalApplied)*100).toFixed(1)}% Conversion`} 
                trend="good"
             />
          </div>

          {/* Funnel Chart */}
          <div className="lg:col-span-2 h-80 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill={COLORS.primary} barSize={30} radius={[0, 4, 4, 0]}>
                   {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? COLORS.success : COLORS.primary} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>


      {/* ---------------- SECTION 2: OPERATIONAL BOTTLENECKS ---------------- */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader 
          title="Operational Bottlenecks" 
          icon={Timer} 
          description="SLA tracking and process stagnation analysis." 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SLA Performance Chart */}
          <div className="h-80">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Cycle Time vs. Target (Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={slaData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" scale="band" width={100} tick={{fontSize: 11}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" name="Avg Actual Time" fill={COLORS.primary} barSize={20} />
                <Bar dataKey="target" name="SLA Target" fill={COLORS.neutral} barSize={5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Violations Heatmap/Grid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">SLA Violations (Volume)</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 font-medium">Waitlist Expired</span>
                    <AlertOctagon size={18} className="text-red-500"/>
                  </div>
                  <span className="text-2xl font-bold text-red-800">{waitlistViolations}</span>
                  <span className="text-xs text-red-600 block">> 14 Days</span>
               </div>
               
               <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 font-medium">Slow Integrity</span>
                    <FileWarning size={18} className="text-orange-500"/>
                  </div>
                  <span className="text-2xl font-bold text-orange-800">{integrityViolations}</span>
                  <span className="text-xs text-orange-600 block">> 10 Days</span>
               </div>

               <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-700 font-medium">Institution Validation Delays</span>
                    <Clock size={18} className="text-yellow-500"/>
                  </div>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-yellow-800">{validationViolations}</span>
                    <span className="text-sm text-yellow-700 mb-1">cases over 30 days</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>


      {/* ---------------- SECTION 3: FINANCIAL & RISK MONITOR ---------------- */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader 
          title="Financial & Risk Monitor" 
          icon={Wallet} 
          description="Payment collection risks and scholarship anomaly detection." 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Payment Status Donut */}
          <div className="h-64 border-r border-slate-100 pr-4">
             <h3 className="text-sm font-semibold text-slate-700 mb-2 text-center">Payment Collection Status</h3>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
             <div className="text-center mt-[-10px]">
                <p className="text-xs text-slate-500">Critical: {criticalArrears} students > 4 mo.</p>
             </div>
          </div>

          {/* Scholarship Scatter */}
          <div className="col-span-2 h-64 pl-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-700">Scholarship: Amount vs. Approval Time</h3>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> >$200 Flag</span>
                </div>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="time" name="Days to Approve" unit="d" />
                  <YAxis type="number" dataKey="amount" name="Amount" unit="$" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  
                  {/* Valid Amounts */}
                  <Scatter name="Standard" data={scholarshipData.filter(d => d.amount <= 200 || d.amount === 300)} fill={COLORS.primary} />
                  {/* Anomalies */}
                  <Scatter name="Review Needed" data={scholarshipData.filter(d => d.amount > 200 && d.amount !== 300)} fill={COLORS.danger} shape="triangle" />
                  
                  {/* Reference Lines for Rules */}
                  <ReferenceLine y={200} stroke={COLORS.warning} strokeDasharray="3 3" label={{ position: 'insideTopRight',  value: 'Std Limit ($200)', fontSize: 10, fill: COLORS.warning }} />
                  <ReferenceLine y={300} stroke={COLORS.success} strokeDasharray="3 3" label={{ position: 'insideTopRight',  value: 'Exc. Limit ($300)', fontSize: 10, fill: COLORS.success }} />
                </ScatterChart>
             </ResponsiveContainer>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;