import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

import Header from './components/Header';
import ApiKeyManager from './components/ApiKeyManager';
import InputForm from './components/InputForm';
import AnalyzingProgress from './components/AnalyzingProgress';
import ResultDashboard from './components/ResultDashboard';
import HistoryPanel from './components/HistoryPanel';

import { analyzeSKKN, getApiKey } from './services/gemini';
import { useAnalysisHistory } from './hooks/useAnalysisHistory';
import type { FormData, AnalysisResult, AppStep } from './types';

export default function App() {
  const [step, setStep] = useState<AppStep>('input');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    level: 'Tiểu học',
    subject: '',
    target: 'Cấp Huyện',
    content: '',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getApiKey());

  const { history, addToHistory, removeFromHistory, clearHistory } = useAnalysisHistory();

  const handleAnalyze = async () => {
    if (!formData.title || !formData.content) {
      alert("Vui lòng nhập tên đề tài và nội dung SKKN");
      return;
    }
    if (!getApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setStep('analyzing');
    try {
      const data = await analyzeSKKN(
        formData.title,
        formData.level,
        formData.subject,
        formData.content,
        formData.target
      );
      setResult(data);
      addToHistory(formData.title, formData.level, formData.subject, formData.target, data);
      setStep('result');
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi phân tích. Vui lòng thử lại.");
      setStep('input');
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setFormData({ title: '', level: 'Tiểu học', subject: '', target: 'Cấp Huyện', content: '' });
    setStep('input');
  };

  const handleHistorySelect = (item: any) => {
    setResult(item.result);
    setFormData({
      title: item.title,
      level: item.level,
      subject: item.subject,
      target: item.target,
      content: '',
    });
    setStep('result');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Header */}
      <Header
        onApiKeyClick={() => setShowApiKeyModal(true)}
        onHistoryClick={() => setShowHistory(true)}
        onLogoClick={handleNewAnalysis}
        hasApiKey={hasApiKey}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Hero Section */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  CHECK
                </span>{' '}
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  SKKN PRO
                </span>
              </h1>
              <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 uppercase tracking-wide">
                Nâng tầm sáng kiến kinh nghiệm của bạn
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Công cụ <span className="text-blue-600 font-semibold">AI</span> hỗ trợ{' '}
                <span className="text-red-500 font-semibold">đánh giá cấu trúc</span>,{' '}
                <span className="text-green-600 font-semibold">soát lỗi chính tả</span> và{' '}
                <span className="text-purple-600 font-semibold">tư vấn chiến lược phát triển SKKN</span>.
              </p>
              <p className="text-gray-400 text-sm mt-2 italic">
                Phát triển bởi thầy <span className="text-blue-600 font-medium not-italic">Hồ Sỹ Long</span>
              </p>
            </div>

            {/* Input Form */}
            <InputForm
              formData={formData}
              setFormData={setFormData}
              onAnalyze={handleAnalyze}
              isAnalyzing={step === 'analyzing'}
            />
          </motion.div>
        )}

        {step === 'analyzing' && <AnalyzingProgress />}

        {step === 'result' && result && (
          <ResultDashboard
            result={result}
            title={formData.title}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            Mọi chi tiết vui lòng liên hệ thầy <span className="font-bold text-yellow-300">Hồ Sỹ Long</span>,
            zalo: <a href="https://zalo.me/0943278804" target="_blank" rel="noopener noreferrer" className="font-bold text-yellow-300 hover:underline">0943278804</a>
          </p>
        </div>
      </footer>

      {/* Modals & Panels */}
      <AnimatePresence>
        {showApiKeyModal && (
          <ApiKeyManager
            isModal
            onKeyValid={() => { setHasApiKey(true); setShowApiKeyModal(false); }}
            onClose={() => setShowApiKeyModal(false)}
          />
        )}
      </AnimatePresence>

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />
    </div>
  );
}
