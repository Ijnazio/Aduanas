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
import { ArrowLeft, AlertTriangle, Upload } from "lucide-react";
import { useCreateProcess } from "@/hooks/useWorkflow";
import { useToast } from "@/hooks/use-toast";

const declarationSchema = z.object({
  // Food items
  foodFruits: z.boolean().optional(),
  foodMeat: z.boolean().optional(),
  foodDairy: z.boolean().optional(),
  foodProcessed: z.boolean().optional(),
  foodDetails: z.string().optional(),
  
  // Plants
  plantSeeds: z.boolean().optional(),
  plantLive: z.boolean().optional(),
  plantWood: z.boolean().optional(),
  plantHerbs: z.boolean().optional(),
  plantDetails: z.string().optional(),
  
  // Pets
  hasPets: z.boolean().optional(),
  petType: z.string().optional(),
  petQuantity: z.string().optional(),
  petCertificate: z.any().optional(),
  
  // Declaration
  truthDeclaration: z.boolean().refine(val => val === true, "Debe aceptar la declaración jurada"),
});

type DeclarationFormData = z.infer<typeof declarationSchema>;

export default function DeclarationForm() {
  const [, setLocation] = useLocation();
  const createProcessMutation = useCreateProcess();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema),
  });

  const watchedValues = watch();
  const hasFoodItems = watchedValues.foodFruits || watchedValues.foodMeat || 
                      watchedValues.foodDairy || watchedValues.foodProcessed;
  const hasPlantItems = watchedValues.plantSeeds || watchedValues.plantLive || 
                       watchedValues.plantWood || watchedValues.plantHerbs;
  const hasPets = watchedValues.hasPets;
  const truthDeclaration = watchedValues.truthDeclaration;

  const onSubmit = async (data: DeclarationFormData) => {
    try {
      const processData = {
        type: "declaration",
        formData: {
          alimentos: {
            frutas: data.foodFruits || false,
            carnes: data.foodMeat || false,
            lacteos: data.foodDairy || false,
            procesados: data.foodProcessed || false,
            detalles: data.foodDetails || "",
          },
          plantas: {
            semillas: data.plantSeeds || false,
            vivas: data.plantLive || false,
            madera: data.plantWood || false,
            hierbas: data.plantHerbs || false,
            detalles: data.plantDetails || "",
          },
          mascotas: {
            tiene: data.hasPets || false,
            tipo: data.petType || "",
            cantidad: data.petQuantity || "",
            certificado: data.petCertificate?.name || "",
          },
          declaracion: {
            verdadera: data.truthDeclaration,
            fecha: new Date().toISOString(),
          },
        },
      };

      await createProcessMutation.mutateAsync(processData);
      
      toast({
        title: "Declaración enviada exitosamente",
        description: "Su declaración jurada ha sido enviada para revisión por SAG",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar declaración",
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
            Declaración Jurada
          </h1>
          <p className="text-gray-600 mt-2">
            Alimentos, plantas y mascotas
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Food Items */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Alimentos</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="food-fruits"
                      checked={watchedValues.foodFruits}
                      onCheckedChange={(checked) => setValue("foodFruits", !!checked)}
                    />
                    <Label htmlFor="food-fruits" className="text-gray-700">
                      Frutas y verduras frescas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="food-meat"
                      checked={watchedValues.foodMeat}
                      onCheckedChange={(checked) => setValue("foodMeat", !!checked)}
                    />
                    <Label htmlFor="food-meat" className="text-gray-700">
                      Carnes y productos cárnicos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="food-dairy"
                      checked={watchedValues.foodDairy}
                      onCheckedChange={(checked) => setValue("foodDairy", !!checked)}
                    />
                    <Label htmlFor="food-dairy" className="text-gray-700">
                      Productos lácteos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="food-processed"
                      checked={watchedValues.foodProcessed}
                      onCheckedChange={(checked) => setValue("foodProcessed", !!checked)}
                    />
                    <Label htmlFor="food-processed" className="text-gray-700">
                      Alimentos procesados
                    </Label>
                  </div>
                </div>
                {hasFoodItems && (
                  <div className="mt-4">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción detallada de alimentos *
                    </Label>
                    <Textarea
                      {...register("foodDetails")}
                      rows={3}
                      className="focus:ring-chile-blue focus:border-chile-blue"
                      placeholder="Describa los alimentos que transporta, incluyendo cantidades aproximadas..."
                    />
                  </div>
                )}
              </div>

              {/* Plants */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Plantas y Material Vegetal
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="plant-seeds"
                      checked={watchedValues.plantSeeds}
                      onCheckedChange={(checked) => setValue("plantSeeds", !!checked)}
                    />
                    <Label htmlFor="plant-seeds" className="text-gray-700">
                      Semillas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="plant-live"
                      checked={watchedValues.plantLive}
                      onCheckedChange={(checked) => setValue("plantLive", !!checked)}
                    />
                    <Label htmlFor="plant-live" className="text-gray-700">
                      Plantas vivas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="plant-wood"
                      checked={watchedValues.plantWood}
                      onCheckedChange={(checked) => setValue("plantWood", !!checked)}
                    />
                    <Label htmlFor="plant-wood" className="text-gray-700">
                      Madera o productos de madera
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="plant-herbs"
                      checked={watchedValues.plantHerbs}
                      onCheckedChange={(checked) => setValue("plantHerbs", !!checked)}
                    />
                    <Label htmlFor="plant-herbs" className="text-gray-700">
                      Hierbas medicinales
                    </Label>
                  </div>
                </div>
                {hasPlantItems && (
                  <div className="mt-4">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción detallada de plantas *
                    </Label>
                    <Textarea
                      {...register("plantDetails")}
                      rows={3}
                      className="focus:ring-chile-blue focus:border-chile-blue"
                      placeholder="Describa las plantas o material vegetal, incluyendo origen y cantidades..."
                    />
                  </div>
                )}
              </div>

              {/* Pets */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Mascotas y Animales
                </h2>
                <div className="flex items-center space-x-3 mb-4">
                  <Checkbox
                    id="hasPets"
                    checked={hasPets}
                    onCheckedChange={(checked) => setValue("hasPets", !!checked)}
                  />
                  <Label htmlFor="hasPets" className="text-gray-700">
                    Viajo con mascotas o animales
                  </Label>
                </div>
                {hasPets && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Animal *
                        </Label>
                        <Select onValueChange={(value) => setValue("petType", value)}>
                          <SelectTrigger className="focus:ring-chile-blue focus:border-chile-blue">
                            <SelectValue placeholder="Seleccionar tipo de animal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perro">Perro</SelectItem>
                            <SelectItem value="gato">Gato</SelectItem>
                            <SelectItem value="ave">Ave</SelectItem>
                            <SelectItem value="roedor">Roedor</SelectItem>
                            <SelectItem value="reptil">Reptil</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad *
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          {...register("petQuantity")}
                          className="focus:ring-chile-blue focus:border-chile-blue"
                          placeholder="Número de animales"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificado Veterinario *
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-chile-blue transition-colors">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="pet-certificate-upload" className="cursor-pointer">
                            <span className="mt-1 block text-sm font-medium text-gray-900">
                              Subir Certificado Veterinario
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">
                              PDF, JPG, PNG hasta 5MB
                            </span>
                            <input
                              id="pet-certificate-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.jpg,.jpeg,.png"
                              {...register("petCertificate")}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        El certificado debe incluir vacunas vigentes y estar emitido por un veterinario autorizado.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Declaration */}
              <div className="pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Declaración</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        La declaración falsa de información constituye una infracción grave y puede 
                        resultar en sanciones legales, multas y prohibición de ingreso al país. 
                        Toda la información será verificada por las autoridades competentes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="truthDeclaration"
                      checked={truthDeclaration}
                      onCheckedChange={(checked) => setValue("truthDeclaration", !!checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="truthDeclaration" className="text-sm text-gray-700 leading-relaxed">
                      Declaro bajo juramento que toda la información proporcionada es verdadera y completa. 
                      Entiendo que cualquier declaración falsa puede resultar en sanciones legales, 
                      confiscación de productos, multas y prohibición de ingreso. Me comprometo a 
                      cumplir con todas las normativas fitosanitarias y zoosanitarias vigentes.
                    </Label>
                  </div>
                  {errors.truthDeclaration && (
                    <p className="error-message">{errors.truthDeclaration.message}</p>
                  )}
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
                  {createProcessMutation.isPending ? "Enviando..." : "Enviar Declaración"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
