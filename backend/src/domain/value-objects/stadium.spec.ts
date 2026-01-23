import { Stadium } from './stadium';
import { StadiumId } from './stadium-id';
import { StadiumName } from './stadium-name';

describe('Stadium', () => {
  describe('create', () => {
    it('should create a valid Stadium with StadiumId and StadiumName', () => {
      const id = StadiumId.create('stadium-id-123');
      const name = StadiumName.create('バンテリンドーム ナゴヤ');
      const stadium = Stadium.create(id, name);

      expect(stadium.id).toBe(id);
      expect(stadium.name).toBe(name);
    });

    it('should create a valid Stadium with English stadium name', () => {
      const id = StadiumId.create('stadium-id-456');
      const name = StadiumName.create('Tokyo Dome');
      const stadium = Stadium.create(id, name);

      expect(stadium.id.value).toBe('stadium-id-456');
      expect(stadium.name.value).toBe('Tokyo Dome');
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const id1 = StadiumId.create('same-id');
      const name1 = StadiumName.create('東京ドーム');
      const stadium1 = Stadium.create(id1, name1);

      const id2 = StadiumId.create('same-id');
      const name2 = StadiumName.create('東京ドーム');
      const stadium2 = Stadium.create(id2, name2);

      expect(stadium1.equals(stadium2)).toBe(true);
    });

    it('should return false for different id', () => {
      const id1 = StadiumId.create('id-1');
      const name1 = StadiumName.create('東京ドーム');
      const stadium1 = Stadium.create(id1, name1);

      const id2 = StadiumId.create('id-2');
      const name2 = StadiumName.create('東京ドーム');
      const stadium2 = Stadium.create(id2, name2);

      expect(stadium1.equals(stadium2)).toBe(false);
    });
  });

  describe('id getter', () => {
    it('should return the StadiumId', () => {
      const id = StadiumId.create('test-id');
      const name = StadiumName.create('神宮球場');
      const stadium = Stadium.create(id, name);

      expect(stadium.id).toBe(id);
      expect(stadium.id.value).toBe('test-id');
    });
  });

  describe('name getter', () => {
    it('should return the StadiumName', () => {
      const id = StadiumId.create('test-id');
      const name = StadiumName.create('甲子園球場');
      const stadium = Stadium.create(id, name);

      expect(stadium.name).toBe(name);
      expect(stadium.name.value).toBe('甲子園球場');
    });
  });
});
