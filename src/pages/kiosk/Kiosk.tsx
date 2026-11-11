import { useState } from 'react';
import { CarFront, Check, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { DemoQr } from '../../components/user/DemoQr';
import { Button } from '../../components/common/Button';
import {
  calculationTime,
  dateTime,
  duration,
  exitDeadline,
  floorName,
  money,
  time,
  vehiclePhoto,
  vehicleTotal,
} from '../../utils/parking';
import '../../styles/kiosk.css';

export function Kiosk() {
  const { data, now, pay, exit } = useParking();
  const [params] = useSearchParams();
  const [id, setId] = useState(
    params.get('vehicle') ?? data.vehicles.find((vehicleItem) => !vehicleItem.exitAt)?.id ?? '',
  );
  const [error, setError] = useState('');
  const vehicle = data.vehicles.find((vehicleItem) => vehicleItem.id === id);
  const payment = data.payments.find((paymentItem) => paymentItem.vehicleId === id);
  const spot = data.spots.find((spotItem) => spotItem.id === vehicle?.spotId);
  const availableVehicles = data.vehicles.filter(
    (vehicleItem) => !vehicleItem.exitAt || vehicleItem.id === id,
  );

  let open = false;
  if (vehicle && !vehicle.exitAt && payment) {
    const currentTime = Date.parse(now);
    const paidTime = Date.parse(payment.paidAt);
    const lastExitTime = Date.parse(exitDeadline(payment));
    open = currentTime >= paidTime && currentTime <= lastExitTime;
  }

  let paymentHeading = 'ชำระค่าจอดรถ';
  if (vehicle?.exitAt) paymentHeading = 'รถออกจากลานแล้ว';
  else if (open) paymentHeading = 'ชำระเงินเรียบร้อยแล้ว';
  else if (payment) paymentHeading = 'พ้นกำหนดเวลาออก';

  let exitMessage = 'กรุณาติดต่อเจ้าหน้าที่ลานจอด';
  if (vehicle?.exitAt) exitMessage = 'เวลาออก ' + time(vehicle.exitAt) + ' น.';
  else if (open && payment) exitMessage = 'ออกจากลานภายใน ' + time(exitDeadline(payment)) + ' น.';

  let gateMessage = 'กรุณาชำระค่าจอดก่อนออก';
  if (vehicle?.exitAt) gateMessage = 'บันทึกเวลาออกและคืนช่องจอดแล้ว';
  else if (open) gateMessage = 'กดจำลองรถผ่านเพื่อบันทึกเวลาออก';
  else if (payment) gateMessage = 'รอเจ้าหน้าที่ตรวจสอบ';

  function handleSelectVehicle(event: React.ChangeEvent<HTMLSelectElement>) {
    setId(event.target.value);
    setError('');
  }

  async function handlePayment() {
    try {
      await pay(id);
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  async function handlePassGate() {
    try {
      await exit(id);
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <main className="kiosk-shell">
      <header className="kiosk-header">
        <div>
          <CarFront size={32} />
          <strong>Door Parking</strong>
          <span>ลานจอดอาคาร A</span>
        </div>
        <span>{dateTime(now)}</span>
      </header>
      <div className="kiosk-toolbar">
        <span>จุดชำระเงินและทางออก · สาธิต</span>
        <label>
          เลือกรายการรถ
          <select value={id} onChange={handleSelectVehicle}>
            {availableVehicles.map((vehicleItem) => (
              <option key={vehicleItem.id} value={vehicleItem.id}>
                {vehicleItem.plate} · {vehicleItem.province} · {vehicleItem.id}
              </option>
            ))}
          </select>
        </label>
        <Link to="/user/search">หน้าผู้ใช้ →</Link>
      </div>
      {vehicle ? (
        <div className="kiosk-panels">
          <section className="kiosk-camera">
            <div className="camera-label">
              <i />
              ภาพตัวอย่างจากกล้องทางออก
            </div>
            <img src={vehiclePhoto(vehicle)} alt={`รถที่ไม้กั้น ${vehicle.plate}`} />
            <div className="kiosk-plate">
              <CarFront size={38} />
              <div>
                <strong>{vehicle.plate}</strong>
                <span>{vehicle.province}</span>
              </div>
            </div>
          </section>
          <section className="kiosk-payment">
            <h1>{paymentHeading}</h1>
            <dl className="detail-list">
              <div>
                <dt>ตำแหน่งจอด</dt>
                <dd>{spot ? floorName(data, spot.floor) + ' / ' + spot.name : 'ไม่ระบุช่อง'}</dd>
              </div>
              <div>
                <dt>เวลาเข้า</dt>
                <dd>{time(vehicle.entryAt)} น.</dd>
              </div>
              <div>
                <dt>ระยะเวลาจอด</dt>
                <dd>{duration(vehicle.entryAt, calculationTime(vehicle, payment, now))}</dd>
              </div>
            </dl>
            {!payment && !vehicle.exitAt ? (
              <>
                <strong className="kiosk-amount">
                  {money(vehicleTotal(vehicle, undefined, now))}
                </strong>
                <DemoQr />
                <p className="section-description">QR สาธิต ไม่สามารถชำระเงินจริง</p>
                <Button onClick={handlePayment}>จำลองการชำระเงิน</Button>
              </>
            ) : (
              <div className="kiosk-paid">
                <span>
                  <Check size={36} />
                </span>
                <strong>{payment ? money(payment.amount) : '—'}</strong>
                <p>{exitMessage}</p>
                <small>{payment?.id}</small>
              </div>
            )}
            <Button className="full-width" disabled={!open} onClick={handlePassGate}>
              จำลองรถผ่านไม้กั้น
            </Button>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
          </section>
        </div>
      ) : (
        <p>ไม่พบรายการรถ กรุณาเลือกรายการใหม่</p>
      )}
      <div className={`kiosk-gate ${open ? 'is-open' : ''}`} role="status">
        <ShieldCheck size={28} />
        <strong>{open ? 'ไม้กั้นเปิด · เชิญออกจากลานจอด' : 'ไม้กั้นปิด'}</strong>
        <span>{gateMessage}</span>
      </div>
    </main>
  );
}
