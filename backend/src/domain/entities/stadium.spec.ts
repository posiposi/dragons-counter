import { Stadium } from './stadium';
import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';

describe('Stadium Entity', () => {
  const validStadiumData = {
    id: new StadiumId('test-stadium-id'),
    name: new StadiumName('バンテリンドームナゴヤ'),
    isDefault: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const createStadium = (
    overrides: Partial<{
      id: StadiumId;
      name: StadiumName;
      isDefault: boolean;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): Stadium => {
    const data = { ...validStadiumData, ...overrides };
    return Stadium.create(
      data.id,
      data.name,
      data.isDefault,
      data.createdAt,
      data.updatedAt,
    );
  };

  describe('constructor', () => {
    it('should create a valid stadium entity', () => {
      const stadium = createStadium();

      expect(stadium.id).toBe(validStadiumData.id);
      expect(stadium.name).toBe(validStadiumData.name);
      expect(stadium.isDefault).toBe(validStadiumData.isDefault);
      expect(stadium.createdAt).toBe(validStadiumData.createdAt);
      expect(stadium.updatedAt).toBe(validStadiumData.updatedAt);
    });

    it('should create a non-default stadium', () => {
      const stadium = createStadium({ isDefault: false });
      expect(stadium.isDefault).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return id value', () => {
      const stadium = createStadium();
      expect(stadium.id.value).toBe('test-stadium-id');
    });

    it('should return name value', () => {
      const stadium = createStadium({
        name: new StadiumName('甲子園球場'),
      });
      expect(stadium.name.value).toBe('甲子園球場');
    });

    it('should return isDefault', () => {
      const defaultStadium = createStadium({ isDefault: true });
      const nonDefaultStadium = createStadium({ isDefault: false });

      expect(defaultStadium.isDefault).toBe(true);
      expect(nonDefaultStadium.isDefault).toBe(false);
    });
  });
});
