export type Role = 'customer' | 'admin' | 'guard' | 'executive';

export type SpotStatus = 'available' | 'occupied' | 'maintenance';
export type SpotType = 'regular' | 'ev' | 'disabled' | 'lady';

export interface ParkingSpot {
  id: string;
  floor: 'P1' | 'P2';
  row: string;
  number: number;
  status: SpotStatus;
  type: SpotType;
  currentPlate: string | null;
  occupiedSince: string | null; // ISO timestamp
}

export type TransactionStatus = 'unpaid' | 'paid' | 'completed';

export interface ParkingTransaction {
  id: string;
  plate: string;
  province: string;
  vehicleModel: string;
  spotId: string;
  floor: 'P1' | 'P2';
  entryTime: string; // ISO
  exitTime: string | null; // ISO
  durationMinutes: number;
  amount: number;
  status: TransactionStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  gracePeriodExpiresAt: string | null; // ISO (15 min after paidAt)
  paymentRef: string;
}

export interface RateConfig {
  firstHourFree: number; // e.g. 1 hour free or 0
  hourlyRate: number; // e.g. 20 THB
  maxCap: number; // e.g. 150 THB/day
  gracePeriodMinutes: number; // 15 mins
  lostTicketFee: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action:
    | 'OVERRIDE_GATE'
    | 'VEHICLE_ENTRY'
    | 'VEHICLE_EXIT'
    | 'RATE_UPDATE'
    | 'MAINTENANCE_TOGGLE'
    | 'PAYMENT_CONFIRMED'
    | 'SPOT_RELEASE';
  actorRole: 'Customer' | 'Admin' | 'Guard' | 'Executive' | 'System LPR';
  actorName: string;
  details: string;
  type: 'danger' | 'warning' | 'success' | 'info';
}

export interface GateState {
  entryGateOpen: boolean;
  exitGateOpen: boolean;
  lastEntryPlate: string | null;
  lastExitPlate: string | null;
  entryCameraDetecting: boolean;
  exitCameraDetecting: boolean;
}
