import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";
import { getApiKey } from '../services/gemini';

// Set up the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function readDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error reading DOCX:", error);
    throw new Error("Không thể đọc file DOCX. Vui lòng đảm bảo file không bị lỗi.");
  }
}

export async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 50);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `--- Trang ${i} ---\n${pageText}\n\n`;
    }

    if (!fullText.trim()) {
      throw new Error("File PDF không chứa văn bản dạng text (có thể là ảnh scan). Hãy thử tính năng OCR cho ảnh.");
    }

    return fullText;
  } catch (error: any) {
    console.error("Error reading PDF:", error);
    throw new Error(`Lỗi đọc PDF: ${error.message || "Không xác định"}`);
  }
}

export async function readImageFile(file: File): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Chưa cấu hình API Key cho tính năng OCR. Vui lòng nhập API Key trước.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const model = "gemini-2.0-flash";
    const prompt = "Trích xuất toàn bộ văn bản từ hình ảnh này. Chỉ trả về nội dung văn bản, giữ nguyên định dạng dòng nếu có thể. Không thêm lời bình.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt },
        ],
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI không tìm thấy văn bản nào trong ảnh.");
    return text;
  } catch (error: any) {
    console.error("Error reading Image:", error);
    throw new Error(`Lỗi OCR ảnh: ${error.message || "Không xác định"}`);
  }
}

export async function readFileContent(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  console.log(`Processing file: ${name}, type: ${type}`);

  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
    return readDocxFile(file);
  } else if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return readPdfFile(file);
  } else if (type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/.test(name)) {
    return readImageFile(file);
  } else if (type === 'text/plain' || name.endsWith('.txt')) {
    return await file.text();
  } else {
    throw new Error('Định dạng file không được hỗ trợ. Vui lòng tải lên file .docx, .pdf hoặc ảnh.');
  }
}
