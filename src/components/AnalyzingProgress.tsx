import React from 'react';
import { Loader2, FileSearch, Brain, BarChart3, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    { icon: FileSearch, label: 'Đọc nội dung', color: 'text-blue-500' },
    { icon: Brain, label: 'Phân tích AI', color: 'text-purple-500' },
    { icon: BarChart3, label: 'Chấm điểm', color: 'text-orange-500' },
    { icon: FileCheck, label: 'Tổng hợp kết quả', color: 'text-green-500' },
];

export default function AnalyzingProgress() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
            >
                <div className="relative inline-flex items-center justify-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-blue-200 animate-ping opacity-20" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang phân tích SKKN...</h2>
                <p className="text-gray-500 mb-8 text-sm">AI đang đọc hiểu, kiểm tra đạo văn và đánh giá các tiêu chí</p>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.3 }}
                            className="flex flex-col items-center gap-1.5 px-4"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ delay: i * 0.3 + 0.5, duration: 0.5 }}
                                className={`w-12 h-12 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center ${step.color}`}
                            >
                                <step.icon className="w-6 h-6" />
                            </motion.div>
                            <span className="text-xs text-gray-500 font-medium">{step.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 12, ease: "linear" }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-3">Thời gian ước tính: 10-30 giây</p>
            </motion.div>
        </div>
    );
}
