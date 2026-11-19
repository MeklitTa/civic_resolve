
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PriorityService } from './priority.service';

describe('PriorityService', () => {
  let priorityService: PriorityService;

  beforeEach(() => {
    priorityService = new PriorityService();
  });

  it('should calculate the correct priority score', () => {
    const result = priorityService.calculatePriority(
      100, 95, 90, 100, 10,
    );

    expect(result).toBe(87.75);
  });

  it('should give dangerous complaints a higher score', () => {
    const dangerousComplaint = priorityService.calculatePriority(
      100, 95, 90, 100, 10,
    );

    const minorComplaint = priorityService.calculatePriority(
      25, 20, 10, 0, 80,
    );

    expect(dangerousComplaint).toBeGreaterThan(minorComplaint);
  });

  it('should reject scores greater than 100', () => {
    expect(() =>
      priorityService.calculatePriority(120, 50, 50, 50, 50),
    ).toThrow('All priority scores must be between 0 and 100.');
  });

  it('should reject negative scores', () => {
    expect(() =>
      priorityService.calculatePriority(50, -10, 50, 50, 50),
    ).toThrow('All priority scores must be between 0 and 100.');
  });

  it('should reject non-numeric values such as NaN', () => {
    expect(() =>
      priorityService.calculatePriority(NaN, 50, 50, 50, 50),
    ).toThrow('All priority scores must be between 0 and 100.');
  });


  it('should convert all urgency levels into numerical scores', () => {
    expect(priorityService.calculateUrgencyScore('LOW')).toBe(25);
    expect(priorityService.calculateUrgencyScore('MEDIUM')).toBe(50);
    expect(priorityService.calculateUrgencyScore('HIGH')).toBe(75);
    expect(priorityService.calculateUrgencyScore('CRITICAL')).toBe(100);
  });

  it('should handle lowercase urgency values', () => {
    expect(priorityService.calculateUrgencyScore('critical')).toBe(100);
  });

  it('should reject invalid urgency levels', () => {
    expect(() =>
      priorityService.calculateUrgencyScore('UNKNOWN'),
    ).toThrow('Invalid urgency level.');
  });

  it('should calculate approximately 14.29 points for one day of waiting', () => {
    const oneDayAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    );

    const result = priorityService.calculateWaitingTime(oneDayAgo);

    expect(result).toBeCloseTo(14.29, 2);
  });

  it('should calculate 50 points for 3.5 days of waiting', () => {
    const threeAndHalfDaysAgo = new Date(
      Date.now() - 3.5 * 24 * 60 * 60 * 1000,
    );

    const result = priorityService.calculateWaitingTime(
      threeAndHalfDaysAgo,
    );

    expect(result).toBe(50);
  });

  it('should not exceed 100 waiting-time points', () => {
    const tenDaysAgo = new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000,
    );

    const result = priorityService.calculateWaitingTime(tenDaysAgo);

    expect(result).toBe(100);
  });

  it('should reject invalid or future creation dates', () => {
    expect(() =>
      priorityService.calculateWaitingTime(new Date('invalid')),
    ).toThrow('Invalid complaint creation date.');

    expect(() =>
      priorityService.calculateWaitingTime(
        new Date(Date.now() + 24 * 60 * 60 * 1000),
      ),
    ).toThrow('Invalid complaint creation date.');
  });
});
