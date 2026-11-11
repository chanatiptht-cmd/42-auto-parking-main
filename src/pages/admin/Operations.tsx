import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useParking } from '../../context/ParkingContext';
import {
  calculationTime,
  dateKey,
  dateTime,
  DEMO_NOW,
  duration,
  floorName,
  money,
  normalizePlate,
  time,
  vehiclePhoto,
  vehicleTotal,
} from '../../utils/parking';
import { downloadCsv } from '../../utils/csv';
import type { Vehicle, VehicleType } from '../../types/parking';

export function Operations() {
  const { data, can, now, updateOperation } = useParking();
  const [params] = useSearchParams();
  const linked = data.vehicles.find((vehicle) => vehicle.id === params.get('vehicle'));
  const defaults = {
    query: '',
    date: dateKey(linked?.entryAt ?? DEMO_NOW),
    start: '00:00',
    end: '23:59',
    status: 'all',
  };
  const [filters, setFilters] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const [selectedId, setSelectedId] = useState(linked?.id ?? 'v1');
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<Vehicle | null>(null);
  const rows = data.vehicles
    .filter((vehicle) => {
      const matchesPlate = normalizePlate(vehicle.plate).includes(normalizePlate(applied.query));
      const matchesDate = dateKey(vehicle.entryAt) === applied.date;
      const entryTime = time(vehicle.entryAt);
      const matchesTime = entryTime >= applied.start && entryTime <= applied.end;

      if (applied.status === 'in' && vehicle.exitAt) return false;
      if (applied.status === 'out' && !vehicle.exitAt) return false;
      return matchesPlate && matchesDate && matchesTime;
    })
    .sort((a, b) => Date.parse(b.entryAt) - Date.parse(a.entryAt));
  const selected = rows.find((vehicle) => vehicle.id === selectedId) ?? rows[0];
  const spot = data.spots.find((spot) => spot.id === selected?.spotId);
  const payment = data.payments.find((payment) => payment.vehicleId === selected?.id);
  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!filters.date || !filters.start || !filters.end || filters.start > filters.end) {
      setError('กรุณาเลือกวันที่และเวลาเริ่ม–สิ้นสุดให้ถูกต้อง');
      return;
    }
    setApplied({ ...filters });
    setError('');
  }
  function handleExportCsv() {
    if (!can('export-operations')) return;
    downloadCsv(`operations-${applied.date}.csv`, [
      [
        'ช่องจอด',
        'ทะเบียน',
        'จังหวัด',
        'ประเภท',
        'เวลาเข้า',
        'เวลาออก',
        'ระยะเวลา',
        'ค่าจอด (บาท)',
        'สถานะจอด',
        'สถานะชำระ',
      ],
      ...rows.map((vehicle) => {
        const payment = data.payments.find((payment) => payment.vehicleId === vehicle.id);
        return [
          data.spots.find((spot) => spot.id === vehicle.spotId)?.name ?? '—',
          vehicle.plate,
          vehicle.province,
          vehicle.type,
          dateTime(vehicle.entryAt),
          vehicle.exitAt ? dateTime(vehicle.exitAt) : '—',
          duration(vehicle.entryAt, calculationTime(vehicle, payment, now)),
          vehicleTotal(vehicle, payment, now),
          vehicle.exitAt ? 'ออกแล้ว' : 'จอดอยู่',
          payment ? 'ชำระแล้ว' : 'ยังไม่ชำระ',
        ];
      }),
    ]);
  }

  function handleCloseEditor() {
    setEdit(null);
    setError('');
  }

  async function handleSaveVehicle(event: React.FormEvent) {
    event.preventDefault();
    if (!edit) return;
    try {
      await updateOperation(edit);
      setEdit(null);
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <>
      <PageHeader
        title="รายการรถเข้า–ออก"
        description="ค้นหาทะเบียนหรือช่วงเวลา แล้วเปิดรูปจากกล้องของแต่ละรายการ"
      >
        {can('export-operations') && (
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download size={15} />
            ส่งออกรายการ
          </Button>
        )}
      </PageHeader>
      <form className="admin-card filter-bar operation-filters" onSubmit={handleSearch} noValidate>
        <Input
          label="ค้นหาทะเบียน"
          placeholder="ค้นหาทะเบียนรถ"
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        />
        <label>
          วันที่
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters({ ...filters, date: event.target.value })}
          />
        </label>
        <label>
          เวลาเริ่ม
          <input
            type="time"
            value={filters.start}
            onChange={(event) => setFilters({ ...filters, start: event.target.value })}
          />
        </label>
        <label>
          เวลาสิ้นสุด
          <input
            type="time"
            value={filters.end}
            onChange={(event) => setFilters({ ...filters, end: event.target.value })}
          />
        </label>
        <label>
          สถานะ
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="all">ทุกสถานะ</option>
            <option value="in">จอดอยู่</option>
            <option value="out">ออกแล้ว</option>
          </select>
        </label>
        <Button type="submit">ค้นหา</Button>
        {error && (
          <p className="form-error full-width" role="alert">
            {error}
          </p>
        )}
      </form>
      <section className="admin-card">
        <div className="card-heading">
          <h2>รายการที่พบ</h2>
          <span>{rows.length} รายการ</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table operations-table">
            <thead>
              <tr>
                {[
                  'ช่องจอด',
                  'ทะเบียน',
                  'ประเภท',
                  'เวลาเข้า',
                  'เวลาออก',
                  'ระยะเวลา',
                  'ค่าจอด',
                  'สถานะ',
                  'รายละเอียด',
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((vehicle) => {
                const payment = data.payments.find((payment) => payment.vehicleId === vehicle.id);
                return (
                  <tr
                    key={vehicle.id}
                    className={vehicle.id === selected?.id ? 'selected-row' : ''}
                  >
                    <td>
                      <strong>
                        {data.spots.find((spot) => spot.id === vehicle.spotId)?.name ?? '—'}
                      </strong>
                    </td>
                    <td>{vehicle.plate}</td>
                    <td>{vehicle.type}</td>
                    <td>{time(vehicle.entryAt)}</td>
                    <td>{vehicle.exitAt ? time(vehicle.exitAt) : '—'}</td>
                    <td>{duration(vehicle.entryAt, calculationTime(vehicle, payment, now))}</td>
                    <td>{money(vehicleTotal(vehicle, payment, now))}</td>
                    <td>
                      <StatusBadge tone={vehicle.exitAt ? 'blue' : 'green'}>
                        {vehicle.exitAt ? 'ออกแล้ว' : 'จอดอยู่'}
                      </StatusBadge>
                    </td>
                    <td>
                      {can('view-photos') && (
                        <button
                          className="text-button"
                          aria-label={`ดูรายละเอียด ${vehicle.plate}`}
                          onClick={() => setSelectedId(vehicle.id)}
                        >
                          ดูรายละเอียด →
                        </button>
                      )}
                      {can('edit-operations') && (
                        <button className="text-button" onClick={() => setEdit({ ...vehicle })}>
                          แก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={9} className="table-empty">
                    ไม่พบรายการรถตามตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {selected && can('view-photos') && (
        <section className="admin-card operation-details">
          <div className="card-heading">
            <h2>รายละเอียดรถ {selected.plate}</h2>
            <span>
              {selected.province} ·{' '}
              {spot ? floorName(data, spot.floor) + ' / ' + spot.name : 'ไม่ระบุช่อง'}
            </span>
            <div className="heading-actions">
              <StatusBadge tone={payment ? 'green' : 'red'}>
                {payment ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
              </StatusBadge>
              <StatusBadge tone={selected.exitAt ? 'blue' : 'green'}>
                {selected.exitAt ? 'ออกแล้ว' : 'จอดอยู่'}
              </StatusBadge>
            </div>
          </div>
          <div className="operation-photos">
            <div>
              <div>
                <strong>ภาพขาเข้า</strong>
                <span>{dateTime(selected.entryAt)}</span>
              </div>
              <img src={vehiclePhoto(selected, 'entry')} alt={`ภาพขาเข้า ${selected.plate}`} />
            </div>
            <div>
              <div>
                <strong>ภาพขาออก</strong>
                <span>{selected.exitAt ? dateTime(selected.exitAt) : '—'}</span>
              </div>
              {selected.exitAt ? (
                <img src={vehiclePhoto(selected, 'exit')} alt={`ภาพขาออก ${selected.plate}`} />
              ) : (
                <div className="camera-empty">รถยังจอดอยู่ · ยังไม่มีภาพขาออก</div>
              )}
            </div>
          </div>
          <p className="section-description">
            ภาพตัวอย่างจากกล้อง · จอด{' '}
            {duration(selected.entryAt, calculationTime(selected, payment, now))} · ค่าจอด{' '}
            {money(vehicleTotal(selected, payment, now))}
          </p>
        </section>
      )}
      <Modal open={!!edit} title="แก้ไขข้อมูลรถ" onClose={handleCloseEditor}>
        {edit && (
          <form className="modal-form" onSubmit={handleSaveVehicle}>
            <Input
              label="ทะเบียนรถ"
              value={edit.plate}
              onChange={(event) => setEdit({ ...edit, plate: event.target.value })}
            />
            <Input
              label="จังหวัด"
              value={edit.province}
              onChange={(event) => setEdit({ ...edit, province: event.target.value })}
            />
            <label className="sp-field">
              ประเภทรถ
              <select
                value={edit.type}
                onChange={(event) => setEdit({ ...edit, type: event.target.value as VehicleType })}
              >
                {['Sedan', 'SUV', 'Pickup'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setEdit(null)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึกรายการ</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
