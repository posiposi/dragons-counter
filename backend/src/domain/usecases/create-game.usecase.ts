import { Game } from '../entities/game';
import type { GamePort } from '../ports/game.port';
import { CreateGameRequest } from '../../application/dto/request/create-game.dto';
import { Inject } from '@nestjs/common';

/**
 * 試合登録ユースケース
 *
 * NOTE: Issue #75により、試合登録処理は現時点では対応しない。
 * 将来的にスクレイピングで試合データを取得する予定のため、
 * このユースケースは暫定的にNotImplementedErrorをスローする。
 */
export class CreateGameUseCase {
  constructor(
    @Inject('GamePort')
    private readonly gamePort: GamePort,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(_request: CreateGameRequest): Promise<Game> {
    // TODO: Issue #75 - 将来的にスクレイピングで試合データを取得する際に実装予定
    return Promise.reject(
      new Error(
        'NotImplemented: 試合登録処理は現在対応していません。将来的にスクレイピングで取得予定です。',
      ),
    );
  }
}
