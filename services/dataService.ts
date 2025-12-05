import { StudentData, IdentityStatus, SanctionStatus, CapacityStatus, FinalOutcome } from '../types';

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateMockData = (count: number = 50): StudentData[] => {
  const data: StudentData[] = [];
  const startDate = new Date('2023-08-01');
  const endDate = new Date('2023-12-01');

  for (let i = 0; i < count; i++) {
    const id = `APP-${1000 + i}`;
    
    // Core Status Logic Generation to ensure realistic scenarios
    let outcome: FinalOutcome = 'Enrolled';
    
    // 1. Identity & Fraud Logic
    const verifAttempts = Math.random() < 0.1 ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 3) + 1; // 10% chance of high attempts
    let identityStatus: IdentityStatus = 'Success';
    
    if (verifAttempts > 3) {
      identityStatus = 'Failed';
      outcome = 'Fraud_Blacklist';
    } else if (Math.random() < 0.05) {
      identityStatus = 'Failed';
      outcome = 'Rejected';
    }

    // 2. Sanction Logic
    const checkDuration = Math.floor(Math.random() * 15) + 1; // 1-15 days. >10 is alert.
    let sanctionStatus: SanctionStatus = 'Cleared';
    if (Math.random() < 0.05) {
        sanctionStatus = 'Blocked';
        outcome = 'Rejected';
    }

    // 3. Capacity & Waitlist
    let capacity: CapacityStatus = 'Accepted';
    let daysWaitlist = 0;
    
    if (outcome !== 'Fraud_Blacklist' && outcome !== 'Rejected') {
        const rand = Math.random();
        if (rand < 0.6) {
            capacity = 'Accepted';
        } else if (rand < 0.9) {
            capacity = 'Waitlisted';
            daysWaitlist = Math.floor(Math.random() * 20); // 0-20 days. >14 is alert.
            if (daysWaitlist > 14) {
                // High chance of expiry if waitlist too long
                if (Math.random() < 0.7) outcome = 'Expired';
            }
        } else {
            capacity = 'Rejected';
            outcome = 'Rejected';
        }
    }

    // 4. Timings
    const docSubTime = Math.floor(Math.random() * 20) + 1; // Deadline 14
    const instValidTime = Math.floor(Math.random() * 40) + 5; // Deadline 30
    
    // If process took too long, might expire
    if (outcome === 'Enrolled' && (docSubTime > 21 || instValidTime > 35)) {
        if (Math.random() < 0.4) outcome = 'Expired';
    }

    // 5. Scholarship
    const requested = Math.random() < 0.4 ? 'Yes' : 'No';
    let amount = 0;
    let approvalTime = 0;
    if (requested === 'Yes') {
        // Mix of valid and invalid amounts
        amount = randomChoice([150, 180, 250, 300, 350, 500]);
        // Approval time simulation
        approvalTime = Math.floor(Math.random() * 25) + 1; 
    }

    // 6. Payment
    let paymentStatus: 'On Time' | 'Delayed' = 'On Time';
    let monthsDelayed = 0;
    
    if (outcome === 'Enrolled') {
        if (Math.random() < 0.2) {
            paymentStatus = 'Delayed';
            monthsDelayed = Math.floor(Math.random() * 5) + 1; // 1-5 months
            // If delayed > 4 months (incasso level), usually implies enrollment issues, but we keep enrolled for dashboard flagging
        }
    }

    data.push({
      Applicant_ID: id,
      Date_Applied: generateRandomDate(startDate, endDate),
      Identity_Verification_Status: identityStatus,
      Verification_Attempts: verifAttempts,
      Sanction_Status: sanctionStatus,
      Integrity_Check_Duration: checkDuration,
      Capacity_Status: capacity,
      Days_On_Waitlist: daysWaitlist,
      Document_Submission_Time: docSubTime,
      Institution_Validation_Time: instValidTime,
      Scholarship_Requested: requested,
      Scholarship_Amount: amount,
      Scholarship_Approval_Time: approvalTime,
      Payment_Status: paymentStatus,
      Months_Delayed: monthsDelayed,
      Final_Outcome: outcome,
    });
  }
  return data;
};

export const downloadCSV = (data: StudentData[]) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "student_enrollment_mock_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
