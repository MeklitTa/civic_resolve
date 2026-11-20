export class MyComplaintResponseDto {
  id!: string;
  complaintNumber!: string;
  title!: string;
  description!: string;
  category!: string;
  location!: string;
  status!: string;

  // AI-generated estimate, not an official decision
  aiUrgency!: string | null;

  createdAt!: Date;
  updatedAt!: Date;
}