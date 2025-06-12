import { useAuth } from "@/hooks/useAuth";
import TouristDashboard from "@/components/dashboard/TouristDashboard";
import SAGPanel from "@/components/dashboard/SAGPanel";
import PDIPanel from "@/components/dashboard/PDIPanel";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Cargando...</h2>
          <p className="text-gray-600 mt-2">Verificando credenciales</p>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case "tourist":
      return <TouristDashboard />;
    case "sag":
      return <SAGPanel />;
    case "pdi":
      return <PDIPanel />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Rol no reconocido</h2>
            <p className="text-gray-600 mt-2">
              Tu cuenta tiene un rol que no está configurado en el sistema.
            </p>
          </div>
        </div>
      );
  }
}
