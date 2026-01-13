'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import type { Incident, IncidentType } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface IncidentMapProps {
  incidents: Incident[];
  center?: [number, number];
  zoom?: number;
}

const getIncidentColor = (type: IncidentType): string => {
  switch (type) {
    case 'GRAIN_THEFT':
      return '#ef4444'; // red
    case 'FUEL_THEFT':
      return '#f97316'; // orange
    case 'EQUIPMENT_BREAKDOWN':
      return '#eab308'; // yellow
    case 'UNAUTHORIZED_STOP':
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
};

const getSeveritySize = (severity: 'low' | 'medium' | 'high'): number => {
  switch (severity) {
    case 'high':
      return 40;
    case 'medium':
      return 30;
    case 'low':
      return 20;
    default:
      return 25;
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

const getSeverityLabel = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high':
      return 'Высокая';
    case 'medium':
      return 'Средняя';
    case 'low':
      return 'Низкая';
    default:
      return 'Неизвестно';
  }
};

const createCustomIcon = (incident: Incident) => {
  const color = getIncidentColor(incident.type);
  const size = getSeveritySize(incident.severity);

  return divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '14px' : '10px'};
      ">
        !
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function IncidentMap({
  incidents,
  center = [47.2357, 39.7015], // Rostov-on-Don
  zoom = 11
}: IncidentMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка карты...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.coordinate.latitude, incident.coordinate.longitude]}
            icon={createCustomIcon(incident)}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-lg mb-2">
                  {getIncidentTypeLabel(incident.type)}
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Описание:</span> {incident.description}
                  </p>
                  <p>
                    <span className="font-semibold">Важность:</span> {getSeverityLabel(incident.severity)}
                  </p>
                  <p>
                    <span className="font-semibold">Время:</span>{' '}
                    {new Date(incident.timestamp).toLocaleString('ru-RU')}
                  </p>
                  {incident.workShift && (
                    <p>
                      <span className="font-semibold">Смена:</span> {incident.workShift.id}
                    </p>
                  )}
                  {incident.workShift?.employee && (
                    <p>
                      <span className="font-semibold">Оператор:</span>{' '}
                      {incident.workShift.employee.lastName} {incident.workShift.employee.firstName}
                    </p>
                  )}
                  {incident.workShift?.vehicleUnit && (
                    <p>
                      <span className="font-semibold">Техника:</span>{' '}
                      {incident.workShift.vehicleUnit.inventoryNumber}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
