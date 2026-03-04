import React from 'react';
import { BookOpen, Award, AlertTriangle, ChevronRight, CheckCircle, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ScoreGauge, CriteriaCard } from './ui/AnalysisComponents';
import { downloadAnalysisReport } from '../lib/downloadUtils';
import type { AnalysisResult } from '../types';

interface ResultDashboardProps {
    result: AnalysisResult;
    title: string;
    onNewAnalysis: () => void;
}

export default function ResultDashboard({ result, title, onNewAnalysis }: ResultDashboardProps) {
    const chartData = result.criteria.map(c => ({
        subject: c.name.length > 8 ? c.name.substring(0, 8) + '…' : c.name,
        A: c.score,
        fullMark: c.maxScore,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Top Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Kết quả Thẩm định SKKN</h2>
                        <p className="text-gray-600 text-sm">Dựa trên tiêu chí Thông tư 27/2020/TT-BGDĐT</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-semibold">Tổng điểm dự kiến</div>
                            <div className="text-4xl font-bold text-blue-600">
                                {result.overallScore}<span className="text-xl text-gray-400">/100</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => downloadAnalysisReport(result, title || 'SKKN_Report')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Tải báo cáo
                            </button>
                            <button
                                onClick={onNewAnalysis}
                                className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors text-sm"
                            >
                                Phân tích mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gauges & Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gauges */}
                <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                    <ScoreGauge
                        score={result.overallScore}
                        label="Chất lượng tổng thể"
                        subLabel={result.overallScore >= 50 ? "Đạt yêu cầu" : "Cần cải thiện"}
                        color={result.overallScore >= 50 ? "#10b981" : "#ef4444"}
                    />
                    <ScoreGauge
                        score={result.plagiarismRisk}
                        label="Nguy cơ đạo văn"
                        subLabel={result.plagiarismRisk > 30 ? "Rủi ro cao" : "An toàn"}
                        color={result.plagiarismRisk > 30 ? "#ef4444" : "#10b981"}
                    />
                    <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">Cấu trúc SKKN</h3>
                        <div className="space-y-2">
                            {['Đặt vấn đề', 'Cơ sở lý luận', 'Thực trạng', 'Giải pháp', 'Kết quả', 'Kết luận'].map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{item}</span>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800">Phân tích chi tiết điểm số</h3>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">Biểu đồ mạng nhện</span>
                            <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded">Biểu đồ cột</span>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                    <Radar name="Điểm" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                                    <XAxis type="number" domain={[0, 10]} hide />
                                    <YAxis dataKey="subject" type="category" width={80} tick={{ fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="A" radius={[0, 4, 4, 0]} barSize={20}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.A >= 8 ? '#10b981' : entry.A >= 5 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Criteria List */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Đánh giá chi tiết từng tiêu chí</h3>
                <div className="space-y-1">
                    {result.criteria.map((criterion) => (
                        <React.Fragment key={criterion.id}>
                            <CriteriaCard
                                score={criterion.score}
                                maxScore={criterion.maxScore}
                                name={criterion.name}
                                comment={criterion.comment}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Detailed Analysis & Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Analysis */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Chi tiết đánh giá & Gợi ý
                    </h3>
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                        {result.criteria.map((c) => (
                            <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0">
                                <h4 className="font-semibold text-gray-800 mb-2">{c.name}</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {c.strengths.length > 0 && (
                                        <div className="bg-green-50 p-3 rounded-lg text-sm">
                                            <span className="font-bold text-green-700 block mb-1">Điểm mạnh:</span>
                                            <ul className="list-disc list-inside text-green-800 space-y-1">
                                                {c.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {c.weaknesses.length > 0 && (
                                        <div className="bg-red-50 p-3 rounded-lg text-sm">
                                            <span className="font-bold text-red-700 block mb-1">Cần khắc phục:</span>
                                            <ul className="list-disc list-inside text-red-800 space-y-1">
                                                {c.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Roadmap & Errors */}
                <div className="space-y-6">
                    {/* Roadmap */}
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-400" />
                            Kế hoạch nâng cấp SKKN
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700">
                                <h4 className="text-yellow-400 font-bold text-sm mb-2 uppercase">Ngắn hạn (1-2 tuần)</h4>
                                <ul className="text-sm text-indigo-100 space-y-2 list-disc list-inside">
                                    {result.roadmap.shortTerm.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700">
                                <h4 className="text-blue-300 font-bold text-sm mb-2 uppercase">Trung hạn (1 tháng)</h4>
                                <ul className="text-sm text-indigo-100 space-y-2 list-disc list-inside">
                                    {result.roadmap.mediumTerm.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-indigo-950 rounded-xl">
                            <h4 className="font-bold text-white mb-2 text-sm">Lời khuyên chuyên gia</h4>
                            <p className="text-sm text-indigo-200 italic">"{result.expertAdvice}"</p>
                        </div>
                    </div>

                    {/* Errors */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Lỗi Chính tả & Diễn đạt ({result.detailedErrors.length})
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {result.detailedErrors.map((err, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="flex-shrink-0 mt-1">
                                        <span className="text-xs font-bold bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded uppercase">{err.type}</span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-gray-600 line-through decoration-orange-400 decoration-2">{err.context}</p>
                                        <p className="text-green-600 font-medium mt-1 flex items-center gap-1">
                                            <ChevronRight className="w-3 h-3" /> {err.suggestion}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {result.detailedErrors.length === 0 && (
                                <p className="text-gray-500 text-sm italic">Không tìm thấy lỗi đáng kể nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
