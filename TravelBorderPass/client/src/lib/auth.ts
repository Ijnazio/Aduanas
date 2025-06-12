export const ROLE_NAMES = {
  admin: "Funcionario Aduanas",
  tourist: "Turista",
  sag: "Inspector SAG",
  pdi: "Inspector PDI",
} as const;

export const ROLE_PERMISSIONS = {
  admin: ["dashboard", "reports", "all_processes", "user_management"],
  tourist: ["own_processes", "forms"],
  sag: ["sag_review", "declaration_approval"],
  pdi: ["pdi_review", "identity_verification"],
} as const;

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  return permissions?.includes(permission as any) || false;
}

export function getRoleName(role: string): string {
  return ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role;
}

export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'tourist':
      return '/dashboard';
    case 'sag':
      return '/dashboard';
    case 'pdi':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

export function getNavItems(role: string) {
  const baseItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: 'Home', path: '/dashboard' },
    { id: 'help', label: 'Ayuda', icon: 'HelpCircle', path: '/help' },
  ];

  switch (role) {
    case 'tourist':
      return [
        ...baseItems.slice(0, 1),
        { id: 'forms', label: 'Formularios', icon: 'FileText', path: '/forms' },
        ...baseItems.slice(1),
      ];
    case 'admin':
      return [
        ...baseItems.slice(0, 1),
        { id: 'reports', label: 'Reportes', icon: 'BarChart3', path: '/dashboard' },
        ...baseItems.slice(1),
      ];
    default:
      return baseItems;
  }
}
