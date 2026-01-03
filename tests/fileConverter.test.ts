import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseCSV,
  toCSV,
  convertData,
  convertImage,
  MIME_TYPES,
  IMAGE_FORMATS,
  DATA_FORMATS
} from '../utils/fileConverter';

// Helper to create a mock File
function createMockFile(content: string, filename: string, mimeType: string): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

// ============================================
// parseCSV Tests
// ============================================
describe('parseCSV', () => {
  it('should parse a simple CSV with headers and values', () => {
    const csv = `name,age,city
John,30,New York
Jane,25,Los Angeles`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'John', age: '30', city: 'New York' });
    expect(result[1]).toEqual({ name: 'Jane', age: '25', city: 'Los Angeles' });
  });

  it('should handle quoted values with commas', () => {
    const csv = `name,city
"Smith, John","New York, NY"`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: 'Smith, John', city: 'New York, NY' });
  });

  it('should handle empty CSV (headers only)', () => {
    const csv = 'name,age,city';
    const result = parseCSV(csv);
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = parseCSV('');
    expect(result).toHaveLength(0);
  });

  it('should handle Windows-style line endings (CRLF)', () => {
    const csv = "name,age\r\nJohn,30\r\nJane,25";
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'John', age: '30' });
  });

  it('should trim whitespace from headers and values', () => {
    const csv = `name , age
 John , 30 `;

    const result = parseCSV(csv);

    expect(result[0]).toEqual({ name: 'John', age: '30' });
  });

  it('should handle missing values in rows', () => {
    const csv = `name,age,city
John,30`;

    const result = parseCSV(csv);

    expect(result[0]).toEqual({ name: 'John', age: '30', city: '' });
  });
});

// ============================================
// toCSV Tests
// ============================================
describe('toCSV', () => {
  it('should convert an array of objects to CSV', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ];

    const result = toCSV(data);
    const lines = result.split('\n');

    expect(lines[0]).toBe('name,age');
    expect(lines[1]).toBe('"John","30"');
    expect(lines[2]).toBe('"Jane","25"');
  });

  it('should return empty string for empty array', () => {
    const result = toCSV([]);
    expect(result).toBe('');
  });

  it('should escape double quotes in values', () => {
    const data = [{ name: 'John "Johnny" Doe' }];
    const result = toCSV(data);

    expect(result).toContain('\\"');
  });

  it('should handle null and undefined values', () => {
    const data = [
      { name: 'John', value: null },
      { name: 'Jane', value: undefined }
    ];

    const result = toCSV(data);
    const lines = result.split('\n');

    expect(lines[1]).toBe('"John",""');
    expect(lines[2]).toBe('"Jane",""');
  });

  it('should handle numeric values', () => {
    const data = [{ count: 42, price: 19.99 }];
    const result = toCSV(data);

    expect(result).toContain('"42"');
    expect(result).toContain('"19.99"');
  });
});

// ============================================
// convertData Tests
// ============================================
describe('convertData', () => {
  describe('JSON to other formats', () => {
    it('should convert JSON to CSV', async () => {
      const jsonContent = JSON.stringify([
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]);
      const file = createMockFile(jsonContent, 'data.json', 'application/json');

      const result = await convertData(file, 'csv');
      const text = await result.text();

      expect(text).toContain('name,age');
      expect(text).toContain('"John"');
      expect(text).toContain('"Jane"');
    });

    it('should convert JSON to TXT', async () => {
      const jsonContent = JSON.stringify([
        { name: 'John', city: 'NYC' }
      ]);
      const file = createMockFile(jsonContent, 'data.json', 'application/json');

      const result = await convertData(file, 'txt');
      const text = await result.text();

      expect(text).toContain('John');
      expect(text).toContain('NYC');
    });

    it('should throw error for invalid JSON', async () => {
      const file = createMockFile('{ invalid json', 'data.json', 'application/json');

      await expect(convertData(file, 'csv')).rejects.toThrow('Invalid JSON file');
    });

    it('should throw error when converting non-array JSON to CSV', async () => {
      const jsonContent = JSON.stringify({ name: 'John', age: 30 });
      const file = createMockFile(jsonContent, 'data.json', 'application/json');

      await expect(convertData(file, 'csv')).rejects.toThrow('Cannot convert non-array JSON object to CSV directly');
    });
  });

  describe('CSV to other formats', () => {
    it('should convert CSV to JSON', async () => {
      const csvContent = `name,age
John,30
Jane,25`;
      const file = createMockFile(csvContent, 'data.csv', 'text/csv');

      const result = await convertData(file, 'json');
      const text = await result.text();
      const parsed = JSON.parse(text);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('John');
      expect(parsed[0].age).toBe('30');
    });

    it('should convert CSV to TXT', async () => {
      const csvContent = `name,age
John,30`;
      const file = createMockFile(csvContent, 'data.csv', 'text/csv');

      const result = await convertData(file, 'txt');
      const text = await result.text();

      expect(text).toContain('John');
      expect(text).toContain('30');
    });
  });

  describe('TXT to other formats', () => {
    it('should convert TXT to JSON', async () => {
      const txtContent = `Line 1
Line 2
Line 3`;
      const file = createMockFile(txtContent, 'data.txt', 'text/plain');

      const result = await convertData(file, 'json');
      const text = await result.text();
      const parsed = JSON.parse(text);

      expect(parsed).toHaveLength(3);
      expect(parsed[0]).toEqual({ line: 'Line 1' });
    });

    it('should convert TXT to CSV', async () => {
      const txtContent = `Line 1
Line 2`;
      const file = createMockFile(txtContent, 'data.txt', 'text/plain');

      const result = await convertData(file, 'csv');
      const text = await result.text();

      expect(text).toContain('line');
      expect(text).toContain('"Line 1"');
      expect(text).toContain('"Line 2"');
    });
  });

  describe('Blob types', () => {
    it('should return correct MIME type for JSON output', async () => {
      const csvContent = `name,age
John,30`;
      const file = createMockFile(csvContent, 'data.csv', 'text/csv');

      const result = await convertData(file, 'json');

      expect(result.type).toBe('application/json');
    });

    it('should return correct MIME type for CSV output', async () => {
      const jsonContent = JSON.stringify([{ name: 'John' }]);
      const file = createMockFile(jsonContent, 'data.json', 'application/json');

      const result = await convertData(file, 'csv');

      expect(result.type).toBe('text/csv');
    });

    it('should return correct MIME type for TXT output', async () => {
      const jsonContent = JSON.stringify([{ name: 'John' }]);
      const file = createMockFile(jsonContent, 'data.json', 'application/json');

      const result = await convertData(file, 'txt');

      expect(result.type).toBe('text/plain');
    });
  });
});

