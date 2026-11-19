import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { AssessComplaintDto } from './dto/assess-complaint.dto';

@Controller('complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
  ) {}

  @Post()
  @Roles(UserRole.CITIZEN)
  create(
    @Body() createComplaintDto: CreateComplaintDto,
    @Req() req: any,
  ) {
    return this.complaintsService.create(
      createComplaintDto,
      req.user.userId,
    );
  }

@Get('my-complaints')
@Roles(UserRole.CITIZEN)
findMyComplaints(@Req() req: any) {
  return this.complaintsService.findMyComplaints(
    req.user.userId,
  );
}

@Get()
@Roles(UserRole.COMPLAINT_OFFICER, UserRole.ADMIN)
findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(limit) || 10),
  );

  return this.complaintsService.findAll(
    currentPage,
    pageSize,
  );
}
@Patch(':id/assign')
@Roles(UserRole.COMPLAINT_OFFICER, UserRole.ADMIN)
assignComplaint(
  @Param('id') complaintId: string,
  @Body() assignComplaintDto: AssignComplaintDto,
  @Req() req: any,
) {
  return this.complaintsService.assignComplaint(
    complaintId,
    assignComplaintDto,
    req.user.userId,
  );
}
@Get('department')
@Roles(UserRole.DEPARTMENT_STAFF)
findDepartmentComplaints(@Req() req: any) {
  if (!req.user.departmentId) {
    throw new ForbiddenException(
      'You are not assigned to any department',
    );
  }

  return this.complaintsService.findDepartmentComplaints(
    req.user.departmentId,
  );
}

@Patch(':id/status')
@Roles(UserRole.DEPARTMENT_STAFF)
updateStatus(
  @Param('id') complaintId: string,
  @Body() updateComplaintStatusDto: UpdateComplaintStatusDto,
  @Req() req: any,
) {
  return this.complaintsService.updateStatus(
    complaintId,
    req.user.departmentId,
    updateComplaintStatusDto.status,
  );
}

@Patch(':id/assessment')
@Roles(UserRole.COMPLAINT_OFFICER, UserRole.ADMIN)
assessComplaint(
  @Param('id') complaintId: string,
  @Body() assessComplaintDto: AssessComplaintDto,
  @Req() req: any,
) {
  return this.complaintsService.assessComplaint(
    complaintId,
    assessComplaintDto,
    req.user.userId,
  );
}
}