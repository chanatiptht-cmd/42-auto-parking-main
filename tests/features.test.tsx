import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { App } from '../src/App';
import { createDemoData } from '../src/data/mockData';
import { SESSION_KEY, STORAGE_KEY } from '../src/utils/demoState';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
const open = (path: string) => {
  window.history.replaceState({}, '', path);
  return render(<App />);
};
const admin = () => sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: 'admin-1' }));
const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY)!);

it('remembers only the login name, shows the password, and lands on a permitted page', async () => {
  const data = createDemoData();
  data.rolePermissions.Viewer = ['reports'];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const u = userEvent.setup();
  open('/admin/login');
  await u.type(screen.getByLabelText('ชื่อผู้ใช้งาน'), 'nicha');
  await u.type(screen.getByLabelText('รหัสผ่าน'), 'demo123');
  await u.click(screen.getByRole('button', { name: 'แสดงรหัสผ่าน' }));
  expect((screen.getByLabelText('รหัสผ่าน') as HTMLInputElement).type).toBe('text');
  await u.click(screen.getByLabelText('จดจำชื่อผู้ใช้'));
  await u.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }));
  await screen.findByRole('heading', { name: 'รายงานรายรับ' }, { timeout: 10000 });
  expect(window.location.pathname).toBe('/admin/reports');
  await u.click(screen.getByRole('link', { name: 'Auto Parking', exact: true }));
  await screen.findByRole('heading', { name: 'รายงานรายรับ' }, { timeout: 3000 });
  expect(screen.queryByRole('button', { name: /ส่งออก CSV/ })).toBeNull();
  await u.click(screen.getByRole('button', { name: 'ออกจากระบบ' }));
  expect((screen.getByLabelText('ชื่อผู้ใช้งาน') as HTMLInputElement).value).toBe('nicha');
  expect((screen.getByLabelText('รหัสผ่าน') as HTMLInputElement).value).toBe('');
});

it('adds and edits floors, cancels drafts, and links to a floor without slots', async () => {
  admin();
  const u = userEvent.setup();
  open('/admin/floors');
  await u.click(screen.getByRole('button', { name: 'เพิ่มชั้น' }));
  await u.type(screen.getByLabelText('ชื่อชั้น'), 'ชั้นดาดฟ้า');
  await u.click(screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }));
  expect(saved().floors).toHaveLength(3);
  expect(screen.getByRole('row', { name: /ชั้นดาดฟ้า/ }).textContent).toContain('0 ช่อง');
  await u.clear(screen.getByLabelText('ชื่อชั้น'));
  await u.type(screen.getByLabelText('ชื่อชั้น'), 'ยังไม่บันทึก');
  await u.click(screen.getByRole('button', { name: 'ยกเลิก' }));
  expect((screen.getByLabelText('ชื่อชั้น') as HTMLInputElement).value).toBe('ชั้นดาดฟ้า');
  await u.click(screen.getByRole('link', { name: 'ดูผังชั้นนี้ →' }));
  expect(screen.getByText('ชั้นนี้ยังไม่มีช่องจอด')).toBeTruthy();
});

it('saves role grants and denies a removed menu including its direct route', async () => {
  admin();
  const u = userEvent.setup();
  open('/admin/permissions');
  await u.click(screen.getByRole('button', { name: 'ตั้งค่าสิทธิ์ตามบทบาท' }));
  await u.click(screen.getByRole('switch', { name: 'เปิดเมนู Parking Layout' }));
  expect((screen.getByLabelText('เพิ่มช่องจอด') as HTMLInputElement).disabled).toBe(true);
  await u.click(screen.getByRole('button', { name: 'บันทึกสิทธิ์' }));
  expect(saved().rolePermissions.Admin).not.toContain('edit-spots');
  await u.selectOptions(screen.getByLabelText('ทดลองบทบาท · Demo'), 'Admin');
  expect(screen.queryByRole('link', { name: 'Parking Layout', exact: true })).toBeNull();
});

it('filters operations by date and time and opens actual entry and exit photos', async () => {
  admin();
  const u = userEvent.setup();
  open('/admin/operations');
  await u.selectOptions(screen.getByLabelText('สถานะ'), 'out');
  await u.type(screen.getByLabelText('ค้นหาทะเบียน'), 'ขม5678');
  await u.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
  await u.click(screen.getByRole('button', { name: 'ดูรายละเอียด ขม 5678' }));
  expect(screen.getByRole('img', { name: 'ภาพขาเข้า ขม 5678' })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'ภาพขาออก ขม 5678' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('เวลาเริ่ม'), { target: { value: '23:00' } });
  fireEvent.change(screen.getByLabelText('เวลาสิ้นสุด'), { target: { value: '22:00' } });
  await u.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
  expect(screen.getByRole('alert').textContent).toContain('เวลา');
});

it('shares kiosk payment, gate passage and one receipt with the user flow', async () => {
  const u = userEvent.setup();
  const view = open('/kiosk?vehicle=v1');
  expect(screen.getByRole('status').textContent).toContain('ไม้กั้นปิด');
  await u.click(screen.getByRole('button', { name: 'จำลองการชำระเงิน' }));
  expect(screen.getByRole('status').textContent).toContain('ไม้กั้นเปิด');
  expect(saved().vehicles.find((v) => v.id === 'v1').exitAt).toBeNull();
  await u.click(screen.getByRole('button', { name: 'จำลองรถผ่านไม้กั้น' }));
  expect(saved().spots.find((s) => s.id === 'f1-A3').occupied).toBe(false);
  expect(saved().payments.filter((p) => p.vehicleId === 'v1')).toHaveLength(1);
  view.unmount();
  open('/user/success/v1');
  await u.click(screen.getByRole('button', { name: 'ดูใบเสร็จ' }));
  expect(within(screen.getByRole('dialog')).getByText(/DEMO-V1/)).toBeTruthy();
});

it('shows no-data states for every report tab after applying an empty date range', async () => {
  admin();
  const u = userEvent.setup();
  open('/admin/reports');
  await screen.findByLabelText('ช่วงเวลารายงาน', {}, { timeout: 10000 });
  fireEvent.change(screen.getByLabelText('วันที่เริ่ม'), { target: { value: '2025-10-12' } });
  fireEvent.change(screen.getByLabelText('วันที่สิ้นสุด'), { target: { value: '2025-10-12' } });
  await u.click(screen.getByRole('button', { name: 'แสดงรายงาน' }));
  expect(screen.getByText('ยังไม่มีรายรับในช่วงเวลานี้')).toBeTruthy();
  await u.click(screen.getByRole('button', { name: 'Activity', exact: true }));
  expect(screen.getByText('ยังไม่มีรถเข้า–ออกในช่วงเวลานี้')).toBeTruthy();
  await u.click(screen.getByRole('button', { name: 'Vehicle Types', exact: true }));
  expect(screen.getByText('ยังไม่มีข้อมูลประเภทรถในช่วงเวลานี้')).toBeTruthy();
  await u.click(screen.getByRole('button', { name: 'Heat Map', exact: true }));
  expect(screen.getByText('ไม่มีประวัติการใช้ช่องจอดในช่วงนี้')).toBeTruthy();
});

it('rejects a disabled account even with the correct demo password', async () => {
  const data = createDemoData();
  data.users[1].active = false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const u = userEvent.setup();
  open('/admin/login');
  await u.type(screen.getByLabelText('ชื่อผู้ใช้งาน'), 'kitti');
  await u.type(screen.getByLabelText('รหัสผ่าน'), 'demo123');
  await u.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }));
  expect(screen.getByRole('alert').textContent).toContain('ถูกปิดใช้งาน');
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
});
