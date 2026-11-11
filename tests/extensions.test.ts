import { describe, expect, it } from 'vitest';
import { createDemoData } from '../src/data/mockData';
import * as state from '../src/utils/demoState';
import { hasPermission, PERMISSIONS } from '../src/data/permissions';
import { calculationTime, DEMO_NOW, parkingFee } from '../src/utils/parking';
import { createReport } from '../src/utils/reports';

describe('extended shared demo rules', () => {
  it('bills any part of a new hour, including one second', () => {
    expect(parkingFee('2025-10-14T11:44:59+07:00')).toBe(60);
  });

  it('manages floors without losing their slots or history', () => {
    expect(typeof state.saveFloor).toBe('function');
    const data = createDemoData();
    const updated = state.saveFloor(data, { id: 1, order: 1, name: 'ชั้น G', active: true });
    expect(updated.floors.find((f) => f.id === 1)?.name).toBe('ชั้น G');
    expect(updated.spots).toEqual(data.spots);
    expect(() =>
      state.saveFloor(updated, { id: 9, order: 2, name: 'ใหม่', active: true }),
    ).toThrow();
    expect(() => state.saveFloor(data, { id: 1, order: 1, name: '', active: true })).toThrow();
    expect(() =>
      state.saveSpot(data, { id: 'bad-floor', name: 'Z1', floor: 99, occupied: false }),
    ).toThrow();
  });

  it('closes child permissions with their menu and protects super administrator grants', () => {
    expect(typeof state.saveRolePermissions).toBe('function');
    const data = state.saveRolePermissions(createDemoData(), 'Admin', [
      'export-reports',
      'edit-spots',
    ]);
    expect(hasPermission('Admin', 'export-reports', data.rolePermissions)).toBe(false);
    expect(hasPermission('Admin', 'edit-spots', data.rolePermissions)).toBe(false);
    expect(() => state.saveRolePermissions(data, 'Super Admin', [])).toThrow();
    expect(PERMISSIONS.Viewer).not.toContain('export-reports');
  });

  it('opens the gate only after payment and releases the slot only on passage', () => {
    expect(typeof state.passGate).toBe('function');
    const before = createDemoData();
    expect(() => state.passGate(before, 'v1', DEMO_NOW)).toThrow();
    const paid = state.payVehicle(before, 'v1');
    expect(paid.spots.find((s) => s.id === 'f1-A3')?.occupied).toBe(true);
    const passed = state.passGate(paid, 'v1', '2025-10-14T12:59:59+07:00');
    expect(passed.vehicles.find((v) => v.id === 'v1')?.exitAt).toBe('2025-10-14T12:59:59+07:00');
    expect(passed.vehicles.find((v) => v.id === 'v1')?.spotId).toBe('f1-A3');
    expect(passed.spots.find((s) => s.id === 'f1-A3')?.occupied).toBe(false);
    expect(passed.payments).toEqual(paid.payments);
    expect(state.passGate(passed, 'v1', DEMO_NOW)).toBe(passed);
    expect(() => state.passGate(paid, 'v1', '2025-10-14T13:00:01+07:00')).toThrow();
    expect(state.payVehicle(passed, 'v1')).toBe(passed);
  });

  it('counts departures independently of entries across midnight in Bangkok', () => {
    const data = createDemoData();
    data.vehicles = [
      {
        ...data.vehicles[0],
        entryAt: '2025-10-13T23:50:00+07:00',
        exitAt: '2025-10-14T00:10:00+07:00',
      },
    ];
    data.payments = [];
    const report = createReport(data, 'day');
    expect(report.vehicleCount).toBe(0);
    expect(report.exitCount).toBe(1);
    expect(report.series.reduce((sum, p) => sum + p.exits, 0)).toBe(1);
  });

  it('rejects stale occupancy edits after another tab records passage', () => {
    const before = createDemoData();
    const original = before.spots.find((s) => s.id === 'f1-A3')!;
    const passed = state.passGate(state.payVehicle(before, 'v1'), 'v1', DEMO_NOW);
    expect(() => state.saveSpot(passed, { ...original, name: 'A12' }, original.occupied)).toThrow(
      'เปลี่ยน',
    );
  });

  it('keeps delegated account managers from granting or modifying Super Admin', () => {
    const data = createDemoData();
    expect(() => state.saveUser(data, { ...data.users[1], role: 'Super Admin' }, 'Admin')).toThrow(
      'Super Admin',
    );
    expect(() =>
      state.saveUser(data, { ...data.users[0], password: 'changed123' }, 'Admin'),
    ).toThrow('Super Admin');
    const twoSupers = state.saveUser(data, { ...data.users[1], role: 'Super Admin' });
    expect(() => state.deleteUser(twoSupers, 'admin-1', 'Admin')).toThrow('Super Admin');
  });

  it('shows actual stay duration after payment and gate passage', () => {
    const paid = state.payVehicle(createDemoData(), 'v1');
    const passed = state.passGate(paid, 'v1', '2025-10-14T12:59:00+07:00');
    expect(
      calculationTime(
        passed.vehicles[0],
        passed.payments.find((p) => p.vehicleId === 'v1'),
      ),
    ).toBe('2025-10-14T12:59:00+07:00');
    expect(passed.payments.find((p) => p.vehicleId === 'v1')?.amount).toBe(120);
  });
});
