export class ComplaintResponseDto {
  id!: string;
  complaintNumber!: string;
  title!: string;
  description!: string;
  category!: string;
  location!: string;
  status!: string;

  // Original AI prediction
  aiUrgency!: string | null;
  aiConfidence!: number | null;
  aiPredictedAt!: Date | null;

  // Priority assessment
  severityScore!: number | null;
  publicImpactScore!: number | null;
  safetyRiskScore!: number | null;
  priorityScore!: number | null;

  // Officer review
  officerUrgency!: string | null;
  officerReviewNote!: string | null;
  reviewedAt!: Date | null;

  // Citizen information
  citizen!: {
    id: string;
    fullName: string;
    email: string;
  };

  // Department information
  assignedDepartment!: {
    id: string;
    name: string;
  } | null;

  createdAt!: Date;
  updatedAt!: Date;
}
