import { Stadium } from '../../../domain/entities/stadium';

export class StadiumResponseDto {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(stadium: Stadium) {
    this.id = stadium.id.value;
    this.name = stadium.name.value;
    this.isDefault = stadium.isDefault;
    this.createdAt = stadium.createdAt.toISOString();
    this.updatedAt = stadium.updatedAt.toISOString();
  }
}
