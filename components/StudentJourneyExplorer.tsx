import React, { useState, useMemo } from 'react';
import { StudentData } from '../types';
import { 
  Search, User, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, 
  ShieldCheck, ShieldAlert, Building, FileText, Wallet, ArrowRight, ArrowRightCircle
} from 'lucide-react';

interface Props {
  data: StudentData[];
}

// Helper to add days to a date string
const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setDate(date.getDate() + Math.ceil(days));
  return date.toISOString().split('T')[0];
};

const StudentJourneyExplorer: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return data
      .filter(d => d.Applicant_ID.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [data, searchTerm]);

  const handleSelect = (student: StudentData) => {
    setSelectedStudent(student);
    setSearchTerm(student.Applicant_ID);
    setShowSuggestions(false);
  };

  // Timeline rendering logic (similar to modal but expanded)
  const renderTimeline = () => {
    if (!selectedStudent) return null;

    const s = selectedStudent;
    
    // Calculate Dates
    // 1. Application & Identity (Instant)
    const d_app = s.Date_Applied;
    
    // 2. Sanctions (Starts after app)
    const d_sanc_start = d_app;
    const d_sanc_end = addDays(d_sanc_start, s.Integrity_Check_Duration);
    
    // 3. Capacity (Starts after Sanctions)
    const d_cap_start = d_sanc_end;
    const d_cap_end = addDays(d_cap_start, s.Days_On_Waitlist);
    
    // 4. Submission (Starts after Capacity confirmed)
    const d_sub_start = d_cap_end;
    const d_sub_end = addDays(d_sub_start, s.Document_Submission_Time);
    
    // 5. Validation (Starts after Submission)
    const d_val_start = d_sub_end;
    const d_val_end = addDays(d_val_start, s.Institution_Validation_Time);

    // 6. Final (Ends at Validation end)
    const d_final = d_val_end;

    const steps = [
      {
        title: "Application Received",
        start: d_app,
        end: d_app,
        actor: "Student",
        status: "Success",
        duration: 0,
        deadline: 0,
        icon: FileText,
        detail: "Initial application submitted via portal."
      },
      {
        title: "Identity Verification",
        start: d_app,
        end: d_app,
        actor: "System",
        status: s.Identity_Verification_Status === 'Success' ? (s.Verification_Attempts > 3 ? 'Warning' : 'Success') : 'Failed',
        duration: 0,
        deadline: 0,
        icon: ShieldCheck,
        detail: `Attempts: ${s.Verification_Attempts}. Status: ${s.Identity_Verification_Status}.`
      },
      {
        title: "Sanctions & Integrity",
        start: d_sanc_start,
        end: d_sanc_end,
        actor: "University",
        status: s.Sanction_Status === 'Cleared' ? (s.Integrity_Check_Duration > 10 ? 'Warning' : 'Success') : 'Failed',
        duration: s.Integrity_Check_Duration,
        deadline: 10,
        icon: ShieldAlert,
        detail: `Outcome: ${s.Sanction_Status}. Check duration: ${s.Integrity_Check_Duration} days.`
      },
      {
        title: "Capacity Check",
        start: d_cap_start,
        end: d_cap_end,
        actor: "University",
        status: s.Capacity_Status === 'Accepted' ? 'Success' : (s.Capacity_Status === 'Rejected' ? 'Failed' : 'Warning'),
        duration: s.Days_On_Waitlist,
        deadline: 14,
        icon: Building,
        detail: `Status: ${s.Capacity_Status}. Waitlist time: ${s.Days_On_Waitlist} days.`
      },
      {
        title: "Document Submission",
        start: d_sub_start,
        end: d_sub_end,
        actor: "Student",
        status: s.Document_Submission_Time > 14 ? 'Warning' : 'Success',
        duration: s.Document_Submission_Time,
        deadline: 14,
        icon: FileText,
        detail: `Time taken to submit docs: ${s.Document_Submission_Time} days.`
      },
      {
        title: "Institution Validation",
        start: d_val_start,
        end: d_val_end,
        actor: "University",
        status: s.Institution_Validation_Time > 30 ? 'Warning' : 'Success',
        duration: s.Institution_Validation_Time,
        deadline: 30,
        icon: Building,
        detail: `Validation process duration: ${s.Institution_Validation_Time} days.`
      },
      {
        title: `Final Outcome: ${s.Final_Outcome}`,
        start: d_final,
        end: d_final,
        actor: "System",
        status: s.Final_Outcome === 'Enrolled' ? 'Success' : 'Failed',
        duration: 0,
        deadline: 0,
        icon: s.Final_Outcome === 'Enrolled' ? CheckCircle2 : XCircle,
        detail: s.Final_Outcome === 'Enrolled' 
          ? `Payment: ${s.Payment_Status}. Scholarship: ${s.Scholarship_Requested === 'Yes' ? `$${s.Scholarship_Amount}` : 'None'}.` 
          : "Enrollment process terminated."
      }
    ];

    // Determine active steps based on outcome
    let activeSteps = steps;
    if (s.Identity_Verification_Status === 'Failed') activeSteps = steps.slice(0, 2);
    else if (s.Sanction_Status === 'Blocked') activeSteps = steps.slice(0, 3);
    else if (s.Capacity_Status === 'Rejected') activeSteps = steps.slice(0, 4);

    return (
      <div className="relative">
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200"></div>
        <div className="space-y-8">
          {activeSteps.map((step, idx) => {
            const isLast = idx === activeSteps.length - 1;
            let color = 'bg-slate-100 text-slate-500 border-slate-200';
            if (step.status === 'Success') color = 'bg-emerald-100 text-emerald-600 border-emerald-200';
            if (step.status === 'Warning') color = 'bg-amber-100 text-amber-600 border-amber-200';
            if (step.status === 'Failed') color = 'bg-red-100 text-red-600 border-red-200';
            
            // Override for final step
            if (isLast && s.Final_Outcome === 'Enrolled') color = 'bg-blue-600 text-white border-blue-600';

            return (
              <div key={idx} className="relative flex gap-6 group">
                {/* Icon Bubble */}
                <div className={`relative z-10 w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center border-4 bg-white ${color.split(' ')[2]}`}>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                      <step.icon size={20} />
                   </div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 text-lg">{step.title}</h3>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                step.actor === 'Student' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                step.actor === 'University' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                                {step.actor}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                           <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                             <Calendar size={14} className="text-slate-400"/> 
                             <span className="font-mono text-xs">{step.start}</span>
                           </span>
                           {step.duration > 0 && (
                             <>
                               <ArrowRight size={12} className="text-slate-300" />
                               <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                 <Calendar size={14} className="text-slate-400"/>
                                 <span className="font-mono text-xs">{step.end}</span>
                               </span>
                             </>
                           )}
                        </div>
                     </div>
                     
                     {step.duration > 0 && (
                        <div className="text-right">
                           <div className="flex items-center justify-end gap-1 font-mono text-lg font-bold text-slate-700">
                              <Clock size={16} className="text-slate-400"/>
                              {step.duration}d
                           </div>
                           {step.deadline > 0 && (
                               <p className={`text-xs ${step.duration > step.deadline ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                   SLA: {step.deadline}d
                               </p>
                           )}
                        </div>
                     )}
                  </div>
                  <p className="text-slate-600 mt-2">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Search Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Student Journey Tracer</h2>
        <p className="text-slate-500">Search for an Applicant ID to visualize their specific enrollment process path.</p>
        
        <div className="relative max-w-md mx-auto">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                placeholder="Enter Applicant ID (e.g. APP-1001)..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                    if (e.target.value === '') setSelectedStudent(null);
                }}
              />
           </div>
           
           {/* Autocomplete Dropdown */}
           {showSuggestions && searchTerm && suggestions.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                {suggestions.map(s => (
                  <div 
                    key={s.Applicant_ID}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                    onClick={() => handleSelect(s)}
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            <User size={14}/>
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">{s.Applicant_ID}</p>
                            <p className="text-xs text-slate-500">{s.Final_Outcome}</p>
                        </div>
                     </div>
                     <ArrowRight size={16} className="text-slate-300"/>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           {/* Left Sidebar: Student Profile */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
                 <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <User size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedStudent.Applicant_ID}</h2>
                    <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium border ${
                        selectedStudent.Final_Outcome === 'Enrolled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        selectedStudent.Final_Outcome === 'Rejected' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {selectedStudent.Final_Outcome.replace('_', ' ')}
                    </span>
                 </div>
                 
                 <div className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-slate-500 text-sm flex items-center gap-2"><Wallet size={16}/> Payment</span>
                       <span className={`font-medium text-sm ${selectedStudent.Payment_Status === 'Delayed' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {selectedStudent.Payment_Status}
                       </span>
                    </div>
                    {selectedStudent.Scholarship_Requested === 'Yes' && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm flex items-center gap-2"><CheckCircle2 size={16}/> Scholarship</span>
                            <span className="font-medium text-sm text-slate-800">${selectedStudent.Scholarship_Amount}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                       <span className="text-slate-500 text-sm flex items-center gap-2"><Clock size={16}/> Waitlist</span>
                       <span className="font-medium text-sm text-slate-800">{selectedStudent.Days_On_Waitlist} days</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Content: Timeline */}
           <div className="lg:col-span-2">
              {renderTimeline()}
           </div>
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
           <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <Search size={40} />
           </div>
           <p className="text-lg text-slate-500 font-medium">No student selected</p>
           <p className="text-slate-400">Please select a student from the search bar above to view their details.</p>
        </div>
      )}
    </div>
  );
};

export default StudentJourneyExplorer;
