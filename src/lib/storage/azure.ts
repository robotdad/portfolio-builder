import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
import type { ProcessedImage } from '../image-processor'
import type { StorageAdapter, StoredImageUrls } from './types'

const FILE_VARIANTS = [
  { name: 'display.webp', key: 'display' },
  { name: 'thumbnail.webp', key: 'thumbnail' },
  { name: 'w400.webp', key: 'w400' },
  { name: 'w800.webp', key: 'w800' },
  { name: 'w1200.webp', key: 'w1200' },
  { name: 'w1600.webp', key: 'w1600' },
] as const

function getAzureConfig() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY
  const containerName =
    process.env.AZURE_STORAGE_CONTAINER_NAME || 'portfolio-images'

  let blobServiceClient: BlobServiceClient

  if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  } else if (accountName && accountKey) {
    const credential = new StorageSharedKeyCredential(accountName, accountKey)
    blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    )
  } else {
    throw new Error(
      'Azure storage configuration incomplete. ' +
        'Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY'
    )
  }

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const baseUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}`

  return { containerClient, baseUrl }
}

async function saveProcessedImages(
  assetId: string,
  processed: ProcessedImage
): Promise<StoredImageUrls> {
  const { containerClient, baseUrl } = getAzureConfig()

  const bufferMap: Record<string, Buffer> = {
    display: processed.display,
    thumbnail: processed.thumbnail,
    w400: processed.srcset.w400,
    w800: processed.srcset.w800,
    w1200: processed.srcset.w1200,
    w1600: processed.srcset.w1600,
  }

  // Upload all variants in parallel
  await Promise.all(
    FILE_VARIANTS.map(async ({ name, key }) => {
      const blobName = `${assetId}/${name}`
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)
      const buffer = bufferMap[key]

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'image/webp',
          blobCacheControl: 'public, max-age=31536000',
        },
      })
    })
  )

  const assetBaseUrl = `${baseUrl}/${assetId}`
  return {
    url: `${assetBaseUrl}/display.webp`,
    thumbnailUrl: `${assetBaseUrl}/thumbnail.webp`,
    placeholderUrl: processed.placeholder,
    srcset400: `${assetBaseUrl}/w400.webp`,
    srcset800: `${assetBaseUrl}/w800.webp`,
    srcset1200: `${assetBaseUrl}/w1200.webp`,
    srcset1600: `${assetBaseUrl}/w1600.webp`,
  }
}

async function deleteAssetFiles(assetId: string): Promise<void> {
  const { containerClient } = getAzureConfig()
  const prefix = `${assetId}/`
  const blobs: string[] = []

  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    blobs.push(blob.name)
  }

  if (blobs.length > 0) {
    await Promise.all(
      blobs.map((blobName) =>
        containerClient.getBlockBlobClient(blobName).deleteIfExists()
      )
    )
  }
}

async function deleteAllFiles(): Promise<number> {
  const { containerClient } = getAzureConfig()
  const blobs: string[] = []

  // List ALL blobs in the container
  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push(blob.name)
  }

  if (blobs.length > 0) {
    await Promise.all(
      blobs.map((blobName) =>
        containerClient.getBlockBlobClient(blobName).deleteIfExists()
      )
    )
  }

  return blobs.length
}

export const azureStorageAdapter: StorageAdapter = {
  saveProcessedImages,
  deleteAssetFiles,
  deleteAllFiles,
}
