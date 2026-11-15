import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from './src/users/entities/user.entity';
import { Department } from './src/departments/entities/department.entity';
import { Complaint } from './src/complaints/entities/complaint.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [User, Department, Complaint],
  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});