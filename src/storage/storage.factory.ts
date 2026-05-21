import { S3Client } from "@aws-sdk/client-s3";
import { BlobServiceClient } from "@azure/storage-blob";
import { env, requireEnv } from "../config/env.js";
import { AzureBlobProvider } from "./providers/azureBlob.provider.js";
import { R2Provider } from "./providers/r2.provider.js";
import { S3Provider } from "./providers/s3.provider.js";
import { setStorageProvider } from "./storageProvider.js";
import type { StorageProvider } from "./types.js";

export function createStorageProvider(): StorageProvider {
  const provider = env.STORAGE_PROVIDER;

  if (provider === "azure") {
    const connectionString = requireEnv("AZURE_STORAGE_CONNECTION_STRING");
    const container = requireEnv("AZURE_BLOB_CONTAINER");
    const client = BlobServiceClient.fromConnectionString(connectionString);
    return new AzureBlobProvider(client, container);
  }

  if (provider === "s3") {
    const accessKeyId = requireEnv("AWS_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("AWS_SECRET_ACCESS_KEY");
    const region = requireEnv("AWS_REGION");
    const bucket = requireEnv("AWS_S3_BUCKET");
    const endpoint = process.env.AWS_S3_ENDPOINT;

    const client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    });

    return new S3Provider(client, bucket);
  }

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("R2_BUCKET");
  const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: env.R2_REGION,
    endpoint: r2Endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  return new R2Provider(client, bucket);
}

setStorageProvider(createStorageProvider());
