import { DomainExceptionFilter } from './domain-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { DomainException } from '../../domain/exceptions/domain-exception';

class UnknownDomainException extends DomainException {
  constructor(message: string) {
    super('UNKNOWN_ERROR', message);
  }
}

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it('UserAlreadyExistsExceptionを409 Conflictに変換する', () => {
    const exception = new UserAlreadyExistsException(
      'このメールアドレスは既に登録されています',
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      error: 'USER_ALREADY_EXISTS',
      message: 'このメールアドレスは既に登録されています',
    });
  });

  it('マッピングに該当しないドメイン例外を400 Bad Requestに変換する', () => {
    const exception = new UnknownDomainException('不明なエラー');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'UNKNOWN_ERROR',
      message: '不明なエラー',
    });
  });
});
