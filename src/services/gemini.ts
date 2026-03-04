import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "../types";

// ── Constants ──────────────────────────────────────────────────
const STORAGE_KEY = "skkn_api_key";
const MODEL_STORAGE_KEY = "skkn_selected_model";

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Mạnh nhất, phân tích sâu" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Cân bằng tốc độ & chất lượng" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "Nhanh nhất, tiết kiệm quota" },
];

export const DEFAULT_MODEL = "gemini-2.5-flash";

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function removeApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Model helpers ──────────────────────────────────────────────
export function getSelectedModel(): string {
  const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
  if (savedModel && AVAILABLE_MODELS.some(m => m.id === savedModel)) {
    return savedModel;
  }
  return DEFAULT_MODEL;
}

export function saveSelectedModel(modelId: string): void {
  localStorage.setItem(MODEL_STORAGE_KEY, modelId);
}

function createClient(apiKey?: string): GoogleGenAI {
  const key = apiKey ?? getApiKey();
  if (!key) throw new Error("Chưa nhập API Key. Vui lòng nhập API Key trước khi sử dụng.");
  return new GoogleGenAI({ apiKey: key });
}

// ── Test API Key ──────────────────────────────────────────────────
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    // Luôn dùng gemini-2.0-flash hoặc gemini-2.5-flash để test key 
    // vì các model "thinking" hoặc "pro" có thể không support prompt quá ngắn
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Trả lời đúng 1 từ: Xin chào",
    });
    if (response.text) {
      return { valid: true };
    }
    return { valid: false, error: "API Key không trả về kết quả." };
  } catch (error: any) {
    console.error("API Key test error:", error);

    // @google/genai SDK uses 'statusCode' for HTTP status
    const statusCode = error?.statusCode || error?.status || error?.code;
    const msg = error?.message || "";

    console.error("Error statusCode:", statusCode, "Message:", msg);

    // 1. Check by HTTP status code (most reliable)
    if (statusCode === 400) {
      // INVALID_ARGUMENT or FAILED_PRECONDITION - free tier unavailable in some regions
      return { valid: false, error: `Yêu cầu không hợp lệ. API có thể chưa khả dụng tại khu vực của bạn. Chi tiết: ${msg}` };
    }
    if (statusCode === 401) {
      return { valid: false, error: "API Key không hợp lệ hoặc đã hết hạn. Vui lòng lấy key mới tại Google AI Studio." };
    }
    if (statusCode === 403) {
      return { valid: false, error: "API Key không có quyền truy cập. Vui lòng kiểm tra lại key hoặc bật API tại Google Cloud Console." };
    }
    if (statusCode === 404) {
      return { valid: false, error: "Model AI không tìm thấy. Có thể model này chưa khả dụng tại Việt Nam hoặc với API Key của bạn." };
    }
    if (statusCode === 429) {
      return { valid: false, error: "Đã hết hạn mức (quota). Vui lòng chờ vài phút hoặc dùng key khác." };
    }
    if (statusCode >= 500) {
      return { valid: false, error: "Lỗi máy chủ Google AI. Vui lòng thử lại sau vài phút." };
    }

    // 2. Fallback: check by message content
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_NETWORK") || msg.includes("fetch")) {
      return { valid: false, error: "Không thể kết nối đến Google AI. Vui lòng kiểm tra kết nối mạng." };
    }

    // 3. Show actual error for unknown cases
    return { valid: false, error: `Lỗi: ${msg || "Không xác định. Vui lòng thử lại."}` };
  }
}

