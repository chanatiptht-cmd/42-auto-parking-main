import { useState } from 'react';
import { CarFront, Eye, EyeOff, UserRound } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useParking } from '../../context/ParkingContext';
import { firstAllowedPath, hasPermission } from '../../data/permissions';
import type { Permission } from '../../types/parking';
import '../../styles/admin.css';

const nameKey = 'parking-remembered-username';
function rememberedName() {
  try {
    return localStorage.getItem(nameKey) ?? '';
  } catch {
    return '';
  }
}
export function AdminLogin() {
  const { data, user, login, storageWarning } = useParking();
  const [username, setUsername] = useState(rememberedName);
  const [remember, setRemember] = useState(() => !!rememberedName());
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const from = location.state?.from;
  const requested =
    typeof from === 'string' && from.startsWith('/admin/') && from !== '/admin/login' ? from : '';
  const segment = requested.split('?')[0].split('/')[2];
  const page = (segment === 'floors' ? 'manage-floors' : segment) as Permission;
  if (user) {
    let nextPage = firstAllowedPath(user.role, data.rolePermissions);
    if (requested && hasPermission(user.role, page, data.rolePermissions)) nextPage = requested;
    return <Navigate to={nextPage} replace />;
  }

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
    setError('');
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    setError('');
  }

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    try {
      login(username, password);
      try {
        if (remember) localStorage.setItem(nameKey, username.trim());
        else localStorage.removeItem(nameKey);
      } catch {
        /* Login works without saved names. */
      }
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="brand-icon">
            <CarFront size={27} />
          </span>
          <strong>Auto Parking</strong>
          <span>Admin console</span>
          <div className="login-brand-copy">
            <h2>ระบบจัดการลานจอดรถ</h2>
            <p>ตรวจช่องจอด รถเข้า–ออก และรายรับ</p>
          </div>
        </div>
        <form className="admin-login-form" onSubmit={handleLogin} noValidate>
          <h1>เข้าสู่ระบบผู้ดูแล</h1>
          <p>ใช้บัญชีที่ได้รับจากผู้ดูแลระบบ</p>
          <Input
            label="ชื่อผู้ใช้งาน"
            placeholder="กรอกชื่อผู้ใช้"
            icon={<UserRound size={16} />}
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
            aria-invalid={!!error}
          />
          <div className="password-field">
            <Input
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            จดจำชื่อผู้ใช้
          </label>
          <Button type="submit" className="full-width">
            เข้าสู่ระบบ
          </Button>
          <small>ติดต่อผู้ดูแลระบบหากเข้าใช้งานไม่ได้</small>
          <details className="login-demo">
            <summary>บัญชีสำหรับทดลอง</summary>
            <p>
              admin / admin123 · Super Admin
              <br />
              kitti / demo123 · Admin
              <br />
              nicha / demo123 · Viewer
            </p>
          </details>
        </form>
      </div>
      <p className="admin-login-caption">Auto Parking / ลานจอดอาคาร A</p>
      <Link className="admin-login-back" to="/user/search">
        กลับหน้าผู้ใช้
      </Link>
      {storageWarning && (
        <p className="admin-login-warning" role="status">
          {storageWarning}
        </p>
      )}
    </main>
  );
}
