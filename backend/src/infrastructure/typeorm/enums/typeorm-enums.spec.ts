import { GameResultEnum } from './game-result.enum';
import { UserRoleEnum } from './user-role.enum';
import { RegistrationStatusEnum } from './registration-status.enum';
import {
  GameResultEnum as BarrelGameResultEnum,
  UserRoleEnum as BarrelUserRoleEnum,
  RegistrationStatusEnum as BarrelRegistrationStatusEnum,
} from './index';

describe('TypeORM Enum定義', () => {
  describe('GameResultEnum', () => {
    it('WINの値が"win"である', () => {
      expect(GameResultEnum.WIN).toBe('win');
    });

    it('LOSEの値が"lose"である', () => {
      expect(GameResultEnum.LOSE).toBe('lose');
    });

    it('DRAWの値が"draw"である', () => {
      expect(GameResultEnum.DRAW).toBe('draw');
    });

    it('メンバーが3つである', () => {
      const values = Object.values(GameResultEnum);
      expect(values).toHaveLength(3);
      expect(values).toEqual(expect.arrayContaining(['win', 'lose', 'draw']));
    });
  });

  describe('UserRoleEnum', () => {
    it('USERの値が"user"である', () => {
      expect(UserRoleEnum.USER).toBe('user');
    });

    it('ADMINの値が"admin"である', () => {
      expect(UserRoleEnum.ADMIN).toBe('admin');
    });

    it('メンバーが2つである', () => {
      const values = Object.values(UserRoleEnum);
      expect(values).toHaveLength(2);
      expect(values).toEqual(expect.arrayContaining(['user', 'admin']));
    });
  });

  describe('RegistrationStatusEnum', () => {
    it('PENDINGの値が"pending"である', () => {
      expect(RegistrationStatusEnum.PENDING).toBe('pending');
    });

    it('APPROVEDの値が"approved"である', () => {
      expect(RegistrationStatusEnum.APPROVED).toBe('approved');
    });

    it('REJECTEDの値が"rejected"である', () => {
      expect(RegistrationStatusEnum.REJECTED).toBe('rejected');
    });

    it('BANNEDの値が"banned"である', () => {
      expect(RegistrationStatusEnum.BANNED).toBe('banned');
    });

    it('メンバーが4つである', () => {
      const values = Object.values(RegistrationStatusEnum);
      expect(values).toHaveLength(4);
      expect(values).toEqual(
        expect.arrayContaining(['pending', 'approved', 'rejected', 'banned']),
      );
    });
  });

  describe('バレルエクスポート', () => {
    it('GameResultEnumがエクスポートされる', () => {
      expect(BarrelGameResultEnum).toBe(GameResultEnum);
    });

    it('UserRoleEnumがエクスポートされる', () => {
      expect(BarrelUserRoleEnum).toBe(UserRoleEnum);
    });

    it('RegistrationStatusEnumがエクスポートされる', () => {
      expect(BarrelRegistrationStatusEnum).toBe(RegistrationStatusEnum);
    });
  });
});
