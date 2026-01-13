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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { companiesApi } from '@/lib/api';
import type { Company } from '@/lib/types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    fullName: '',
    shortName: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    const response = await companiesApi.getAll();
    setCompanies(response.data);
    setIsOffline(response.isOffline || false);
    setError(response.error);
    setIsLoading(false);
  };

  const filteredCompanies = companies.filter(company =>
    company.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = async () => {
    if (newCompany.fullName && newCompany.shortName) {
      const response = await companiesApi.create(newCompany);

      if (response.error) {
        alert(`Ошибка при создании компании: ${response.error}`);
        return;
      }

      await loadCompanies();
      setNewCompany({ fullName: '', shortName: '' });
      setEditingCompany(null);
      setIsDialogOpen(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (editingCompany && newCompany.fullName && newCompany.shortName) {
      const response = await companiesApi.update(editingCompany.id, newCompany);

      if (response.error) {
        alert(`Ошибка при обновлении компании: ${response.error}`);
        return;
      }

      await loadCompanies();
      setNewCompany({ fullName: '', shortName: '' });
      setEditingCompany(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    if (confirm(`Удалить компанию ${company.shortName}?`)) {
      const response = await companiesApi.delete(company.id);

      if (response.error) {
        alert(`Ошибка при удалении компании: ${response.error}`);
        return;
      }

      await loadCompanies();
    }
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      fullName: company.fullName,
      shortName: company.shortName
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCompany(null);
    setNewCompany({ fullName: '', shortName: '' });
    setIsDialogOpen(true);
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Компании</h1>
          <p className="text-muted-foreground">
            Управление сельскохозяйственными предприятиями в системе
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openCreateDialog}>
              Добавить компанию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'Редактировать компанию' : 'Добавить новую компанию'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium">
                  Полное наименование
                </label>
                <Input
                  id="fullName"
                  value={newCompany.fullName}
                  onChange={(e) => setNewCompany({...newCompany, fullName: e.target.value})}
                  placeholder="Полное юридическое наименование компании"
                />
              </div>
              <div>
                <label htmlFor="shortName" className="text-sm font-medium">
                  Сокращенное наименование
                </label>
                <Input
                  id="shortName"
                  value={newCompany.shortName}
                  onChange={(e) => setNewCompany({...newCompany, shortName: e.target.value})}
                  placeholder="Сокращенное наименование для отображения"
                />
              </div>
            </div>
            <Button onClick={editingCompany ? handleUpdateCompany : handleCreateCompany}>
              {editingCompany ? 'Обновить' : 'Создать'} компанию
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список компаний ({companies.length})</CardTitle>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Поиск компаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Полное наименование</TableHead>
                  <TableHead>Сокращенное наименование</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Компании не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.id.split('-')[0]}</TableCell>
                      <TableCell>{company.fullName}</TableCell>
                      <TableCell>{company.shortName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
