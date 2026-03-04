import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AnalysisResult } from '../types';

export const downloadAnalysisReport = async (result: AnalysisResult, fileName: string = 'SKKN_Analysis_Report') => {
  const zip = new JSZip();

  // 1. Create a readable text report
  const reportContent = generateTextReport(result);
  zip.file("Bao_cao_chi_tiet.txt", reportContent);

  // 2. Add the raw JSON data for reference
  zip.file("Du_lieu_phan_tich.json", JSON.stringify(result, null, 2));

  // 3. Generate the zip file
  try {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${fileName}.zip`);
  } catch (error) {
    console.error("Error generating zip file:", error);
    alert("Có lỗi xảy ra khi tạo file tải xuống.");
  }
};

function generateTextReport(result: AnalysisResult): string {
  return `
BÁO CÁO THẨM ĐỊNH SÁNG KIẾN KINH NGHIỆM
=======================================

TỔNG QUAN
---------
Điểm tổng kết: ${result.overallScore}/100
Đánh giá chung: ${result.summary}
Nguy cơ đạo văn: ${result.plagiarismRisk}%

CHI TIẾT ĐIỂM SỐ TỪNG TIÊU CHÍ
------------------------------
${result.criteria.map(c => `
${c.name.toUpperCase()} (${c.score}/${c.maxScore || 10} điểm)
- Nhận xét: ${c.comment}
${c.strengths.length > 0 ? `- Điểm mạnh:\n  + ${c.strengths.join('\n  + ')}` : ''}
${c.weaknesses.length > 0 ? `- Cần khắc phục:\n  + ${c.weaknesses.join('\n  + ')}` : ''}
`).join('\n')}

LỖI CẦN SỬA (CHÍNH TẢ / DIỄN ĐẠT / LOGIC)
-----------------------------------------
${result.detailedErrors.length > 0 ? result.detailedErrors.map(e => `
- Lỗi: "${e.context}"
  -> Gợi ý: "${e.suggestion}" (${e.type})
`).join('') : "Không phát hiện lỗi đáng kể."}

LỘ TRÌNH CẢI THIỆN
------------------
1. Ngắn hạn (1-2 tuần):
${result.roadmap.shortTerm.map(s => `   - ${s}`).join('\n')}

2. Trung hạn (1 tháng):
${result.roadmap.mediumTerm.map(s => `   - ${s}`).join('\n')}

3. Dài hạn (2-3 tháng):
${result.roadmap.longTerm.map(s => `   - ${s}`).join('\n')}

LỜI KHUYÊN CHUYÊN GIA
---------------------
"${result.expertAdvice}"

=======================================
Báo cáo được tạo tự động bởi SKKN Checker Pro
Liên hệ: Thầy Hồ Sỹ Long - Zalo: 0943278804
`;
}
