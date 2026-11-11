import { useState } from 'react';
import type { AdminRole, DemoUser } from '../../types/parking';
import { ROLES } from '../../data/permissions';
import { useParking } from '../../context/ParkingContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function UserEditor({
  user,
  onSaved,
  onCancel,
}: {
  user?: DemoUser;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { updateUser, role: actorRole } = useParking();
  const [form, setForm] = useState<DemoUser>(
    user ?? {
      id: crypto.randomUUID(),
      name: '',
      username: '',
      password: '',
      role: 'Viewer',
      active: true,
    },
  );
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateUser(form);
      onSaved();
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <form className="modal-form" onSubmit={submit} noValidate>
      <Input
        label="ชื่อผู้ใช้ (ชื่อ–นามสกุล)"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        maxLength={80}
        autoFocus
      />
      <Input
        label="ชื่อสำหรับเข้าสู่ระบบ"
        placeholder="ภาษาอังกฤษ 3–30 ตัว"
        value={form.username}
        onChange={(event) => setForm({ ...form, username: event.target.value })}
        autoComplete="off"
        maxLength={30}
      />
      <Input
        label="รหัสผ่าน Demo"
        type="password"
        placeholder="อย่างน้อย 6 ตัวอักษร"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        autoComplete="new-password"
        minLength={6}
      />
      <div className="sp-field">
        <label htmlFor="user-role">บทบาท</label>
        <select
          id="user-role"
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value as AdminRole })}
        >
          {ROLES.filter((role) => role !== 'Super Admin' || actorRole === 'Super Admin').map(
            (role) => (
              <option key={role}>{role}</option>
            ),
          )}
        </select>
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => setForm({ ...form, active: event.target.checked })}
        />
        เปิดใช้งานบัญชีนี้
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึกผู้ใช้</Button>
      </div>
    </form>
  );
}
