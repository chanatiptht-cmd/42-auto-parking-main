import { useState } from 'react';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { createReport, reportDates } from '../../utils/reports';
import type { ReportPeriod } from '../../utils/reports';
import { money, time } from '../../utils/parking';
import { DonutChart, ReportTrafficChart, RevenueChart } from '../../components/admin/ReportCharts';
import { Button } from '../../components/common/Button';
import { downloadCsv } from '../../utils/csv';
import { floorName } from '../../utils/parking';
import '../../styles/reports.css';

type Tab = 'Finance' | 'Activity' | 'Vehicle Types' | 'Heat Map';
const tabs: Tab[] = ['Finance', 'Activity', 'Vehicle Types', 'Heat Map'];
const titles = {
  Finance: ['รายงานรายรับ', 'ดูยอดรับชำระและรายการชำระเงินในช่วงที่เลือก'],
  Activity: ['รายงานรถเข้า–ออก', 'เปรียบเทียบจำนวนรถเข้า–ออกและดูช่วงเวลาที่หนาแน่น'],
  'Vehicle Types': ['รายงานประเภทรถ', 'ดูจำนวนและสัดส่วนของรถแต่ละประเภท'],
  'Heat Map': ['ความถี่การใช้ช่องจอด', 'ดูว่าช่องจอดแต่ละช่องถูกใช้กี่ครั้งในช่วงที่เลือก'],
};
const heatColors = ['#f2eef9', '#e2d8f4', '#c6b5e8', '#a58bd6', '#775aba', '#493290'];
type Period = ReportPeriod | 'custom';
type ReportRow = (string | number)[];

