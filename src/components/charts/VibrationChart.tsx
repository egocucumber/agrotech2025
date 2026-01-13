'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { VibrationData } from '@/lib/types';

interface VibrationChartProps {
  data: VibrationData[];
}

export function VibrationChart({ data }: VibrationChartProps) {
  const chartData = data
    .map((item) => {
      let vibValues = { x: 0, y: 0, z: 0 };
      try {
        vibValues = JSON.parse(item.vibrationValues);
      } catch (e) {
        // ignore parse errors
      }

      const magnitude = Math.sqrt(vibValues.x ** 2 + vibValues.y ** 2 + vibValues.z ** 2);

      return {
        date: new Date(item.timestamp).toLocaleDateString('ru-RU'),
        time: new Date(item.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        magnitude: magnitude,
        anomaly: item.anomalyDetected,
        location: item.sensorLocation,
        fullDate: item.timestamp,
        x: vibValues.x,
        y: vibValues.y,
        z: vibValues.z,
      };
    })
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .map((item, index) => ({ ...item, index }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Нет данных для отображения
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          dataKey="index"
          name="Измерение"
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
          label={{ value: 'Последовательность измерений', position: 'insideBottom', offset: -5, fill: 'hsl(var(--foreground))' }}
        />
        <YAxis
          type="number"
          dataKey="magnitude"
          name="Магнитуда"
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
          label={{ value: 'Магнитуда вибрации', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string, props: any) => {
            if (name === 'magnitude') {
              return [
                `${value.toFixed(2)} (X:${props.payload.x.toFixed(2)}, Y:${props.payload.y.toFixed(2)}, Z:${props.payload.z.toFixed(2)})`,
                props.payload.anomaly ? '⚠️ Аномалия' : 'Норма'
              ];
            }
            return [value, name];
          }}
          labelFormatter={(value) => {
            const item = chartData[value as number];
            return `${item?.date} ${item?.time} - ${item?.location}`;
          }}
        />
        <Scatter name="Вибрация" data={chartData} fill="#8884d8">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.anomaly ? '#ef4444' : '#22c55e'} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
