export type IdentityStatus = 'Success' | 'Failed';
export type SanctionStatus = 'Blocked' | 'Cleared';
export type CapacityStatus = 'Accepted' | 'Waitlisted' | 'Rejected';
export type ScholarshipRequested = 'Yes' | 'No';
export type PaymentStatus = 'On Time' | 'Delayed';
export type FinalOutcome = 'Enrolled' | 'Rejected' | 'Fraud_Blacklist' | 'Expired';

export interface StudentData {
  Applicant_ID: string;
  Date_Applied: string;
  Identity_Verification_Status: IdentityStatus;
  Verification_Attempts: number;
  Sanction_Status: SanctionStatus;
  Integrity_Check_Duration: number; // Days
  Capacity_Status: CapacityStatus;
  Days_On_Waitlist: number;
  Document_Submission_Time: number; // Days
  Institution_Validation_Time: number; // Days
  Scholarship_Requested: ScholarshipRequested;
  Scholarship_Amount: number;
  Scholarship_Approval_Time: number; // Days (New requirement)
  Payment_Status: PaymentStatus;
  Months_Delayed: number;
  Final_Outcome: FinalOutcome;
}
