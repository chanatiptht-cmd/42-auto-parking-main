import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, ShieldAlert, UserRound } from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { firstAllowedPath, MENU_ACTIONS } from '../data/permissions';
import type { Permission } from '../data/permissions';
import { Sidebar } from '../components/admin/Sidebar';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { DEMO_NOW, dateTime } from '../utils/parking';
import '../styles/admin.css';

export function AdminLayout() {
  const { user, role, data, can, resetDemo, storageWarning, dismissWarning } = useParking();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState('');
  const location = useLocation();
  if (!user)
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname + location.search }} replace />
    );
  const segment = location.pathname.split('/')[2] || 'dashboard';
  const isIndex = location.pathname === '/admin' || location.pathname === '/admin/';
  const page = (segment === 'floors' ? 'manage-floors' : segment) as Permission;
  const title =
    segment === 'floors'
      ? 'Parking Layout / จัดการชั้น'
      : (MENU_ACTIONS.find((menuItem) => menuItem.menu === segment)?.label ?? 'Auto Parking');

  function handleCloseReset() {
    setResetOpen(false);
    setResetError('');
  }

  async function handleResetDemo() {
    try {
      await resetDemo();
      setResetOpen(false);
    } catch (error) {
      setResetError((error as Error).message);
    }
  }
  return (
    <div className="admin-shell">
      <Sidebar onReset={() => setResetOpen(true)} />
      <div className="admin-main">
        <header className="admin-topbar">
          <span>{title}</span>
          <div>
            <span className="topbar-avatar">
              <UserRound size={15} fill="currentColor" />
            </span>
            <strong>{role === 'Super Admin' ? 'Super Admin' : 'Admin'}</strong>
            <ChevronDown size={12} />
          </div>
        </header>
        {storageWarning && (
          <div className="storage-notice" role="status">
            {storageWarning}
            <button onClick={dismissWarning} aria-label="ปิดข้อความ">
              ×
            </button>
          </div>
        )}
        <main className="admin-content">
          {isIndex || can(page) ? (
            <Outlet />
          ) : (
            <div className="admin-empty">
              <ShieldAlert size={42} />
              <h1>ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
              <p>เมนูและการทำงานขึ้นอยู่กับบทบาทที่กำลังใช้งาน</p>
              <Link
                to={firstAllowedPath(role!, data.rolePermissions)}
                className="sp-button sp-button--primary"
              >
                กลับหน้าที่มีสิทธิ์
              </Link>
            </div>
          )}
        </main>
        <footer className="admin-demo-footer">
          ข้อมูลสาธิต · เวลาเริ่มต้น {dateTime(DEMO_NOW)}
        </footer>
        <Modal open={resetOpen} title="รีเซ็ตข้อมูล Demo" onClose={handleCloseReset}>
          <p>ข้อมูลช่องจอด ผู้ใช้ และการชำระเงินที่แก้ไขจะกลับเป็นค่าเริ่มต้น และคุณจะออกจากระบบ</p>
          {resetError && (
            <p className="form-error" role="alert">
              {resetError}
            </p>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleResetDemo}>
              ยืนยันรีเซ็ต
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
