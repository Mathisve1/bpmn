import React, { useState, useMemo } from 'react';
import { StudentData } from '../types';
import { 
  Search, AlertTriangle, ShieldCheck, ShieldAlert, Filter, 
  ArrowUpDown, ArrowUp, ArrowDown, X, Eye, 
  UserCheck, Building, FileText, Wallet, CheckCircle2, XCircle, Clock, CalendarDays
} from 'lucide-react';

interface Props {
  data: StudentData[];
}

type SortKey = keyof StudentData;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// Helper to add days to a date string
const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setDate(date.getDate() + Math.ceil(days));
  return date.toISOString().split('T')[0];
};

// --- SUB-COMPONENT: Student Journey Modal ---
const StudentDetailModal = ({ student, onClose }: { student: StudentData; onClose: () => void }) => {
  if (!student) return null;

  // Timeline Dates Calculation
  const d_applied = student.Date_Applied;
  // Identity is instant
  const d_sanction_start = d_applied;
  const d_sanction_end = addDays(d_sanction_start, student.Integrity_Check_Duration);
  
  // Capacity check happens after sanctions cleared
  const d_capacity_start = d_sanction_end;
  const d_capacity_end = addDays(d_capacity_start, student.Days_On_Waitlist);
  
  // Doc submission starts after capacity accepted
  const d_submission_start = d_capacity_end;
  const d_submission_end = addDays(d_submission_start, student.Document_Submission_Time);

  // Validation starts after submission
  const d_validation_start = d_submission_end;
  const d_validation_end = addDays(d_validation_start, student.Institution_Validation_Time);

  const getTimelineItem = (
    title: string, 
    date: string,
    actor: 'Student' | 'University' | 'System', 
    duration: number | null, 
    deadline: number | null,
    status: 'Success' | 'Failed' | 'Warning' | 'Neutral',
    details: string,
    icon: any
  ) => {
    const Icon = icon;
    let colorClass = 'bg-slate-100 text-slate-500';
    let borderClass = 'border-slate-200';
    
    if (status === 'Success') { colorClass = 'bg-emerald-100 text-emerald-600'; borderClass = 'border-emerald-200'; }
    if (status === 'Failed') { colorClass = 'bg-red-100 text-red-600'; borderClass = 'border-red-200'; }
    if (status === 'Warning') { colorClass = 'bg-amber-100 text-amber-600'; borderClass = 'border-amber-200'; }

    const isOverDeadline = duration && deadline && duration > deadline;

    return (
      <div className="flex gap-4 mb-8 relative last:mb-0 group">
        {/* Connector Line */}
        <div className="absolute left-[8.5rem] top-10 bottom-[-32px] w-0.5 bg-slate-200 group-last:hidden"></div>
        
        {/* Date Column */}
        <div className="w-24 text-right pt-2 flex-shrink-0">
          <p className="text-sm font-bold text-slate-700">{date}</p>
          <p className="text-xs text-slate-400">Date</p>
        </div>

        {/* Icon Bubble */}
        <div className={`relative z-10 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border-2 ${borderClass} ${colorClass} mt-1`}>
          <Icon size={18} />
        </div>

        {/* Content Card */}
        <div className="flex-1 bg-white border border-slate-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-slate-800 text-sm md:text-base">{title}</h4>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                actor === 'Student' ? 'bg-blue-50 text-blue-600' : 
                actor === 'University' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {actor}
              </span>
            </div>
            {duration !== null && (
               <div className="text-right">
                 <div className="flex items-center gap-1 justify-end">
                   <Clock size={14} className={isOverDeadline ? 'text-red-500' : 'text-slate-400'} />
                   <span className={`font-bold text-sm ${isOverDeadline ? 'text-red-600' : 'text-slate-700'}`}>{duration} days</span>
                 </div>
                 {deadline && <span className="text-xs text-slate-400">Target: {deadline}d</span>}
               </div>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{details}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="text-blue-500" />
                {student.Applicant_ID}
              </h2>
              <span className={`px-2 py-1 rounded text-xs font-bold border ${
                student.Final_Outcome === 'Enrolled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {student.Final_Outcome}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
               <CalendarDays size={14}/> Applied: {student.Date_Applied}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto bg-slate-50/50">
          
          {/* 1. Application */}
          {getTimelineItem(
            "Application Received", 
            d_applied,
            "Student", 
            0, null, 
            "Success", 
            "Application submitted via portal.",
            FileText
          )}

          {/* 2. Identity */}
          {getTimelineItem(
            "Identity Verification",
            d_applied,
            "System",
            null, null,
            student.Identity_Verification_Status === 'Success' ? (student.Verification_Attempts > 3 ? 'Warning' : 'Success') : 'Failed',
            `Status: ${student.Identity_Verification_Status}. Attempts: ${student.Verification_Attempts}. ${student.Verification_Attempts > 3 ? 'High attempt count flagged.' : ''}`,
            ShieldCheck
          )}

          {/* 3. Sanctions (Only if ID passed) */}
          {student.Identity_Verification_Status === 'Success' && getTimelineItem(
            "Integrity & Sanctions Check",
            d_sanction_end,
            "University",
            student.Integrity_Check_Duration, 10,
            student.Sanction_Status === 'Cleared' ? (student.Integrity_Check_Duration > 10 ? 'Warning' : 'Success') : 'Failed',
            `Outcome: ${student.Sanction_Status}. Checked against international watchlists.`,
            ShieldAlert
          )}

          {/* 4. Capacity/Waitlist (Only if Sanctions passed) */}
          {student.Sanction_Status === 'Cleared' && getTimelineItem(
            "Capacity Check",
            d_capacity_end,
            "University",
            student.Days_On_Waitlist > 0 ? student.Days_On_Waitlist : 0, 14,
            student.Capacity_Status === 'Accepted' ? 'Success' : (student.Capacity_Status === 'Rejected' ? 'Failed' : 'Warning'),
            `Status: ${student.Capacity_Status}. ${student.Days_On_Waitlist > 0 ? `Student was on waitlist for ${student.Days_On_Waitlist} days.` : 'Direct capacity availability.'}`,
            Building
          )}

          {/* 5. Doc Submission (If accepted or waitlisted) */}
          {student.Capacity_Status !== 'Rejected' && student.Sanction_Status === 'Cleared' && getTimelineItem(
            "Document Submission",
            d_submission_end,
            "Student",
            student.Document_Submission_Time, 14,
            student.Document_Submission_Time > 14 ? 'Warning' : 'Success',
            `Student took ${student.Document_Submission_Time} days to upload required diplomas and transcripts.`,
            FileText
          )}

          {/* 6. Validation (If docs submitted) */}
          {student.Capacity_Status !== 'Rejected' && student.Sanction_Status === 'Cleared' && getTimelineItem(
            "Institution Validation",
            d_validation_end,
            "University",
            student.Institution_Validation_Time, 30,
            student.Institution_Validation_Time > 30 ? 'Warning' : 'Success',
            `Academic validation performed by faculty. Duration: ${student.Institution_Validation_Time} days.`,
            Building
          )}

          {/* 7. Final Outcome */}
          <div className="flex gap-4 mb-4 relative pl-[7.5rem]">
             <div className={`relative z-10 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border-2 
                ${student.Final_Outcome === 'Enrolled' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                {student.Final_Outcome === 'Enrolled' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
             </div>
             <div className={`flex-1 rounded-lg p-4 border-l-4 shadow-sm
                ${student.Final_Outcome === 'Enrolled' ? 'bg-blue-50 border-blue-500' : 'bg-slate-100 border-slate-400'}`}>
                <h4 className="font-bold text-sm mb-1">Final Outcome: {student.Final_Outcome}</h4>
                {student.Final_Outcome === 'Enrolled' && (
                  <div className="space-y-1 mt-2 text-xs">
                    <p className="flex items-center gap-2">
                       <Wallet size={14} className="text-slate-500"/>
                       Payment: <span className={student.Payment_Status === 'Delayed' ? 'text-red-600 font-bold' : 'text-emerald-600'}>{student.Payment_Status}</span>
                       {student.Payment_Status === 'Delayed' && ` (${student.Months_Delayed} months)`}
                    </p>
                    {student.Scholarship_Requested === 'Yes' && (
                      <p className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-slate-500"/>
                        Scholarship: ${student.Scholarship_Amount} (Approved in {student.Scholarship_Approval_Time} days)
                      </p>
                    )}
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
const StudentTable: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // New State for Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // Filtering
    if (searchTerm) {
      result = result.filter(d => d.Applicant_ID.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (outcomeFilter !== 'All') {
      result = result.filter(d => d.Final_Outcome === outcomeFilter);
    }
    if (paymentFilter !== 'All') {
      result = result.filter(d => d.Payment_Status === paymentFilter);
    }

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, outcomeFilter, paymentFilter, sortConfig]);

  // Helper for sort icon
  const getSortIcon = (key: SortKey) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return <ArrowUpDown size={14} className="text-slate-300" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[800px]">
      
      {/* Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}

      {/* Header & Filters */}
      <div className="p-4 border-b border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Detailed Enrollment Log</h3>
            <div className="text-xs text-slate-500">{processedData.length} records found</div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
             {/* ID Search */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search Applicant ID..." 
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select 
                    className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
                    value={outcomeFilter}
                    onChange={(e) => setOutcomeFilter(e.target.value)}
                >
                    <option value="All">All Outcomes</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Fraud_Blacklist">Fraud Blacklist</option>
                    <option value="Expired">Expired</option>
                </select>

                <select 
                    className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="All">All Payment Status</option>
                    <option value="On Time">On Time</option>
                    <option value="Delayed">Delayed</option>
                </select>
                
                {(searchTerm || outcomeFilter !== 'All' || paymentFilter !== 'All') && (
                    <button 
                        onClick={() => { setSearchTerm(''); setOutcomeFilter('All'); setPaymentFilter('All'); }}
                        className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 px-2 transition-colors"
                    >
                        <X size={14} /> Clear
                    </button>
                )}
            </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 w-10"></th> {/* Action Column */}
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Applicant_ID')}>
                 <div className="flex items-center gap-1">Applicant ID {getSortIcon('Applicant_ID')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Date_Applied')}>
                 <div className="flex items-center gap-1">Applied {getSortIcon('Date_Applied')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Verification_Attempts')}>
                 <div className="flex items-center gap-1">Identity {getSortIcon('Verification_Attempts')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Integrity_Check_Duration')}>
                 <div className="flex items-center gap-1">Sanctions {getSortIcon('Integrity_Check_Duration')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Days_On_Waitlist')}>
                 <div className="flex items-center gap-1">Waitlist {getSortIcon('Days_On_Waitlist')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Document_Submission_Time')}>
                 <div className="flex items-center gap-1">Submission {getSortIcon('Document_Submission_Time')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Scholarship_Amount')}>
                 <div className="flex items-center gap-1">Scholarship {getSortIcon('Scholarship_Amount')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Months_Delayed')}>
                 <div className="flex items-center gap-1">Payment {getSortIcon('Months_Delayed')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('Final_Outcome')}>
                 <div className="flex items-center gap-1">Outcome {getSortIcon('Final_Outcome')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedData.map((student) => (
              <tr 
                key={student.Applicant_ID} 
                className="hover:bg-blue-50 transition-colors group cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <td className="px-6 py-4">
                    <div className="p-2 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors w-fit">
                        <Eye size={16} />
                    </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-700">{student.Applicant_ID}</td>
                <td className="px-6 py-4 text-slate-600">{student.Date_Applied}</td>
                
                {/* Identity Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {student.Identity_Verification_Status === 'Success' ? (
                       <ShieldCheck size={16} className="text-emerald-500" />
                    ) : (
                       <ShieldAlert size={16} className="text-red-500" />
                    )}
                    <span className={student.Verification_Attempts > 3 ? "text-red-600 font-bold" : "text-slate-600"}>
                      {student.Verification_Attempts} tries
                    </span>
                  </div>
                </td>

                {/* Sanction Cell */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={student.Sanction_Status === 'Blocked' ? "text-red-600 font-semibold" : "text-slate-600"}>
                        {student.Sanction_Status}
                    </span>
                    <span className={`text-xs ${student.Integrity_Check_Duration > 10 ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>
                        {student.Integrity_Check_Duration} days check
                    </span>
                  </div>
                </td>

                {/* Waitlist Cell */}
                <td className="px-6 py-4">
                    {student.Capacity_Status === 'Waitlisted' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.Days_On_Waitlist > 14 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {student.Days_On_Waitlist} days
                        </span>
                    ) : (
                        <span className="text-slate-400">-</span>
                    )}
                </td>

                {/* Submission Time Cell */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                        <span className={student.Document_Submission_Time > 14 ? "text-orange-600 font-medium" : "text-slate-600"}>
                            {student.Document_Submission_Time} days
                        </span>
                    </div>
                </td>

                {/* Scholarship Cell */}
                <td className="px-6 py-4">
                    {student.Scholarship_Requested === 'Yes' ? (
                        <div className="flex flex-col">
                            <span className="text-slate-900 font-medium">${student.Scholarship_Amount}</span>
                            <span className="text-xs text-slate-400">{student.Scholarship_Approval_Time} days approval</span>
                            {(student.Scholarship_Amount > 200 && student.Scholarship_Amount !== 300) && (
                                <span className="text-[10px] text-red-500">Review Amount</span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs">None</span>
                    )}
                </td>

                {/* Payment Cell */}
                <td className="px-6 py-4">
                    {student.Payment_Status === 'Delayed' ? (
                         <div className="flex items-center gap-2">
                             <AlertTriangle size={16} className="text-red-500" />
                             <span className="text-red-700 font-medium">{student.Months_Delayed} mo.</span>
                         </div>
                    ) : (
                        <span className="text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded-full">On Time</span>
                    )}
                </td>

                {/* Outcome Cell */}
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border
                    ${student.Final_Outcome === 'Enrolled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                    ${student.Final_Outcome === 'Rejected' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
                    ${student.Final_Outcome === 'Fraud_Blacklist' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    ${student.Final_Outcome === 'Expired' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                  `}>
                    {student.Final_Outcome.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {processedData.length === 0 && (
            <div className="text-center py-12 text-slate-500">
                No applicants found matching your filters.
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentTable;