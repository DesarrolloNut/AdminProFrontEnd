// Sidebar route metadata
export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  label: string;
  labelClass: string;
  extralink: boolean;
  permisos: string[];
  submenu: RouteInfo[];
}