// ============================================
// convertImage Tests
// Note: Image conversion requires browser Canvas/Image APIs that are not
// fully supported in happy-dom. These tests verify the function signature
// and error handling. Full image conversion testing requires a real browser.
// ============================================
describe('convertImage', () => {
  // Create a minimal valid PNG (1x1 transparent pixel)
  const createMinimalPng = (): Blob => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: 'image/png' });
  };

  it.skip('should convert PNG to JPG (requires browser)', async () => {
    const pngBlob = createMinimalPng();
    const file = new File([pngBlob], 'image.png', { type: 'image/png' });

    const result = await convertImage(file, 'jpg', 0.9);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
  });

  it.skip('should convert PNG to WEBP (requires browser)', async () => {
    const pngBlob = createMinimalPng();
    const file = new File([pngBlob], 'image.png', { type: 'image/png' });

    const result = await convertImage(file, 'webp', 0.9);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/webp');
  });

  it.skip('should convert PNG to BMP (requires browser)', async () => {
    const pngBlob = createMinimalPng();
    const file = new File([pngBlob], 'image.png', { type: 'image/png' });

    const result = await convertImage(file, 'bmp', 1);

    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBeGreaterThan(0);
  });

  it.skip('should convert PNG to GIF (requires browser)', async () => {
    const pngBlob = createMinimalPng();
    const file = new File([pngBlob], 'image.png', { type: 'image/png' });

    const result = await convertImage(file, 'gif', 1);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/gif');
  });

  it.skip('should handle quality parameter (requires browser)', async () => {
    const pngBlob = createMinimalPng();
    const file = new File([pngBlob], 'image.png', { type: 'image/png' });

    const lowQuality = await convertImage(file, 'jpg', 0.1);
    const highQuality = await convertImage(file, 'jpg', 1.0);

    expect(lowQuality).toBeInstanceOf(Blob);
    expect(highQuality).toBeInstanceOf(Blob);
  });

  it.skip('should reject invalid image data (requires browser)', async () => {
    const file = createMockFile('not an image', 'fake.png', 'image/png');

    await expect(convertImage(file, 'jpg', 0.9)).rejects.toThrow();
  });

  it.skip('should convert to PNG format (requires browser)', async () => {
    const pngBlob = createMinimalPng();
    const file = new File([pngBlob], 'image.png', { type: 'image/png' });

    const result = await convertImage(file, 'png', 1);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });

  // Verify the function is exported and callable
  it('should be a function that accepts File, format, and quality', () => {
    expect(typeof convertImage).toBe('function');
    expect(convertImage.length).toBe(3);
  });
});

