import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { createDemoData } from '../src/data/mockData';
import { SESSION_KEY, STORAGE_KEY } from '../src/utils/demoState';
import { createReport } from '../src/utils/reports';
import { money } from '../src/utils/parking';

function open(path = '/user/search') {
  window.history.replaceState({}, '', path);
  return render(<App />);
}
function adminSession(role?: string) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ userId: 'admin-1', ...(role ? { previewRole: role } : {}) }),
  );
}
function saved() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)!);
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('user flow (simulated DOM)', () => {
  it('validates search and completes payment, retaining its receipt after refresh without double revenue', async () => {
    const user = userEvent.setup();
    const view = open('/');
    await user.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
    expect(screen.getByRole('alert').textContent).toContain('กรุณากรอกทะเบียนรถ');
    await user.type(screen.getByLabelText('ทะเบียนรถ'), 'ไม่มีรถ');
    await user.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
    expect(screen.getByRole('alert').textContent).toContain('ไม่พบทะเบียนรถ');
    await user.clear(screen.getByLabelText('ทะเบียนรถ'));
    await user.type(screen.getByLabelText('ทะเบียนรถ'), '  กก   1234  ');
    await user.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
    expect(screen.getByRole('heading', { name: 'ผลการค้นหา · 2 รายการ' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'รายละเอียดรถ' })).toBeNull();
    await user.click(screen.getByRole('link', { name: /กก 1234 กรุงเทพมหานคร/ }));
    expect(screen.getByRole('heading', { name: 'รายละเอียดรถ' })).toBeTruthy();
    expect(screen.getByText('120 บาท')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'ชำระเงิน' }));
    expect(screen.getByText('สำหรับสาธิต ไม่สามารถชำระเงินจริง')).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toContain('10:00');
    await user.click(screen.getByRole('button', { name: 'เปิดแอปธนาคาร' }));
    await user.click(screen.getByRole('button', { name: /K PLUS/ }));
    expect(saved().payments.some((p) => p.vehicleId === 'v1')).toBe(false);
    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงินจำลอง' }));
    expect(await screen.findByRole('heading', { name: 'ชำระเงินสำเร็จ' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'ดูใบเสร็จ' }));
    expect(screen.getByRole('dialog').textContent).toContain('DEMO-V1-');
    const data = saved();
    expect(data.vehicles.find((v) => v.id === 'v1').exitAt).toBeNull();
    expect(data.spots.find((s) => s.id === 'f1-A3').occupied).toBe(true);
    expect(data.payments.filter((p) => p.vehicleId === 'v1')).toHaveLength(1);
    view.unmount();
    open('/user/payment/v1');
    expect(await screen.findByRole('heading', { name: 'ชำระเงินสำเร็จ' })).toBeTruthy();
    expect(saved().payments).toHaveLength(data.payments.length);
  });

  it('expires QR at ten minutes, renews it, and cleans up its timer', () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(window, 'clearInterval');
    const view = open('/user/payment/v1');
    act(() => {
      vi.advanceTimersByTime(600001);
    });
    expect(screen.getByText('QR จำลองหมดอายุแล้ว')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'จำลองชำระเงินสำเร็จ' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'สร้างรายการจำลองใหม่' }));
    expect(screen.getByRole('timer').textContent).toContain('10:00');
    view.unmount();
    expect(clear).toHaveBeenCalled();
  });

  it('retains the QR expiry deadline after refresh', () => {
    vi.useFakeTimers();
    const view = open('/user/payment/v1');
    act(() => {
      vi.advanceTimersByTime(300000);
    });
    view.unmount();
    open('/user/payment/v1');
    expect(screen.getByRole('timer').textContent).toContain('05:00');
    act(() => {
      vi.advanceTimersByTime(300001);
    });
    expect(screen.queryByRole('button', { name: 'เปิดแอปธนาคาร' })).toBeNull();
  });

  it('handles invalid IDs and redirects unpaid success URLs', () => {
    const view = open('/user/vehicle/unknown');
    expect(screen.getByRole('heading', { name: 'ไม่พบรายการนี้' })).toBeTruthy();
    view.unmount();
    open('/user/success/v1');
    expect(screen.getByRole('heading', { name: 'สรุปค่าจอดรถ' })).toBeTruthy();
    expect(window.location.pathname).toBe('/user/summary/v1');
  });

  it('recovers malformed stored data and reports an unavailable storage', async () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    const view = open();
    expect(screen.getByRole('status').textContent).toContain('ข้อมูล Demo ใหม่');
    await waitFor(() => expect(saved().vehicles[0].plate).toBe('กก 1234'));
    view.unmount();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    open();
    expect((await screen.findByRole('status')).textContent).toContain('ไม่อนุญาตให้บันทึก');
  });
});

