import React, { useState, useRef } from 'react';
import { Upload, FileText, GraduationCap, BookOpen, Award, CheckCircle, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { readFileContent } from '../lib/fileReader';
import type { FormData, InputMode } from '../types';
import { cn } from '../lib/utils';

interface InputFormProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export default function InputForm({ formData, setFormData, onAnalyze, isAnalyzing }: InputFormProps) {
    const [inputMode, setInputMode] = useState<InputMode>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
        if (e.target) e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    const processFile = async (file: File) => {
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadStatus({ type: 'error', message: 'File quá lớn. Vui lòng tải lên file nhỏ hơn 50MB.' });
            return;
        }

        setIsProcessingFile(true);
        setUploadStatus({ type: null, message: '' });

        try {
            const content = await readFileContent(file);
            setFormData(prev => ({ ...prev, content }));

            if (!formData.title) {
                const fileName = file.name.replace(/\.[^/.]+$/, "");
                setFormData(prev => ({ ...prev, title: fileName }));
            }

            setUploadStatus({ type: 'success', message: `Đã tải lên thành công: ${file.name}` });
        } catch (error: any) {
            setUploadStatus({ type: 'error', message: error.message || "Lỗi khi đọc file" });
        } finally {
            setIsProcessingFile(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white text-center">
                <h2 className="text-lg font-bold">Nhập thông tin SKKN</h2>
                <p className="text-blue-100 text-sm mt-1">Hệ thống sẽ phân tích và đưa ra báo cáo chi tiết trong vài giây</p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
                {/* Title */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                        <FileText className="w-4 h-4 text-blue-500" />
                        Tên đề tài SKKN
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            placeholder="Ví dụ: Một số biện pháp giúp học sinh..."
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Phân tích đề tài
                        </button>
                    </div>
                </div>

                {/* Level & Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <GraduationCap className="w-4 h-4 text-green-500" />
                            Cấp học
                        </label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm cursor-pointer"
                            value={formData.level}
                            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                        >
                            <option>Mầm non</option>
                            <option>Tiểu học</option>
                            <option>THCS</option>
                            <option>THPT</option>
                            <option>GDTX</option>
                        </select>
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            Môn học / Lĩnh vực
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="VD: Toán, Ngữ Văn, Quản lý..."
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Target */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                        <Award className="w-4 h-4 text-orange-500" />
                        Mục tiêu thi đạt giải
                    </label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm cursor-pointer"
                        value={formData.target}
                        onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    >
                        <option>Cấp Trường</option>
                        <option>Cấp Tỉnh/Thành phố</option>
                        <option>Cấp Quốc gia</option>
                    </select>
                </div>

                {/* Content */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Nội dung SKKN
                        </label>
                        <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => setFormData(prev => ({ ...prev, content: "Đây là nội dung mẫu để test hệ thống phân tích SKKN. Giáo viên có thể dán nội dung thực tế hoặc tải file lên." }))}
                        >
                            Dùng dữ liệu mẫu
                        </button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-3">
                        <button
                            onClick={() => setInputMode('upload')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
                                inputMode === 'upload'
                                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <Upload className="w-4 h-4" />
                            Tải tệp lên
                        </button>
                        <button
                            onClick={() => setInputMode('text')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
                                inputMode === 'text'
                                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <FileText className="w-4 h-4" />
                            Nhập văn bản
                        </button>
                    </div>

                    {inputMode === 'upload' ? (
                        <>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer group relative",
                                    isDragging ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-300"
                                )}
                                onDrop={handleDrop}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isProcessingFile && (
                                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 rounded-xl">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                        <span className="text-sm font-medium text-blue-600">Đang đọc file...</span>
                                    </div>
                                )}

                                <Upload className="w-10 h-10 mx-auto text-gray-300 group-hover:text-blue-400 transition-colors mb-3" />
                                <p className="text-sm text-gray-500 font-medium">Kéo thả file hoặc click để chọn</p>
                                <p className="text-xs text-gray-400 mt-1">Hỗ trợ file .pdf, .docx và ảnh (OCR tự động)</p>

                                <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                        <FileText className="w-3 h-3" /> Word (.docx)
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                        <FileText className="w-3 h-3" /> PDF
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                                        <FileText className="w-3 h-3" /> Ảnh (JPG, PNG)
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".docx,.pdf,.txt,.jpg,.jpeg,.png,.webp"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </>
                    ) : (
                        <textarea
                            className="w-full h-48 p-4 bg-gray-50 border border-gray-300 rounded-xl outline-none resize-none text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Dán nội dung SKKN của bạn vào đây..."
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        />
                    )}

                    {/* Upload status */}
                    <AnimatePresence>
                        {uploadStatus.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={cn(
                                    "mt-3 p-3 rounded-lg text-sm flex items-center gap-2",
                                    uploadStatus.type === 'success'
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                )}
                            >
                                {uploadStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                {uploadStatus.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content preview indicator */}
                    {formData.content && (
                        <div className="mt-2 text-xs text-gray-400 text-right">
                            {formData.content.length.toLocaleString()} ký tự đã nhập
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    onClick={onAnalyze}
                    disabled={isProcessingFile || isAnalyzing || !formData.title || !formData.content}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.01] hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isAnalyzing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Đang phân tích...</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> KIỂM TRA NGAY</>
                    )}
                </button>
            </div>
        </div>
    );
}
