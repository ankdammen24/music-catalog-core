import { BlobSASPermissions, BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters } from "@azure/storage-blob";
import type { StorageProvider } from "../types.js";

export class AzureBlobProvider implements StorageProvider {
  private readonly container;
  constructor(private readonly client: BlobServiceClient, private readonly containerName: string) { this.container = client.getContainerClient(containerName); }
  async uploadObject(input: Parameters<StorageProvider["uploadObject"]>[0]) { const blob = this.container.getBlockBlobClient(input.key); const payload = typeof input.body === "string" ? Buffer.from(input.body) : Buffer.from(input.body); const out = await blob.uploadData(payload, { blobHTTPHeaders: { blobContentType: input.contentType }, metadata: input.metadata }); return { key: input.key, etag: out.etag }; }
  async getObject(input: Parameters<StorageProvider["getObject"]>[0]) { const out = await this.container.getBlobClient(input.key).download(); const body = out.readableStreamBody ? new Uint8Array(await streamToBuffer(out.readableStreamBody)) : undefined; return { body, contentType: out.contentType, etag: out.etag }; }
  async deleteObject(input: Parameters<StorageProvider["deleteObject"]>[0]) { await this.container.deleteBlob(input.key); }
  async listObjects(input: Parameters<StorageProvider["listObjects"]>[0]) { const results = []; for await (const b of this.container.listBlobsFlat({ prefix: input.prefix })) { results.push({ key: b.name, size: b.properties.contentLength, etag: b.properties.etag, lastModified: b.properties.lastModified }); if (input.maxKeys && results.length >= input.maxKeys) break; } return results; }
  async objectExists(input: Parameters<StorageProvider["objectExists"]>[0]) { return this.container.getBlobClient(input.key).exists(); }
  async getSignedUploadUrl(input: Parameters<StorageProvider["getSignedUploadUrl"]>[0]) { return this.getSasUrl(input.key, input.expiresInSeconds ?? 900, "cw"); }
  async getSignedDownloadUrl(input: Parameters<StorageProvider["getSignedDownloadUrl"]>[0]) { return this.getSasUrl(input.key, input.expiresInSeconds ?? 300, "r"); }
  private getSasUrl(key: string, expiresIn: number, perms: string) { const cred = this.client.credential; if (!(cred instanceof StorageSharedKeyCredential)) throw new Error("Azure shared key credential required for signed URLs"); const startsOn = new Date(); const expiresOn = new Date(Date.now() + expiresIn * 1000); const sas = generateBlobSASQueryParameters({ containerName: this.containerName, blobName: key, permissions: BlobSASPermissions.parse(perms), startsOn, expiresOn }, cred).toString(); return `${this.container.getBlockBlobClient(key).url}?${sas}`; }
}
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> { const chunks: Buffer[] = []; for await (const c of stream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)); return Buffer.concat(chunks); }
