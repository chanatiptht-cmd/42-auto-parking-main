export type VehicleType = 'Sedan' | 'SUV' | 'Pickup';
export type AdminRole = 'Super Admin' | 'Admin' | 'Operator' | 'Viewer';
export type PaymentMethod = 'Thai QR' | 'บัตรเครดิต';
export type MenuPermission =
  | 'dashboard'
  | 'parking-layout'
  | 'operations'
  | 'reports'
  | 'permissions';
export type Permission =
  | MenuPermission
  | 'add-spots'
  | 'edit-spots'
  | 'manage-floors'
  | 'view-photos'
  | 'edit-operations'
  | 'export-operations'
  | 'export-reports'
  | 'edit-users'
  | 'edit-roles'
  | 'reset';
export type RolePermissions = Record<AdminRole, Permission[]>;

export interface ParkingFloor {
  id: number;
  order: number;
  name: string;
  active: boolean;
}

export interface Vehicle {
  id: string;
  plate: string;
  province: string;
  type: VehicleType;
  entryAt: string;
  exitAt: string | null;
  spotId: string | null;
  entryImage?: string;
  exitImage?: string;
}

export interface ParkingSpot {
  id: string;
  name: string;
  floor: number;
  occupied: boolean;
}

export interface Payment {
  id: string;
  vehicleId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  calculatedAt: string;
}

export interface DemoUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: AdminRole;
  active: boolean;
}

export interface ParkingData {
  version: 1;
  spots: ParkingSpot[];
  vehicles: Vehicle[];
  payments: Payment[];
  users: DemoUser[];
  floors: ParkingFloor[];
  rolePermissions: RolePermissions;
  clockStartedAt: number;
}

export type Session = { userId: string; previewRole?: AdminRole };
