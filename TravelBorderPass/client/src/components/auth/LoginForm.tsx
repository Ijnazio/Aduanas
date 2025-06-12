import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    const success = await login(data.username, data.password);
    if (!success) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-chile flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <Shield className="text-chile-blue text-5xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sistema Aduanas Chile
            </CardTitle>
            <p className="text-gray-600 mt-2">Modernización Pasos Fronterizos</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  {...register("username")}
                  placeholder="Ingresa tu usuario"
                  className="focus:ring-chile-blue focus:border-chile-blue"
                />
                {errors.username && (
                  <p className="error-message">{errors.username.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Ingresa tu contraseña"
                  className="focus:ring-chile-blue focus:border-chile-blue"
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="notification-error rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-chile-blue hover:bg-chile-blue-light"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/register">
                <Button variant="link" className="text-chile-blue hover:underline">
                  ¿Eres turista? Regístrate aquí
                </Button>
              </Link>
            </div>

            {/* Demo Users Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Usuarios Demo:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Funcionario:</strong> funcionario1 / pass123</div>
                <div><strong>Turista:</strong> turista1 / pass123</div>
                <div><strong>SAG:</strong> sag1 / pass123</div>
                <div><strong>PDI:</strong> pdi1 / pass123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