describe('admin flow (simulated DOM)', () => {
  it('guards routes, validates login, opens the requested page, and logs out', async () => {
    const user = userEvent.setup();
    open('/admin/operations?vehicle=v1');
    expect(window.location.pathname).toBe('/admin/login');
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
    expect(screen.getByRole('alert').textContent).toContain('กรุณากรอก');
    await user.type(screen.getByLabelText('ชื่อผู้ใช้งาน'), 'admin');
    await user.type(screen.getByLabelText('รหัสผ่าน'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
    expect(screen.getByRole('alert').textContent).toContain('ไม่ถูกต้อง');
    await user.clear(screen.getByLabelText('รหัสผ่าน'));
    await user.type(screen.getByLabelText('รหัสผ่าน'), 'admin123');
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
    expect(screen.getByRole('heading', { name: 'รายการรถเข้า–ออก' })).toBeTruthy();
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!).userId).toBe('admin-1');
    expect(window.location.search).toBe('?vehicle=v1');
    await user.click(screen.getByRole('button', { name: 'ออกจากระบบ' }));
    expect(await screen.findByRole('button', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('edits occupancy, rejects duplicate names, adds a slot, and persists after remount', async () => {
    adminSession();
    const user = userEvent.setup();
    const view = open('/admin/parking-layout');
    expect(screen.getAllByRole('button', { name: /^[ABC]\d+ (ไม่ว่าง|ว่าง)$/ })).toHaveLength(30);
    await user.click(screen.getByRole('button', { name: 'A3 ไม่ว่าง' }));
    expect(screen.getByText('กก 1234')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'แก้ไขช่องจอด' }));
    await user.selectOptions(screen.getByLabelText('สถานะช่องจอด'), 'available');
    await user.click(screen.getByRole('button', { name: 'บันทึกช่องจอด' }));
    expect(screen.getByRole('alert').textContent).toContain('ไม้กั้น');
    await user.selectOptions(screen.getByLabelText('สถานะช่องจอด'), 'occupied');
    await user.clear(screen.getByLabelText('ชื่อช่องจอด'));
    await user.type(screen.getByLabelText('ชื่อช่องจอด'), 'A12');
    await user.click(screen.getByRole('button', { name: 'บันทึกช่องจอด' }));
    expect(screen.getByRole('button', { name: 'A12 ไม่ว่าง' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'เพิ่มช่องจอด' }));
    await user.type(screen.getByLabelText('ชื่อช่องจอด'), 'A1');
    await user.click(screen.getByRole('button', { name: 'บันทึกช่องจอด' }));
    expect(screen.getByRole('alert').textContent).toContain('ชั้นเดียวกัน');
    await user.clear(screen.getByLabelText('ชื่อช่องจอด'));
    await user.type(screen.getByLabelText('ชื่อช่องจอด'), 'A11');
    await user.click(screen.getByRole('button', { name: 'บันทึกช่องจอด' }));
    expect(screen.getByRole('button', { name: 'A11 ว่าง' })).toBeTruthy();
    view.unmount();
    open('/admin/dashboard');
    await screen.findByRole('heading', { name: 'ภาพรวมระบบ' }, { timeout: 5000 });
    expect(screen.getByText('61 ช่อง')).toBeTruthy();
    expect(screen.getByText('51 ช่อง')).toBeTruthy();
    expect(screen.getByText('10 ช่อง')).toBeTruthy();
  });

  it('filters operation tabs and plate searches, including empty results', async () => {
    adminSession();
    const user = userEvent.setup();
    open('/admin/operations');
    expect(screen.getAllByText('กก 1234').length).toBeGreaterThan(0);
    await user.type(screen.getByLabelText('ค้นหาทะเบียน'), 'ไม่พบรถ');
    await user.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
    expect(screen.getByText(/ไม่พบรายการรถ/)).toBeTruthy();
    await user.clear(screen.getByLabelText('ค้นหาทะเบียน'));
    await user.selectOptions(screen.getByLabelText('สถานะ'), 'out');
    await user.type(screen.getByLabelText('ค้นหาทะเบียน'), 'ขม5678');
    await user.click(screen.getByRole('button', { name: 'ค้นหา', exact: true }));
    expect(screen.getByText('ขม 5678')).toBeTruthy();
    expect(screen.queryByText('กก 1234')).toBeNull();
    expect(screen.getAllByText('ออกแล้ว').length).toBeGreaterThan(0);
  });

  it('changes report data with the period and switches all four report tabs', async () => {
    adminSession();
    const user = userEvent.setup();
    open('/admin/reports');
    const period = await screen.findByLabelText('ช่วงเวลารายงาน', {}, { timeout: 5000 });
    expect(
      screen.getAllByText(money(createReport(createDemoData(), 'month').total)).length,
    ).toBeGreaterThan(0);
    await user.selectOptions(period, 'day');
    await user.click(screen.getByRole('button', { name: 'แสดงรายงาน' }));
    expect(
      screen.getAllByText(money(createReport(createDemoData(), 'day').total)).length,
    ).toBeGreaterThan(0);
    await user.selectOptions(period, 'year');
    await user.click(screen.getByRole('button', { name: 'แสดงรายงาน' }));
    expect(
      screen.getAllByText(money(createReport(createDemoData(), 'year').total)).length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Activity', exact: true }));
    expect(screen.getByRole('heading', { name: /สถิติรถเข้า–ออก/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Vehicle Types', exact: true }));
    expect(screen.getByRole('heading', { name: /สัดส่วนประเภทรถ/ })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Sedan', exact: true })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Heat Map', exact: true }));
    await user.selectOptions(screen.getByLabelText('ชั้นจอด'), '2');
    await user.click(screen.getByRole('button', { name: 'แสดงรายงาน' }));
    const map = screen.getByRole('region', { name: 'Heat Map · ชั้น 2' });
    await user.click(within(map).getByRole('button', { name: /^B4 / }));
    expect(screen.getByRole('region', { name: 'รายละเอียดช่องจอด' }).textContent).toContain('B4');
  });

  it('applies custom report dates only when submitting the filters', async () => {
    adminSession();
    const user = userEvent.setup();
    open('/admin/reports');
    await user.selectOptions(await screen.findByLabelText('ช่วงเวลารายงาน'), 'custom');
    fireEvent.change(screen.getByLabelText('วันที่เริ่ม'), { target: { value: '2025-10-12' } });
    fireEvent.change(screen.getByLabelText('วันที่สิ้นสุด'), { target: { value: '2025-10-12' } });
    expect(screen.queryByText('ยังไม่มีรายรับในช่วงเวลานี้')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'แสดงรายงาน' }));
    expect(screen.getByText('ยังไม่มีรายรับในช่วงเวลานี้')).toBeTruthy();
  });

  it('creates, toggles, edits, and deletes a user while protecting the last Super Admin', async () => {
    adminSession();
    const user = userEvent.setup();
    open('/admin/permissions');
    expect(
      (screen.getByRole('switch', { name: 'สิทธิ์การเข้าถึง สมชาย ใจดี' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'ลบ สมชาย ใจดี' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    await user.click(screen.getByRole('button', { name: 'เพิ่มผู้ใช้' }));
    await user.type(screen.getByLabelText('ชื่อผู้ใช้ (ชื่อ–นามสกุล)'), 'ผู้ใช้ทดสอบ');
    await user.type(screen.getByLabelText('ชื่อสำหรับเข้าสู่ระบบ'), 'tester');
    await user.type(screen.getByLabelText('รหัสผ่าน Demo'), 'test123');
    await user.selectOptions(screen.getByLabelText('บทบาท'), 'Operator');
    await user.click(screen.getByRole('button', { name: 'บันทึกผู้ใช้' }));
    await user.click(screen.getByRole('switch', { name: 'สิทธิ์การเข้าถึง ผู้ใช้ทดสอบ' }));
    expect(saved().users.find((u) => u.username === 'tester').active).toBe(false);
    await user.click(screen.getByRole('button', { name: 'แก้ไข ผู้ใช้ทดสอบ' }));
    await user.selectOptions(screen.getByLabelText('บทบาท'), 'Viewer');
    await user.click(screen.getByRole('button', { name: 'บันทึกผู้ใช้' }));
    expect(saved().users.find((u) => u.username === 'tester').role).toBe('Viewer');
    await user.click(screen.getByRole('button', { name: 'ลบ ผู้ใช้ทดสอบ' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ยกเลิก' }));
    expect(screen.getByText('ผู้ใช้ทดสอบ')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'ลบ ผู้ใช้ทดสอบ' }));
    await user.click(screen.getByRole('button', { name: 'ยืนยันลบ' }));
    expect(screen.queryByText('ผู้ใช้ทดสอบ')).toBeNull();
  });

  it('uses demo role permissions for menus and direct routes', async () => {
    adminSession('Viewer');
    const user = userEvent.setup();
    open('/admin/permissions');
    expect(screen.getByRole('heading', { name: 'ไม่มีสิทธิ์เข้าถึงหน้านี้' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Admin Perm', exact: true })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Parking Layout', exact: true })).toBeNull();
    expect(screen.getByRole('link', { name: 'Reports', exact: true })).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('ทดลองบทบาท · Demo'), 'Super Admin');
    expect(screen.getByRole('button', { name: 'เพิ่มผู้ใช้' })).toBeTruthy();
  });

  it('requires reset confirmation and restores seed data with logout', async () => {
    adminSession();
    const seed = createDemoData();
    seed.spots.push({ id: 'extra', floor: 1, name: 'D1', occupied: false });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const user = userEvent.setup();
    open('/admin/parking-layout');
    await user.click(screen.getByRole('button', { name: 'รีเซ็ตข้อมูล Demo' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ยกเลิก' }));
    expect(saved().spots).toHaveLength(61);
    await user.click(screen.getByRole('button', { name: 'รีเซ็ตข้อมูล Demo' }));
    await user.click(screen.getByRole('button', { name: 'ยืนยันรีเซ็ต' }));
    expect(saved().spots).toHaveLength(60);
    expect(await screen.findByRole('button', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
  });
});
