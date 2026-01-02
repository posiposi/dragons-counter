import { Stadium } from '../entities/stadium';

export interface StadiumPort {
  findAll(): Promise<Stadium[]>;
  findDefault(): Promise<Stadium | null>;
}
