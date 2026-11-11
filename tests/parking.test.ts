import { describe, expect, it } from 'vitest';
import { createDemoData } from '../src/data/mockData';
import { hasPermission } from '../src/data/permissions';
import { deleteUser, isParkingData, payVehicle, saveSpot, saveUser } from '../src/utils/demoState';
import { dateKey, DEMO_NOW, duration, normalizePlate, parkingFee } from '../src/utils/parking';
import { createReport } from '../src/utils/reports';

describe('shared parking rules', () => {
  it('normalizes Thai plates and bills rounded hours at the fixed demo clock', () => {
    expect(normalizePlate(' กก  1234 ')).toBe('กก1234');
    expect(parkingFee('2025-10-14T09:24:00+07:00')).toBe(120);
    expect(duration('2025-10-14T09:24:00+07:00')).toBe('3 ชม. 21 นาที');
    expect(parkingFee('2025-10-14T11:45:00+07:00')).toBe(30);
    expect(parkingFee('2025-10-14T11:44:00+07:00')).toBe(60);
    expect(parkingFee(DEMO_NOW)).toBe(0);
    expect(dateKey('2025-10-13T18:00:00Z')).toBe('2025-10-14');
  });

  it('starts with coherent slots, vehicles, payments, and storage schema', () => {
    const data = createDemoData();
    expect(isParkingData(data)).toBe(true);
    expect(data.spots.length).toBe(60);
    expect(data.spots.filter((s) => s.occupied).length).toBe(10);
    expect(data.vehicles.filter((v) => !v.exitAt).length).toBe(10);
    for (const vehicle of data.vehicles.filter((v) => !v.exitAt)) {
      expect(data.spots.find((s) => s.id === vehicle.spotId)?.occupied).toBe(true);
    }
  });

  it('records a payment once and leaves the parked car and its slot untouched', () => {
    const before = createDemoData();
    const after = payVehicle(before, 'v1');
    expect(createReport(after, 'day').total - createReport(before, 'day').total).toBe(120);
    expect(after.vehicles).toBe(before.vehicles);
    expect(after.spots).toBe(before.spots);
    expect(payVehicle(after, 'v1')).toBe(after);
    expect(() => payVehicle(before, 'missing')).toThrow('ไม่พบข้อมูลรถ');
  });

  it('validates duplicate slots and preserves active sessions until gate passage', () => {
    const data = createDemoData();
    const occupied = data.spots.find((s) => s.id === 'f1-A3')!;
    expect(() => saveSpot(data, { ...occupied, id: 'new', name: ' a3 ' })).toThrow(
      'มีชื่อช่องจอดนี้',
    );
    expect(() => saveSpot(data, { ...occupied, occupied: false })).toThrow('ไม้กั้น');
    const updated = saveSpot(data, { ...occupied, name: 'A12' });
    expect(updated.vehicles.find((v) => v.id === 'v1')?.spotId).toBe('f1-A3');
    expect(updated.vehicles.find((v) => v.id === 'v1')?.exitAt).toBeNull();
    expect(saveSpot(data, { ...occupied, id: 'new', floor: 2, name: 'A11' }).spots.length).toBe(61);
  });

  it('protects the last active Super Admin against deletion, disabling, and demotion', () => {
    const data = createDemoData();
    expect(() => deleteUser(data, 'admin-1')).toThrow('Super Admin');
    expect(() => saveUser(data, { ...data.users[0], active: false })).toThrow('Super Admin');
    expect(() => saveUser(data, { ...data.users[0], role: 'Viewer' })).toThrow('Super Admin');
    const twoSupers = saveUser(data, { ...data.users[1], role: 'Super Admin' });
    expect(deleteUser(twoSupers, 'admin-1').users.length).toBe(3);
    expect(() => saveUser(data, { ...data.users[1], username: ' ADMIN ' })).toThrow(
      'ชื่อผู้ใช้นี้มีอยู่แล้ว',
    );
  });

  it('rejects corrupt persisted structures and duplicate payments', () => {
    const data = createDemoData();
    expect(isParkingData(null)).toBe(false);
    expect(isParkingData({ ...data, users: [null] })).toBe(false);
    expect(isParkingData({ ...data, payments: [...data.payments, data.payments[0]] })).toBe(false);
    expect(
      isParkingData({ ...data, vehicles: [{ ...data.vehicles[0], entryAt: 'invalid' }] }),
    ).toBe(false);
    expect(
      isParkingData({ ...data, users: data.users.map((user) => ({ ...user, active: false })) }),
    ).toBe(false);
  });

  it('uses one payment set for report totals, bars, tables, and donut channels', () => {
    const data = payVehicle(createDemoData(), 'v1');
    const reports = (['day', 'month', 'year'] as const).map((period) => createReport(data, period));
    for (const report of reports) {
      expect(report.series.reduce((sum, item) => sum + item.revenue, 0)).toBe(report.total);
      expect(report.channels.reduce((sum, item) => sum + item.value, 0)).toBe(report.total);
      expect(report.series.reduce((sum, item) => sum + item.transactions, 0)).toBe(
        report.payments.length,
      );
      expect(report.types.reduce((sum, item) => sum + item.value, 0)).toBe(report.vehicleCount);
      expect(report.series.reduce((sum, item) => sum + item.entries, 0)).toBe(report.vehicleCount);
    }
    expect(reports[0].total).toBeLessThan(reports[1].total);
    expect(reports[1].total).toBeLessThan(reports[2].total);
  });

  it('centrally maps menu and mutation permissions', () => {
    expect(hasPermission('Viewer', 'reports')).toBe(true);
    expect(hasPermission('Viewer', 'edit-spots')).toBe(false);
    expect(hasPermission('Operator', 'edit-spots')).toBe(true);
    expect(hasPermission('Operator', 'reports')).toBe(false);
    expect(hasPermission('Admin', 'edit-users')).toBe(false);
    expect(hasPermission('Super Admin', 'edit-users')).toBe(true);
    expect(hasPermission(undefined, 'dashboard')).toBe(false);
  });
});
