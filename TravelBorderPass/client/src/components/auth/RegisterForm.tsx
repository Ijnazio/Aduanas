import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  rut: z.string().min(1, "El RUT/Pasaporte es requerido"),
  termsAccepted: z.boolean().refine(val => val === true, "Debe aceptar los términos y condiciones"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { register: authRegister, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const termsAccepted = watch("termsAccepted");

  const onSubmit = async (data: RegisterFormData) => {
    const { termsAccepted, ...userData } = data;
    await authRegister(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-chile flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <UserPlus className="text-chile-blue text-4xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registro de Turista
            </CardTitle>
            <p className="text-gray-600 mt-2">Crea tu cuenta para gestionar trámites</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </Label>
                  <Input
                    {...register("name")}
                    className="focus:ring-chile-blue focus:border-chile-blue"
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </Label>
                  <Input
                    {...register("username")}
                    className="focus:ring-chile-blue focus:border-chile-blue"
                  />
                  {errors.username && (
                    <p className="error-message">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT/Pasaporte
                </Label>
                <Input
                  {...register("rut")}
                  className="focus:ring-chile-blue focus:border-chile-blue"
                />
                {errors.rut && (
                  <p className="error-message">{errors.rut.message}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </Label>
                <Input
                  type="email"
                  {...register("email")}
                  className="focus:ring-chile-blue focus:border-chile-blue"
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </Label>
                <Input
                  type="tel"
                  {...register("phone")}
                  className="focus:ring-chile-blue focus:border-chile-blue"
                />
                {errors.phone && (
                  <p className="error-message">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </Label>
                <Input
                  type="password"
                  {...register("password")}
                  className="focus:ring-chile-blue focus:border-chile-blue"
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAccept"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setValue("termsAccepted", !!checked)}
                />
                <Label htmlFor="termsAccept" className="text-sm text-gray-600">
                  Acepto los términos y condiciones
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="error-message">{errors.termsAccepted.message}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-chile-blue hover:bg-chile-blue-light"
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="link" className="text-chile-blue hover:underline">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <Info className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-yellow-800">
                  Su cuenta será validada por un funcionario antes de poder acceder al sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
