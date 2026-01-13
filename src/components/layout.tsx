'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Home,
  Users,
  Truck,
  Wheat,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
  MapPin
} from 'lucide-react';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  { title: 'Главная', icon: <Home className="h-4 w-4" />, href: '/' },
  { title: 'Детальная аналитика', icon: <BarChart3 className="h-4 w-4" />, href: '/analytics' },
  { title: 'Карта происшествий', icon: <MapPin className="h-4 w-4" />, href: '/incidents' },
  {
    title: 'Справочники',
    icon: <Building2 className="h-4 w-4" />,
    children: [
      { title: 'Компании', icon: <Building2 className="h-4 w-4" />, href: '/companies' },
      { title: 'Сотрудники', icon: <Users className="h-4 w-4" />, href: '/employees' },
      { title: 'Техника', icon: <Truck className="h-4 w-4" />, href: '/machinery' },
      { title: 'Культуры', icon: <Wheat className="h-4 w-4" />, href: '/crops' },
      { title: 'Полевые работы', icon: <Calendar className="h-4 w-4" />, href: '/field-works' },
      { title: 'Рабочие смены', icon: <Calendar className="h-4 w-4" />, href: '/work-shifts' },
    ]
  },
  { title: 'Настройки', icon: <Settings className="h-4 w-4" />, href: '/settings' },
];

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Справочники']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderMenuItem = (item: SidebarItem, index: number) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.title);
      return (
        <li key={index}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => toggleExpanded(item.title)}
          >
            {item.icon}
            <span className="ml-2 flex-1 text-left">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && (
            <ul className="ml-4 mt-1 space-y-1">
              {item.children.map((child, childIndex) => (
                <li key={childIndex}>
                  <Link href={child.href || '#'}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {child.icon}
                      <span className="ml-2">{child.title}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={index}>
        <Link href={item.href || '#'}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Button>
        </Link>
      </li>
    );
  };

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed inset-y-0 z-50 w-64 bg-background p-4 shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">AgroVzor</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => renderMenuItem(item, index))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex h-16 items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="ml-auto flex items-center space-x-2">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}