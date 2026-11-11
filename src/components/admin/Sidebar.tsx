import { CarFront, LogOut, RotateCcw } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { MENU_ACTIONS, ROLES } from '../../data/permissions';
import type { AdminRole } from '../../types/parking';
import { Button } from '../common/Button';

export function Sidebar({ onReset }: { onReset: () => void }) {
  const { can, logout, user, role, previewRole } = useParking();
  const location = useLocation();
  return (
    <aside className="admin-sidebar">
      <NavLink to="/admin" className="admin-logo" aria-label="Auto Parking">
        <span className="brand-icon">
          <CarFront size={22} />
        </span>
        <span>
          <strong>Auto Parking</strong>
          <small>Admin console</small>
        </span>
      </NavLink>
      <p className="sidebar-label">จัดการลานจอด</p>
      <nav aria-label="เมนูผู้ดูแลระบบ">
        {MENU_ACTIONS.filter((item) => can(item.menu)).map((item) => (
          <NavLink
            key={item.menu}
            to={`/admin/${item.menu}`}
            className={({ isActive }) =>
              isActive || (item.menu === 'parking-layout' && location.pathname === '/admin/floors')
                ? 'is-active'
                : ''
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-bottom">
        <details className="demo-controls">
          <summary>เครื่องมือ Demo</summary>
          {user?.role === 'Super Admin' && (
            <div className="admin-role-preview">
              <label htmlFor="demo-role">ทดลองบทบาท · Demo</label>
              <select
                id="demo-role"
                value={role}
                onChange={(e) => previewRole(e.target.value as AdminRole)}
              >
                {ROLES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          )}
          {can('reset') && (
            <Button variant="ghost" onClick={onReset}>
              <RotateCcw size={14} />
              รีเซ็ตข้อมูล Demo
            </Button>
          )}
        </details>
        <Button variant="ghost" onClick={logout}>
          <LogOut size={15} />
          ออกจากระบบ
        </Button>
        <div className="parking-site">
          <i />
          ลานจอดอาคาร A
        </div>
      </div>
    </aside>
  );
}
