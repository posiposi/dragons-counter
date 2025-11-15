export enum GameResultValue {
  WIN = 'WIN',
  LOSE = 'LOSE',
  DRAW = 'DRAW',
}

export class GameResult {
  private readonly _value: GameResultValue;

  constructor(value: GameResultValue) {
    this._value = value;
  }

  static fromScores(dragonsScore: number, opponentScore: number): GameResult {
    if (dragonsScore > opponentScore) {
      return new GameResult(GameResultValue.WIN);
    } else if (opponentScore > dragonsScore) {
      return new GameResult(GameResultValue.LOSE);
    } else {
      return new GameResult(GameResultValue.DRAW);
    }
  }

  get value(): GameResultValue {
    return this._value;
  }

  isWin(): boolean {
    return this._value === GameResultValue.WIN;
  }
}
