// S3 helpers for presigned URLs and file operations
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';

const client = new S3Client({ region: process.env.REGION || 'us-east-1' });
const ASSETS_BUCKET = process.env.ASSETS_BUCKET || 'couriercue-dev-assets';

/**
 * Generate presigned URL for uploading signature
 */
export async function getSignatureUploadUrl(
  orgId: string,
  loadId: string,
  contentType: string = 'image/png'
): Promise<{ uploadUrl: string; s3Key: string }> {
  const s3Key = `${orgId}/${loadId}/signature-${Date.now()}.png`;

  const command = new PutObjectCommand({
    Bucket: ASSETS_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 minutes

  return { uploadUrl, s3Key };
}

/**
 * Generate presigned URL for uploading logo
 */
export async function getLogoUploadUrl(
  orgId: string,
  contentType: string
): Promise<{ uploadUrl: string; s3Key: string }> {
  const ext = contentType.split('/')[1] || 'png';
  const s3Key = `${orgId}/logo-${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: ASSETS_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return { uploadUrl, s3Key };
}

/**
 * Generate presigned URL for downloading file
 */
export async function getDownloadUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: ASSETS_BUCKET,
    Key: s3Key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Get S3 object as buffer
 */
export async function getObject(s3Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: ASSETS_BUCKET,
    Key: s3Key,
  });

  const response = await client.send(command);
  const stream = response.Body as any;
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Upload buffer to S3
 */
export async function putObject(
  s3Key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: ASSETS_BUCKET,
    Key: s3Key,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);
}

/**
 * Generate S3 key for PDF receipt
 */
export function getReceiptS3Key(orgId: string, loadId: string): string {
  return `${orgId}/${loadId}/receipt.pdf`;
}

/**
 * Calculate SHA256 hash of buffer
 */
export function calculateHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Check if S3 key belongs to org (security check)
 */
export function verifyS3KeyOwnership(s3Key: string, orgId: string): boolean {
  return s3Key.startsWith(`${orgId}/`);
}