function ReportTable({
  heading,
  columns,
  rows,
  empty,
}: {
  heading: string;
  columns: string[];
  rows: ReportRow[];
  empty: string;
}) {
  return (
    <section className="reports-card">
      <h2>{heading}</h2>
      <div className="reports-table-scroll">
        <table className="reports-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((value, column) => (
                  <td key={column}>{value}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Reports() {
  const { data, can } = useParking();
  const [tab, setTab] = useState<Tab>('Finance');
  const [period, setPeriod] = useState<Period>('month');
  const [dates, setDates] = useState(() => reportDates('month'));
  const [appliedDates, setAppliedDates] = useState(dates);
  const [floor, setFloor] = useState(data.spots[0]?.floor ?? 1);
  const [appliedFloor, setAppliedFloor] = useState(floor);
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [error, setError] = useState('');

  const report = createReport(data, 'month', appliedDates);
  const floors = data.floors;
  const spots = data.spots
    .filter((spot) => spot.floor === appliedFloor)
    .map((spot) => ({ ...spot, count: report.visits.get(spot.id) ?? 0 }));
  const topSpot = [...spots].sort((a, b) => b.count - a.count)[0];
  const bottomSpot = [...spots].sort((a, b) => a.count - b.count)[0];
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId) ?? topSpot;
  function spotLabel(spot?: { name: string; count: number }) {
    if (!spot) return '—';
    return `${spot.name} · ${spot.count} ครั้ง`;
  }
  const activity = report.series
    .filter((point) => point.entries || point.exits)
    .sort((a, b) => b.entries + b.exits - a.entries - a.exits);
  const financeRows = [...report.payments]
    .sort((a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt))
    .map((payment) => [
      time(payment.paidAt),
      payment.id,
      data.vehicles.find((vehicle) => vehicle.id === payment.vehicleId)?.plate ?? '—',
      payment.method,
      payment.amount,
      'สำเร็จ',
    ]);
  const activityRows = activity.map((point) => [
    point.label,
    point.entries,
    point.exits,
    point.entries + point.exits,
  ]);
  const vehicleRows = report.types.map((item) => [
    item.name,
    item.value,
    `${report.vehicleCount ? ((item.value / report.vehicleCount) * 100).toFixed(1) : '0.0'}%`,
  ]);
  const topType = [...report.types].sort((a, b) => b.value - a.value)[0];
  let averagePayment = 0;
  if (report.payments.length > 0) {
    averagePayment = Number((report.total / report.payments.length).toFixed(2));
  }
  const summary = {
    Finance: [
      ['รายรับรวม', money(report.total)],
      ['ชำระสำเร็จ', `${report.payments.length} รายการ`],
      ['ยอดเฉลี่ยต่อรายการ', money(averagePayment)],
    ],
    Activity: [
      ['รถเข้าทั้งหมด', `${report.vehicleCount} คัน`],
      ['รถออกทั้งหมด', `${report.exitCount} คัน`],
      ['ช่วงที่หนาแน่นที่สุด', activity[0]?.label ?? '—'],
    ],
    'Vehicle Types': [
      ['รถเข้าทั้งหมด', `${report.vehicleCount} คัน`],
      ['ประเภทที่พบมากที่สุด', report.vehicleCount ? topType.name : '—'],
      ['ประเภทที่พบ', `${report.types.filter((item) => item.value > 0).length} ประเภท`],
    ],
    'Heat Map': [
      ['การใช้งานรวม', `${spots.reduce((sum, spot) => sum + spot.count, 0)} ครั้ง`],
      ['ช่องที่ใช้มากที่สุด', topSpot?.count ? spotLabel(topSpot) : '—'],
      ['ช่องที่ใช้น้อยที่สุด', topSpot?.count ? spotLabel(bottomSpot) : '—'],
    ],
  };
  const financeColumns = ['เวลา', 'รหัสอ้างอิง', 'ทะเบียนรถ', 'วิธีชำระ', 'ยอดชำระ (บาท)', 'สถานะ'];
  const activityColumns = ['ช่วงเวลา', 'รถเข้า', 'รถออก', 'รวมเหตุการณ์'];
  const vehicleColumns = ['ประเภทรถ', 'จำนวน (คัน)', 'สัดส่วน'];
  const csvRows = {
    Finance: [financeColumns, ...financeRows],
    Activity: [activityColumns, ...activityRows],
    'Vehicle Types': [vehicleColumns, ...vehicleRows],
    'Heat Map': [
      ['ชั้น', 'ช่องจอด', 'จำนวนครั้ง'],
      ...spots.map((spot) => [spot.floor, spot.name, spot.count]),
    ],
  };

  function changePeriod(next: Period) {
    setPeriod(next);
    setError('');
    if (next === 'custom') return;
    const range = reportDates(next);
    setDates(range);
  }

  function applyFilters() {
    if (!dates.start || !dates.end || dates.start > dates.end) {
      setError('กรุณาเลือกวันที่เริ่มและวันที่สิ้นสุดให้ถูกต้อง');
      return;
    }
    setError('');
    setAppliedDates(dates);
    setAppliedFloor(floor);
    setSelectedSpotId('');
  }

  function updateDate(key: 'start' | 'end', value: string) {
    setPeriod('custom');
    setDates({ ...dates, [key]: value });
  }

  function handleShowReport(event: React.FormEvent) {
    event.preventDefault();
    applyFilters();
  }

  function handleExportCsv() {
    if (!can('export-reports')) return;
    const tabName = tab.toLowerCase().replaceAll(' ', '-');
    const filename = `auto-parking-${tabName}-${appliedDates.start}-${appliedDates.end}.csv`;
    downloadCsv(filename, csvRows[tab]);
  }

  return (
    <div className="reports-page">
      <header className="reports-heading">
        <div>
          <h1>{titles[tab][0]}</h1>
          <p>{titles[tab][1]}</p>
        </div>
        {can('export-reports') && (
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download size={16} /> ส่งออก CSV
          </Button>
        )}
      </header>

      <div className="reports-tabs" role="group" aria-label="ประเภทรายงาน">
        {tabs.map((item) => (
          <button type="button" key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      <form className="reports-filters" onSubmit={handleShowReport}>
        <label>
          ช่วงเวลารายงาน
          <select value={period} onChange={(event) => changePeriod(event.target.value as Period)}>
            <option value="day">รายวัน</option>
            <option value="month">รายเดือน</option>
            <option value="year">รายปี</option>
            <option value="custom">กำหนดเอง</option>
          </select>
        </label>
        <label>
          วันที่เริ่ม
          <input
            type="date"
            value={dates.start}
            onChange={(event) => updateDate('start', event.target.value)}
          />
        </label>
        <label>
          วันที่สิ้นสุด
          <input
            type="date"
            value={dates.end}
            onChange={(event) => updateDate('end', event.target.value)}
          />
        </label>
        {tab === 'Heat Map' && (
          <label>
            ชั้นจอด
            <select value={floor} onChange={(event) => setFloor(Number(event.target.value))}>
              {floors.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <Button type="submit">แสดงรายงาน</Button>
        {error && (
          <p role="alert" className="reports-error">
            {error}
          </p>
        )}
      </form>

      <div className="reports-summary">
        {summary[tab].map(([label, value]) => (
          <div className="reports-card reports-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {tab === 'Finance' && (
        <>
          <section className="reports-card">
            <h2>รายรับตามช่วงเวลา</h2>
            <RevenueChart series={report.series} />
          </section>
          <ReportTable
            heading="รายการรับชำระล่าสุด"
            columns={financeColumns}
            rows={financeRows.slice(0, 10)}
            empty="ยังไม่มีรายรับในช่วงเวลานี้"
          />
        </>
      )}

      {tab === 'Activity' && (
        <>
          <section className="reports-card">
            <h2>สถิติรถเข้า–ออกตามช่วงเวลา</h2>
            <ReportTrafficChart series={report.series} />
          </section>
          <ReportTable
            heading="รายละเอียดช่วงหนาแน่น"
            columns={activityColumns}
            rows={activityRows}
            empty="ยังไม่มีรถเข้า–ออกในช่วงเวลานี้"
          />
        </>
      )}

      {tab === 'Vehicle Types' && (
        <>
          <div className="reports-split reports-split--vehicles">
            <section className="reports-card">
              <h2>สัดส่วนประเภทรถ</h2>
              <DonutChart values={report.types} total={report.vehicleCount} unit="คัน" />
            </section>
            <ReportTable
              heading="จำนวนและสัดส่วน"
              columns={vehicleColumns}
              rows={vehicleRows}
              empty="ยังไม่มีข้อมูลประเภทรถ"
            />
          </div>
          {!report.vehicleCount && (
            <p className="section-description">ยังไม่มีข้อมูลประเภทรถในช่วงเวลานี้</p>
          )}
        </>
      )}

      {tab === 'Heat Map' && (
        <div className="reports-split">
          <section className="reports-card" aria-labelledby="heat-map-heading">
            <h2 id="heat-map-heading">Heat Map · {floorName(data, appliedFloor)}</h2>
            <div className="reports-heat-grid">
              {spots.map((spot) => {
                const shade = topSpot?.count
                  ? Math.ceil((spot.count / topSpot.count) * (heatColors.length - 1))
                  : 0;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    aria-label={`${spot.name} ${spot.count} ครั้ง`}
                    aria-pressed={spot.id === selectedSpot?.id}
                    style={{
                      backgroundColor: heatColors[shade],
                      color: shade >= 4 ? '#fff' : undefined,
                    }}
                    onClick={() => setSelectedSpotId(spot.id)}
                  >
                    <strong>{spot.name}</strong>
                    <span>{spot.count} ครั้ง</span>
                  </button>
                );
              })}
            </div>
            <div className="reports-heat-legend">
              น้อย{' '}
              {heatColors.map((color) => (
                <i key={color} style={{ backgroundColor: color }} />
              ))}{' '}
              มาก
            </div>
            {!spots.some((spot) => spot.count > 0) && (
              <p className="section-description">ไม่มีประวัติการใช้ช่องจอดในช่วงนี้</p>
            )}
          </section>
          <section className="reports-card reports-spot" aria-labelledby="report-spot-heading">
            <h2 id="report-spot-heading">รายละเอียดช่องจอด</h2>
            {selectedSpot ? (
              <>
                <div>
                  <strong className="reports-spot-code">{selectedSpot.name}</strong> ชั้น{' '}
                  {selectedSpot.floor}
                </div>
                <p>จำนวนครั้งที่ใช้งาน</p>
                <strong className="reports-spot-count">{selectedSpot.count} ครั้ง</strong>
                {can('parking-layout') && (
                  <Link to={`/admin/parking-layout?spot=${encodeURIComponent(selectedSpot.id)}`}>
                    ดูตำแหน่งในผัง →
                  </Link>
                )}
              </>
            ) : (
              <p>ยังไม่มีช่องจอดในชั้นนี้</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
