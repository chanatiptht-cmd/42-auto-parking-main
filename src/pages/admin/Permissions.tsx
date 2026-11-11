import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserEditor } from '../../components/admin/UserEditor';
import { RoleEditor } from '../../components/admin/RoleEditor';
import { ROLES } from '../../data/permissions';
import type { DemoUser } from '../../types/parking';

export function Permissions() {
  const { data, role, can, updateUser, removeUser } = useParking();
  const [tab, setTab] = useState('accounts');
  const [filters, setFilters] = useState({ query: '', role: 'all', status: 'all' });
  const [applied, setApplied] = useState(filters);
  const [editor, setEditor] = useState<{ user?: DemoUser } | null>(null);
  const [detail, setDetail] = useState<DemoUser | null>(null);
  const [deleting, setDeleting] = useState<DemoUser | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const superCount = data.users.filter(
    (account) => account.active && account.role === 'Super Admin',
  ).length;
  const rows = data.users.filter((account) => {
    const searchText = applied.query.trim().toLowerCase();
    const accountText = (account.name + account.username).toLowerCase();
    const matchesName = accountText.includes(searchText);
    const matchesRole = applied.role === 'all' || account.role === applied.role;
    const matchesStatus =
      applied.status === 'all' || account.active === (applied.status === 'active');
    return matchesName && matchesRole && matchesStatus;
  });

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setApplied({ ...filters });
  }

  function handleRequestDelete(account: DemoUser) {
    setError('');
    setDeleting(account);
  }

  function handleUserSaved() {
    setEditor(null);
    setNotice('บันทึกข้อมูลผู้ใช้เรียบร้อยแล้ว');
    setError('');
  }

  async function handleDeleteUser() {
    if (!deleting) return;
    try {
      await removeUser(deleting.id);
      setDeleting(null);
      setNotice('ลบผู้ใช้เรียบร้อยแล้ว');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  async function handleToggleAccount(account: DemoUser) {
    try {
      await updateUser({ ...account, active: !account.active });
      setError('');
      setNotice(`อัปเดตสถานะของ ${account.name} แล้ว`);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <>
      <PageHeader
        title="จัดการสิทธิ์ผู้ใช้งาน"
        description={
          tab === 'accounts'
            ? 'จัดการบัญชีผู้ดูแล บทบาท และสถานะการเข้าใช้งาน'
            : 'กำหนดเมนูและการทำงานที่ผู้ดูแลแต่ละบทบาทใช้ได้'
        }
      >
        {tab === 'accounts' && can('edit-users') && (
          <Button aria-label="เพิ่มผู้ใช้" onClick={() => setEditor({})}>
            + เพิ่มผู้ใช้
          </Button>
        )}
      </PageHeader>
      <div className="admin-tabs permission-tabs" role="group" aria-label="การจัดการผู้ดูแล">
        <button aria-pressed={tab === 'accounts'} onClick={() => setTab('accounts')}>
          บัญชีผู้ดูแล
        </button>
        {can('edit-roles') && (
          <button aria-pressed={tab === 'roles'} onClick={() => setTab('roles')}>
            ตั้งค่าสิทธิ์ตามบทบาท
          </button>
        )}
      </div>
      {tab === 'roles' && can('edit-roles') ? (
        <RoleEditor />
      ) : (
        <>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="success-notice" role="status">
              {notice}
            </p>
          )}
          <form className="admin-card filter-bar account-filters" onSubmit={handleSearch}>
            <Input
              label="ค้นหาผู้ดูแล"
              placeholder="ชื่อหรือชื่อผู้ใช้"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            />
            <label>
              กรองบทบาท
              <select
                value={filters.role}
                onChange={(event) => setFilters({ ...filters, role: event.target.value })}
              >
                <option value="all">ทุกบทบาท</option>
                {ROLES.map((roleName) => (
                  <option key={roleName}>{roleName}</option>
                ))}
              </select>
            </label>
            <label>
              กรองสถานะ
              <select
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">เปิดใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
              </select>
            </label>
            <Button type="submit">ค้นหา</Button>
          </form>
          <section className="admin-card">
            <div className="card-heading">
              <h2>บัญชีผู้ดูแล</h2>
              <span>{rows.length} บัญชี</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table permissions-table">
                <thead>
                  <tr>
                    {['ชื่อผู้ดูแล', 'ชื่อผู้ใช้', 'บทบาท', 'สถานะ', 'จัดการ'].map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => {
                    const lastSuper =
                      account.role === 'Super Admin' &&
                      (role !== 'Super Admin' || (account.active && superCount === 1));
                    return (
                      <tr key={account.id}>
                        <td>
                          <strong>{account.name}</strong>
                        </td>
                        <td>{account.username}</td>
                        <td>{account.role}</td>
                        <td>
                          <div className="account-status">
                            <StatusBadge tone={account.active ? 'green' : 'gray'}>
                              {account.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </StatusBadge>
                            {can('edit-users') && (
                              <button
                                role="switch"
                                aria-checked={account.active}
                                aria-label={`สิทธิ์การเข้าถึง ${account.name}`}
                                className={`permission-toggle ${account.active ? 'is-on' : ''}`}
                                disabled={lastSuper}
                                title={
                                  lastSuper
                                    ? 'ต้องมี Super Admin อย่างน้อย 1 คน'
                                    : 'เปิดหรือปิดบัญชี'
                                }
                                onClick={() => handleToggleAccount(account)}
                              >
                                <span />
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="text-button"
                              aria-label={`ดูรายละเอียด ${account.name}`}
                              onClick={() => setDetail(account)}
                            >
                              ดูรายละเอียด →
                            </button>
                            {can('edit-users') && (
                              <>
                                <Button
                                  variant="ghost"
                                  className="icon-button"
                                  aria-label={`แก้ไข ${account.name}`}
                                  disabled={
                                    account.role === 'Super Admin' && role !== 'Super Admin'
                                  }
                                  onClick={() => setEditor({ user: account })}
                                >
                                  <Pencil size={15} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="icon-button"
                                  aria-label={`ลบ ${account.name}`}
                                  disabled={lastSuper}
                                  onClick={() => handleRequestDelete(account)}
                                >
                                  <Trash2 size={15} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        ไม่พบบัญชีตามตัวกรอง
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="table-count">
              บัญชีตัวอย่าง · แสดง {rows.length} จาก {data.users.length} บัญชี
            </p>
          </section>
        </>
      )}
      <Modal open={!!detail} title="รายละเอียดผู้ดูแล" onClose={() => setDetail(null)}>
        {detail && (
          <dl className="detail-list">
            <div>
              <dt>ชื่อ</dt>
              <dd>{detail.name}</dd>
            </div>
            <div>
              <dt>ชื่อผู้ใช้</dt>
              <dd>{detail.username}</dd>
            </div>
            <div>
              <dt>บทบาท</dt>
              <dd>{detail.role}</dd>
            </div>
            <div>
              <dt>สถานะ</dt>
              <dd>{detail.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</dd>
            </div>
          </dl>
        )}
      </Modal>
      <Modal
        open={editor !== null}
        title={editor?.user ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}
        onClose={() => setEditor(null)}
      >
        {editor && (
          <UserEditor
            key={editor.user?.id ?? 'new'}
            user={editor.user}
            onCancel={() => setEditor(null)}
            onSaved={handleUserSaved}
          />
        )}
      </Modal>
      <Modal open={!!deleting} title="ยืนยันการลบผู้ใช้" onClose={() => setDeleting(null)}>
        <p>ต้องการลบบัญชี {deleting?.name} หรือไม่?</p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            ยืนยันลบ
          </Button>
        </div>
      </Modal>
    </>
  );
}
