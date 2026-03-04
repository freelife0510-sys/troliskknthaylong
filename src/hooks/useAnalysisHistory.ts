import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { AnalysisHistoryItem, AnalysisResult } from '../types';

const MAX_HISTORY = 20;

export function useAnalysisHistory() {
    const [history, setHistory] = useLocalStorage<AnalysisHistoryItem[]>('skkn_history', []);

    const addToHistory = useCallback((
        title: string,
        level: string,
        subject: string,
        target: string,
        result: AnalysisResult
    ) => {
        const item: AnalysisHistoryItem = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
            title,
            level,
            subject,
            target,
            overallScore: result.overallScore,
            date: new Date().toISOString(),
            result,
        };
        setHistory(prev => [item, ...prev].slice(0, MAX_HISTORY));
        return item;
    }, [setHistory]);

    const removeFromHistory = useCallback((id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, [setHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, [setHistory]);

    return { history, addToHistory, removeFromHistory, clearHistory };
}
