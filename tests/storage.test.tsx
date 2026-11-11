import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ParkingProvider, useParking } from '../src/context/ParkingContext';
import { createDemoData } from '../src/data/mockData';
import { passGate, payVehicle, STORAGE_KEY } from '../src/utils/demoState';
import { DEMO_NOW } from '../src/utils/parking';

function PaymentProbe() {
  const { data, pay } = useParking();
  return (
    <>
      <button onClick={() => pay('v1')}>pay one</button>
      <button onClick={() => pay('v3')}>pay two</button>
      <button onClick={() => Promise.all([pay('v1'), pay('v3'), pay('v1')])}>
        pay concurrently
      </button>
      <output>{data.payments.filter((p) => ['v1', 'v3'].includes(p.vehicleId)).length}</output>
    </>
  );
}
it('keeps successive changes in memory when browser storage becomes read-only', async () => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(createDemoData()));
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  const u = userEvent.setup();
  render(
    <ParkingProvider>
      <PaymentProbe />
    </ParkingProvider>,
  );
  await u.click(screen.getByText('pay one'));
  await u.click(screen.getByText('pay two'));
  expect(screen.getByRole('status').textContent).toBe('2');
});

it('serializes queued mutations and retains one receipt per session', async () => {
  localStorage.clear();
  sessionStorage.clear();
  const u = userEvent.setup();
  render(
    <ParkingProvider>
      <PaymentProbe />
    </ParkingProvider>,
  );
  await u.click(screen.getByText('pay concurrently'));
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('2'));
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(data.payments.filter((p) => p.vehicleId === 'v1')).toHaveLength(1);
  expect(data.payments.filter((p) => p.vehicleId === 'v3')).toHaveLength(1);
});

function ExitProbe() {
  const { data } = useParking();
  return <p>{data.vehicles[0].exitAt ? 'ออกแล้ว' : 'ยังจอด'}</p>;
}
it('does not replay stale storage events over a newer gate passage', async () => {
  localStorage.clear();
  sessionStorage.clear();
  const paid = payVehicle(createDemoData(), 'v1');
  const passed = passGate(paid, 'v1', DEMO_NOW);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(passed));
  render(
    <ParkingProvider>
      <ExitProbe />
    </ParkingProvider>,
  );
  await act(async () => {});
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(paid) }),
    ),
  );
  expect(screen.getByText('ออกแล้ว')).toBeTruthy();
});
