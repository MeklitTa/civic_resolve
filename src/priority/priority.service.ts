
import { Injectable } from '@nestjs/common';

@Injectable()
export class PriorityService {

  // Convert AI urgency into a numerical score
  calculateUrgencyScore(urgency: string): number {
    const urgencyScores: Record<string, number> = {
      LOW: 25,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 100,
    };

    const score = urgencyScores[urgency.trim().toUpperCase()];

    if (score === undefined) {
      throw new Error('Invalid urgency level.');
    }

    return score;
  }

  // Calculate waiting-time score from complaint creation date
  calculateWaitingTime(createdAt: Date): number {
    const currentTime = Date.now();
    const createdTime = createdAt.getTime();

    if (!Number.isFinite(createdTime) || createdTime > currentTime) {
      throw new Error('Invalid complaint creation date.');
    }

    const sevenDaysInMilliseconds =
      7 * 24 * 60 * 60 * 1000;

    const elapsedTime = currentTime - createdTime;

    const waitingScore = Math.min(
      (elapsedTime / sevenDaysInMilliseconds) * 100,
      100,
    );

    return Math.round(waitingScore * 100) / 100;
  }

  // Calculate final weighted priority score
  calculatePriority(
    urgency: number,
    severity: number,
    publicImpact: number,
    safetyRisk: number,
    waitingTime: number,
  ): number {

    const scores = [
      urgency,
      severity,
      publicImpact,
      safetyRisk,
      waitingTime,
    ];

    if (
      scores.some(
        score =>
          !Number.isFinite(score) ||
          score < 0 ||
          score > 100,
      )
    ) {
      throw new Error(
        'All priority scores must be between 0 and 100.',
      );
    }

    const priorityScore =
      urgency * 0.30 +
      severity * 0.25 +
      publicImpact * 0.20 +
      safetyRisk * 0.15 +
      waitingTime * 0.10;

    return Math.round(priorityScore * 100) / 100;
  }
}
