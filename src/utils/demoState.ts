import type {
  AdminRole,
  DemoUser,
  ParkingData,
  ParkingFloor,
  ParkingSpot,
  Permission,
  Vehicle,
} from '../types/parking.ts';
import { ALL_PERMISSIONS, MENU_ACTIONS, PERMISSIONS, ROLES } from '../data/permissions.ts';
import { DEMO_NOW, exitDeadline, parkingFee } from './parking.ts';

export const STORAGE_KEY = 'smart-parking-demo-v1';
export const SESSION_KEY = 'smart-parking-session-v1';

const validDate = (value: unknown) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const uniqueIds = (items: { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length;

export function isParkingData(value: unknown): value is ParkingData {
  if (!value || typeof value !== 'object') return false;
  const data = value as ParkingData;
  if (
    data.version !== 1 ||
    ![data.spots, data.vehicles, data.payments, data.users].every(Array.isArray)
  )
    return false;
  if (
    !Array.isArray(data.floors) ||
    !data.floors.every(
      (f) =>
        f &&
        Number.isInteger(f.id) &&
        f.id > 0 &&
        Number.isInteger(f.order) &&
        f.order > 0 &&
        text(f.name) &&
        typeof f.active === 'boolean',
    )
  )
    return false;
  if (
    new Set(data.floors.map((f) => f.id)).size !== data.floors.length ||
    new Set(data.floors.map((f) => f.order)).size !== data.floors.length
  )
    return false;
  if (!Number.isFinite(data.clockStartedAt) || data.clockStartedAt <= 0) return false;
  if (
    !data.rolePermissions ||
    !ROLES.every(
      (role) =>
        Array.isArray(data.rolePermissions[role]) &&
        data.rolePermissions[role].every((p) => ALL_PERMISSIONS.includes(p)),
    )
  )
    return false;
  if (!ALL_PERMISSIONS.every((p) => data.rolePermissions['Super Admin'].includes(p))) return false;
  if (
    !data.spots.every(
      (s) =>
        s &&
        text(s.id) &&
        text(s.name) &&
        data.floors.some((f) => f.id === s.floor) &&
        typeof s.occupied === 'boolean',
    )
  )
    return false;
  if (
    !data.vehicles.every(
      (v) =>
        v &&
        text(v.id) &&
        text(v.plate) &&
        text(v.province) &&
        ['Sedan', 'SUV', 'Pickup'].includes(v.type) &&
        validDate(v.entryAt) &&
        (v.exitAt === null ||
          (validDate(v.exitAt) && Date.parse(v.exitAt) >= Date.parse(v.entryAt))) &&
        (v.spotId === null || data.spots.some((s) => s.id === v.spotId)),
    )
  )
    return false;
  if (
    !data.payments.every(
      (p) =>
        p &&
        text(p.id) &&
        data.vehicles.some((v) => v.id === p.vehicleId) &&
        Number.isFinite(p.amount) &&
        p.amount >= 0 &&
        ['Thai QR', 'บัตรเครดิต'].includes(p.method) &&
        validDate(p.paidAt) &&
        validDate(p.calculatedAt),
    )
  )
    return false;
  if (
    !data.users.every(
      (u) =>
        u &&
        text(u.id) &&
        text(u.name) &&
        text(u.username) &&
        text(u.password) &&
        ROLES.includes(u.role) &&
        typeof u.active === 'boolean',
    )
  )
    return false;
  return (
    [data.spots, data.vehicles, data.payments, data.users].every(uniqueIds) &&
    new Set(data.spots.map((s) => `${s.floor}-${s.name.toUpperCase()}`)).size ===
      data.spots.length &&
    new Set(data.payments.map((p) => p.vehicleId)).size === data.payments.length &&
    new Set(data.users.map((u) => u.username.toLowerCase())).size === data.users.length &&
    data.users.some((u) => u.role === 'Super Admin' && u.active)
  );
}

export function payVehicle(data: ParkingData, vehicleId: string, now = DEMO_NOW): ParkingData {
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) throw new Error('ไม่พบข้อมูลรถ');
  if (data.payments.some((payment) => payment.vehicleId === vehicleId)) return data;
  if (vehicle.exitAt) throw new Error('รถออกจากลานแล้ว');
  const calculatedAt = now;
  return {
    ...data,
    // Payment does not modify exitAt or release a parking spot.
    payments: [
      ...data.payments,
      {
        id: `DEMO-${vehicle.id.toUpperCase()}-${Date.parse(now)}`,
        vehicleId,
        amount: parkingFee(vehicle.entryAt, calculatedAt),
        method: 'Thai QR',
        paidAt: now,
        calculatedAt,
      },
    ],
  };
}

export function saveSpot(
  data: ParkingData,
  spot: ParkingSpot,
  originalOccupied?: boolean,
): ParkingData {
  const next = { ...spot, name: spot.name.trim().toUpperCase() };
  const current = data.spots.find((s) => s.id === next.id);
  if (current && originalOccupied !== undefined && current.occupied !== originalOccupied)
    throw new Error('สถานะช่องจอดเปลี่ยนแล้ว กรุณาปิดแล้วเปิดแบบฟอร์มใหม่');
  if (!/^[A-Z][A-Z0-9-]{0,7}$/.test(next.name))
    throw new Error('ชื่อช่องจอดต้องเริ่มด้วย A–Z เช่น A1 และยาวไม่เกิน 8 ตัว');
  if (!Number.isInteger(next.floor) || next.floor < 1 || next.floor > 99)
    throw new Error('กรุณาระบุชั้นตั้งแต่ 1–99');
  if (!data.floors.some((f) => f.id === next.floor))
    throw new Error('ไม่พบชั้นจอด กรุณาเพิ่มชั้นก่อน');
  if (data.spots.some((s) => s.id !== next.id && s.floor === next.floor && s.name === next.name))
    throw new Error('มีชื่อช่องจอดนี้ในชั้นเดียวกันแล้ว');
  if (!next.occupied && data.vehicles.some((v) => !v.exitAt && v.spotId === next.id))
    throw new Error('รถยังจอดอยู่ กรุณาจำลองรถผ่านไม้กั้นที่ Kiosk ก่อนคืนช่องจอด');
  return {
    ...data,
    spots: current ? data.spots.map((s) => (s.id === next.id ? next : s)) : [...data.spots, next],
  };
}

export function saveUser(
  data: ParkingData,
  user: DemoUser,
  actorRole: AdminRole = 'Super Admin',
): ParkingData {
  const next = { ...user, name: user.name.trim(), username: user.username.trim().toLowerCase() };
  if (
    actorRole !== 'Super Admin' &&
    (next.role === 'Super Admin' ||
      data.users.find((u) => u.id === next.id)?.role === 'Super Admin')
  )
    throw new Error('เฉพาะ Super Admin ที่จัดการบัญชี Super Admin ได้');
  if (!next.name || !/^[a-z0-9_.-]{3,30}$/.test(next.username))
    throw new Error('กรุณากรอกชื่อ และชื่อผู้ใช้ภาษาอังกฤษ 3–30 ตัว');
  if (next.password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
  if (!ROLES.includes(next.role)) throw new Error('บทบาทไม่ถูกต้อง');
  if (data.users.some((u) => u.id !== next.id && u.username.toLowerCase() === next.username))
    throw new Error('ชื่อผู้ใช้นี้มีอยู่แล้ว');
  const users = data.users.some((u) => u.id === next.id)
    ? data.users.map((u) => (u.id === next.id ? next : u))
    : [...data.users, next];
  if (!users.some((u) => u.role === 'Super Admin' && u.active))
    throw new Error('ต้องมี Super Admin ที่เปิดใช้งานอย่างน้อย 1 คน');
  return { ...data, users };
}

export function deleteUser(
  data: ParkingData,
  id: string,
  actorRole: AdminRole = 'Super Admin',
): ParkingData {
  if (actorRole !== 'Super Admin' && data.users.find((u) => u.id === id)?.role === 'Super Admin')
    throw new Error('เฉพาะ Super Admin ที่จัดการบัญชี Super Admin ได้');
  const users = data.users.filter((user) => user.id !== id);
  if (!users.some((user) => user.role === 'Super Admin' && user.active))
    throw new Error('ไม่สามารถลบ Super Admin คนสุดท้ายได้');
  return { ...data, users };
}

export function saveFloor(data: ParkingData, floor: ParkingFloor): ParkingData {
  const next = { ...floor, name: floor.name.trim() };
  if (
    !Number.isInteger(next.id) ||
    next.id < 1 ||
    next.id > 99 ||
    !Number.isInteger(next.order) ||
    next.order < 1 ||
    next.order > 99 ||
    !next.name ||
    next.name.length > 40
  )
    throw new Error('กรุณากรอกชื่อชั้นและลำดับ 1–99 ให้ถูกต้อง');
  if (
    data.floors.some(
      (f) =>
        f.id !== next.id &&
        (f.order === next.order || f.name.toLowerCase() === next.name.toLowerCase()),
    )
  )
    throw new Error('ชื่อชั้นหรือลำดับซ้ำ');
  return {
    ...data,
    floors: (data.floors.some((f) => f.id === next.id)
      ? data.floors.map((f) => (f.id === next.id ? next : f))
      : [...data.floors, next]
    ).sort((a, b) => a.order - b.order),
  };
}

export function saveRolePermissions(
  data: ParkingData,
  role: AdminRole,
  permissions: Permission[],
): ParkingData {
  if (!ROLES.includes(role) || role === 'Super Admin')
    throw new Error('สิทธิ์ Super Admin ถูกสงวนไว้เพื่อดูแลระบบ');
  const allowed = permissions.filter(
    (p) => ALL_PERMISSIONS.includes(p) && !['reset', 'edit-roles'].includes(p),
  );
  const clean = [...new Set(allowed)].filter((p) => {
    const parent = MENU_ACTIONS.find((m) => m.actions.some((a) => a.key === p));
    return !parent || allowed.includes(parent.menu);
  });
  return { ...data, rolePermissions: { ...data.rolePermissions, [role]: clean } };
}

export function passGate(data: ParkingData, id: string, now: string): ParkingData {
  const vehicle = data.vehicles.find((v) => v.id === id);
  if (!vehicle) throw new Error('ไม่พบรายการรถ');
  if (vehicle.exitAt) return data;
  const payment = data.payments.find((p) => p.vehicleId === id);
  if (
    !payment ||
    Date.parse(now) < Date.parse(payment.paidAt) ||
    Date.parse(now) > Date.parse(exitDeadline(payment))
  )
    throw new Error('ยังไม่ชำระเงินหรือพ้นเวลาออก 15 นาที');
  return {
    ...data,
    vehicles: data.vehicles.map((v) => (v.id === id ? { ...v, exitAt: now } : v)),
    spots: data.spots.map((s) => (s.id === vehicle.spotId ? { ...s, occupied: false } : s)),
  };
}

export function saveOperation(data: ParkingData, vehicle: Vehicle): ParkingData {
  const previous = data.vehicles.find((v) => v.id === vehicle.id);
  if (!previous) throw new Error('ไม่พบรายการรถ');
  if (
    !vehicle.plate.trim() ||
    !vehicle.province.trim() ||
    !['Sedan', 'SUV', 'Pickup'].includes(vehicle.type)
  )
    throw new Error('กรุณากรอกข้อมูลรถให้ครบ');
  // Editing vehicle metadata cannot create payment, exit or occupancy events.
  return {
    ...data,
    vehicles: data.vehicles.map((v) =>
      v.id === vehicle.id
        ? {
            ...v,
            plate: vehicle.plate.trim(),
            province: vehicle.province.trim(),
            type: vehicle.type,
          }
        : v,
    ),
  };
}

// Upgrade earlier v1 browser data in place; preserve existing receipts and accounts.
export function migrateParkingData(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const data = value as ParkingData;
  if (data.version !== 1 || !Array.isArray(data.spots)) return value;
  return {
    ...data,
    floors:
      data.floors ??
      [...new Set(data.spots.map((s) => s?.floor))]
        .filter(Number.isInteger)
        .map((id, i) => ({ id, order: i + 1, name: `ชั้น ${id}`, active: true })),
    rolePermissions: data.rolePermissions ?? structuredClone(PERMISSIONS),
    clockStartedAt: data.clockStartedAt ?? Date.now(),
  };
}
