import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Process } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProcesses() {
  return useQuery<Process[]>({
    queryKey: ["/api/processes"],
  });
}

export function useProcess(id: number) {
  return useQuery<Process>({
    queryKey: ["/api/processes", id],
    enabled: !!id,
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (processData: any) => {
      const response = await apiRequest("POST", "/api/processes", processData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Formulario enviado",
        description: "Su trámite ha sido enviado para revisión",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el formulario",
      });
    },
  });
}

export function useUpdateProcess() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/processes/${id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/processes", data.id] });
      toast({
        title: "Proceso actualizado",
        description: "El estado del proceso ha sido actualizado",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el proceso",
      });
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["/api/notifications"],
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
}

export function useActivityLog(processId: number) {
  return useQuery({
    queryKey: ["/api/activity", processId],
    enabled: !!processId,
  });
}

export function useGenerateReport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reporte generado",
        description: "El reporte ha sido generado exitosamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el reporte",
      });
    },
  });
}
