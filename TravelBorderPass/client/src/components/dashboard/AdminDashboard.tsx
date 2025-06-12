import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Car, 
  Clock, 
  TrendingUp, 
  FileText, 
  Download,
  FolderSync,
  AlertTriangle,
  CheckCircle 
} from "lucide-react";
import { useDashboardStats, useGenerateReport } from "@/hooks/useWorkflow";
import { generatePDF, generateExcel } from "@/lib/export";

// Mock chart data
const mockChartData = {
  traffic: [
    { day: 'Lun', crossings: 245, vehicles: 89 },
    { day: 'Mar', crossings: 198, vehicles: 76 },
    { day: 'Mié', crossings: 289, vehicles: 102 },
    { day: 'Jue', crossings: 267, vehicles: 95 },
    { day: 'Vie', crossings: 298, vehicles: 108 },
    { day: 'Sáb', crossings: 189, vehicles: 67 },
    { day: 'Dom', crossings: 167, vehicles: 54 },
  ],
  status: [
    { status: 'Aprobados', count: 65, color: '#059669' },
    { status: 'Pendientes', count: 20, color: '#F59E0B' },
    { status: 'En Revisión', count: 12, color: '#3B82F6' },
    { status: 'Rechazados', count: 3, color: '#EF4444' },
  ]
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const generateReportMutation = useGenerateReport();
  const [chartPeriod, setChartPeriod] = useState("7days");

  const handleGenerateReport = async (type: string, format: 'pdf' | 'excel') => {
    const reportData = {
      type,
      parameters: { period: chartPeriod, format },
    };

    await generateReportMutation.mutateAsync(reportData);

    // Simulate file generation
    const data = type === 'daily' ? mockChartData.traffic : mockChartData.status;
    const filename = `reporte-${type}-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'pdf') {
      generatePDF(data, filename);
    } else {
      generateExcel(data, filename);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel Administrativo</h1>
        <p className="text-gray-600 mt-2">Control general y reportes del sistema</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cruces Hoy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.todayStats.crossings || 247}
                </p>
                <p className="text-sm text-green-600">+12% vs ayer</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="text-chile-blue w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vehículos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.todayStats.vehicles || 89}
                </p>
                <p className="text-sm text-red-600">-5% vs ayer</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Car className="text-success-green w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.todayStats.avgTime || 12}m
                </p>
                <p className="text-sm text-green-600">-2m vs ayer</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="text-yellow-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.efficiency || 94}%
                </p>
                <p className="text-sm text-green-600">+2% vs ayer</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Flujo de Cruces (Últimos 7 días)
            </CardTitle>
            <Select value={chartPeriod} onValueChange={setChartPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 días</SelectItem>
                <SelectItem value="30days">Último mes</SelectItem>
                <SelectItem value="1year">Último año</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {/* Simplified chart representation */}
              <div className="h-64 flex items-end justify-around bg-gray-50 rounded-lg p-4">
                {mockChartData.traffic.map((item, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex space-x-1">
                      <div 
                        className="w-6 bg-chile-blue rounded-t"
                        style={{ height: `${(item.crossings / 300) * 120}px` }}
                      ></div>
                      <div 
                        className="w-6 bg-success-green rounded-t"
                        style={{ height: `${(item.vehicles / 120) * 120}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-chile-blue rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Cruces de Personas</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-green rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Vehículos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Estado de Trámites
            </CardTitle>
            <Button variant="outline" size="sm">
              Ver detalles
            </Button>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {/* Simplified donut chart representation */}
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                  <div className="absolute inset-4 rounded-full bg-white"></div>
                  <div className="text-center z-10">
                    <div className="text-2xl font-bold text-gray-900">100</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                  {mockChartData.status.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {item.status}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Reports */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Generación de Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-3">
                    <FileText className="text-red-600 w-8 h-8 mr-3" />
                    <h3 className="font-medium text-gray-900">Reporte Diario</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Resumen de actividad del día</p>
                  <Button
                    className="w-full bg-chile-blue hover:bg-chile-blue-light"
                    onClick={() => handleGenerateReport('daily', 'pdf')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-3">
                    <FileText className="text-green-600 w-8 h-8 mr-3" />
                    <h3 className="font-medium text-gray-900">Reporte Mensual</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Estadísticas del mes</p>
                  <Button
                    className="w-full bg-success-green hover:bg-green-700"
                    onClick={() => handleGenerateReport('monthly', 'excel')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generar Excel
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-3">
                    <FileText className="text-purple-600 w-8 h-8 mr-3" />
                    <h3 className="font-medium text-gray-900">Reporte Anual</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Análisis anual completo</p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleGenerateReport('annual', 'pdf')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-3">
                    <FileText className="text-yellow-600 w-8 h-8 mr-3" />
                    <h3 className="font-medium text-gray-900">Reporte Personalizado</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Filtros avanzados</p>
                  <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => handleGenerateReport('custom', 'excel')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de Datos</span>
              <div className="flex items-center text-success-green">
                <div className="w-2 h-2 bg-success-green rounded-full mr-2"></div>
                <span className="text-sm">Operativo</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sistema SAG</span>
              <div className="flex items-center text-success-green">
                <div className="w-2 h-2 bg-success-green rounded-full mr-2"></div>
                <span className="text-sm">Conectado</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sistema PDI</span>
              <div className="flex items-center text-success-green">
                <div className="w-2 h-2 bg-success-green rounded-full mr-2"></div>
                <span className="text-sm">Conectado</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conexión Argentina</span>
              <div className="flex items-center text-yellow-600">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                <span className="text-sm">Intermitente</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button variant="link" className="w-full text-chile-blue hover:underline p-0">
                Ver bitácora de cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Actividad Reciente del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="text-success-green w-4 h-4" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Procesamiento masivo completado</p>
                  <p className="text-sm text-gray-600">147 trámites procesados automáticamente</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Hace 15 min</span>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <FolderSync className="text-chile-blue w-4 h-4" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Sincronización con Argentina</p>
                  <p className="text-sm text-gray-600">Intercambio de datos actualizado</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Hace 1 hora</span>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100">
                  <AlertTriangle className="text-yellow-600 w-4 h-4" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Mantenimiento programado</p>
                  <p className="text-sm text-gray-600">Sistema no disponible de 02:00 a 04:00</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Mañana</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
