import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/auth";
import MinorsForm from "@/components/forms/MinorsForm";
import VehiclesForm from "@/components/forms/VehiclesForm";
import DeclarationForm from "@/components/forms/DeclarationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Car, Apple, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Forms() {
  const { formType } = useParams<{ formType?: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Check if user has permission to access forms
  if (!user || !hasPermission(user.role, "forms")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a los formularios.
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show specific form based on formType parameter
  if (formType) {
    switch (formType) {
      case "minors":
        return <MinorsForm />;
      case "vehicles":
        return <VehiclesForm />;
      case "declaration":
        return <DeclarationForm />;
      default:
        // Invalid form type, redirect to forms list
        setLocation("/forms");
        return null;
    }
  }

  // Show forms selection page
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="text-chile-blue hover:text-chile-blue-light flex items-center mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Formularios de Trámites
          </h1>
          <p className="text-gray-600 mt-2">
            Selecciona el tipo de trámite que deseas realizar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/forms/minors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-chile-blue group-hover:text-white transition-colors">
                  <User className="w-8 h-8" />
                </div>
                <CardTitle className="text-lg">Salida/Entrada de Menores</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-center mb-4">
                  Autorización notarial para el cruce fronterizo de menores de edad
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>• Autorización notarial requerida</div>
                  <div>• Documentos de identidad</div>
                  <div>• Información del acompañante</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/forms/vehicles">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-chile-blue group-hover:text-white transition-colors">
                  <Car className="w-8 h-8" />
                </div>
                <CardTitle className="text-lg">Vehículos Particulares</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-center mb-4">
                  Salida y Admisión Temporal de Vehículos con reconocimiento binacional
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>• Permiso de circulación</div>
                  <div>• Seguro obligatorio</div>
                  <div>• Válido en Argentina</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/forms/declaration">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-chile-blue group-hover:text-white transition-colors">
                  <Apple className="w-8 h-8" />
                </div>
                <CardTitle className="text-lg">Declaración Jurada</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-center mb-4">
                  Declaración de alimentos, plantas, mascotas y material orgánico
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>• Alimentos y productos orgánicos</div>
                  <div>• Plantas y semillas</div>
                  <div>• Mascotas y animales</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Information Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-chile-blue">
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Tiempo de procesamiento:</strong> Los trámites son revisados por SAG y PDI 
                en orden de llegada. El tiempo estimado es de 4-8 horas hábiles.
              </p>
              <p>
                <strong>Documentación:</strong> Asegúrate de tener todos los documentos necesarios 
                antes de iniciar el formulario. Los archivos deben estar en formato PDF, JPG o PNG.
              </p>
              <p>
                <strong>Borradores:</strong> Puedes guardar tu progreso como borrador y continuar 
                más tarde. Los borradores se mantienen por 30 días.
              </p>
              <p>
                <strong>Ayuda:</strong> Si tienes dudas, visita nuestro 
                <Link href="/help">
                  <Button variant="link" className="p-0 h-auto text-chile-blue">
                    centro de ayuda
                  </Button>
                </Link> 
                {" "}o contacta al soporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
