import { useEffect, useState } from 'react';
import { ChevronRight, Circle, Clock3, Download, RotateCcw } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useVehicle } from '../../components/user/VehicleInfo';
import { DemoQr } from '../../components/user/DemoQr';
import { useParking } from '../../context/ParkingContext';
import { vehicleTotal } from '../../utils/parking';
import { VehicleNotFound } from './VehicleNotFound';

const QR_LIFETIME = 10 * 60 * 1000;

function loadQrDeadline(storageKey: string) {
  try {
    const savedDeadline = Number(sessionStorage.getItem(storageKey));
    if (savedDeadline > 0) return savedDeadline;
  } catch {
    // ถ้า storage ใช้ไม่ได้ ยังทดลอง QR ในหน้านี้ต่อได้
  }
  return Date.now() + QR_LIFETIME;
}
export function QrPayment() {
  const { vehicle, payment } = useVehicle();
  const { pay, now } = useParking();
  const storageKey = 'parking-qr-' + (vehicle?.id ?? '');
  const [deadline, setDeadline] = useState(() => loadQrDeadline(storageKey));
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
  );
  const [bankOpen, setBankOpen] = useState(false);
  const [bank, setBank] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, String(deadline));
    } catch {
      /* Timer still works without storage. */
    }
    function updateCountdown() {
      const remainingSeconds = Math.ceil((deadline - Date.now()) / 1000);
      setSeconds(Math.max(0, remainingSeconds));
    }
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, storageKey]);
  if (!vehicle) return <VehicleNotFound />;
  if (payment) return <Navigate to={`/user/success/${vehicle.id}`} replace />;
  const expired = seconds === 0;
  const amount =
    vehicleTotal(vehicle, undefined, now).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' บาท';
  function handleDownloadQr() {
    const svg = document.getElementById('payment-qr');
    if (!svg) return;
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svg)], {
        type: 'image/svg+xml;charset=utf-8',
      }),
    );
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'auto-parking-demo-qr.svg';
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function handleRenewQr() {
    setDeadline(Date.now() + QR_LIFETIME);
    setBank('');
    setNotice('');
  }

  function handleOpenBanks() {
    setBank('');
    setBankOpen(true);
  }

  function handleCheckStatus() {
    if (expired) setNotice('QR หมดอายุแล้ว กรุณาสร้างรายการใหม่');
    else setNotice('ยังไม่พบการชำระเงินจากข้อมูลจำลอง');
  }

  async function handleConfirmPayment() {
    if (!vehicle) return;
    if (Date.now() >= deadline) {
      setSeconds(0);
      setBankOpen(false);
      return;
    }
    try {
      await pay(vehicle.id, deadline);
    } catch (error) {
      setNotice((error as Error).message);
    }
  }
  return (
    <>
      <PageHeader title="ชำระค่าจอด" backTo={`/user/vehicle/${vehicle.id}`} />
      <main className="user-page-content user-payment">
        <div className="payment-car">
          <small>รถที่จอด:</small>
          <strong>
            {vehicle.plate} · {vehicle.province}
          </strong>
        </div>
        <div className="user-payment-card">
          <p>ยอดที่ต้องชำระ</p>
          <strong className="user-payment-amount">{amount}</strong>
          <small>ผู้รับเงิน Auto Parking (จำลอง)</small>
          <div className={`user-qr-panel ${expired ? 'is-expired' : ''}`}>
            <DemoQr id="payment-qr" />
            <p className="user-qr-disclaimer">สำหรับสาธิต ไม่สามารถชำระเงินจริง</p>
            <div className="user-countdown" role="timer" aria-label="เวลาที่เหลือ">
              <Clock3 size={15} />
              {expired
                ? 'QR จำลองหมดอายุแล้ว'
                : `QR ใช้ได้อีก ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} นาที`}
            </div>
          </div>
        </div>
        {expired ? (
          <Button className="full-width" onClick={handleRenewQr}>
            <RotateCcw size={18} />
            สร้างรายการจำลองใหม่
          </Button>
        ) : (
          <Button className="full-width" onClick={handleOpenBanks}>
            เปิดแอปธนาคาร
          </Button>
        )}
        <Button variant="ghost" className="full-width payment-download" >
          {/* onClick={handleDownloadQr} */}
          {/* <Download size={16} /> */}
          บันทึกรูป QR
        </Button>
        <div className="user-payment-status">
          <Circle size={9} fill="currentColor" />
          <div>
            <strong>{expired ? 'รายการหมดอายุ' : 'รอชำระเงิน'}</strong>
            <small>
              {expired ? 'สร้าง QR ใหม่เพื่อชำระเงินจำลอง' : 'ชำระแล้ว กลับมาตรวจสอบที่นี่'}
            </small>
          </div>
        </div>
        {notice && (
          <p role="status" className="form-hint">
            {notice}
          </p>
        )}
        <Button variant="ghost" className="full-width check-payment" onClick={handleCheckStatus}>
          ตรวจสอบสถานะ
        </Button>
      </main>
      <Modal
        open={bankOpen}
        title={bank ? 'ชำระเงินจำลอง' : 'เลือกแอปธนาคาร'}
        className="bank-sheet"
        onClose={() => setBankOpen(false)}
      >
        <p className="bank-amount">ชำระค่าจอด {amount}</p>
        {bank ? (
          <div className="bank-confirm">
            <strong>{bank}</strong>
            <p>
              ขั้นตอนสาธิต: ตรวจสอบทะเบียน {vehicle.plate} และยอดชำระ
              แล้วกดยืนยันเพื่อบันทึกการชำระเงิน
            </p>
            <p className="form-hint">ไม่มีการเปิดแอปหรือหักเงินจริง</p>
            <Button className="full-width" onClick={handleConfirmPayment}>
              ยืนยันการชำระเงินจำลอง
            </Button>
            <Button variant="ghost" className="full-width" onClick={() => setBank('')}>
              กลับไปเลือกธนาคาร
            </Button>
          </div>
        ) : (
          <div className="bank-list">
            {[
              { name: 'K PLUS', detail: 'ธนาคารกสิกรไทย', icon: 'K', css: 'kbank' },
              { name: 'Krungthai NEXT', detail: 'ธนาคารกรุงไทย', icon: 'NEXT', css: 'ktb' },
            ].map((bankOption) => (
              <button key={bankOption.name} onClick={() => setBank(bankOption.name)}>
                <span className={`bank-icon ${bankOption.css}`}>{bankOption.icon}</span>
                <span>
                  <strong>{bankOption.name}</strong>
                  <small>{bankOption.detail}</small>
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        )}
        {!bank && (
          <Button variant="ghost" className="full-width">
             {/* onClick={handleDownloadQr} */}
            บันทึกรูป QR
          </Button>
        )}
      </Modal>
    </>
  );
}
