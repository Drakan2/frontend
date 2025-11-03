import { BaseEntity, ID } from './common';

export type UserRole = 'admin' | 'user';

export interface User extends BaseEntity {
  username: string;
  password: string;
  role: UserRole;
  assignedPatients: ID[];
}
