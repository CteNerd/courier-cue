import { describe, it, expect, jest, beforeAll, beforeEach, afterEach } from '@jest/globals';

// Set up environment to prevent credential loading
beforeAll(() => {
  // Set mock AWS credentials to prevent credential provider from running
  process.env.AWS_ACCESS_KEY_ID = 'mock-access-key';
  process.env.AWS_SECRET_ACCESS_KEY = 'mock-secret-key';
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_DEFAULT_REGION = 'us-east-1';
  process.env.AWS_SDK_LOAD_CONFIG = '0';
});

// Create comprehensive mocks before any imports
const mockSend = jest.fn() as jest.MockedFunction<any>;
const mockGetSignedUrl = jest.fn() as jest.MockedFunction<any>;

// Mock the entire AWS SDK modules with factory functions
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: mockSend,
      config: {
        region: () => Promise.resolve('us-east-1'),
        credentials: () => Promise.resolve({
          accessKeyId: 'mock-access-key',
          secretAccessKey: 'mock-secret-key',
        }),
      },
    })),
    PutObjectCommand: jest.fn((params: any) => ({ ...params, __type: 'PutObjectCommand' })),
    GetObjectCommand: jest.fn((params: any) => ({ ...params, __type: 'GetObjectCommand' })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

// Import after mocks are established
import {
  verifyS3KeyOwnership,
  getReceiptS3Key,
  getSignatureUploadUrl,
} from '../s3.js';

describe('S3 Module', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up mock return values
    mockSend.mockResolvedValue({});
    mockGetSignedUrl.mockResolvedValue('https://mock-signed-url.com');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('verifyS3KeyOwnership', () => {
    it('should return true for valid orgId prefix', () => {
      const s3Key = 'org123/load456/signature.png';
      const orgId = 'org123';

      expect(verifyS3KeyOwnership(s3Key, orgId)).toBe(true);
    });

    it('should return false for mismatched orgId', () => {
      const s3Key = 'org123/load456/signature.png';
      const orgId = 'org999';

      expect(verifyS3KeyOwnership(s3Key, orgId)).toBe(false);
    });

    it('should return false for s3Key without orgId prefix', () => {
      const s3Key = 'load456/signature.png';
      const orgId = 'org123';

      expect(verifyS3KeyOwnership(s3Key, orgId)).toBe(false);
    });
  });

  describe('getReceiptS3Key', () => {
    it('should generate correct receipt S3 key', () => {
      const orgId = 'org123';
      const loadId = 'load456';

      const key = getReceiptS3Key(orgId, loadId);

      expect(key).toBe('org123/load456/receipt.pdf');
    });
  });

  describe('getSignatureUploadUrl', () => {
    it('should generate presigned URL with s3Key', async () => {
      const orgId = 'test-org';
      const loadId = 'test-load';

      const result = await getSignatureUploadUrl(orgId, loadId);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('s3Key');
      expect(result.s3Key).toMatch(/^test-org\/test-load\/signature-\d+\.png$/);
    });
  });
});
