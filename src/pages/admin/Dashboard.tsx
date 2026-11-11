import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useParking } from '../../context/ParkingContext';
import { dateKey, DEMO_NOW, money, time } from '../../utils/parking';
import { createReport } from '../../utils/reports';

export function Dashboard() {
  const { data, now, can } = useParking();
  const [date, setDate] = useState(dateKey(DEMO_NOW));
  const [floor, setFloor] = useState('all');
  const spots = data.spots.filter((spot) => floor === 'all' || spot.floor === Number(floor));
  const scopedVehicles = data.vehicles.filter(
    (vehicle) => floor === 'all' || spots.some((spot) => spot.id === vehicle.spotId),
  );
  const scoped = {
    ...data,
    vehicles: scopedVehicles,
    payments: data.payments.filter((payment) =>
      scopedVehicles.some((vehicle) => vehicle.id === payment.vehicleId),
    ),
  };
  const report = createReport(scoped, 'day', { start: date, end: date });
  function isOccupied(id: string, current: boolean) {
    if (date === dateKey(now)) return current;
    const end = Date.parse(date + 'T23:59:59+07:00');
    return data.vehicles.some(
      (vehicle) =>
        vehicle.spotId === id &&
        Date.parse(vehicle.entryAt) <= end &&
        (!vehicle.exitAt || Date.parse(vehicle.exitAt) > end),
    );
  }
  const occupied = spots.filter((spot) => isOccupied(spot.id, spot.occupied)).length;
  const stats = [
    ['ช่องจอดทั้งหมด', `${spots.length} ช่อง`, `${data.floors.length} ชั้นในอาคาร A`],
    ['ช่องว่าง', `${spots.length - occupied} ช่อง`, 'พร้อมให้บริการ'],
    [
      'ช่องไม่ว่าง',
      `${occupied} ช่อง`,
      `อัตราการใช้งาน ${spots.length ? Math.round((occupied / spots.length) * 100) : 0}%`,
    ],
    ['รายรับ', money(report.total), 'ยอดที่ชำระสำเร็จ'],
  ];
  const recent = scopedVehicles
    .filter(
      (vehicle) =>
        dateKey(vehicle.entryAt) === date || (vehicle.exitAt && dateKey(vehicle.exitAt) === date),
    )
    .sort((a, b) => Date.parse(b.exitAt ?? b.entryAt) - Date.parse(a.exitAt ?? a.entryAt))
    .slice(0, 3);
  return (
    <>
      <PageHeader title="ภาพรวมระบบ" description="ติดตามช่องจอด รถเข้า–ออก และรายรับของลานจอด">
        <div className="heading-filters">
          <label>
            <span className="visually-hidden">วันที่ Dashboard</span>
            <input
              aria-label="วันที่ Dashboard"
              type="date"
              value={date}
              onChange={(event) => {
                if (event.target.value) setDate(event.target.value);
              }}
            />
          </label>
          <select
            aria-label="ชั้น Dashboard"
            value={floor}
            onChange={(event) => setFloor(event.target.value)}
          >
            <option value="all">ทุกชั้น</option>
            {data.floors.map((floorItem) => (
              <option key={floorItem.id} value={floorItem.id}>
                {floorItem.name}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>
      <div className="admin-stats">
        {stats.map(([label, value, note], i) => (
          <div className={`admin-stat-card tone-${i}`} key={label}>
            <h2>{label}</h2>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-panels">
        <section className="admin-card dashboard-activity">
          <div className="card-heading">
            <h2>สถิติรถเข้า–ออก</h2>
            <div className="chart-legend">
              <span>
                <i />
                รถเข้า
              </span>
              <span>
                <i />
                รถออก
              </span>
            </div>
          </div>
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.series} margin={{ top: 14, left: -22, right: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e6e8f2" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value, name) => [`${value} คัน`, name]} />
                <Area
                  isAnimationActive={false}
                  type="linear"
                  dataKey="entries"
                  name="รถเข้า"
                  stroke="#5742b9"
                  strokeWidth={2}
                  fill="#ece8f6"
                  dot={{ r: 2 }}
                />
                <Area
                  isAnimationActive={false}
                  type="linear"
                  dataKey="exits"
                  name="รถออก"
                  stroke="#13877d"
                  strokeWidth={2}
                  fill="transparent"
                  dot={{ r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="admin-card floor-availability">
          <h2>ช่องจอดตามชั้น</h2>
          <p className="section-description">จำนวนช่องว่างเทียบกับทั้งหมด</p>
          {data.floors
            .filter((floorItem) => floor === 'all' || floorItem.id === Number(floor))
            .map((floorItem) => {
              const slots = spots.filter((spot) => spot.floor === floorItem.id);
              const free = slots.filter((spot) => !isOccupied(spot.id, spot.occupied)).length;
              return (
                <div className="floor-bar" key={floorItem.id}>
                  <div>
                    <strong>{floorItem.name}</strong>
                    <span>
                      {free} / {slots.length} ช่องว่าง
                    </span>
                  </div>
                  <progress
                    aria-label={`ช่องว่าง ${floorItem.name}`}
                    max={slots.length || 1}
                    value={free}
                  />
                </div>
              );
            })}
        </section>
      </div>
      <section className="admin-card latest-vehicles">
        <div className="card-heading">
          <h2>รายการรถล่าสุด</h2>
          {can('operations') && <Link to="/admin/operations">ดูรายการทั้งหมด →</Link>}
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {['ทะเบียนรถ', 'ช่องจอด', 'ประเภท', 'เวลาเข้า', 'เวลาออก', 'สถานะ'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <strong>{vehicle.plate}</strong>
                  </td>
                  <td>{data.spots.find((spot) => spot.id === vehicle.spotId)?.name ?? '—'}</td>
                  <td>{vehicle.type}</td>
                  <td>{time(vehicle.entryAt)}</td>
                  <td>{vehicle.exitAt ? time(vehicle.exitAt) : '—'}</td>
                  <td>
                    <StatusBadge tone={vehicle.exitAt ? 'blue' : 'green'}>
                      {vehicle.exitAt ? 'ออกแล้ว' : 'จอดอยู่'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr>
                  <td colSpan={6} className="table-empty">
                    ไม่มีข้อมูลรถในวันที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
