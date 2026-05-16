/**
 * Compression Service - Single Responsibility: Handle data compression/decompression
 * Following SOLID Principles:
 * - Single Responsibility: Only handles compression operations
 * - Open/Closed: Can be extended with different compression algorithms
 * - Dependency Inversion: Uses abstract compression interface
 */

import { gzip, ungzip } from 'pako';

export interface CompressionResult {
  data: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export class CompressionService {
  /**
   * Compress data using gzip and encode as base64
   */
  static compress(data: string): CompressionResult {
    try {
      const originalSize = new Blob([data]).size;
      const compressed = gzip(data, { level: 9 });
      const base64 = Buffer.from(compressed).toString('base64');
      const compressedSize = Buffer.byteLength(base64, 'base64');

      return {
        data: base64,
        originalSize,
        compressedSize,
        compressionRatio: originalSize > 0 
          ? ((originalSize - compressedSize) / originalSize) * 100 
          : 0,
      };
    } catch (error) {
      console.error('Compression error:', error);
      return {
        data,
        originalSize: new Blob([data]).size,
        compressedSize: new Blob([data]).size,
        compressionRatio: 0,
      };
    }
  }

  /**
   * Decompress base64 encoded gzip data
   */
  static decompress(compressedData: string): string {
    try {
      const buffer = Buffer.from(compressedData, 'base64');
      const decompressed = ungzip(buffer);
      return new TextDecoder().decode(decompressed);
    } catch (error) {
      // If decompression fails, return original data (might not be compressed)
      console.warn('Decompression failed, returning original data:', error);
      return compressedData;
    }
  }

  /**
   * Calculate hash for deduplication
   */
  static hash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Check if data is compressed
   */
  static isCompressed(data: string): boolean {
    try {
      const buffer = Buffer.from(data, 'base64');
      // Gzip magic number: 1f 8b
      return buffer[0] === 0x1f && buffer[1] === 0x8b;
    } catch {
      return false;
    }
  }
}

export default CompressionService;
