import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ScoreGaugeProps {
  score: number;
  max?: number;
  label: string;
  color?: string;
  subLabel?: string;
}

export function ScoreGauge({ score, max = 100, label, color = "#ef4444", subLabel }: ScoreGaugeProps) {
  const percentage = (score / max) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            className="text-gray-100"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-800">{score}</span>
          <span className="text-xs text-gray-400">/ {max} điểm</span>
        </div>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-600 uppercase tracking-wide text-center">{label}</h3>
      {subLabel && (
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full mt-1",
          score < 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        )}>
          {subLabel}
        </span>
      )}
    </div>
  );
}

interface CriteriaCardProps {
  score: number;
  maxScore?: number;
  name: string;
  comment: string;
  onClick?: () => void;
}

export function CriteriaCard({ score, maxScore = 10, name, comment, onClick }: CriteriaCardProps) {
  const percentage = (score / maxScore) * 100;

  let bgClass = "bg-gray-50";
  let textClass = "text-gray-600";
  let scoreBgClass = "bg-gray-200";

  if (percentage >= 80) {
    bgClass = "bg-green-50 border-green-100";
    textClass = "text-green-800";
    scoreBgClass = "bg-green-500";
  } else if (percentage >= 50) {
    bgClass = "bg-yellow-50 border-yellow-100";
    textClass = "text-yellow-800";
    scoreBgClass = "bg-yellow-500";
  } else {
    bgClass = "bg-red-50 border-red-100";
    textClass = "text-red-800";
    scoreBgClass = "bg-red-500";
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn("flex items-start p-4 rounded-lg border mb-3 cursor-pointer transition-colors", bgClass)}
      onClick={onClick}
    >
      <div className={cn("flex-shrink-0 w-16 h-12 rounded-lg flex flex-col items-center justify-center text-white mr-4", scoreBgClass)}>
        <span className="font-bold text-lg leading-none">{score}</span>
        <span className="text-[10px] opacity-80 leading-none">/{maxScore}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 mb-1">{name}</h4>
        <p className={cn("text-sm", textClass)}>{comment}</p>
      </div>
    </motion.div>
  );
}
