import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CarFront, Plus } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SpotEditor } from '../../components/admin/SpotEditor';
import { floorName, time } from '../../utils/parking';

export function ParkingLayout() {
  const { data, can } = useParking();
  const [params] = useSearchParams();
  const linked = data.spots.find((spot) => spot.id === params.get('spot'));
  let initialFloor = data.floors[0]?.id ?? 1;
  const requestedFloor = Number(params.get('floor'));
  if (requestedFloor) initialFloor = requestedFloor;
  if (linked) initialFloor = linked.floor;
  const [floor, setFloor] = useState(initialFloor);
  const [selectedId, setSelectedId] = useState(
    linked?.id ?? data.spots.find((spot) => spot.floor === initialFloor && spot.occupied)?.id ?? '',
  );
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const selected = data.spots.find((spot) => spot.id === selectedId && spot.floor === floor);
  const vehicle = data.vehicles.find(
    (vehicle) => vehicle.spotId === selected?.id && !vehicle.exitAt,
  );
  const spots = data.spots
    .filter((spot) => spot.floor === floor)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
  const rows: string[] = [];
  for (const spot of spots) {
    const rowName = spot.name[0];
    if (!rows.includes(rowName)) rows.push(rowName);
  }
  const free = spots.filter((spot) => !spot.occupied).length;

  function handleSelectFloor(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedFloor = Number(event.target.value);
    setFloor(selectedFloor);
    const firstSpot = data.spots.find((spot) => spot.floor === selectedFloor);
    setSelectedId(firstSpot?.id ?? '');
  }

  function handleAddSpot() {
    setAdding(true);
    setEditing(true);
  }

  function handleEditSpot() {
    setAdding(false);
    setEditing(true);
  }

  function handleSpotSaved() {
    setNotice('บันทึกข้อมูลช่องจอดเรียบร้อยแล้ว');
    setEditing(false);
  }
  return (
    <>
      <PageHeader title="ผังลานจอดรถ" description="เลือกชั้นแล้วคลิกช่องจอดเพื่อดูสถานะและข้อมูลรถ">
        <div className="heading-actions">
          {can('manage-floors') && (
            <Link to="/admin/floors" className="sp-button sp-button--secondary">
              จัดการชั้น
            </Link>
          )}
          {can('add-spots') && (
            <Button onClick={handleAddSpot}>
              <Plus size={16} />
              เพิ่มช่องจอด
            </Button>
          )}
        </div>
      </PageHeader>
      <div className="admin-card parking-toolbar">
        <select aria-label="เลือกชั้น" value={floor} onChange={handleSelectFloor}>
          {data.floors.map((floorItem) => (
            <option key={floorItem.id} value={floorItem.id}>
              {floorItem.name}
              {!floorItem.active ? ' (ปิดใช้งาน)' : ''}
            </option>
          ))}
        </select>
        <span>ลานจอดอาคาร A</span>
      </div>
      {notice && (
        <p className="success-notice" role="status">
          {notice}
        </p>
      )}
      <div className="admin-stats three-stats">
        {[
          ['ช่องจอด' + floorName(data, floor), spots.length + ' ช่อง', rows.length + ' แถว'],
          [
            'ช่องว่าง',
            free + ' ช่อง',
            (spots.length ? Math.round((free / spots.length) * 100) : 0) + '% ของชั้นนี้',
          ],
          [
            'ไม่ว่าง',
            spots.length - free + ' ช่อง',
            (spots.length ? Math.round(((spots.length - free) / spots.length) * 100) : 0) +
              '% ของชั้นนี้',
          ],
        ].map(([label, value, note], i) => (
          <div className={`admin-stat-card tone-${i}`} key={label}>
            <h2>{label}</h2>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="layout-panels">
        <section className="admin-card parking-map">
          <div className="card-heading">
            <h2>ผังช่องจอด · {floorName(data, floor)}</h2>
            <div className="parking-legend">
              <span>
                <i className="available-dot" />
                ว่าง
              </span>
              <span>
                <i className="occupied-dot" />
                ไม่ว่าง
              </span>
              <span>
                <i className="selected-dot" />
                เลือกอยู่
              </span>
            </div>
          </div>
          <div className="parking-grid-scroll">
            {rows.map((row) => (
              <div key={row} className="parking-row">
                <div className="parking-grid">
                  {spots
                    .filter((spot) => spot.name[0] === row)
                    .map((spot) => (
                      <button
                        key={spot.id}
                        className={`parking-spot ${spot.occupied ? 'is-occupied' : 'is-available'} ${spot.id === selected?.id ? 'is-selected' : ''}`}
                        aria-label={`${spot.name} ${spot.occupied ? 'ไม่ว่าง' : 'ว่าง'}`}
                        aria-pressed={spot.id === selected?.id}
                        onClick={() => setSelectedId(spot.id)}
                      >
                        <strong>{spot.name}</strong>
                        {spot.occupied ? <CarFront size={16} /> : <small>ว่าง</small>}
                      </button>
                    ))}
                </div>
                <div className="parking-lane" />
              </div>
            ))}
            {!spots.length && <p className="table-empty">ชั้นนี้ยังไม่มีช่องจอด</p>}
          </div>
          <div className="map-directions">
            <span>ทางเข้า →</span>
            <span>→ ทางออก</span>
          </div>
        </section>
        <section className="admin-card parking-detail">
          <h2>รายละเอียดช่องจอด</h2>
          {selected ? (
            <>
              <div className="spot-detail-heading">
                <strong>{selected.name}</strong>
                <StatusBadge tone={selected.occupied ? 'red' : 'green'}>
                  {selected.occupied ? 'ไม่ว่าง' : 'ว่าง'}
                </StatusBadge>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>ชั้น</dt>
                  <dd>{floorName(data, selected.floor)}</dd>
                </div>
                <div>
                  <dt>ทะเบียนรถ</dt>
                  <dd>{vehicle?.plate ?? '—'}</dd>
                </div>
                <div>
                  <dt>เวลาเข้า</dt>
                  <dd>{vehicle ? time(vehicle.entryAt) + ' น.' : '—'}</dd>
                </div>
                <div>
                  <dt>ประเภทรถ</dt>
                  <dd>{vehicle?.type ?? '—'}</dd>
                </div>
              </dl>
              <div className="spot-detail-actions">
                {vehicle && can('operations') && (
                  <Link
                    className="sp-button sp-button--primary"
                    to={`/admin/operations?vehicle=${vehicle.id}`}
                  >
                    ดูข้อมูลรถ
                  </Link>
                )}
                {can('edit-spots') && (
                  <Button variant="secondary" onClick={handleEditSpot}>
                    แก้ไขช่องจอด
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="section-description">เลือกช่องจอดในผังเพื่อดูรายละเอียด</p>
          )}
        </section>
      </div>
      <Modal
        open={editing}
        title={adding ? 'เพิ่มช่องจอด' : `แก้ไขช่องจอด ${selected?.name ?? ''}`}
        onClose={() => setEditing(false)}
      >
        {editing && (
          <SpotEditor
            key={adding ? 'new' : selectedId}
            spot={adding ? undefined : selected}
            floor={floor}
            onCancel={() => setEditing(false)}
            onSaved={handleSpotSaved}
          />
        )}
      </Modal>
    </>
  );
}
