'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GrainLossEstimate } from '@/lib/types';

interface GrainLossChartProps {
  data: GrainLossEstimate[];
}

export function GrainLossChart({ data }: GrainLossChartProps) {
  const chartData = data
    .map((item) => ({
      date: new Date(item.calculatedAt).toLocaleDateString('ru-RU'),
      time: new Date(item.calculatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      percentage: item.lossPercentage,
      weight: item.lossWeight,
      fullDate: item.calculatedAt,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Нет данных для отображения
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
          label={{ value: 'Потери (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string) => [
            name === 'percentage' ? `${value.toFixed(2)}%` : `${value.toFixed(1)} кг`,
            name === 'percentage' ? 'Процент потерь' : 'Вес потерь'
          ]}
        />
        <Legend
          formatter={(value) => value === 'percentage' ? 'Процент потерь (%)' : 'Вес потерь (кг)'}
          wrapperStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
