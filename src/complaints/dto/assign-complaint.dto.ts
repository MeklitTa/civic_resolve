import { IsUUID } from 'class-validator';

export class AssignComplaintDto {
  @IsUUID()
  departmentId!: string;
}