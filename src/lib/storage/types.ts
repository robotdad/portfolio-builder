import type { ProcessedImage } from '../image-processor'

export interface StoredImageUrls {
  url: string
  thumbnailUrl: string
  placeholderUrl: string
  srcset400: string
  srcset800: string
  srcset1200: string
  srcset1600: string
}

export interface StorageAdapter {
  saveProcessedImages(assetId: string, processed: ProcessedImage): Promise<StoredImageUrls>
  deleteAssetFiles(assetId: string): Promise<void>
}
