import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { Department } from 'src/departments/entities/department.entity';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
      @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<{
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  }> {
    const { fullName, email, password } = registerUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.usersRepository.create({
      fullName,
      email,
      passwordHash,
      role: UserRole.CITIZEN,
    });

    

    const savedUser = await this.usersRepository.save(user);


    return {
      id: savedUser.id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      role: savedUser.role,
    };

    
  }
  async findByEmailForLogin(email: string) {
  return this.usersRepository.findOne({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });
}
async findById(userId: string) {
  return this.usersRepository.findOne({
    where: { id: userId },
    relations: {
      department: true,
    },
  });
}

async createStaff(createStaffDto: CreateStaffDto) {
  const {
    fullName,
    email,
    password,
    role,
    departmentId,
  } = createStaffDto;

  const existingUser = await this.usersRepository.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('Email is already registered');
  }

  let department: Department | null = null;

  if (role === UserRole.DEPARTMENT_STAFF) {
    if (!departmentId) {
      throw new BadRequestException(
        'Department is required for department staff',
      );
    }

    department = await this.departmentsRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }
  }

  if (role === UserRole.COMPLAINT_OFFICER && departmentId) {
    throw new BadRequestException(
      'Complaint officers do not need a department',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = this.usersRepository.create({
    fullName,
    email,
    passwordHash,
    role,
    department,
  });

  const savedUser = await this.usersRepository.save(user);

  return {
    id: savedUser.id,
    fullName: savedUser.fullName,
    email: savedUser.email,
    role: savedUser.role,
    department: savedUser.department
      ? {
          id: savedUser.department.id,
          name: savedUser.department.name,
        }
      : null,
  };
}

}