import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Car, 
  Apple, 
  User, 
  CheckCircle, 
  Clock, 
  Shield,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Baby,
  Utensils,
  Plus,
  Flag
} from "lucide-react";
import { useProcesses } from "@/hooks/useWorkflow";
import { useAuth } from "@/hooks/useAuth";

export default function TouristDashboard() {
  const { user } = useAuth();
  const { data: processes = [], isLoading } = useProcesses();

  const [activeTab, setActiveTab] = useState("overview");
  
  const userProcesses = processes.filter(p => p.userId === user?.id) || [];
  const minorsProcesses = userProcesses.filter(p => p.type === 'minors');
  const vehicleProcesses = userProcesses.filter(p => p.type === 'vehicles');
  const declarationProcesses = userProcesses.filter(p => p.type === 'declaration');
  
  const stats = {
    active: userProcesses.filter(p => ['pending', 'sag_review', 'pdi_review'].includes(p.status)).length,
    completed: userProcesses.filter(p => p.status === 'approved').length,
    pending: userProcesses.filter(p => p.status === 'pending').length,
    minors: minorsProcesses.length,
    vehicles: vehicleProcesses.length,
    declarations: declarationProcesses.length,
  };

  const recentActivity = userProcesses
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="status-approved">Aprobado</Badge>;
      case 'rejected':
        return <Badge className="status-rejected">Rechazado</Badge>;
      case 'sag_review':
      case 'pdi_review':
        return <Badge className="status-review">En Revisión</Badge>;
      default:
        return <Badge className="status-pending">Pendiente</Badge>;
    }
  };

  const getProcessTitle = (type: string) => {
    switch (type) {
      case 'minors': return 'Formulario de menores';
      case 'vehicles': return 'Formulario de vehículo';
      case 'declaration': return 'Declaración jurada';
      default: return 'Trámite';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Panel del Turista
        </h1>
        <p className="text-gray-600 mt-2">Gestiona tus trámites fronterizos</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="text-chile-blue w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Trámites Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="text-success-green w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/forms/minors">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <User className="text-chile-blue w-8 h-8" />
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  Salida/Entrada de Menores
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Autorización para el cruce fronterizo de menores de edad
              </p>
              <Button className="w-full bg-chile-blue hover:bg-chile-blue-light">
                Iniciar Trámite
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/forms/vehicles">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Car className="text-chile-blue w-8 h-8" />
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  Vehículos Particulares
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Salida y Admisión Temporal de Vehículos
              </p>
              <Button className="w-full bg-chile-blue hover:bg-chile-blue-light">
                Iniciar Trámite
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/forms/declaration">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Apple className="text-chile-blue w-8 h-8" />
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  Declaración Jurada
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Alimentos, plantas y mascotas
              </p>
              <Button className="w-full bg-chile-blue hover:bg-chile-blue-light">
                Iniciar Trámite
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((process) => (
                <div key={process.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle className="text-success-green w-4 h-4" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">
                        {getProcessTitle(process.type)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(process.createdAt!).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(process.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
