import type { ParkingData, Vehicle, VehicleType } from '../types/parking.ts';
import { parkingFee } from '../utils/parking.ts';
import { PERMISSIONS } from './permissions';

export function createDemoData(): ParkingData {
  const occupied = {
    1: ['A3', 'A8', 'B8', 'B9', 'C3', 'C4'],
    2: ['A2', 'B4', 'B7', 'C6'],
  };
  const spots = [1, 2].flatMap((floor) =>
    ['A', 'B', 'C'].flatMap((row) =>
      Array.from({ length: 10 }, (_, index) => ({
        id: `f${floor}-${row}${index + 1}`,
        name: `${row}${index + 1}`,
        floor,
        occupied: occupied[floor as 1 | 2].includes(`${row}${index + 1}`),
      })),
    ),
  );
  const vehicles: Vehicle[] = [
    {
      id: 'v1',
      plate: 'กก 1234',
      province: 'กรุงเทพมหานคร',
      type: 'Sedan',
      entryAt: '2025-10-14T09:24:00+07:00',
      exitAt: null,
      spotId: 'f1',
    },
    
  ];
  const types: VehicleType[] = ['Sedan', 'SUV', 'Pickup'];
  spots
    .filter((spot) => spot.occupied && !vehicles.some((vehicle) => vehicle.spotId === spot.id))
    .forEach((spot, index) => {
      vehicles.push({
        id: `v${index + 6}`,
        plate: index === 0 ? 'กก 1234' : `จค ${2100 + index}`,
        province: index === 0 ? 'ชลบุรี' : 'กรุงเทพมหานคร',
        entryImage: index === 0 ? '/images/blue-car.jpg' : '/images/white-car.jpg',
        type: types[index % 3],
        entryAt: `2025-10-14T${String(8 + (index % 4)).padStart(2, '0')}:30:00+07:00`,
        exitAt: null,
        spotId: spot.id,
      });
    });

  // Historical sessions power every report; charts and totals never have separate numbers.
  for (let month = 1; month <= 10; month++) {
    const days = month === 10 ? [2, 5, 8, 11, 13] : [3, 8, 14, 20, 26];
    days.forEach((day, index) => {
      for (let count = 0; count < 2 + (month % 3); count++) {
        const date = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hour = 7 + count;
        vehicles.push({
          id: `history-${month}-${day}-${count}`,
          plate: `ทด ${month}${day}${count}`,
          province: 'กรุงเทพมหานคร',
          type: types[(index + count) % 3],
          entryAt: `${date}T${String(hour).padStart(2, '0')}:00:00+07:00`,
          exitAt: `${date}T${String(hour + 1 + ((index + month) % 4)).padStart(2, '0')}:20:00+07:00`,
          spotId: spots[(day + index * 7 + count * 13) % spots.length].id,
        });
      }
    });
  }
  const payments = vehicles
    .filter((vehicle) => vehicle.exitAt)
    .map((vehicle, index) => ({
      id: `DEMO-SEED-${String(index + 1).padStart(4, '0')}`,
      vehicleId: vehicle.id,
      amount: parkingFee(vehicle.entryAt, vehicle.exitAt!),
      method: index % 4 === 0 ? ('บัตรเครดิต' as const) : ('Thai QR' as const),
      paidAt: vehicle.exitAt!,
      calculatedAt: vehicle.exitAt!,
    }));

  return {
    version: 1,
    floors: [1, 2].map((id) => ({ id, order: id, name: `ชั้น ${id}`, active: true })),
    rolePermissions: structuredClone(PERMISSIONS),
    clockStartedAt: Date.now(),
    spots,
    vehicles,
    payments,
    users: [
      {
        id: 'admin-1',
        name: 'สมชาย ใจดี',
        username: 'admin',
        password: 'admin123',
        role: 'Super Admin',
        active: true,
      },
      {
        id: 'admin-2',
        name: 'กิตติพงษ์ สมบัติ',
        username: 'kitti',
        password: 'demo123',
        role: 'Admin',
        active: true,
      },
      {
        id: 'admin-3',
        name: 'ณิชากร ศรีสุข',
        username: 'nicha',
        password: 'demo123',
        role: 'Viewer',
        active: true,
      },
      {
        id: 'admin-4',
        name: 'ณัฐวุฒิ มั่นคง',
        username: 'nat',
        password: 'demo123',
        role: 'Operator',
        active: true,
      },
    ],
  };
}
