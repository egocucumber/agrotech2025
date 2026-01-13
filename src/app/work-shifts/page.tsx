'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { workShiftsApi } from '@/lib/api';
import type { WorkShift } from '@/lib/types';

export default function WorkShiftsPage() {
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkShifts();
  }, []);

  const loadWorkShifts = async () => {
    setIsLoading(true);
    const response = await workShiftsApi.getAll();
    setWorkShifts(response.data);
    setIsOffline(response.isOffline || false);
    setError(response.error);
    setIsLoading(false);
  };

  const filteredShifts = workShifts.filter(shift =>
    shift.employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.vehicleUnit?.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Рабочие смены</h1>
          <p className="text-muted-foreground">
            Управление сменами работы техники
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список рабочих смен ({workShifts.length})</CardTitle>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Поиск смен..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Полевая работа</TableHead>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Техника</TableHead>
                <TableHead>Начало</TableHead>
                <TableHead>Окончание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Рабочие смены не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">{shift.id.split('-')[0]}</TableCell>
                    <TableCell>{shift.fieldWork?.id.split('-')[0] || 'N/A'}</TableCell>
                    <TableCell>
                      {shift.employee?.lastName} {shift.employee?.firstName}
                    </TableCell>
                    <TableCell>{shift.vehicleUnit?.inventoryNumber || 'N/A'}</TableCell>
                    <TableCell>{shift.startDate}</TableCell>
                    <TableCell>{shift.endDate || 'В процессе'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
