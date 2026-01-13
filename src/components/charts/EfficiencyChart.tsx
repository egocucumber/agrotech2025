'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { OperatorEfficiencyIndex } from '@/lib/types';

interface EfficiencyChartProps {
  data: OperatorEfficiencyIndex[];
}

export function EfficiencyChart({ data }: EfficiencyChartProps) {
  const chartData = data
    .map((item) => ({
      date: new Date(item.calculatedAt).toLocaleDateString('ru-RU'),
      time: new Date(item.calculatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      overall: item.overallIndex,
      movement: item.movementScore,
      response: item.responseTimeScore,
      unload: item.unloadEfficiencyScore,
      operator: `${item.workShift?.employee?.lastName} ${item.workShift?.employee?.firstName}`,
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
          label={{ value: 'Эффективность (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string) => {
            const labels: Record<string, string> = {
              overall: 'Общая',
              movement: 'Движение',
              response: 'Реакция',
              unload: 'Выгрузка'
            };
            return [`${value.toFixed(1)}%`, labels[name] || name];
          }}
        />
        <Legend
          formatter={(value) => {
            const labels: Record<string, string> = {
              overall: 'Общая эффективность',
              movement: 'Движение',
              response: 'Время реакции',
              unload: 'Эффективность выгрузки'
            };
            return labels[value] || value;
          }}
          wrapperStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Отлично', fill: '#22c55e' }} />
        <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Хорошо', fill: '#f59e0b' }} />
        <Line
          type="monotone"
          dataKey="overall"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ fill: '#8b5cf6', r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="movement"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="response"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="unload"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
