import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Info, RefreshCw, Upload } from "lucide-react";
import { useCreateProcess } from "@/hooks/useWorkflow";
import { useToast } from "@/hooks/use-toast";

const vehiclesSchema = z.object({
  patente: z.string().min(1, "La patente/placa es requerida"),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  año: z.string().min(1, "El año es requerido"),
  color: z.string().min(1, "El color es requerido"),
  numeroMotor: z.string().optional(),
  propietarioNombre: z.string().min(1, "El nombre del propietario es requerido"),
  propietarioRut: z.string().min(1, "El RUT/Pasaporte del propietario es requerido"),
  propietarioDireccion: z.string().min(1, "La dirección es requerida"),
  fechaSalida: z.string().min(1, "La fecha de salida es requerida"),
  fechaRetorno: z.string().optional(),
  motivoViaje: z.string().min(1, "El motivo del viaje es requerido"),
  permisoCirculacion: z.any().optional(),
  seguroObligatorio: z.any().optional(),
  documentsConfirm: z.boolean().refine(val => val === true, "Debe confirmar la validez de los documentos"),
});

type VehiclesFormData = z.infer<typeof vehiclesSchema>;

export default function VehiclesForm() {
  const [, setLocation] = useLocation();
  const createProcessMutation = useCreateProcess();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VehiclesFormData>({
    resolver: zodResolver(vehiclesSchema),
  });

  const documentsConfirm = watch("documentsConfirm");

  const onSubmit = async (data: VehiclesFormData) => {
    try {
      const processData = {
        type: "vehicles",
        formData: {
          vehiculo: {
            patente: data.patente,
            marca: data.marca,
            modelo: data.modelo,
            año: parseInt(data.año),
            color: data.color,
            numeroMotor: data.numeroMotor,
          },
          propietario: {
            nombre: data.propietarioNombre,
            rut: data.propietarioRut,
            direccion: data.propietarioDireccion,
          },
          viaje: {
            fechaSalida: data.fechaSalida,
            fechaRetorno: data.fechaRetorno,
            motivo: data.motivoViaje,
          },
          documentos: {
            permisoCirculacion: data.permisoCirculacion?.name || "permiso_circulacion.pdf",
            seguroObligatorio: data.seguroObligatorio?.name || "seguro_obligatorio.pdf",
            confirmados: data.documentsConfirm,
          },
        },
      };

      await createProcessMutation.mutateAsync(processData);
      
      toast({
        title: "Formulario enviado exitosamente",
        description: "Su trámite de vehículo ha sido enviado para revisión",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar formulario",
        description: "Por favor intente nuevamente",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/dashboard")}
            className="text-chile-blue hover:text-chile-blue-light flex items-center mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Vehículos Particulares
          </h1>
          <p className="text-gray-600 mt-2">
            Salida y Admisión Temporal de Vehículos
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Binational Agreement Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="text-chile-blue mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-chile-blue">Acuerdo Binacional</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Este documento será reconocido por Aduana Argentina en virtud del Acuerdo Binacional vigente.
                    Los datos serán compartidos automáticamente con el sistema de Horcones (AR).
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Información del Vehículo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Patente/Placa *
                    </Label>
                    <Input
                      {...register("patente")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.patente ? "form-error" : ""
                      }`}
                      placeholder="Ej: AB-12-34"
                    />
                    {errors.patente && (
                      <p className="error-message">{errors.patente.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca *
                    </Label>
                    <Input
                      {...register("marca")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.marca ? "form-error" : ""
                      }`}
                      placeholder="Ej: Toyota"
                    />
                    {errors.marca && (
                      <p className="error-message">{errors.marca.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo *
                    </Label>
                    <Input
                      {...register("modelo")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.modelo ? "form-error" : ""
                      }`}
                      placeholder="Ej: Corolla"
                    />
                    {errors.modelo && (
                      <p className="error-message">{errors.modelo.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Año *
                    </Label>
                    <Input
                      type="number"
                      min="1950"
                      max="2024"
                      {...register("año")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.año ? "form-error" : ""
                      }`}
                      placeholder="2020"
                    />
                    {errors.año && (
                      <p className="error-message">{errors.año.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Color *
                    </Label>
                    <Input
                      {...register("color")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.color ? "form-error" : ""
                      }`}
                      placeholder="Ej: Blanco"
                    />
                    {errors.color && (
                      <p className="error-message">{errors.color.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Motor
                    </Label>
                    <Input
                      {...register("numeroMotor")}
                      className="focus:ring-chile-blue focus:border-chile-blue"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Información del Propietario
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </Label>
                    <Input
                      {...register("propietarioNombre")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.propietarioNombre ? "form-error" : ""
                      }`}
                      placeholder="Nombre completo del propietario"
                    />
                    {errors.propietarioNombre && (
                      <p className="error-message">{errors.propietarioNombre.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      RUT/Pasaporte *
                    </Label>
                    <Input
                      {...register("propietarioRut")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.propietarioRut ? "form-error" : ""
                      }`}
                      placeholder="RUT o número de pasaporte"
                    />
                    {errors.propietarioRut && (
                      <p className="error-message">{errors.propietarioRut.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </Label>
                    <Textarea
                      {...register("propietarioDireccion")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.propietarioDireccion ? "form-error" : ""
                      }`}
                      placeholder="Dirección completa del propietario"
                      rows={2}
                    />
                    {errors.propietarioDireccion && (
                      <p className="error-message">{errors.propietarioDireccion.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Información del Viaje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Salida *
                    </Label>
                    <Input
                      type="date"
                      {...register("fechaSalida")}
                      className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.fechaSalida ? "form-error" : ""
                      }`}
                    />
                    {errors.fechaSalida && (
                      <p className="error-message">{errors.fechaSalida.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Retorno Estimada
                    </Label>
                    <Input
                      type="date"
                      {...register("fechaRetorno")}
                      className="focus:ring-chile-blue focus:border-chile-blue"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo del Viaje *
                    </Label>
                    <Select onValueChange={(value) => setValue("motivoViaje", value)}>
                      <SelectTrigger className={`focus:ring-chile-blue focus:border-chile-blue ${
                        errors.motivoViaje ? "form-error" : ""
                      }`}>
                        <SelectValue placeholder="Seleccionar motivo del viaje" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="turismo">Turismo</SelectItem>
                        <SelectItem value="trabajo">Trabajo</SelectItem>
                        <SelectItem value="familiar">Visita Familiar</SelectItem>
                        <SelectItem value="medico">Tratamiento Médico</SelectItem>
                        <SelectItem value="mudanza">Mudanza</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.motivoViaje && (
                      <p className="error-message">{errors.motivoViaje.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documentación
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Permiso de Circulación *
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-chile-blue transition-colors">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="permiso-upload" className="cursor-pointer">
                          <span className="mt-1 block text-sm font-medium text-gray-900">
                            Subir Permiso de Circulación
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PDF, JPG, PNG hasta 5MB
                          </span>
                          <input
                            id="permiso-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            {...register("permisoCirculacion")}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Seguro Obligatorio *
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-chile-blue transition-colors">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="seguro-upload" className="cursor-pointer">
                          <span className="mt-1 block text-sm font-medium text-gray-900">
                            Subir Seguro Obligatorio
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PDF, JPG, PNG hasta 5MB
                          </span>
                          <input
                            id="seguro-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            {...register("seguroObligatorio")}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="documentsConfirm"
                      checked={documentsConfirm}
                      onCheckedChange={(checked) => setValue("documentsConfirm", !!checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="documentsConfirm" className="text-sm text-gray-700 leading-relaxed">
                      Confirmo que todos los documentos adjuntos son válidos y están vigentes.
                      Los documentos deben estar a nombre del propietario del vehículo.
                    </Label>
                  </div>
                  {errors.documentsConfirm && (
                    <p className="error-message">{errors.documentsConfirm.message}</p>
                  )}
                </div>
              </div>

              {/* Argentina Sharing Notice */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <RefreshCw className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800">Intercambio de Información</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Datos compartidos con Horcones (AR) - Sistema de Intercambio Binacional Activo.
                      Su vehículo será registrado automáticamente en el sistema argentino.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Guardar Borrador
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProcessMutation.isPending}
                  className="flex-1 bg-chile-blue hover:bg-chile-blue-light"
                >
                  {createProcessMutation.isPending ? "Enviando..." : "Enviar para Revisión"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
