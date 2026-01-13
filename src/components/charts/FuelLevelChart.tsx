'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { FuelData } from '@/lib/types';

interface FuelLevelChartProps {
  data: FuelData[];
}

export function FuelLevelChart({ data }: FuelLevelChartProps) {
  const chartData = data
    .map((item) => ({
      date: new Date(item.timestamp).toLocaleDateString('ru-RU'),
      time: new Date(item.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      level: item.fuelLevel,
      theft: item.theftDetected,
      fullDate: item.timestamp,
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
          label={{ value: 'Уровень топлива (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string, props: any) => {
            const theft = props.payload.theft;
            return [
              `${value.toFixed(1)}%${theft ? ' (кража обнаружена!)' : ''}`,
              'Уровень топлива'
            ];
          }}
        />
        <Legend
          formatter={() => 'Уровень топлива (%)'}
          wrapperStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Критический уровень', fill: '#ef4444' }} />
        <Line
          type="monotone"
          dataKey="level"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={payload.theft ? 6 : 4}
                fill={payload.theft ? '#ef4444' : '#3b82f6'}
                stroke={payload.theft ? '#dc2626' : '#3b82f6'}
                strokeWidth={payload.theft ? 2 : 0}
              />
            );
          }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
