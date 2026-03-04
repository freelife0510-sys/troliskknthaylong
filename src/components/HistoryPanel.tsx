import React from 'react';
import { History, Trash2, Eye, X, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisHistoryItem } from '../types';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: AnalysisHistoryItem[];
    onSelect: (item: AnalysisHistoryItem) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function scoreColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
}

export default function HistoryPanel({ isOpen, onClose, history, onSelect, onRemove, onClear }: HistoryPanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-800">Lịch sử phân tích</h2>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                    {history.length}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <History className="w-12 h-12 text-gray-200 mb-3" />
                                    <p className="text-gray-500 text-sm">Chưa có phân tích nào</p>
                                    <p className="text-gray-400 text-xs mt-1">Kết quả phân tích sẽ được lưu tại đây</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 100 }}
                                            className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { onSelect(item); onClose(); }}>
                                                    <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{item.level}</span>
                                                        {item.subject && (
                                                            <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{item.subject}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${scoreColor(item.overallScore)}`}>
                                                        {item.overallScore}
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {history.length > 0 && (
                            <div className="p-4 border-t border-gray-200">
                                <button
                                    onClick={onClear}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors border border-red-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa toàn bộ lịch sử
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
