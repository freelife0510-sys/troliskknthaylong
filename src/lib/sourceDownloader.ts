import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Import root files as raw strings
// Note: These imports rely on Vite's ?raw query parameter
// @ts-ignore
import indexHtml from '../../index.html?raw';
// @ts-ignore
import packageJson from '../../package.json?raw';
// @ts-ignore
import tsConfig from '../../tsconfig.json?raw';
// @ts-ignore
import viteConfig from '../../vite.config.ts?raw';
// @ts-ignore
import gitIgnore from '../../.gitignore?raw';
// @ts-ignore
import envExample from '../../.env.example?raw';

export const downloadSourceCode = async () => {
  const zip = new JSZip();

  // Add root files
  zip.file("index.html", indexHtml);
  zip.file("package.json", packageJson);
  zip.file("tsconfig.json", tsConfig);
  zip.file("vite.config.ts", viteConfig);
  zip.file(".gitignore", gitIgnore);
  zip.file(".env.example", envExample);
  
  // Add README
  zip.file("README.md", `# SKKN Checker Pro

## Giới thiệu
Ứng dụng thẩm định và phân tích Sáng kiến kinh nghiệm (SKKN) sử dụng AI (Gemini).

## Cài đặt & Chạy Local
1. Tải về và giải nén file zip này.
2. Mở terminal tại thư mục dự án.
3. Chạy lệnh \`npm install\` để cài đặt các thư viện.
4. Tạo file \`.env\` từ file \`.env.example\`:
   - Copy \`.env.example\` thành \`.env\`
   - Điền API Key của bạn vào dòng \`GEMINI_API_KEY=...\`
5. Chạy lệnh \`npm run dev\` để khởi chạy ứng dụng.

## Deploy lên Vercel
1. Đẩy code này lên GitHub.
2. Vào Vercel, chọn "Add New Project" -> "Import" từ GitHub.
3. Vercel sẽ tự động nhận diện framework là Vite.
4. Trong phần "Environment Variables", thêm \`GEMINI_API_KEY\`.
5. Bấm "Deploy".

## Deploy lên Netlify
1. Kéo thả thư mục \`dist\` (sau khi chạy \`npm run build\`) vào Netlify Drop.
2. Hoặc kết nối với GitHub tương tự như Vercel.
`);

  // Add src files
  // We use import.meta.glob to get all files in src
  // eager: true loads them immediately
  // query: '?raw' loads them as text content
  const modules = import.meta.glob('../../src/**/*', { query: '?raw', eager: true });
  
  for (const path in modules) {
    // path is relative to this file, e.g., "../../src/App.tsx"
    // We want to store it as "src/App.tsx"
    const relativePath = path.replace('../../', '');
    
    // The module content is in the 'default' export for ?raw imports
    const content = (modules[path] as any).default;
    
    if (typeof content === 'string') {
      zip.file(relativePath, content);
    }
  }

  // Generate zip
  try {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "skkn-checker-source-code.zip");
  } catch (error) {
    console.error("Error generating source zip:", error);
    alert("Có lỗi xảy ra khi nén file mã nguồn.");
  }
};