// ── Analyze SKKN ──────────────────────────────────────────────────
export async function analyzeSKKN(
  title: string,
  level: string,
  subject: string,
  content: string,
  target: string,
  apiKey?: string
): Promise<AnalysisResult> {
  const ai = createClient(apiKey);
  const model = getSelectedModel();

  const prompt = `
    Bạn là một CHUYÊN GIA THẨM ĐỊNH KHÓ TÍNH trong hội đồng chấm Sáng kiến kinh nghiệm (SKKN) ngành giáo dục.
    Nhiệm vụ của bạn là "vạch lá tìm sâu", đánh giá khắt khe, khách quan và chính xác thực chất của SKKN.
    KHÔNG ĐƯỢC nể nang hay đánh giá cao chung chung. Nếu SKKN kém, hãy cho điểm thấp (dưới 50/100) và chỉ rõ lý do.

    Thông tin đề tài:
    - Tên đề tài: ${title}
    - Cấp học: ${level}
    - Môn/Lĩnh vực: ${subject}
    - Mục tiêu thi: ${target}
    
    Nội dung cần phân tích (trích đoạn):
    "${content.substring(0, 40000)}"

    TIÊU CHÍ ĐÁNH GIÁ KHẮT KHE:
    1. TÍNH MỚI (Quan trọng nhất): Giải pháp có thực sự mới, sáng tạo không? Hay chỉ là tổng hợp lại kiến thức Sách giáo khoa, Sách giáo viên, hoặc các phương pháp dạy học truyền thống (như thảo luận nhóm, trò chơi...) một cách rập khuôn? Nếu chỉ là "bình mới rượu cũ", hãy đánh giá THẤP điểm này.
    2. TÍNH HIỆU QUẢ & SỐ LIỆU: Có số liệu chứng minh cụ thể không? Có bảng so sánh đối chứng (Lớp Thực nghiệm vs Lớp Đối chứng, hoặc Trước vs Sau khi áp dụng) không? Số liệu có logic và đáng tin cậy không? Nếu không có số liệu hoặc số liệu sơ sài, hãy trừ điểm nặng.
    3. TÍNH KHOA HỌC & CẤU TRÚC: Có đầy đủ các phần: Đặt vấn đề, Nội dung (Cơ sở lý luận, Thực trạng, Giải pháp), Kết luận không? Lý luận có trích dẫn nguồn không?
    4. TÍNH ỨNG DỤNG: Giải pháp có dễ áp dụng đại trà không hay quá tốn kém/phức tạp?

    Trả về JSON với cấu trúc sau (tuyệt đối không dùng markdown block):
    {
      "overallScore": number (0-100, hãy chấm chặt, SKKN trung bình chỉ nên 50-65 điểm),
      "plagiarismRisk": number (0-100, ước tính dựa trên văn phong: nếu văn phong quá lý thuyết, giống sách vở thì nguy cơ cao),
      "summary": "Nhận xét tổng quan sắc bén, chỉ thẳng vào vấn đề cốt lõi (đạt hay không đạt).",
      "criteria": [
        {
          "id": "structure",
          "name": "Cấu trúc & Hình thức",
          "score": number (0-10, chấm lẻ 0.5),
          "maxScore": 10,
          "comment": "Nhận xét ngắn gọn, chỉ ra lỗi sai cụ thể về bố cục.",
          "strengths": ["Điểm mạnh cụ thể"],
          "weaknesses": ["Lỗi sai cụ thể"]
        },
        {
          "id": "theory",
          "name": "Cơ sở lý luận",
          "score": number (0-10),
          "maxScore": 10,
          "comment": "Lý luận có sát đề tài không hay lan man?",
          "strengths": [],
          "weaknesses": []
        },
        {
          "id": "practice",
          "name": "Thực trạng",
          "score": number (0-10),
          "maxScore": 10,
          "comment": "Phân tích thực trạng có số liệu minh chứng không?",
          "strengths": [],
          "weaknesses": []
        },
        {
          "id": "solution",
          "name": "Nội dung Giải pháp",
          "score": number (0-20),
          "maxScore": 20,
          "comment": "Giải pháp có cụ thể các bước không?",
          "strengths": [],
          "weaknesses": []
        },
        {
          "id": "data",
          "name": "Hiệu quả & Số liệu",
          "score": number (0-20),
          "maxScore": 20,
          "comment": "Số liệu có thuyết phục không?",
          "strengths": [],
          "weaknesses": []
        },
        {
          "id": "novelty",
          "name": "Tính mới & Sáng tạo",
          "score": number (0-15),
          "maxScore": 15,
          "comment": "Có gì mới so với cách dạy truyền thống?",
          "strengths": [],
          "weaknesses": []
        },
        {
          "id": "feasibility",
          "name": "Khả năng áp dụng",
          "score": number (0-10),
          "maxScore": 10,
          "comment": "Có dễ áp dụng không?",
          "strengths": [],
          "weaknesses": []
        },
        {
          "id": "language",
          "name": "Ngôn ngữ & Diễn đạt",
          "score": number (0-5),
          "maxScore": 5,
          "comment": "Văn phong khoa học hay văn nói?",
          "strengths": [],
          "weaknesses": []
        }
      ],
      "detailedErrors": [
        {
          "context": "Đoạn văn lỗi",
          "suggestion": "Gợi ý sửa",
          "type": "Lỗi Logic / Số liệu ảo / Diễn đạt / Chính tả"
        }
      ],
      "roadmap": {
        "shortTerm": ["Việc cần sửa ngay"],
        "mediumTerm": ["Việc cần làm để nâng cao"],
        "longTerm": ["Định hướng phát triển"]
      },
      "expertAdvice": "Lời khuyên chuyên gia."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI không trả về kết quả. Vui lòng thử lại.");

    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing SKKN:", error);
    const statusCode = error?.statusCode || error?.status || error?.code;
    const msg = error?.message || "";

    if (statusCode === 400) {
      throw new Error(`Yêu cầu không hợp lệ. Chi tiết: ${msg}`);
    }
    if (statusCode === 401 || statusCode === 403) {
      throw new Error("API Key không hợp lệ hoặc không có quyền. Vui lòng kiểm tra lại trong phần API Key.");
    }
    if (statusCode === 429) {
      throw new Error("Đã hết hạn mức API. Vui lòng chờ vài phút hoặc dùng key khác.");
    }
    if (statusCode >= 500) {
      throw new Error("Lỗi máy chủ Google AI. Vui lòng thử lại sau.");
    }
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
      throw new Error("Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng.");
    }
    throw new Error(`Lỗi phân tích: ${msg || "Không xác định. Vui lòng thử lại."}`);
  }
}
