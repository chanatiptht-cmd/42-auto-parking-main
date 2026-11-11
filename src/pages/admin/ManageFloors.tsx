import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useParking } from '../../context/ParkingContext';
import type { ParkingFloor } from '../../types/parking';

export function ManageFloors() {
  const { data, updateFloor } = useParking();
  const [selected, setSelected] = useState<ParkingFloor>(
    data.floors[0] ?? { id: 1, order: 1, name: '', active: true },
  );
  const [draft, setDraft] = useState(selected);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const adding = !data.floors.some((floor) => floor.id === selected.id);
  function handleSelectFloor(floor: ParkingFloor) {
    setSelected(floor);
    setDraft({ ...floor });
    setError('');
    setNotice('');
  }
  function handleAddFloor() {
    let nextId = 1;
    let nextOrder = 1;
    for (const floor of data.floors) {
      if (floor.id >= nextId) nextId = floor.id + 1;
      if (floor.order >= nextOrder) nextOrder = floor.order + 1;
    }
    handleSelectFloor({ id: nextId, order: nextOrder, name: '', active: true });
  }

  function handleCancel() {
    setDraft({ ...selected });
    setError('');
  }

  async function handleSaveFloor(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateFloor(draft);
      setSelected(draft);
      setNotice('บันทึกข้อมูลชั้นเรียบร้อยแล้ว');
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <>
      <PageHeader
        title="จัดการชั้นจอดรถ"
        description="เพิ่มและแก้ไขชื่อชั้น ลำดับ และสถานะของชั้นจอด"
      >
        <Link className="sp-button sp-button--secondary" to="/admin/parking-layout">
          ← กลับไปที่ผังลานจอด
        </Link>
      </PageHeader>
      {notice && (
        <p role="status" className="success-notice">
          {notice}
        </p>
      )}
      <div className="floor-panels">
        <section className="admin-card">
          <div className="card-heading">
            <div>
              <h2>รายการชั้นจอดรถ</h2>
              <p className="section-description">
                {data.floors.length} ชั้น · {data.spots.length} ช่องจอด
              </p>
            </div>
            <Button aria-label="เพิ่มชั้น" onClick={handleAddFloor}>
              + เพิ่มชั้น
            </Button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['ลำดับ', 'ชื่อชั้น', 'ช่องจอดทั้งหมด', 'สถานะ', 'จัดการ'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.floors.map((floor) => (
                  <tr key={floor.id} className={floor.id === selected.id ? 'selected-row' : ''}>
                    <td>
                      <strong>{String(floor.order).padStart(2, '0')}</strong>
                    </td>
                    <td>{floor.name}</td>
                    <td>{data.spots.filter((s) => s.floor === floor.id).length} ช่อง</td>
                    <td>
                      <StatusBadge tone={floor.active ? 'green' : 'gray'}>
                        {floor.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </StatusBadge>
                    </td>
                    <td>
                      <button
                        className="text-button"
                        aria-label={`แก้ไข ${floor.name}`}
                        onClick={() => handleSelectFloor(floor)}
                      >
                        แก้ไข →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="purple-note">
            <span>รวมช่องจอดทั้งหมด</span>
            <strong>{data.spots.length} ช่อง</strong>
          </div>
        </section>
        <section className="admin-card floor-editor">
          <h2>{adding ? 'เพิ่มข้อมูลชั้น' : 'แก้ไขข้อมูลชั้น'}</h2>
          <p className="section-description">
            {adding ? 'สร้างชั้นใหม่ในลานจอด' : 'กำลังแก้ไข' + selected.name}
          </p>
          <form className="modal-form" onSubmit={handleSaveFloor} noValidate>
            <label className="sp-field">
              ลำดับชั้น
              <input
                aria-label="ลำดับชั้น"
                type="number"
                min={1}
                max={99}
                value={draft.order}
                onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })}
              />
            </label>
            <label className="sp-field">
              ชื่อชั้น
              <input
                aria-label="ชื่อชั้น"
                value={draft.name}
                maxLength={40}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>
            <label className="sp-field">
              สถานะการใช้งาน
              <select
                value={String(draft.active)}
                onChange={(event) => setDraft({ ...draft, active: event.target.value === 'true' })}
              >
                <option value="true">เปิดใช้งาน</option>
                <option value="false">ปิดใช้งาน</option>
              </select>
            </label>
            <div className="purple-note">
              <strong>
                จำนวนช่องจอดของชั้นนี้: {data.spots.filter((s) => s.floor === selected.id).length}{' '}
                ช่อง
              </strong>
              <small>ปรับจำนวนช่องจอดได้ที่หน้าผังลานจอด</small>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <Button variant="secondary" onClick={handleCancel}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
            </div>
          </form>
          {!adding && (
            <Link
              className="sp-button sp-button--secondary full-width"
              to={`/admin/parking-layout?floor=${selected.id}`}
            >
              ดูผังชั้นนี้ →
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
