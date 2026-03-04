import React, { useState } from 'react';
import { CheckCircle, History, BookOpen, Key, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    onApiKeyClick: () => void;
    onHistoryClick: () => void;
    onLogoClick: () => void;
    hasApiKey: boolean;
}

export default function Header({ onApiKeyClick, onHistoryClick, onLogoClick, hasApiKey }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={onLogoClick}>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-md">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="leading-tight">
                        <span className="font-bold text-lg text-gray-900 block">SKKN Checker Pro</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Trợ lý thẩm định SKKN</span>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <button
                        onClick={onHistoryClick}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <History className="w-4 h-4" />
                        Lịch sử
                    </button>
                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <BookOpen className="w-4 h-4" />
                        Hướng dẫn
                    </a>
                    <button
                        onClick={onApiKeyClick}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${hasApiKey
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                    >
                        <Key className="w-4 h-4" />
                        API Key
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">v2.0</span>
                </nav>

                {/* Mobile Menu button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-1">
                            <button
                                onClick={() => { onHistoryClick(); setMobileMenuOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                <History className="w-4 h-4" /> Lịch sử
                            </button>
                            <button
                                onClick={() => { onApiKeyClick(); setMobileMenuOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                <Key className="w-4 h-4" /> API Key
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
