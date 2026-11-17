
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) {}

  async predictUrgency(description: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:8000/predict-urgency',
          { description },
        ),
      );

      return response.data;
    } catch (error) {
      console.error('AI service request failed:', error);

      throw new ServiceUnavailableException(
        'The AI prediction service is currently unavailable.',
      );
    }
  }
}
