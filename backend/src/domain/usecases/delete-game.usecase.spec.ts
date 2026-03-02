import { Test, TestingModule } from '@nestjs/testing';
import { DeleteGameUsecase } from './delete-game.usecase';
import { GamePort } from '../ports/game.port';
import { Game } from '../entities/game';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('DeleteGameUsecase', () => {
  let usecase: DeleteGameUsecase;
  let mockGamePort: jest.Mocked<GamePort>;

  beforeEach(async () => {
    mockGamePort = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<GamePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteGameUsecase,
        {
          provide: 'GamePort',
          useValue: mockGamePort,
        },
      ],
    }).compile();

    usecase = module.get<DeleteGameUsecase>(DeleteGameUsecase);
  });

  describe('execute', () => {
    describe('正常系', () => {
      it.each([
        {
          description: '存在する試合IDで削除に成功する',
          gameId: '123e4567-e89b-12d3-a456-426614174000',
          findByIdResult: true,
          deleteResult: true,
        },
      ])('$description', async ({ gameId, findByIdResult, deleteResult }) => {
        const findByIdSpy = jest
          .spyOn(mockGamePort, 'findById')
          .mockResolvedValue(findByIdResult ? ({} as Game) : null);
        const deleteSpy = jest
          .spyOn(mockGamePort, 'delete')
          .mockResolvedValue(deleteResult);

        await expect(usecase.execute(gameId)).resolves.not.toThrow();

        expect(findByIdSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('異常系', () => {
      it.each([
        {
          description: '存在しない試合IDで404エラーが発生する',
          gameId: '123e4567-e89b-12d3-a456-426614174000',
          findByIdResult: null,
          expectedError: NotFoundException,
        },
        {
          description: '削除処理に失敗した場合500エラーが発生する',
          gameId: '123e4567-e89b-12d3-a456-426614174000',
          findByIdResult: {},
          deleteResult: false,
          expectedError: InternalServerErrorException,
        },
      ])(
        '$description',
        async ({ gameId, findByIdResult, deleteResult, expectedError }) => {
          mockGamePort.findById.mockResolvedValue(
            findByIdResult ? ({} as Game) : null,
          );
          if (deleteResult !== undefined) {
            mockGamePort.delete.mockResolvedValue(deleteResult);
          }

          await expect(usecase.execute(gameId)).rejects.toThrow(expectedError);
        },
      );
    });
  });
});
