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
import { IdCard, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { useProcesses, useUpdateProcess } from "@/hooks/useWorkflow";

export default function PDIPanel() {
  const { data: processes = [], isLoading } = useProcesses();
  const updateProcessMutation = useUpdateProcess();

  const pdiProcesses = processes.filter(p => 
    p.status === 'pdi_review' || (p.sagStatus === 'approved' && p.pdiStatus === 'pending')
  );

  const stats = {
    toVerify: pdiProcesses.filter(p => p.pdiStatus === 'pending').length,
    verified: processes.filter(p => p.pdiStatus === 'approved').length,
    withObservations: processes.filter(p => p.pdiStatus === 'observed').length,
    minors: processes.filter(p => p.type === 'minors').length,
  };

  const handlePDIAction = (processId: number, action: 'approve' | 'observe', observations?: string) => {
    const updates = {
      pdiStatus: action === 'approve' ? 'approved' : 'observed',
      pdiObservations: observations,
    };
    
    updateProcessMutation.mutate({ id: processId, updates });
  };

  const getProcessTypeBadge = (type: string) => {
    switch (type) {
      case 'minors':
        return <Badge className="bg-purple-100 text-purple-800">Menor</Badge>;
      case 'vehicles':
        return <Badge className="bg-blue-100 text-blue-800">Vehículo</Badge>;
      case 'declaration':
        return <Badge className="bg-green-100 text-green-800">Declaración</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getSAGStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel PDI</h1>
        <p className="text-gray-600 mt-2">Verificación de identidad y documentos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <IdCard className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Por Verificar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.toVerify}</p>
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
                <p className="text-sm text-gray-600">Verificadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Con Observaciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withObservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="text-chile-blue w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Menores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.minors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Cola de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pdiProcesses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay documentos pendientes de verificación
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proceso</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo Trámite</TableHead>
                    <TableHead>Estado SAG</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdiProcesses.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Proceso #{process.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Usuario: {process.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm text-gray-900">
                            {process.formData?.rut || process.formData?.patente || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Documento válido
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProcessTypeBadge(process.type)}
                      </TableCell>
                      <TableCell>
                        {getSAGStatusBadge(process.sagStatus || 'pending')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-chile-blue hover:text-chile-blue-light"
                            disabled={updateProcessMutation.isPending}
                          >
                            Ver Detalles
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-success-green hover:text-green-700"
                            onClick={() => handlePDIAction(process.id, 'approve')}
                            disabled={updateProcessMutation.isPending}
                          >
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-yellow-600 hover:text-yellow-700"
                            onClick={() => handlePDIAction(process.id, 'observe', 'Requiere verificación adicional')}
                            disabled={updateProcessMutation.isPending}
                          >
                            Observar
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
