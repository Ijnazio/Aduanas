import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useProcesses, useUpdateProcess } from "@/hooks/useWorkflow";

export default function SAGPanel() {
  const { data: processes = [], isLoading } = useProcesses();
  const updateProcessMutation = useUpdateProcess();

  const sagProcesses = processes.filter(p => 
    p.status === 'sag_review' || p.sagStatus === 'pending'
  );

  const stats = {
    pending: sagProcesses.filter(p => p.sagStatus === 'pending').length,
    approved: processes.filter(p => p.sagStatus === 'approved').length,
    rejected: processes.filter(p => p.sagStatus === 'rejected').length,
    today: sagProcesses.filter(p => {
      const today = new Date();
      const processDate = new Date(p.createdAt!);
      return processDate.toDateString() === today.toDateString();
    }).length,
  };

  const handleSAGAction = (processId: number, action: 'approve' | 'reject', observations?: string) => {
    const updates = {
      sagStatus: action === 'approve' ? 'approved' : 'rejected',
      sagObservations: observations,
      status: action === 'approve' ? 'pdi_review' : 'rejected',
    };
    
    updateProcessMutation.mutate({ id: processId, updates });
  };

  const getProcessTypeBadge = (type: string) => {
    switch (type) {
      case 'declaration':
        return <Badge className="bg-green-100 text-green-800">Declaración Alimentos</Badge>;
      case 'minors':
        return <Badge className="bg-purple-100 text-purple-800">Menor</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string = 'media') => {
    switch (priority) {
      case 'alta':
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      case 'baja':
        return <Badge className="bg-gray-100 text-gray-800">Baja</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel SAG</h1>
        <p className="text-gray-600 mt-2">Revisión de declaraciones y material vegetal/animal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="text-success-green w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="text-chile-blue w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Declaraciones Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sagProcesses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay declaraciones pendientes de revisión
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sagProcesses.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Usuario ID: {process.userId}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {process.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProcessTypeBadge(process.type)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {new Date(process.createdAt!).toLocaleString('es-CL')}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-chile-blue hover:text-chile-blue-light"
                            disabled={updateProcessMutation.isPending}
                          >
                            Revisar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-success-green hover:text-green-700"
                            onClick={() => handleSAGAction(process.id, 'approve')}
                            disabled={updateProcessMutation.isPending}
                          >
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-chile-red hover:text-red-700"
                            onClick={() => handleSAGAction(process.id, 'reject', 'Documentación insuficiente')}
                            disabled={updateProcessMutation.isPending}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
