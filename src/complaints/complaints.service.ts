import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Complaint,
  ComplaintStatus,
} from './entities/complaint.entity';

import { User } from '../users/entities/user.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Department } from 'src/departments/entities/department.entity';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { AiService } from 'src/ai/ai.service';
import { PriorityService } from 'src/priority/priority.service';
import { AssessComplaintDto } from './dto/assess-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
   @InjectRepository(Department)
     private readonly departmentsRepository: Repository<Department>,

    private readonly aiService: AiService,
    private readonly priorityService: PriorityService,
  ) {}

 
async create(
  createComplaintDto: CreateComplaintDto,
  citizenId: string,
) {
  // 1. Find the citizen
  const citizen = await this.usersRepository.findOne({
    where: { id: citizenId },
  });

  if (!citizen) {
    throw new NotFoundException('Citizen not found');
  }

  // 2. Ask the Python AI service to predict urgency
  let aiUrgency: string | null = null;
  let aiConfidence: number | null = null;
  let aiPredictedAt: Date | null = null;

  try {
    const prediction = await this.aiService.predictUrgency(
      createComplaintDto.description,
    );

    aiUrgency = prediction.urgency;
    aiConfidence = prediction.confidence;
    aiPredictedAt = new Date();

  } catch (error) {
    // Keep the complaint even if the AI service is unavailable.
    console.error('AI prediction unavailable:', error);
  }

  // 3. Generate a complaint number
  const complaintNumber = `CR-${Date.now()}`;

  // 4. Create the complaint
  const complaint = this.complaintsRepository.create({
    ...createComplaintDto,
    complaintNumber,
    status: ComplaintStatus.PENDING,
    citizen,

    // Original AI prediction
    aiUrgency,
    aiConfidence,
    aiPredictedAt,
  });

  // 5. Save the complaint and its AI prediction
  const savedComplaint =
    await this.complaintsRepository.save(complaint);

  return savedComplaint;
}

async findMyComplaints(citizenId: string) {
  return this.complaintsRepository.find({
    where: {
      citizen: {
        id: citizenId,
      },
    },
    order: {
      createdAt: 'DESC',
    },
  });
}

async findAll(page = 1, limit = 10) {
  const [complaints, total] =
    await this.complaintsRepository.findAndCount({
      relations: {
        citizen: true,
        assignedDepartment: true,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

  return {
    data: complaints,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

 async assignComplaint(
  complaintId: string,
  assignComplaintDto: AssignComplaintDto,
  officerId: string,
) {
  const complaint = await this.complaintsRepository.findOne({
    where: { id: complaintId },
  });

  if (!complaint) {
    throw new NotFoundException('Complaint not found');
  }

  if (complaint.status !== ComplaintStatus.PENDING) {
    throw new ConflictException(
      'Only pending complaints can be assigned',
    );
  }

  const department = await this.departmentsRepository.findOne({
    where: { id: assignComplaintDto.departmentId }, 
  });

  if (!department) {
    throw new NotFoundException('Department not found');
  }

  const officer = await this.usersRepository.findOne({
    where: { id: officerId },
  });

  if (!officer) {
    throw new NotFoundException('Officer not found');
  }

  complaint.assignedDepartment = department;
  complaint.assignedBy = officer;
  complaint.status = ComplaintStatus.ASSIGNED;

  return this.complaintsRepository.save(complaint);
}







async assessComplaint(
  complaintId: string,
  assessComplaintDto: AssessComplaintDto,
  officerId: string,
) {
  // 1. Find the complaint
  const complaint = await this.complaintsRepository.findOne({
    where: { id: complaintId },
  });

  if (!complaint) {
    throw new NotFoundException('Complaint not found');
  }

  // 2. Find the reviewing officer
  const officer = await this.usersRepository.findOne({
    where: { id: officerId },
  });

  if (!officer) {
    throw new NotFoundException('Officer not found');
  }

  // 3. Check whether the officer changed the AI prediction
  const officerUrgency =
    assessComplaintDto.officerUrgency.trim().toUpperCase();

  const aiUrgency =
    complaint.aiUrgency?.trim().toUpperCase() ?? null;

  const urgencyChanged =
    aiUrgency !== null && aiUrgency !== officerUrgency;

  // 4. Require an explanation when urgency changes
  if (
    urgencyChanged &&
    !assessComplaintDto.officerReviewNote?.trim()
  ) {
    throw new BadRequestException(
      'Please provide a reason for changing the AI urgency prediction.',
    );
  }

  // 5. Calculate urgency using the officer's decision
  const urgencyScore =
    this.priorityService.calculateUrgencyScore(officerUrgency);

  // 6. Calculate waiting time
  const waitingTimeScore =
    this.priorityService.calculateWaitingTime(
      complaint.createdAt,
    );

  // 7. Calculate final priority
  const priorityScore =
    this.priorityService.calculatePriority(
      urgencyScore,
      assessComplaintDto.severityScore,
      assessComplaintDto.publicImpactScore,
      assessComplaintDto.safetyRiskScore,
      waitingTimeScore,
    );

  // 8. Save officer assessment
  complaint.officerUrgency = officerUrgency;
  complaint.officerReviewNote =
    assessComplaintDto.officerReviewNote?.trim() || null;

  complaint.reviewedBy = officer;
  complaint.reviewedAt = new Date();

  complaint.severityScore = assessComplaintDto.severityScore;
  complaint.publicImpactScore =
    assessComplaintDto.publicImpactScore;
  complaint.safetyRiskScore =
    assessComplaintDto.safetyRiskScore;

  complaint.priorityScore = priorityScore;

  // 9. Save everything
  return this.complaintsRepository.save(complaint);
}











async findDepartmentComplaints(departmentId: string) {
  return this.complaintsRepository.find({
    where: {
      assignedDepartment: {
        id: departmentId,
      },
    },
    relations: {
      citizen: true,
      assignedDepartment: true,
      assignedBy: true,
    },
    order: {
      createdAt: 'DESC',
    },
  });
}

async updateStatus(
  complaintId: string,
  departmentId: string,
  newStatus: ComplaintStatus,
) {
  const complaint = await this.complaintsRepository.findOne({
    where: { id: complaintId },
    relations: {
      assignedDepartment: true,
    },
  });

  if (!complaint) {
    throw new NotFoundException('Complaint not found');
  }

  // Check whether the complaint belongs to this staff member's department.
  if (
    !departmentId ||
    complaint.assignedDepartment?.id !== departmentId
  ) {
    throw new ForbiddenException(
      'You cannot update complaints assigned to another department',
    );
  }

  // Allow only ASSIGNED -> IN_PROGRESS.
  if (
    complaint.status === ComplaintStatus.ASSIGNED &&
    newStatus === ComplaintStatus.IN_PROGRESS
  ) {
    complaint.status = ComplaintStatus.IN_PROGRESS;
  }

  // Allow only IN_PROGRESS -> RESOLVED.
  else if (
    complaint.status === ComplaintStatus.IN_PROGRESS &&
    newStatus === ComplaintStatus.RESOLVED
  ) {
    complaint.status = ComplaintStatus.RESOLVED;
  }

  else {
    throw new ConflictException(
      `Cannot change complaint status from ${complaint.status} to ${newStatus}`,
    );
  }

  return this.complaintsRepository.save(complaint);
}

}
