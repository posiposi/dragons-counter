import { GameId } from '../value-objects/game-id';
import { GameDate } from '../value-objects/game-date';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { Notes } from '../value-objects/notes';
import { GameResult } from '../value-objects/game-result';

export class Game {
  private readonly _id: GameId;
  private readonly _gameDate: GameDate;
  private readonly _opponent: Opponent;
  private readonly _dragonsScore: Score;
  private readonly _opponentScore: Score;
  private readonly _stadium: Stadium;
  private readonly _notes: Notes | undefined;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _result: GameResult;

  constructor(
    id: GameId,
    gameDate: GameDate,
    opponent: Opponent,
    dragonsScore: Score,
    opponentScore: Score,
    stadium: Stadium,
    notes: Notes | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._gameDate = gameDate;
    this._opponent = opponent;
    this._dragonsScore = dragonsScore;
    this._opponentScore = opponentScore;
    this._stadium = stadium;
    this._notes = notes;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this.validateGameDate();
    this._result = this.determineResult();
  }

  private validateGameDate(): void {
    // Validation is now handled in GameDate value object
  }

  private determineResult(): GameResult {
    return GameResult.fromScores(
      this._dragonsScore.value,
      this._opponentScore.value,
    );
  }

  get id(): GameId {
    return this._id;
  }

  get gameDate(): GameDate {
    return this._gameDate;
  }

  get opponent(): Opponent {
    return this._opponent;
  }

  get dragonsScore(): Score {
    return this._dragonsScore;
  }

  get opponentScore(): Score {
    return this._opponentScore;
  }

  get stadium(): Stadium {
    return this._stadium;
  }

  get notes(): Notes | undefined {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get result(): GameResult {
    return this._result;
  }

  isVictory(): boolean {
    return this._result.isWin();
  }
}