// ============================================
// MIME_TYPES Tests
// ============================================
describe('MIME_TYPES', () => {
  it('should have correct MIME type for image formats', () => {
    expect(MIME_TYPES.jpg).toBe('image/jpeg');
    expect(MIME_TYPES.jpeg).toBe('image/jpeg');
    expect(MIME_TYPES.png).toBe('image/png');
    expect(MIME_TYPES.webp).toBe('image/webp');
    expect(MIME_TYPES.gif).toBe('image/gif');
    expect(MIME_TYPES.bmp).toBe('image/bmp');
    expect(MIME_TYPES.ico).toBe('image/x-icon');
  });

  it('should have correct MIME type for data formats', () => {
    expect(MIME_TYPES.json).toBe('application/json');
    expect(MIME_TYPES.csv).toBe('text/csv');
    expect(MIME_TYPES.txt).toBe('text/plain');
  });

  it('should have correct MIME type for document formats', () => {
    expect(MIME_TYPES.pdf).toBe('application/pdf');
    expect(MIME_TYPES.docx).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(MIME_TYPES.xlsx).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(MIME_TYPES.html).toBe('text/html');
  });
});

// ============================================
// Format Arrays Tests
// ============================================
describe('Format arrays', () => {
  it('should have all image formats defined', () => {
    expect(IMAGE_FORMATS).toContain('jpg');
    expect(IMAGE_FORMATS).toContain('png');
    expect(IMAGE_FORMATS).toContain('webp');
    expect(IMAGE_FORMATS).toContain('gif');
    expect(IMAGE_FORMATS).toContain('bmp');
    expect(IMAGE_FORMATS).toContain('ico');
    expect(IMAGE_FORMATS).toHaveLength(6);
  });

  it('should have all data formats defined', () => {
    expect(DATA_FORMATS).toContain('csv');
    expect(DATA_FORMATS).toContain('json');
    expect(DATA_FORMATS).toContain('txt');
    expect(DATA_FORMATS).toHaveLength(3);
  });
});

// ============================================
// Integration Tests - Full Conversion Cycles
// ============================================
describe('Full conversion cycles', () => {
  it('should handle JSON -> CSV -> JSON roundtrip', async () => {
    const original = [
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' }
    ];
    const jsonContent = JSON.stringify(original);
    const jsonFile = createMockFile(jsonContent, 'data.json', 'application/json');

    // JSON to CSV
    const csvBlob = await convertData(jsonFile, 'csv');
    const csvText = await csvBlob.text();
    const csvFile = createMockFile(csvText, 'data.csv', 'text/csv');

    // CSV back to JSON
    const jsonBlob = await convertData(csvFile, 'json');
    const jsonText = await jsonBlob.text();
    const result = JSON.parse(jsonText);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('John');
    expect(result[1].name).toBe('Jane');
  });

  it('should handle CSV -> TXT -> JSON conversion chain', async () => {
    const csvContent = `name,city
John,NYC
Jane,LA`;
    const csvFile = createMockFile(csvContent, 'data.csv', 'text/csv');

    // CSV to TXT
    const txtBlob = await convertData(csvFile, 'txt');
    const txtText = await txtBlob.text();

    expect(txtText).toContain('John');
    expect(txtText).toContain('NYC');

    // TXT to JSON
    const txtFile = createMockFile(txtText, 'data.txt', 'text/plain');
    const jsonBlob = await convertData(txtFile, 'json');
    const jsonText = await jsonBlob.text();

    const result = JSON.parse(jsonText);
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================
// Edge Cases
// ============================================
describe('Edge cases', () => {
  it('should handle CSV with commas inside quotes', async () => {
    const csvContent = `name,description
"Product A","Contains commas, like this"
"Product B","Also, has, multiple, commas"`;
    const file = createMockFile(csvContent, 'data.csv', 'text/csv');

    const result = await convertData(file, 'json');
    const text = await result.text();
    const parsed = JSON.parse(text);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].description).toContain('commas');
  });

  it('should handle CSV with tabs in values', async () => {
    const csvContent = `name,description
"Product A","Has\ttabs"`;
    const file = createMockFile(csvContent, 'data.csv', 'text/csv');

    const result = await convertData(file, 'json');
    const text = await result.text();
    const parsed = JSON.parse(text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].description).toContain('\t');
  });

  it('should handle JSON with nested objects', async () => {
    const jsonContent = JSON.stringify([
      { name: 'John', address: { city: 'NYC', zip: '10001' } }
    ]);
    const file = createMockFile(jsonContent, 'data.json', 'application/json');

    const result = await convertData(file, 'txt');
    const text = await result.text();

    expect(text).toBeTruthy();
  });

  it('should handle empty JSON array', async () => {
    const jsonContent = '[]';
    const file = createMockFile(jsonContent, 'data.json', 'application/json');

    const result = await convertData(file, 'csv');
    const text = await result.text();

    expect(text).toBe('');
  });

  it('should handle single-line TXT', async () => {
    const txtContent = 'Just one line';
    const file = createMockFile(txtContent, 'data.txt', 'text/plain');

    const result = await convertData(file, 'json');
    const text = await result.text();
    const parsed = JSON.parse(text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].line).toBe('Just one line');
  });
});
