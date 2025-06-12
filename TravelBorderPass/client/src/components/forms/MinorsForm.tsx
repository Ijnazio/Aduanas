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
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, AlertTriangle, Upload } from "lucide-react";
import { useCreateProcess } from "@/hooks/useWorkflow";
import { useToast } from "@/hooks/use-toast";

const minorsSchema = z.object({
  minorName: z.string().min(1, "El nombre del menor es requerido"),
  minorRut: z.string().min(1, "El RUT/Pasaporte del menor es requerido"),
  minorBirthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  minorNationality: z.string().min(1, "La nacionalidad es requerida"),
  guardianName: z.string().min(1, "El nombre del acompañante es requerido"),
  guardianRut: z.string().min(1, "El RUT/Pasaporte del acompañante es requerido"),
  guardianRelation: z.string().min(1, "La relación con el menor es requerida"),
  guardianPhone: z.string().min(1, "El teléfono de contacto es requerido"),
  authorizationFile: z.any().optional(),
  authorizationConfirm: z.boolean().refine(val => val === true, "Debe confirmar la validez de la autorización"),
});

type MinorsFormData = z.infer<typeof minorsSchema>;

export default function MinorsForm() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const createProcessMutation = useCreateProcess();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<MinorsFormData>({
    resolver: zodResolver(minorsSchema),
  });

  const authorizationConfirm = watch("authorizationConfirm");

  const onSubmit = async (data: MinorsFormData) => {
    try {
      const processData = {
        type: "minors",
        formData: {
          menor: {
            nombre: data.minorName,
            rut: data.minorRut,
            fechaNacimiento: data.minorBirthDate,
            nacionalidad: data.minorNationality,
          },
          acompañante: {
            nombre: data.guardianName,
            rut: data.guardianRut,
            relacion: data.guardianRelation,
            telefono: data.guardianPhone,
          },
          autorizacion: {
            confirmada: data.authorizationConfirm,
            archivo: data.authorizationFile?.name || "documento_autorización.pdf",
          },
        },
      };

      await createProcessMutation.mutateAsync(processData);
      
      toast({
        title: "Formulario enviado exitosamente",
        description: "Su trámite ha sido enviado para revisión por SAG",
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

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ["minorName", "minorRut", "minorBirthDate", "minorNationality"]
      : ["guardianName", "guardianRut", "guardianRelation", "guardianPhone"];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const progress = (currentStep / 3) * 100;

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
            Salida/Entrada de Menores
          </h1>
          <p className="text-gray-600 mt-2">
            Autorización para el cruce fronterizo de menores de edad
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Paso {currentStep} de 3</span>
                <span>{Math.round(progress)}% Completado</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Minor Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Información del Menor
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </Label>
                        <Input
                          {...register("minorName")}
                          className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.minorName ? "form-error" : ""
                          }`}
                          placeholder="Nombre completo del menor"
                        />
                        {errors.minorName && (
                          <p className="error-message">{errors.minorName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          RUT/Pasaporte *
                        </Label>
                        <Input
                          {...register("minorRut")}
                          className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.minorRut ? "form-error" : ""
                          }`}
                          placeholder="RUT o número de pasaporte"
                        />
                        {errors.minorRut && (
                          <p className="error-message">{errors.minorRut.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Nacimiento *
                        </Label>
                        <Input
                          type="date"
                          {...register("minorBirthDate")}
                          className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.minorBirthDate ? "form-error" : ""
                          }`}
                        />
                        {errors.minorBirthDate && (
                          <p className="error-message">{errors.minorBirthDate.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Nacionalidad *
                        </Label>
                        <Select onValueChange={(value) => setValue("minorNationality", value)}>
                          <SelectTrigger className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.minorNationality ? "form-error" : ""
                          }`}>
                            <SelectValue placeholder="Seleccionar nacionalidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chilena">Chilena</SelectItem>
                            <SelectItem value="argentina">Argentina</SelectItem>
                            <SelectItem value="brasileña">Brasileña</SelectItem>
                            <SelectItem value="peruana">Peruana</SelectItem>
                            <SelectItem value="otra">Otra</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.minorNationality && (
                          <p className="error-message">{errors.minorNationality.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={handleNextStep}
                      className="bg-chile-blue hover:bg-chile-blue-light"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Guardian Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Información del Acompañante
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </Label>
                        <Input
                          {...register("guardianName")}
                          className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.guardianName ? "form-error" : ""
                          }`}
                          placeholder="Nombre completo del acompañante"
                        />
                        {errors.guardianName && (
                          <p className="error-message">{errors.guardianName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          RUT/Pasaporte *
                        </Label>
                        <Input
                          {...register("guardianRut")}
                          className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.guardianRut ? "form-error" : ""
                          }`}
                          placeholder="RUT o número de pasaporte"
                        />
                        {errors.guardianRut && (
                          <p className="error-message">{errors.guardianRut.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Relación con el menor *
                        </Label>
                        <Select onValueChange={(value) => setValue("guardianRelation", value)}>
                          <SelectTrigger className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.guardianRelation ? "form-error" : ""
                          }`}>
                            <SelectValue placeholder="Seleccionar relación" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="padre">Padre</SelectItem>
                            <SelectItem value="madre">Madre</SelectItem>
                            <SelectItem value="tutor">Tutor Legal</SelectItem>
                            <SelectItem value="familiar">Familiar Autorizado</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.guardianRelation && (
                          <p className="error-message">{errors.guardianRelation.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono de Contacto *
                        </Label>
                        <Input
                          type="tel"
                          {...register("guardianPhone")}
                          className={`focus:ring-chile-blue focus:border-chile-blue ${
                            errors.guardianPhone ? "form-error" : ""
                          }`}
                          placeholder="+56 9 1234 5678"
                        />
                        {errors.guardianPhone && (
                          <p className="error-message">{errors.guardianPhone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Anterior
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNextStep}
                      className="bg-chile-blue hover:bg-chile-blue-light"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Authorization */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="pb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Autorización Notarial
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-yellow-800">Documentación Requerida</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                              Debe adjuntar autorización notarial firmada por ambos padres o tutores legales.
                              El documento debe estar vigente y especificar los países de destino.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Subir Autorización Notarial *
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-chile-blue transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Haga clic para subir archivo
                              </span>
                              <span className="mt-1 block text-sm text-gray-500">
                                PDF, JPG, PNG hasta 10MB
                              </span>
                              <input
                                id="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                {...register("authorizationFile")}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="authorizationConfirm"
                          checked={authorizationConfirm}
                          onCheckedChange={(checked) => setValue("authorizationConfirm", !!checked)}
                          className="mt-1"
                        />
                        <Label htmlFor="authorizationConfirm" className="text-sm text-gray-700 leading-relaxed">
                          Confirmo que la autorización notarial adjunta es válida y está firmada por los 
                          tutores legales correspondientes. Entiendo que cualquier información falsa puede 
                          resultar en el rechazo del trámite.
                        </Label>
                      </div>
                      {errors.authorizationConfirm && (
                        <p className="error-message">{errors.authorizationConfirm.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Anterior
                    </Button>
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
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
