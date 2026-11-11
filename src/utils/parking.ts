import type { ParkingData, Payment, Vehicle } from '../types/parking.ts';

// A fixed demo clock keeps the sample parking fee stable, even years later.
export const DEMO_NOW = '2025-10-14T12:45:00+07:00';
export const HOURLY_RATE = 30;
export const TIME_ZONE = 'Asia/Bangkok';

export function normalizePlate(value: string) {
  return value.replace(/\s+/g, '').toLocaleLowerCase('th-TH');
}

export function parkingMinutes(entryAt: string, endAt = DEMO_NOW) {
  return Math.max(0, Math.floor((Date.parse(endAt) - Date.parse(entryAt)) / 60000));
}

export function parkingFee(entryAt: string, endAt = DEMO_NOW) {
  return Math.ceil(Math.max(0, Date.parse(endAt) - Date.parse(entryAt)) / 3600000) * HOURLY_RATE;
}

export function duration(entryAt: string, endAt = DEMO_NOW) {
  const minutes = parkingMinutes(entryAt, endAt);
  return `${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`;
}

export function money(amount: number) {
  return `${amount.toLocaleString('th-TH')} บาท`;
}

export function thaiDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function time(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function dateTime(value: string) {
  return `${thaiDate(value)} ${time(value)} น.`;
}

export function dateKey(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function vehicleTotal(vehicle: Vehicle, payment?: Payment, now = DEMO_NOW) {
  return payment?.amount ?? parkingFee(vehicle.entryAt, vehicle.exitAt ?? now);
}

export function calculationTime(vehicle: Vehicle, _payment?: Payment, now = DEMO_NOW) {
  return vehicle.exitAt ?? now;
}

export const exitDeadline = (payment: Payment) =>
  new Date(Date.parse(payment.paidAt) + 15 * 60000).toISOString();
export const demoNow = (data: ParkingData) =>
  new Date(Date.parse(DEMO_NOW) + Math.max(0, Date.now() - data.clockStartedAt)).toISOString();
export const floorName = (data: ParkingData, id: number) =>
  data.floors.find((f) => f.id === id)?.name ?? `ชั้น ${id}`;
export const vehiclePhoto = (vehicle: Vehicle, kind: 'entry' | 'exit' = 'entry') =>
  (kind === 'exit' ? vehicle.exitImage : vehicle.entryImage) ?? '/images/white-car.jpg';
