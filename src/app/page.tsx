'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Wheat,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Fuel,
  TrendingUp,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import {
  companiesApi,
  employeesApi,
  fieldWorksApi,
  workShiftsApi,
  analyticsApi
} from '@/lib/api';
import { GrainLossChart } from '@/components/charts/GrainLossChart';
import { FuelLevelChart } from '@/components/charts/FuelLevelChart';
import { EfficiencyChart } from '@/components/charts/EfficiencyChart';
import type {
  GrainLossEstimate,
  VibrationData,
  FuelData,
  OperatorEfficiencyIndex
} from '@/lib/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    companies: 0,
    fieldWorks: 0,
    employees: 0,
    workShifts: 0
  });
  const [grainLossData, setGrainLossData] = useState<GrainLossEstimate[]>([]);
  const [vibrationAnomalies, setVibrationAnomalies] = useState<VibrationData[]>([]);
  const [fuelAnomalies, setFuelAnomalies] = useState<FuelData[]>([]);
  const [efficiencyData, setEfficiencyData] = useState<OperatorEfficiencyIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    const [
      companiesRes,
      employeesRes,
      fieldWorksRes,
      workShiftsRes,
      grainLoss,
      vibration,
      fuel,
      efficiency
    ] = await Promise.all([
      companiesApi.getAll(),
      employeesApi.getAll(),
      fieldWorksApi.getAll(),
      workShiftsApi.getAll(),
      analyticsApi.getAllGrainLoss(),
      analyticsApi.getVibrationAnomalies(),
      analyticsApi.getFuelTheftAlerts(),
      analyticsApi.getAllEfficiency()
    ]);

    setMetrics({
      companies: companiesRes.data.length,
      fieldWorks: fieldWorksRes.data.length,
      employees: employeesRes.data.length,
      workShifts: workShiftsRes.data.length
    });

    setGrainLossData(grainLoss.data);
    setVibrationAnomalies(vibration.data);
    setFuelAnomalies(fuel.data);
    setEfficiencyData(efficiency.data);

    setIsOffline(
      companiesRes.isOffline ||
      employeesRes.isOffline ||
      fieldWorksRes.isOffline ||
      workShiftsRes.isOffline ||
      grainLoss.isOffline ||
      vibration.isOffline ||
      fuel.isOffline ||
      efficiency.isOffline ||
      false
    );
    setError(
      companiesRes.error ||
      employeesRes.error ||
      fieldWorksRes.error ||
      workShiftsRes.error ||
      grainLoss.error ||
      vibration.error ||
      fuel.error ||
      efficiency.error
    );
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
        <p className="text-muted-foreground">Загрузка панели управления...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Hero Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитическая панель</h1>
          <p className="text-muted-foreground mt-1">
            Мониторинг и анализ сельскохозяйственных операций в реальном времени
          </p>
        </div>
        <Link href="/analytics">
          <Button variant="outline" className="gap-2">
            Подробная аналитика
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средние потери зерна</CardTitle>
            <Wheat className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageLossPercentage}%</div>
            <p className="text-xs text-muted-foreground">Всего расчетов: {grainLossData.length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Аномалии вибрации</CardTitle>
            <Wrench className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vibrationAnomalies.length}</div>
            <p className="text-xs text-muted-foreground">Требуют внимания</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Оповещения о топливе</CardTitle>
            <Fuel className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelAnomalies.length}</div>
            <p className="text-xs text-muted-foreground">Всего инцидентов</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя эффективность</CardTitle>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency}%</div>
            <p className="text-xs text-muted-foreground">Среди {efficiencyData.length} операторов</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wheat className="mr-2 h-5 w-5 text-blue-600" />
              Потери зерна во времени
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GrainLossChart data={grainLossData.slice(-10)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fuel className="mr-2 h-5 w-5 text-red-600" />
              Уровень топлива
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FuelLevelChart data={fuelAnomalies.slice(-10)} />
          </CardContent>
        </Card>
      </div>

      {/* Efficiency and Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Эффективность механизаторов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EfficiencyChart data={efficiencyData.slice(-10)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Критические оповещения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {fuelAnomalies.slice(0, 3).map((anomaly) => (
                <div key={anomaly.id} className="flex items-start space-x-3 rounded-lg p-3 bg-red-50 border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Подозрение на кражу топлива
                    </p>
                    <p className="text-xs text-gray-600 truncate">{anomaly.timestamp}</p>
                  </div>
                </div>
              ))}
              {vibrationAnomalies.slice(0, 2).map((anomaly) => (
                <div key={anomaly.id} className="flex items-start space-x-3 rounded-lg p-3 bg-orange-50 border border-orange-200">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Аномалия: {anomaly.sensorLocation}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{anomaly.timestamp}</p>
                  </div>
                </div>
              ))}
              {fuelAnomalies.length === 0 && vibrationAnomalies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Критических оповещений нет</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Система мониторинга
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Потери зерна</span>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Активен</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Вибродиагностика</span>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Активен</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Мониторинг топлива</span>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Активен</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Эффективность операторов</span>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Активен</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Статус оборудования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Техника в работе</span>
                <div className="flex items-center">
                  <Wrench className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    {metrics.workShifts} единиц
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">На обслуживании</span>
                <div className="flex items-center">
                  <Wrench className="mr-2 h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">0 единиц</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Неисправности</span>
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">0 единиц</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Сотрудников: {metrics.employees}</span>
                  <span>Компаний: {metrics.companies}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
