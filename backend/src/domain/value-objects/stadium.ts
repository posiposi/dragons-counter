import { StadiumId } from './stadium-id';
import { StadiumName } from './stadium-name';

export class Stadium {
  private readonly _id: StadiumId;
  private readonly _name: StadiumName;

  private constructor(id: StadiumId, name: StadiumName) {
    this._id = id;
    this._name = name;
  }

  static create(id: StadiumId, name: StadiumName): Stadium {
    return new Stadium(id, name);
  }

  get id(): StadiumId {
    return this._id;
  }

  get name(): StadiumName {
    return this._name;
  }

  equals(other: Stadium): boolean {
    return this._id.equals(other._id);
  }
}
