import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, XCircle, Loader2, ExternalLink, Shield, ChevronDown, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { testApiKey, saveApiKey, getApiKey, removeApiKey, AVAILABLE_MODELS, getSelectedModel, saveSelectedModel } from '../services/gemini';

interface ApiKeyManagerProps {
    onKeyValid: () => void;
    isModal?: boolean;
    onClose?: () => void;
    required?: boolean;
}

export default function ApiKeyManager({ onKeyValid, isModal = false, onClose, required = false }: ApiKeyManagerProps) {
    const [key, setKey] = useState(getApiKey());
    const [showKey, setShowKey] = useState(false);
    const [selectedModel, setSelectedModel] = useState(getSelectedModel());
    const [status, setStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>
        (getApiKey() ? 'valid' : 'idle');
    const [error, setError] = useState('');

    const handleTest = async () => {
        if (!key.trim()) {
            setError('Vui lòng nhập API Key');
            setStatus('invalid');
            return;
        }
        setStatus('testing');
        setError('');

        const result = await testApiKey(key.trim());
        if (result.valid) {
            saveApiKey(key.trim());
            saveSelectedModel(selectedModel);
            setStatus('valid');
            setError('');
            setTimeout(() => onKeyValid(), 800);
        } else {
            setStatus('invalid');
            setError(result.error || 'API Key không hợp lệ');
        }
    };

    const handleRemove = () => {
        removeApiKey();
        setKey('');
        setStatus('idle');
        setError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTest();
    };

    const content = (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 shadow-lg">
                    <Key className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Cấu hình API Key</h2>
                <p className="text-sm text-gray-500 mt-1">Nhập Gemini API Key để sử dụng tính năng AI</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gemini API Key</label>
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={key}
                            onChange={(e) => { setKey(e.target.value); setStatus('idle'); setError(''); }}
                            onKeyDown={handleKeyDown}
                            placeholder="AIzaSy..."
                            className="w-full pl-4 pr-20 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono bg-gray-50"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                type="button"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Model Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn Model AI</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                            <Cpu className="w-4 h-4" />
                        </div>
                        <select
                            value={selectedModel}
                            onChange={(e) => { setSelectedModel(e.target.value); if (status === 'valid') setStatus('idle'); }}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 appearance-none cursor-pointer font-medium"
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name} — {model.description}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100"
                        >
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                    {status === 'valid' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100"
                        >
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            API Key hợp lệ và đã được lưu!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-2">
                    <button
                        onClick={handleTest}
                        disabled={status === 'testing' || !key.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                    >
                        {status === 'testing' ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm tra...</>
                        ) : status === 'valid' ? (
                            <><CheckCircle className="w-4 h-4" /> Đã xác thực</>
                        ) : (
                            <><Shield className="w-4 h-4" /> Xác thực Key</>
                        )}
                    </button>
                    {key && (
                        <button
                            onClick={handleRemove}
                            className="px-4 py-3 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm"
                        >
                            Xóa
                        </button>
                    )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors py-2"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Lấy API Key miễn phí tại Google AI Studio
                    </a>
                </div>
            </div>

            {isModal && onClose && !required && (
                <button
                    onClick={onClose}
                    className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                >
                    Đóng
                </button>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={(e) => { if (e.target === e.currentTarget && onClose && !required) onClose(); }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md"
                >
                    {content}
                </motion.div>
            </div>
        );
    }

    return content;
}
