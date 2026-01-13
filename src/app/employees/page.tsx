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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { employeesApi, companiesApi } from '@/lib/api';
import type { Employee, Company } from '@/lib/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    firstName: '',
    lastName: '',
    middleName: '',
    companyId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    const [employeesResponse, companiesResponse] = await Promise.all([
      employeesApi.getAll(),
      companiesApi.getAll()
    ]);

    setEmployees(employeesResponse.data);
    setCompanies(companiesResponse.data);
    setIsOffline(employeesResponse.isOffline || companiesResponse.isOffline || false);
    setError(employeesResponse.error || companiesResponse.error);

    if (companiesResponse.data.length > 0) {
      setNewEmployee(prev => ({
        ...prev,
        companyId: prev.companyId || companiesResponse.data[0].id
      }));
    }

    setIsLoading(false);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEmployee = async () => {
    if (newEmployee.firstName && newEmployee.lastName && newEmployee.username && newEmployee.companyId) {
      const selectedCompany = companies.find(c => c.id === newEmployee.companyId);
      if (!selectedCompany) return;

      const response = await employeesApi.create({
        username: newEmployee.username,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        middleName: newEmployee.middleName || undefined,
        company: selectedCompany
      });

      if (response.error) {
        alert(`Ошибка при создании сотрудника: ${response.error}`);
        return;
      }

      await loadData();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (editingEmployee && newEmployee.firstName && newEmployee.lastName && newEmployee.username) {
      const selectedCompany = companies.find(c => c.id === newEmployee.companyId);
      if (!selectedCompany) return;

      const response = await employeesApi.update(editingEmployee.id, {
        username: newEmployee.username,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        middleName: newEmployee.middleName || undefined,
        company: selectedCompany
      });

      if (response.error) {
        alert(`Ошибка при обновлении сотрудника: ${response.error}`);
        return;
      }

      await loadData();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (confirm(`Удалить сотрудника ${employee.lastName} ${employee.firstName}?`)) {
      const response = await employeesApi.delete(employee.id);

      if (response.error) {
        alert(`Ошибка при удалении сотрудника: ${response.error}`);
        return;
      }

      await loadData();
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      username: employee.username,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName || '',
      companyId: employee.company.id
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setNewEmployee({
      username: '',
      firstName: '',
      lastName: '',
      middleName: '',
      companyId: companies[0]?.id || ''
    });
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
          <h1 className="text-2xl font-bold tracking-tight">Сотрудники</h1>
          <p className="text-muted-foreground">
            Управление персоналом с доступом к сельскохозяйственной технике
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openCreateDialog}>
              Добавить сотрудника
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Имя
                  </label>
                  <Input
                    id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    placeholder="Имя"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Фамилия
                  </label>
                  <Input
                    id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    placeholder="Фамилия"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="middleName" className="text-sm font-medium">
                  Отчество
                </label>
                <Input
                  id="middleName"
                  value={newEmployee.middleName}
                  onChange={(e) => setNewEmployee({...newEmployee, middleName: e.target.value})}
                  placeholder="Отчество (необязательно)"
                />
              </div>
              <div>
                <label htmlFor="username" className="text-sm font-medium">
                  Имя пользователя
                </label>
                <Input
                  id="username"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  placeholder="Имя пользователя для входа"
                />
              </div>
              <div>
                <label htmlFor="company" className="text-sm font-medium">
                  Компания
                </label>
                <Select
                  value={newEmployee.companyId}
                  onValueChange={(value) => setNewEmployee({...newEmployee, companyId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите компанию" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.shortName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}>
              {editingEmployee ? 'Обновить' : 'Добавить'} сотрудника
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список сотрудников ({employees.length})</CardTitle>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Поиск сотрудников..."
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
                <TableHead>ФИО</TableHead>
                <TableHead>Имя пользователя</TableHead>
                <TableHead>Компания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Сотрудники не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.id.split('-')[0]}</TableCell>
                    <TableCell>
                      {employee.lastName} {employee.firstName} {employee.middleName}
                    </TableCell>
                    <TableCell>{employee.username}</TableCell>
                    <TableCell>{employee.company?.shortName || 'N/A'}</TableCell>
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
