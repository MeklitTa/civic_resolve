import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';

@Module({
  providers: [PriorityService]
})
export class PriorityModule {}
