export interface StorageProvider {
  upload(input: {
    key: string
    body: Uint8Array
    contentType: string
  }): Promise<{ url: string }>
  delete(key: string): Promise<void>
}
