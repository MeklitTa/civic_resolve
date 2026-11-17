
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
});
