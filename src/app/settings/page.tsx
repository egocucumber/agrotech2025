'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [notificationSettings, setNotificationSettings] = useState({
    fuelTheftAlerts: true,
    vibrationAnomalies: true,
    grainLossThreshold: 2.5,
    maintenanceReminders: true,
    dailyReports: true,
  });

  const [apiSettings, setApiSettings] = useState({
    apiEndpoint: 'http://localhost:8080',
    apiKey: '',
    pollingInterval: 30,
  });

  const handleNotificationChange = (field: string, value: boolean | number) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApiChange = (field: string, value: string | number) => {
    setApiSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveNotifications = () => {
    console.log('Notification settings saved:', notificationSettings);
    alert('Настройки уведомлений сохранены');
  };

  const handleSaveApiSettings = () => {
    console.log('API settings saved:', apiSettings);
    alert('Настройки API сохранены');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Настройка параметров системы AgroVzor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Настройки уведомлений</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Уведомления о краже топлива</Label>
              <p className="text-sm text-muted-foreground">Отправлять уведомления при обнаружении подозрительных изменений уровня топлива</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.fuelTheftAlerts}
              onChange={(e) => handleNotificationChange('fuelTheftAlerts', e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Уведомления об аномалиях вибрации</Label>
              <p className="text-sm text-muted-foreground">Отправлять уведомления о превышении порогов вибрации</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.vibrationAnomalies}
              onChange={(e) => handleNotificationChange('vibrationAnomalies', e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Порог потерь зерна (%)</Label>
              <p className="text-sm text-muted-foreground">Уровень потерь, при котором будет отправлено уведомление</p>
            </div>
            <Input
              type="number"
              value={notificationSettings.grainLossThreshold}
              onChange={(e) => handleNotificationChange('grainLossThreshold', parseFloat(e.target.value))}
              className="w-32"
              min="0"
              max="10"
              step="0.1"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Напоминания о техобслуживании</Label>
              <p className="text-sm text-muted-foreground">Отправлять уведомления за 3 дня до срока техобслуживания</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.maintenanceReminders}
              onChange={(e) => handleNotificationChange('maintenanceReminders', e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Ежедневные отчеты</Label>
              <p className="text-sm text-muted-foreground">Отправлять сводку за день каждый вечер</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.dailyReports}
              onChange={(e) => handleNotificationChange('dailyReports', e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </div>

          <Button variant="outline" onClick={handleSaveNotifications} className="mt-4">
            Сохранить настройки уведомлений
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <Input
              id="apiEndpoint"
              value={apiSettings.apiEndpoint}
              onChange={(e) => handleApiChange('apiEndpoint', e.target.value)}
              placeholder="Адрес API сервера"
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Ключ</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiSettings.apiKey}
              onChange={(e) => handleApiChange('apiKey', e.target.value)}
              placeholder="Введите API ключ"
            />
          </div>

          <div>
            <Label htmlFor="pollingInterval">Интервал опроса (секунды)</Label>
            <Input
              id="pollingInterval"
              type="number"
              value={apiSettings.pollingInterval}
              onChange={(e) => handleApiChange('pollingInterval', parseInt(e.target.value))}
              min="5"
              max="300"
            />
          </div>

          <Button variant="outline" onClick={handleSaveApiSettings} className="mt-4">
            Сохранить API настройки
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}