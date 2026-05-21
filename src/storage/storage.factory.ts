import { S3Client } from "@aws-sdk/client-s3";
import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "../config/env.js";
import { AzureBlobProvider } from "./providers/azureBlob.provider.js";
import { R2Provider } from "./providers/r2.provider.js";
import { S3Provider } from "./providers/s3.provider.js";
import { setStorageProvider } from "./storageProvider.js";
import type { StorageProvider } from "./types.js";

export function createStorageProvider(): StorageProvider {
  const provider = env.STORAGE_PROVIDER;
  if (provider === "azure") {
    const client = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
    return new AzureBlobProvider(client, env.AZURE_BLOB_CONTAINER);
  }

  if (provider === "s3") {
    const client = new S3Client({ region: env.AWS_REGION, endpoint: env.AWS_S3_ENDPOINT || undefined, forcePathStyle: Boolean(env.AWS_S3_ENDPOINT), credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY } });
    return new S3Provider(client, env.AWS_S3_BUCKET);
  }

  const r2Endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const client = new S3Client({ region: env.R2_REGION, endpoint: r2Endpoint, forcePathStyle: true, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY } });
  return new R2Provider(client, env.R2_BUCKET);
}

setStorageProvider(createStorageProvider());
