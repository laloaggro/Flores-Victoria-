/**
 * Tests para configuración de base de datos
 */

const { MongoClient } = require('mongodb');
const { connectToDatabase } = require('../../config/database');

jest.mock('mongodb');
jest.mock('../../logger.simple');

describe('Database Connection', () => {
  let mockClient;
  let mockDb;

  beforeEach(() => {
    mockDb = { collection: jest.fn() };
    mockClient = {
      connect: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue(mockDb),
      close: jest.fn().mockResolvedValue(true),
    };

    MongoClient.mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should export connectToDatabase function', () => {
    expect(typeof connectToDatabase).toBe('function');
  });

  it('should connect to MongoDB and return db instance', async () => {
    const db = await connectToDatabase();

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.db).toHaveBeenCalledWith('reviews_db');
    expect(db).toBe(mockDb);
  });
});
