import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment =
      await this.departmentsRepository.findOne({
        where: { name: createDepartmentDto.name },
      });

    if (existingDepartment) {
      throw new ConflictException(
        'Department already exists',
      );
    }

    const department = this.departmentsRepository.create(
      createDepartmentDto,
    );

    return this.departmentsRepository.save(department);
  }

  async findAll() {
    return this.departmentsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }
}