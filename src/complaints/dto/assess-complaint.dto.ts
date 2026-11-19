import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AssessComplaintDto {
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  officerUrgency!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  officerReviewNote?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  severityScore!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  publicImpactScore!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  safetyRiskScore!: number;
}