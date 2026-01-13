'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Fuel,
  Wrench,
  Users,
  Wheat,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import type {
  GrainLossEstimate,
  VibrationData,
  FuelData,
  OperatorEfficiencyIndex
} from '@/lib/types';
import { GrainLossChart } from '@/components/charts/GrainLossChart';
import { FuelLevelChart } from '@/components/charts/FuelLevelChart';
import { EfficiencyChart } from '@/components/charts/EfficiencyChart';
import { VibrationChart } from '@/components/charts/VibrationChart';

export default function AnalyticsPage() {
  const [grainLossData, setGrainLossData] = useState<GrainLossEstimate[]>([]);
  const [vibrationAnomalies, setVibrationAnomalies] = useState<VibrationData[]>([]);
  const [fuelAnomalies, setFuelAnomalies] = useState<FuelData[]>([]);
  const [efficiencyData, setEfficiencyData] = useState<OperatorEfficiencyIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);

    const [grainLoss, vibration, fuel, efficiency] = await Promise.all([
      analyticsApi.getAllGrainLoss(),
      analyticsApi.getVibrationAnomalies(),
      analyticsApi.getFuelTheftAlerts(),
      analyticsApi.getAllEfficiency()
    ]);

    setGrainLossData(grainLoss.data);
    setVibrationAnomalies(vibration.data);
    setFuelAnomalies(fuel.data);
    setEfficiencyData(efficiency.data);

    setIsOffline(
      grainLoss.isOffline ||
      vibration.isOffline ||
      fuel.isOffline ||
      efficiency.isOffline ||
      false
    );
    setError(grainLoss.error || vibration.error || fuel.error || efficiency.error);
    setIsLoading(false);
  };

  const averageLossPercentage = grainLossData.length > 0
    ? (grainLossData.reduce((sum, loss) => sum + loss.lossPercentage, 0) / grainLossData.length).toFixed(2)
    : '0.00';

  const averageEfficiency = efficiencyData.length > 0
    ? (efficiencyData.reduce((sum, eff) => sum + eff.overallIndex, 0) / efficiencyData.length).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Загрузка данных аналитики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground">
          Расширенный мониторинг и анализ сельскохозяйственных операций
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b overflow-x-auto">
        {['overview', 'timeseries', 'grain-loss', 'vibration', 'fuel', 'efficiency'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="capitalize whitespace-nowrap"
          >
            {tab === 'overview' ? 'Обзор' :
             tab === 'timeseries' ? 'Динамика показателей' :
             tab === 'grain-loss' ? 'Потери зерна' :
             tab === 'vibration' ? 'Вибродиагностика' :
             tab === 'fuel' ? 'Мониторинг топлива' :
             'Эффективность'}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Средние потери зерна</CardTitle>
                <Wheat className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageLossPercentage}%</div>
                <p className="text-xs text-muted-foreground">Всего расчетов: {grainLossData.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Аномалии вибрации</CardTitle>
                <Wrench className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vibrationAnomalies.length}</div>
                <p className="text-xs text-muted-foreground">Требуют внимания</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Оповещения о краже топлива</CardTitle>
                <Fuel className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fuelAnomalies.length}</div>
                <p className="text-xs text-muted-foreground">Всего инцидентов</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Средняя эффективность</CardTitle>
                <Users className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageEfficiency}%</div>
                <p className="text-xs text-muted-foreground">Среди {efficiencyData.length} операторов</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Критические оповещения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fuelAnomalies.slice(0, 3).map((anomaly) => (
                    <div key={anomaly.id} className="flex items-start space-x-3 rounded-lg p-3 bg-red-100 border border-red-300">
                      <AlertTriangle className="h-5 w-5 text-red-700 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-800">
                          Подозрение на кражу топлива (Смена: {anomaly.workShift?.id.split('-')[0]})
                        </p>
                        <p className="text-xs text-gray-800">{anomaly.timestamp}</p>
                      </div>
                    </div>
                  ))}
                  {vibrationAnomalies.slice(0, 2).map((anomaly) => (
                    <div key={anomaly.id} className="flex items-start space-x-3 rounded-lg p-3 bg-orange-100 border border-orange-300">
                      <AlertTriangle className="h-5 w-5 text-orange-700 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-800">
                          Аномалия вибрации: {anomaly.sensorLocation}
                        </p>
                        <p className="text-xs text-gray-800">{anomaly.timestamp}</p>
                      </div>
                    </div>
                  ))}
                  {fuelAnomalies.length === 0 && vibrationAnomalies.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Критических оповещений нет
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Эффективность механизаторов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {efficiencyData.slice(0, 5).map((eff) => (
                    <div key={eff.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {eff.workShift?.employee?.lastName} {eff.workShift?.employee?.firstName}
                        </span>
                        <span className="text-sm font-medium">{eff.overallIndex.toFixed(2)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${
                            eff.overallIndex >= 80 ? 'bg-green-500' :
                            eff.overallIndex >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(eff.overallIndex, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {efficiencyData.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Данные эффективности отсутствуют
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Timeseries Tab */}
      {activeTab === 'timeseries' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wheat className="mr-2 h-5 w-5" />
                Потери зерна во времени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GrainLossChart data={grainLossData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fuel className="mr-2 h-5 w-5" />
                Уровень топлива во времени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FuelLevelChart data={fuelAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Эффективность операторов во времени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EfficiencyChart data={efficiencyData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Вибрация датчиков
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VibrationChart data={vibrationAnomalies} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grain Loss Tab */}
      {activeTab === 'grain-loss' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wheat className="mr-2 h-5 w-5" />
              Анализ потерь зерна ({grainLossData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grainLossData.map((loss) => (
                <div key={loss.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Рабочая смена: {loss.workShift?.id.split('-')[0]}</div>
                    <div className="text-sm text-gray-800">Рассчитано {loss.calculatedAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{loss.lossWeight.toFixed(1)} кг</div>
                    <div className="text-sm text-gray-800">{loss.lossPercentage}% потеряно</div>
                  </div>
                  <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {loss.calculationMethod}
                  </div>
                </div>
              ))}
              {grainLossData.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Данные о потерях зерна отсутствуют
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vibration Tab */}
      {activeTab === 'vibration' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Вибродиагностика ({vibrationAnomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vibrationAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="rounded-full bg-red-100 p-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{anomaly.sensorLocation}</div>
                    <div className="text-sm text-gray-800">Рабочая смена: {anomaly.workShift?.id.split('-')[0]}</div>
                    <div className="text-sm text-gray-800">Время: {anomaly.timestamp}</div>
                  </div>
                  <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    {anomaly.anomalyDescription || 'Аномалия обнаружена'}
                  </div>
                </div>
              ))}
              {vibrationAnomalies.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Аномалий вибрации не обнаружено
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fuel Tab */}
      {activeTab === 'fuel' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fuel className="mr-2 h-5 w-5" />
              Мониторинг топлива ({fuelAnomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fuelAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Рабочая смена: {anomaly.workShift?.id.split('-')[0]}</div>
                    <div className="text-sm text-gray-800">Время: {anomaly.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{anomaly.fuelLevel}%</div>
                    <div className="text-sm text-gray-800">
                      {anomaly.theftDetected ? 'ОБНАРУЖЕНА КРАЖА' : 'Норма'}
                    </div>
                  </div>
                  {anomaly.suspiciousDrop && (
                    <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      {anomaly.suspiciousDrop}
                    </div>
                  )}
                </div>
              ))}
              {fuelAnomalies.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Подозрительных инцидентов с топливом не обнаружено
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Efficiency Tab */}
      {activeTab === 'efficiency' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Эффективность механизаторов ({efficiencyData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Имя</th>
                    <th className="text-right py-2">Движение</th>
                    <th className="text-right py-2">Реакция</th>
                    <th className="text-right py-2">Выгрузка</th>
                    <th className="text-right py-2">Всего</th>
                  </tr>
                </thead>
                <tbody>
                  {efficiencyData.map((eff) => (
                    <tr key={eff.id} className="border-b last:border-b-0">
                      <td className="py-3">
                        {eff.workShift?.employee?.lastName} {eff.workShift?.employee?.firstName}
                      </td>
                      <td className="text-right py-3">{eff.movementScore.toFixed(1)}%</td>
                      <td className="text-right py-3">{eff.responseTimeScore.toFixed(1)}%</td>
                      <td className="text-right py-3">{eff.unloadEfficiencyScore.toFixed(1)}%</td>
                      <td className="text-right font-medium py-3">
                        <span className={`${
                          eff.overallIndex >= 80 ? 'text-green-600' :
                          eff.overallIndex >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {eff.overallIndex.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {efficiencyData.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Данные эффективности отсутствуют
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
