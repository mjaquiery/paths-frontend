import { describe, expect, it } from 'vitest';

import { kebabCase } from '../utils/text';
import { buildImageDownloadFilename } from '../utils/imageDownload';

describe('kebabCase', () => {
  it('lowercases and hyphenates words', () => {
    expect(kebabCase('Sunrise over the ridge')).toBe('sunrise-over-the-ridge');
  });

  it('strips punctuation and collapses runs of separators', () => {
    expect(kebabCase("Mom's 40th!! -- birthday??")).toBe('mom-s-40th-birthday');
  });

  it('drops non-ascii characters entirely', () => {
    expect(kebabCase('Café au lait')).toBe('caf-au-lait');
  });

  it('trims leading/trailing separators', () => {
    expect(kebabCase('  --hello world--  ')).toBe('hello-world');
  });

  it('truncates long input at a word boundary', () => {
    const long = 'one two three four five six seven eight nine ten eleven';
    const result = kebabCase(long, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).not.toMatch(/-$/);
    expect(result).toBe('one-two-three-four');
  });

  it('returns empty string for input with nothing kebab-able', () => {
    expect(kebabCase('!!!')).toBe('');
  });
});

describe('buildImageDownloadFilename', () => {
  it('combines the entry date and a slug of the caption', () => {
    const name = buildImageDownloadFilename('2024-01-01', {
      filename: 'IMG_1234.JPG',
      caption: 'Sunrise over the ridge',
      content_type: 'image/jpeg',
    });
    expect(name).toBe('2024-01-01-sunrise-over-the-ridge.jpg');
  });

  it('falls back to just the date when there is no caption', () => {
    const name = buildImageDownloadFilename('2024-01-01', {
      filename: 'photo.png',
      caption: null,
      content_type: 'image/png',
    });
    expect(name).toBe('2024-01-01.png');
  });

  it('prefers the extension from the filename over the content type', () => {
    const name = buildImageDownloadFilename('2024-01-01', {
      filename: 'photo.jpeg',
      caption: null,
      content_type: 'image/webp',
    });
    expect(name).toBe('2024-01-01.jpeg');
  });

  it('falls back to the content type extension when the filename has none', () => {
    const name = buildImageDownloadFilename('2024-01-01', {
      filename: 'photo',
      caption: null,
      content_type: 'image/webp',
    });
    expect(name).toBe('2024-01-01.webp');
  });

  it('defaults to jpg when neither filename nor content type give an extension', () => {
    const name = buildImageDownloadFilename('2024-01-01', {
      filename: 'photo',
      caption: null,
      content_type: null,
    });
    expect(name).toBe('2024-01-01.jpg');
  });
});
