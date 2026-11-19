jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('src/ai/ai.service', () => ({
  AiService: jest.fn(),
}));
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ComplaintsService } from './complaints.service';
import { Complaint } from './entities/complaint.entity';
import { User } from '../users/entities/user.entity';



describe('ComplaintsService - Assessment', () => {
  let service: ComplaintsService;

  let complaintsRepository: any;
  let usersRepository: any;
  let departmentsRepository: any;
  let aiService: any;
  let priorityService: any;

  let complaint: any;
  let officer: any;

  beforeEach(() => {
    // Mock complaint
    complaint = {
      id: 'complaint-123',
      aiUrgency: 'MEDIUM',
      aiConfidence: 0.85,
      officerUrgency: null,
      officerReviewNote: null,
      severityScore: null,
      publicImpactScore: null,
      safetyRiskScore: null,
      priorityScore: null,
      reviewedAt: null,
      reviewedBy: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };

    // Mock officer
    officer = {
      id: 'officer-123',
      fullName: 'Test Officer',
    };

    // Mock repositories
    complaintsRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    usersRepository = {
      findOne: jest.fn(),
    };

    departmentsRepository = {};

    // Mock AI service
    aiService = {
      predictUrgency: jest.fn(),
    };

    // Mock priority service
    priorityService = {
      calculateUrgencyScore: jest.fn().mockReturnValue(50),
      calculateWaitingTime: jest.fn().mockReturnValue(10),
      calculatePriority: jest.fn().mockReturnValue(75),
    };

    complaintsRepository.findOne.mockResolvedValue(complaint);
    usersRepository.findOne.mockResolvedValue(officer);
    complaintsRepository.save.mockImplementation(
      async (savedComplaint: Complaint) => savedComplaint,
    );

    // Create the service using the mock dependencies
    service = new ComplaintsService(
      complaintsRepository,
      usersRepository,
      departmentsRepository,
      aiService,
      priorityService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save an assessment when the officer agrees with AI', async () => {
    const dto = {
      officerUrgency: 'MEDIUM',
      severityScore: 80,
      publicImpactScore: 70,
      safetyRiskScore: 90,
    };

    const result = await service.assessComplaint(
      'complaint-123',
      dto,
      'officer-123',
    );

    expect(result.aiUrgency).toBe('MEDIUM');
    expect(result.officerUrgency).toBe('MEDIUM');
    expect(result.officerReviewNote).toBeNull();
    expect(result.reviewedBy).toBe(officer);
    expect(result.severityScore).toBe(80);
    expect(result.publicImpactScore).toBe(70);
    expect(result.safetyRiskScore).toBe(90);
    expect(result.priorityScore).toBe(75);

    expect(complaintsRepository.save).toHaveBeenCalled();
  });

  it('should require a reason when the officer changes AI urgency', async () => {
    const dto = {
      officerUrgency: 'CRITICAL',
      severityScore: 90,
      publicImpactScore: 80,
      safetyRiskScore: 100,
    };

    await expect(
      service.assessComplaint('complaint-123', dto, 'officer-123'),
    ).rejects.toThrow(BadRequestException);

    expect(complaintsRepository.save).not.toHaveBeenCalled();
  });

  it('should save the officer reason when urgency differs from AI', async () => {
    const dto = {
      officerUrgency: 'CRITICAL',
      officerReviewNote: 'This complaint presents an immediate safety risk.',
      severityScore: 90,
      publicImpactScore: 80,
      safetyRiskScore: 100,
    };

    const result = await service.assessComplaint(
      'complaint-123',
      dto,
      'officer-123',
    );

    expect(result.aiUrgency).toBe('MEDIUM');
    expect(result.officerUrgency).toBe('CRITICAL');
    expect(result.officerReviewNote).toBe(
      'This complaint presents an immediate safety risk.',
    );

    expect(priorityService.calculateUrgencyScore).toHaveBeenCalledWith(
      'CRITICAL',
    );
    expect(complaintsRepository.save).toHaveBeenCalled();
  });

  it('should allow manual assessment when AI urgency is null', async () => {
    complaint.aiUrgency = null;

    const dto = {
      officerUrgency: 'HIGH',
      severityScore: 75,
      publicImpactScore: 70,
      safetyRiskScore: 80,
    };

    const result = await service.assessComplaint(
      'complaint-123',
      dto,
      'officer-123',
    );

    expect(result.aiUrgency).toBeNull();
    expect(result.officerUrgency).toBe('HIGH');
    expect(result.officerReviewNote).toBeNull();
    expect(result.priorityScore).toBe(75);

    expect(complaintsRepository.save).toHaveBeenCalled();
  });

  it('should throw an error when the complaint does not exist', async () => {
    complaintsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.assessComplaint('unknown-id', {
        officerUrgency: 'HIGH',
        severityScore: 75,
        publicImpactScore: 70,
        safetyRiskScore: 80,
      }, 'officer-123'),
    ).rejects.toThrow(NotFoundException);

    expect(usersRepository.findOne).not.toHaveBeenCalled();
  });

  it('should throw an error when the reviewing officer does not exist', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.assessComplaint('complaint-123', {
        officerUrgency: 'MEDIUM',
        severityScore: 75,
        publicImpactScore: 70,
        safetyRiskScore: 80,
      }, 'unknown-officer'),
    ).rejects.toThrow(NotFoundException);

    expect(complaintsRepository.save).not.toHaveBeenCalled();
  });
});
