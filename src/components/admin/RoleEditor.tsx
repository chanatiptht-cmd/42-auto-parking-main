import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { MENU_ACTIONS, ROLES } from '../../data/permissions';
import type { AdminRole, MenuPermission, Permission } from '../../types/parking';
import { Button } from '../common/Button';

export function RoleEditor() {
  const { data, can, updateRoles } = useParking();
  const [role, setRole] = useState<AdminRole>('Admin');
  const [draft, setDraft] = useState<Permission[]>([...data.rolePermissions.Admin]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const locked = role === 'Super Admin' || !can('edit-roles');
  function handleSelectRole(roleName: AdminRole) {
    setRole(roleName);
    setDraft([...data.rolePermissions[roleName]]);
    setError('');
    setNotice('');
  }

  function handleToggleMenu(menuKey: MenuPermission) {
    const menu = MENU_ACTIONS.find((item) => item.menu === menuKey);
    if (!menu) return;

    if (draft.includes(menuKey)) {
      const childPermissions = menu.actions.map((action) => action.key);
      const remainingPermissions = draft.filter((permission) => {
        return permission !== menuKey && !childPermissions.includes(permission);
      });
      setDraft(remainingPermissions);
    } else {
      setDraft([...draft, menuKey]);
    }
    setNotice('');
  }

  function handleTogglePermission(permission: Permission) {
    if (draft.includes(permission)) {
      setDraft(draft.filter((item) => item !== permission));
    } else {
      setDraft([...draft, permission]);
    }
    setNotice('');
  }

  function handleCancel() {
    setDraft([...data.rolePermissions[role]]);
    setError('');
    setNotice('');
  }

  async function handleSavePermissions() {
    try {
      await updateRoles(role, draft);
      setNotice('บันทึกสิทธิ์เรียบร้อยแล้ว');
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <section className="admin-card role-editor">
      <h2>สิทธิ์ตามบทบาท</h2>
      <div className="role-editor-top">
        <label>
          บทบาท
          <select
            value={role}
            onChange={(event) => handleSelectRole(event.target.value as AdminRole)}
          >
            {ROLES.map((roleName) => (
              <option key={roleName}>{roleName}</option>
            ))}
          </select>
        </label>
        <p className="purple-note">
          {role === 'Super Admin'
            ? 'Super Admin มีสิทธิ์ครบทุกเมนูเพื่อดูแลระบบ'
            : 'เมื่อปิดเมนู สิทธิ์การทำงานในเมนูนั้นจะปิดตาม'}
        </p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table role-table">
          <thead>
            <tr>
              <th>เมนู</th>
              <th>เห็นเมนู</th>
              <th>การทำงานที่อนุญาต</th>
            </tr>
          </thead>
          <tbody>
            {MENU_ACTIONS.map((item) => (
              <tr key={item.menu}>
                <td>
                  <strong>{item.label}</strong>
                </td>
                <td>
                  <button
                    className={`permission-toggle ${draft.includes(item.menu) ? 'is-on' : ''}`}
                    role="switch"
                    aria-label={`เปิดเมนู ${item.label}`}
                    aria-checked={draft.includes(item.menu)}
                    disabled={locked}
                    onClick={() => handleToggleMenu(item.menu)}
                  >
                    <span />
                  </button>
                </td>
                <td>
                  <div className="role-actions">
                    {!item.actions.length ? (
                      <span className="section-description">ดูข้อมูลสรุป</span>
                    ) : (
                      item.actions.map((action) => (
                        <label key={action.key}>
                          <input
                            type="checkbox"
                            checked={draft.includes(action.key)}
                            disabled={
                              locked || !draft.includes(item.menu) || action.key === 'edit-roles'
                            }
                            onChange={() => handleTogglePermission(action.key)}
                          />
                          {action.label}
                        </label>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notice && (
        <p role="status" className="success-notice">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="role-footer">
        <span>
          <ShieldCheck size={18} />
          เฉพาะ Super Admin ที่แก้ไขสิทธิ์ได้
        </span>
        <div className="heading-actions">
          <Button variant="secondary" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button disabled={locked} onClick={handleSavePermissions}>
            บันทึกสิทธิ์
          </Button>
        </div>
      </div>
    </section>
  );
}
