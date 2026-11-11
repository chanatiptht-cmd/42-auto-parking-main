import type { ParkingData } from '../types/parking.ts';
import { dateKey, DEMO_NOW, time } from './parking.ts';

export type ReportPeriod = 'day' | 'month' | 'year';
export type ReportDates = { start: string; end: string };
export const REPORT_COLORS = ['#5441a6', '#19857e', '#d5a73e'];

const months = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];
const dayInMilliseconds = 86_400_000;

export function reportDates(period: ReportPeriod): ReportDates {
  const today = dateKey(DEMO_NOW);
  if (period === 'day') return { start: today, end: today };
  const year = Number(today.slice(0, 4));
  if (period === 'year') return { start: `${year}-01-01`, end: `${year}-12-31` };
  const month = Number(today.slice(5, 7));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { start: `${today.slice(0, 7)}-01`, end: `${today.slice(0, 7)}-${lastDay}` };
}

export function inPeriod(value: string, period: ReportPeriod) {
  const { start, end } = reportDates(period);
  const day = dateKey(value);
  return day >= start && day <= end;
}

export function createReport(data: ParkingData, period: ReportPeriod, dates = reportDates(period)) {
  const { start, end } = dates;
  const inRange = (value: string) => {
    const day = dateKey(value);
    return day >= start && day <= end;
  };
  const payments = data.payments.filter((payment) => inRange(payment.paidAt));
  const vehicles = data.vehicles.filter((vehicle) => inRange(vehicle.entryAt));
  const departures = data.vehicles.flatMap((vehicle) =>
    vehicle.exitAt && inRange(vehicle.exitAt) ? [vehicle.exitAt] : [],
  );
  const dayCount = Math.round((Date.parse(end) - Date.parse(start)) / dayInMilliseconds) + 1;
  const isHourly = dayCount === 1;
  const isMonthly = dayCount > 45;
  const monthIndex = (date: string) => Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;

  const labels = isHourly
    ? Array.from({ length: 12 }, (_, index) => `${String(index * 2).padStart(2, '0')}:00`)
    : isMonthly
      ? Array.from({ length: monthIndex(end) - monthIndex(start) + 1 }, (_, index) => {
          const month = monthIndex(start) + index;
          return `${months[month % 12]} ${Math.floor(month / 12) + 543}`;
        })
      : Array.from({ length: dayCount }, (_, index) => {
          const day = new Date(Date.parse(start) + index * dayInMilliseconds);
          return `${day.getUTCDate()} ${months[day.getUTCMonth()]}`;
        });

  function bucket(value: string) {
    if (isHourly) return Math.floor(Number(time(value).slice(0, 2)) / 2);
    const day = dateKey(value);
    if (isMonthly) return monthIndex(day) - monthIndex(start);
    return Math.round((Date.parse(day) - Date.parse(start)) / dayInMilliseconds);
  }

  const series = labels.map((label) => ({
    label,
    revenue: 0,
    transactions: 0,
    entries: 0,
    exits: 0,
  }));
  for (const payment of payments) {
    const point = series[bucket(payment.paidAt)];
    point.revenue += payment.amount;
    point.transactions += 1;
  }
  for (const vehicle of vehicles) series[bucket(vehicle.entryAt)].entries += 1;
  for (const exitAt of departures) series[bucket(exitAt)].exits += 1;

  const channels = ['Thai QR', 'บัตรเครดิต'].map((name) => ({
    name,
    value: payments
      .filter((payment) => payment.method === name)
      .reduce((sum, payment) => sum + payment.amount, 0),
  }));
  const types = ['Sedan', 'SUV', 'Pickup'].map((name) => ({
    name,
    value: vehicles.filter((vehicle) => vehicle.type === name).length,
  }));
  const visits = new Map<string, number>();
  for (const vehicle of vehicles) {
    if (vehicle.spotId) visits.set(vehicle.spotId, (visits.get(vehicle.spotId) ?? 0) + 1);
  }

  return {
    series,
    channels,
    types,
    payments,
    visits,
    total: payments.reduce((sum, payment) => sum + payment.amount, 0),
    vehicleCount: vehicles.length,
    exitCount: departures.length,
  };
}
