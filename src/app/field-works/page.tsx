'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { fieldWorksApi } from '@/lib/api';
import type { FieldWork } from '@/lib/types';

export default function FieldWorksPage() {
  const [fieldWorks, setFieldWorks] = useState<FieldWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFieldWorks();
  }, []);

  const loadFieldWorks = async () => {
    setIsLoading(true);
    const response = await fieldWorksApi.getAll();
    setFieldWorks(response.data);
    setIsOffline(response.isOffline || false);
    setError(response.error);
    setIsLoading(false);
  };

  const filteredWorks = fieldWorks.filter(work =>
    work.company?.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.variety?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold tracking-tight">Полевые работы</h1>
          <p className="text-muted-foreground">
            Планирование и учет полевых работ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список полевых работ ({fieldWorks.length})</CardTitle>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Поиск работ..."
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
                <TableHead>Компания</TableHead>
                <TableHead>Сорт культуры</TableHead>
                <TableHead>Дата начала</TableHead>
                <TableHead>Дата окончания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Полевые работы не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorks.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell className="font-medium">{work.id.split('-')[0]}</TableCell>
                    <TableCell>{work.company?.shortName || 'N/A'}</TableCell>
                    <TableCell>
                      {work.variety?.name} ({work.variety?.species?.name})
                    </TableCell>
                    <TableCell>{work.startDate}</TableCell>
                    <TableCell>{work.endDate || 'В процессе'}</TableCell>
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
