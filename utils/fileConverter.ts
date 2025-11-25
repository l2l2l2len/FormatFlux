export type ImageFormat = 'jpg' | 'png' | 'webp' | 'gif' | 'bmp' | 'ico';
export type DataFormat = 'json' | 'csv' | 'txt';
export type DocumentFormat = 'pdf' | 'docx' | 'txt' | 'html' | 'csv' | 'json' | 'xlsx';

export type SupportedFormat = ImageFormat | DataFormat | DocumentFormat;

export const IMAGE_FORMATS: ImageFormat[] = ['jpg', 'png', 'webp', 'gif', 'bmp', 'ico'];
export const DATA_FORMATS: DataFormat[] = ['csv', 'json', 'txt'];
// Document formats are context-dependent (input vs output), managed in ConverterPage or here helpers

// External Library Declarations
declare const pdfjsLib: any;
declare const mammoth: any;
declare const jspdf: any;
declare const XLSX: any;

export const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  json: 'application/json',
  csv: 'text/csv',
  txt: 'text/plain',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  html: 'text/html',
};

// Helper to download blob
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const convertImage = async (
  file: File,
  format: ImageFormat,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill background white for JPEGs/BMPs to avoid black transparency
        if (format === 'jpg' || format === 'bmp') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        let mimeType = MIME_TYPES[format];
        
        // Browser support fallback for specific formats
        if (format === 'ico') {
           mimeType = 'image/png';
        }
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Conversion failed'));
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const convertData = async (
  file: File,
  targetFormat: DataFormat
): Promise<Blob> => {
  const text = await file.text();
  let data: any;
  const sourceFormat = file.name.split('.').pop()?.toLowerCase();

  // Parse Source
  if (sourceFormat === 'json') {
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON file');
    }
  } else if (sourceFormat === 'csv') {
    data = parseCSV(text);
  } else if (sourceFormat === 'txt') {
    data = text.split('\n').map(line => ({ line }));
  } else {
    data = { content: text };
  }

  // Convert to Target
  let outputString = '';
  
  if (targetFormat === 'json') {
    outputString = JSON.stringify(data, null, 2);
  } else if (targetFormat === 'csv') {
    if (Array.isArray(data)) {
        outputString = toCSV(data);
    } else {
        throw new Error('Cannot convert non-array JSON object to CSV directly.');
    }
  } else if (targetFormat === 'txt') {
    if (typeof data === 'string') outputString = data;
    else if (Array.isArray(data)) outputString = data.map(row => Object.values(row).join(' ')).join('\n');
    else outputString = JSON.stringify(data);
  }

  return new Blob([outputString], { type: MIME_TYPES[targetFormat] });
};

// --- DOCUMENT CONVERSION LOGIC ---

export const convertDocument = async (
  file: File,
  targetFormat: DocumentFormat
): Promise<Blob> => {
  const sourceFormat = file.name.split('.').pop()?.toLowerCase();

  // Excel Handling (using SheetJS)
  if (sourceFormat === 'xlsx' || sourceFormat === 'xls') {
    return convertExcel(file, targetFormat);
  }

  // Word Handling (using Mammoth/jsPDF)
  if (sourceFormat === 'docx') {
    return convertWord(file, targetFormat);
  }

  // PDF Handling (using PDF.js)
  if (sourceFormat === 'pdf') {
    return convertPdf(file, targetFormat);
  }

  throw new Error(`Unsupported source format: ${sourceFormat}`);
};

async function convertExcel(file: File, targetFormat: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        let content: string;
        let mime = 'text/plain';

        if (targetFormat === 'csv') {
          content = XLSX.utils.sheet_to_csv(worksheet);
          mime = 'text/csv';
        } else if (targetFormat === 'json') {
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          content = JSON.stringify(jsonData, null, 2);
          mime = 'application/json';
        } else if (targetFormat === 'html') {
          content = XLSX.utils.sheet_to_html(worksheet);
          mime = 'text/html';
        } else {
           throw new Error(`Cannot convert Excel to ${targetFormat}`);
        }

        resolve(new Blob([content], { type: mime }));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

async function convertWord(file: File, targetFormat: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();

  if (targetFormat === 'html' || targetFormat === 'pdf') {
     // First convert to HTML using Mammoth
     const result = await mammoth.convertToHtml({ arrayBuffer });
     const html = result.value;

     if (targetFormat === 'html') {
       return new Blob([html], { type: 'text/html' });
     } 
     
     if (targetFormat === 'pdf') {
       // Simple PDF generation from HTML
       const { jsPDF } = (window as any).jspdf;
       const doc = new jsPDF();
       
       // Use html method if available (better layout) or simply split text
       // Note: Client-side robust HTML->PDF is hard. We use a simplified text approach here
       // or try to strip tags and place text.
       // For better UX in a demo, we extract raw text and place it, 
       // or we use doc.html but it requires the element to be in DOM.
       
       // Let's use raw text for reliability in this environment
       const textResult = await mammoth.extractRawText({ arrayBuffer });
       const text = textResult.value;
       
       const splitText = doc.splitTextToSize(text, 180); // Margin
       let y = 10;
       for(let i=0; i<splitText.length; i++) {
           if (y > 280) {
               doc.addPage();
               y = 10;
           }
           doc.text(splitText[i], 10, y);
           y += 7;
       }
       
       return doc.output('blob');
     }
  }

  if (targetFormat === 'txt') {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return new Blob([result.value], { type: 'text/plain' });
  }

  throw new Error(`Cannot convert Word to ${targetFormat}`);
}

async function convertPdf(file: File, targetFormat: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  if (targetFormat === 'txt') {
    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    return new Blob([fullText], { type: 'text/plain' });
  }

  if (targetFormat === 'jpg' || targetFormat === 'png') {
    // Only converting the first page for image format to keep it simple
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 }); // High res
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!ctx) throw new Error('Canvas context failed');

    await page.render({ canvasContext: ctx, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, targetFormat === 'png' ? 'image/png' : 'image/jpeg', 0.9);
    });
  }
  
  // Hacky PDF -> DOC (Just text inside HTML wrapper that Word opens)
  if (targetFormat === 'docx') {
     let fullText = '';
     for (let i = 1; i <= numPages; i++) {
       const page = await pdf.getPage(i);
       const textContent = await page.getTextContent();
       const pageText = textContent.items.map((item: any) => item.str).join(' ');
       fullText += `<p>${pageText}</p><hr/>`;
     }
     
     const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
     const footer = "</body></html>";
     const sourceHTML = header + fullText + footer;
     
     return new Blob(['\ufeff', sourceHTML], {
         type: 'application/msword'
     });
  }

  throw new Error(`Cannot convert PDF to ${targetFormat}`);
}


// --- UTILS ---

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    for(let i=0; i<line.length; i++) {
        const char = line[i];
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
        obj[h] = values[i] || '';
    });
    return obj;
  });
}

function toCSV(data: any[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + (val === null || val === undefined ? '' : val)).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}