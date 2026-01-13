'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { incidentsApi } from '@/lib/api';
import type { Incident, IncidentType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Droplet, Wrench, StopCircle, MapPin } from 'lucide-react';

const IncidentMap = dynamic(() => import('@/components/maps/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Загрузка карты...</p>
    </div>
  ),
});

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [selectedType, setSelectedType] = useState<IncidentType | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'low' | 'medium' | 'high' | 'ALL'>('ALL');
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, selectedType, selectedSeverity]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const response = await incidentsApi.getAll();
      setIncidents(response.data);
      setIsOffline(response.isOffline || false);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(i => i.type === selectedType);
    }

    if (selectedSeverity !== 'ALL') {
      filtered = filtered.filter(i => i.severity === selectedSeverity);
    }

    setFilteredIncidents(filtered);
  };

  const getIncidentTypeIcon = (type: IncidentType) => {
    switch (type) {
      case 'GRAIN_THEFT':
        return <AlertTriangle className="h-4 w-4" />;
      case 'FUEL_THEFT':
        return <Droplet className="h-4 w-4" />;
      case 'EQUIPMENT_BREAKDOWN':
        return <Wrench className="h-4 w-4" />;
      case 'UNAUTHORIZED_STOP':
        return <StopCircle className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getIncidentTypeLabel = (type: IncidentType): string => {
    switch (type) {
      case 'GRAIN_THEFT':
        return 'Кража зерна';
      case 'FUEL_THEFT':
        return 'Слив топлива';
      case 'EQUIPMENT_BREAKDOWN':
        return 'Поломка техники';
      case 'UNAUTHORIZED_STOP':
        return 'Несанкционированная остановка';
      default:
        return 'Неизвестно';
    }
  };

  const incidentStats = {
    total: incidents.length,
    grainTheft: incidents.filter(i => i.type === 'GRAIN_THEFT').length,
    fuelTheft: incidents.filter(i => i.type === 'FUEL_THEFT').length,
    equipmentBreakdown: incidents.filter(i => i.type === 'EQUIPMENT_BREAKDOWN').length,
    unauthorizedStop: incidents.filter(i => i.type === 'UNAUTHORIZED_STOP').length,
    high: incidents.filter(i => i.severity === 'high').length,
    medium: incidents.filter(i => i.severity === 'medium').length,
    low: incidents.filter(i => i.severity === 'low').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Загрузка происшествий...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Карта происшествий</h1>
          <p className="text-muted-foreground">
            Отслеживание инцидентов на полях в режиме реального времени
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего инцидентов</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {incidentStats.high} критических
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Кража зерна</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.grainTheft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Слив топлива</CardTitle>
            <Droplet className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.fuelTheft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Поломки техники</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.equipmentBreakdown}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Отфильтруйте происшествия по типу и важности</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('ALL')}
              >
                Все типы
              </Button>
              <Button
                variant={selectedType === 'GRAIN_THEFT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('GRAIN_THEFT')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Кража зерна
              </Button>
              <Button
                variant={selectedType === 'FUEL_THEFT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('FUEL_THEFT')}
              >
                <Droplet className="mr-2 h-4 w-4" />
                Слив топлива
              </Button>
              <Button
                variant={selectedType === 'EQUIPMENT_BREAKDOWN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('EQUIPMENT_BREAKDOWN')}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Поломки
              </Button>
              <Button
                variant={selectedType === 'UNAUTHORIZED_STOP' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('UNAUTHORIZED_STOP')}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Остановки
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedSeverity === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('ALL')}
              >
                Все важности
              </Button>
              <Button
                variant={selectedSeverity === 'high' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('high')}
              >
                Высокая
              </Button>
              <Button
                variant={selectedSeverity === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('medium')}
              >
                Средняя
              </Button>
              <Button
                variant={selectedSeverity === 'low' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('low')}
              >
                Низкая
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Показано {filteredIncidents.length} из {incidents.length} происшествий
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Карта происшествий - Ростов-на-Дону</CardTitle>
          <CardDescription>
            Интерактивная карта с отображением всех зарегистрированных инцидентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentMap incidents={filteredIncidents} />
        </CardContent>
      </Card>
    </div>
  );
}
