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
import { companiesApi, vehiclesApi } from '@/lib/api';
import type { Company, VehicleType, VehicleModel, VehicleUnit } from '@/lib/types';

export default function MachineryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [machineryTypes, setMachineryTypes] = useState<VehicleType[]>([]);
  const [machineryModels, setMachineryModels] = useState<VehicleModel[]>([]);
  const [machineryUnits, setMachineryUnits] = useState<VehicleUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    const [companiesResponse, typesResponse, modelsResponse, unitsResponse] = await Promise.all([
      companiesApi.getAll(),
      vehiclesApi.getAllTypes(),
      vehiclesApi.getAllModels(),
      vehiclesApi.getAllUnits(),
    ]);

    setCompanies(companiesResponse.data);
    setMachineryTypes(typesResponse.data);
    setMachineryModels(modelsResponse.data);
    setMachineryUnits(unitsResponse.data);
    setIsOffline(
      companiesResponse.isOffline ||
      typesResponse.isOffline ||
      modelsResponse.isOffline ||
      unitsResponse.isOffline ||
      false
    );
    setIsLoading(false);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMachinery, setNewMachinery] = useState({
    inventoryNumber: '',
    companyId: '',
    modelId: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (companies.length > 0 && !newMachinery.companyId) {
      setNewMachinery(prev => ({ ...prev, companyId: companies[0].id }));
    }
  }, [companies, newMachinery.companyId]);

  useEffect(() => {
    if (machineryModels.length > 0 && newMachinery.modelId === 0) {
      setNewMachinery(prev => ({ ...prev, modelId: machineryModels[0].id }));
    }
  }, [machineryModels, newMachinery.modelId]);

  const filteredMachinery = machineryUnits.filter(unit =>
    unit.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.company.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMachinery = async () => {
    if (newMachinery.inventoryNumber && newMachinery.companyId && newMachinery.modelId) {
      const company = companies.find(c => c.id === newMachinery.companyId);
      const model = machineryModels.find(m => m.id === newMachinery.modelId);

      if (!company || !model) return;

      const response = await vehiclesApi.createUnit({
        inventoryNumber: newMachinery.inventoryNumber,
        company: company,
        model: model,
      });

      if (response.data) {
        setMachineryUnits([...machineryUnits, response.data]);
        setNewMachinery({
          inventoryNumber: '',
          companyId: companies[0]?.id || '',
          modelId: machineryModels[0]?.id || 0,
        });
        setIsDialogOpen(false);
      }
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Техника</h1>
          <p className="text-muted-foreground">
            Управление сельскохозяйственной техникой и транспортными средствами
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Добавить технику</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить новую технику</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="inventoryNumber" className="text-sm font-medium">
                  Инвентарный номер
                </label>
                <Input
                  id="inventoryNumber"
                  value={newMachinery.inventoryNumber}
                  onChange={(e) => setNewMachinery({...newMachinery, inventoryNumber: e.target.value})}
                  placeholder="Инвентарный номер (например, КМБ-123)"
                />
              </div>
              <div>
                <label htmlFor="company" className="text-sm font-medium">
                  Компания
                </label>
                <Select
                  value={newMachinery.companyId}
                  onValueChange={(value) => setNewMachinery({...newMachinery, companyId: value})}
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
              <div>
                <label htmlFor="model" className="text-sm font-medium">
                  Модель
                </label>
                <Select
                  value={newMachinery.modelId.toString()}
                  onValueChange={(value) => setNewMachinery({...newMachinery, modelId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineryModels.map((model) => {
                      return (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name} ({model.vehicleType.name})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateMachinery}>Добавить технику</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список техники ({machineryUnits.length})</CardTitle>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Поиск техники..."
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
                <TableHead>Инвентарный номер</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Компания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachinery.map((unit) => {
                return (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.id}</TableCell>
                    <TableCell>{unit.inventoryNumber}</TableCell>
                    <TableCell>{unit.model.name}</TableCell>
                    <TableCell>{unit.model.vehicleType.name}</TableCell>
                    <TableCell>{unit.company.shortName}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
