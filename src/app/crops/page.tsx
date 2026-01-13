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
import { cropsApi } from '@/lib/api';
import type { CropSpecies, CropVariety } from '@/lib/types';

export default function CropsPage() {
  const [cropTypes, setCropTypes] = useState<CropSpecies[]>([]);
  const [cropVarieties, setCropVarieties] = useState<CropVariety[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    const [speciesResponse, varietiesResponse] = await Promise.all([
      cropsApi.getAllSpecies(),
      cropsApi.getAllVarieties(),
    ]);

    setCropTypes(speciesResponse.data);
    setCropVarieties(varietiesResponse.data);
    setIsOffline(speciesResponse.isOffline || varietiesResponse.isOffline || false);
    setIsLoading(false);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCrop, setNewCrop] = useState({
    name: '',
    speciesId: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (cropTypes.length > 0 && newCrop.speciesId === 0) {
      setNewCrop(prev => ({ ...prev, speciesId: cropTypes[0].id }));
    }
  }, [cropTypes, newCrop.speciesId]);

  const filteredVarieties = cropVarieties.filter(variety =>
    variety.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variety.species.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCrop = async () => {
    if (newCrop.name && newCrop.speciesId) {
      const species = cropTypes.find(s => s.id === newCrop.speciesId);
      if (!species) return;

      const response = await cropsApi.createVariety({
        name: newCrop.name,
        species: species,
      });

      if (response.data) {
        setCropVarieties([...cropVarieties, response.data]);
        setNewCrop({
          name: '',
          speciesId: cropTypes[0]?.id || 0,
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
          <h1 className="text-2xl font-bold tracking-tight">Культуры</h1>
          <p className="text-muted-foreground">
            Управление сельскохозяйственными культурами и сортами
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Добавить сорт</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить новый сорт</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="cropName" className="text-sm font-medium">
                  Название сорта
                </label>
                <Input
                  id="cropName"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                  placeholder="Название сорта"
                />
              </div>
              <div>
                <label htmlFor="cropType" className="text-sm font-medium">
                  Тип культуры
                </label>
                <select
                  id="cropType"
                  value={newCrop.speciesId}
                  onChange={(e) => setNewCrop({...newCrop, speciesId: parseInt(e.target.value)})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {cropTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleCreateCrop}>Добавить сорт</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список сортов ({cropVarieties.length})</CardTitle>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Поиск сортов..."
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
                <TableHead>Название сорта</TableHead>
                <TableHead>Тип культуры</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVarieties.map((variety) => {
                return (
                  <TableRow key={variety.id}>
                    <TableCell className="font-medium">{variety.id}</TableCell>
                    <TableCell>{variety.name}</TableCell>
                    <TableCell>{variety.species.name}</TableCell>
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
