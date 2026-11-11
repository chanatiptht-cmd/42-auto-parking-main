import { useState } from 'react';
import { Check } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useVehicle } from '../../components/user/VehicleInfo';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useParking } from '../../context/ParkingContext';
import { dateTime, exitDeadline, floorName, money, time } from '../../utils/parking';
import { VehicleNotFound } from './VehicleNotFound';

export function PaymentSuccess() {
  const { vehicle, payment } = useVehicle();
  const { data, now } = useParking();
  const [receipt, setReceipt] = useState(false);
  if (!vehicle) return <VehicleNotFound />;
  if (!payment) return <Navigate to={`/user/summary/${vehicle.id}`} replace />;
  const spot = data.spots.find((spot) => spot.id === vehicle.spotId);
  const location = spot ? `${floorName(data, spot.floor)} · ช่อง ${spot.name}` : 'ไม่ระบุช่องจอด';
  const expired = Date.parse(now) > Date.parse(exitDeadline(payment));

  let exitHeading = 'กรุณาออกจากลานภายใน';
  let exitNote = 'ภายใน 15 นาทีหลังชำระเงิน';
  if (vehicle.exitAt) {
    exitHeading = 'รถออกจากลานแล้ว';
    exitNote = dateTime(vehicle.exitAt);
  } else if (expired) {
    exitHeading = 'พ้นกำหนดเวลาออก';
    exitNote = 'กรุณาติดต่อเจ้าหน้าที่ลานจอด';
  }
  return (
    <>
      <header className="user-page-header">
        <h1>ผลการชำระเงิน</h1>
      </header>
      <main className="user-page-content user-success">
        <div className="user-success-heading">
          <span className="success-check">
            <Check size={35} />
          </span>
          <h1>ชำระเงินสำเร็จ</h1>
          <strong>
            {payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
          </strong>
        </div>
        <div className="success-receipt-card">
          <strong>
            {vehicle.plate} · {vehicle.province}
          </strong>
          <small>อาคาร A · {location}</small>
          <dl className="detail-list">
            <div>
              <dt>ชำระเวลา</dt>
              <dd>{time(payment.paidAt)} น.</dd>
            </div>
            <div>
              <dt>เลขอ้างอิง</dt>
              <dd>{payment.id}</dd>
            </div>
          </dl>
        </div>
        <div className="user-exit-deadline">
          <span>{exitHeading}</span>
          <strong>{time(vehicle.exitAt ?? exitDeadline(payment))} น.</strong>
          <small>{exitNote}</small>
        </div>
        <div className="user-bottom-action">
          <Button className="full-width" onClick={() => setReceipt(true)}>
            ดูใบเสร็จ
          </Button>
          <Link className="user-home-link" to="/user/search">
            กลับหน้าหลัก
          </Link>
        </div>
        <Modal open={receipt} title="ใบเสร็จรับเงิน · Demo" onClose={() => setReceipt(false)}>
          <p>Auto Parking </p>
          <dl className="detail-list">
            <div>
              <dt>ทะเบียน</dt>
              <dd>
                {vehicle.plate} · {vehicle.province}
              </dd>
            </div>
            <div>
              <dt>วันที่ชำระ</dt>
              <dd>{dateTime(payment.paidAt)}</dd>
            </div>
            <div>
              <dt>วิธีชำระ</dt>
              <dd>{payment.method}</dd>
            </div>
            <div>
              <dt>ยอดชำระ</dt>
              <dd>{money(payment.amount)}</dd>
            </div>
            <div>
              <dt>เลขอ้างอิง</dt>
              <dd>{payment.id}</dd>
            </div>
          </dl>
          <p className="form-hint">เอกสารจำลองจากข้อมูลการชำระรายการนี้</p>
        </Modal>
      </main>
    </>
  );
}
