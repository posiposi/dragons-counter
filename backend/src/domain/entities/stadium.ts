import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';

export class Stadium {
  private readonly _id: StadiumId;
  private readonly _name: StadiumName;
  private readonly _isDefault: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: StadiumId,
    name: StadiumName,
    isDefault: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._name = name;
    this._isDefault = isDefault;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): StadiumId {
    return this._id;
  }

  get name(): StadiumName {
    return this._name;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
