import React, { useState } from 'react';
import { ParkingSpot, ParkingTransaction, RateConfig } from '../../types';
import { ThaiQRCode } from './ThaiQRCode';
import { GracePeriodTimer } from './GracePeriodTimer';
import {
  Car,
  Search,
  Clock,
  CreditCard,
  MapPin,
  CheckCircle2,
  Sparkles,
  Zap,
  Accessibility,
  Heart,
  Smartphone,
  Monitor,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerViewProps {
  spots: ParkingSpot[];
  transactions: ParkingTransaction[];
  rates: RateConfig;
  onPay: (txId: string) => void;
  onExitVehicle: (plate: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  spots,
  transactions,
  rates,
  onPay,
  onExitVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'pay' | 'grace'>('spots');
  const [selectedFloor, setSelectedFloor] = useState<'P1' | 'P2'>('P1');
  const [searchPlate, setSearchPlate] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<ParkingTransaction | null>(null);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(true);
  const [isPaying, setIsPaying] = useState<boolean>(false);

  // Filtered spots for current floor
  const floorSpots = spots.filter((s) => s.floor === selectedFloor);
  const availableCount = floorSpots.filter((s) => s.status === 'available').length;
  const occupiedCount = floorSpots.filter((s) => s.status === 'occupied').length;
  const maintenanceCount = floorSpots.filter((s) => s.status === 'maintenance').length;

  // Active parked cars for quick search recommendations
  const activeTransactions = transactions.filter((t) => t.status !== 'completed');

  // Handle Search
  const handleSearch = (plateQuery: string) => {
    setSearchPlate(plateQuery);
    const clean = plateQuery.replace(/\s+/g, '').toLowerCase();
    const found = activeTransactions.find(
      (t) => t.plate.replace(/\s+/g, '').toLowerCase() === clean,
    );
    if (found) {
      setSelectedTx(found);
      if (found.status === 'paid' && found.gracePeriodExpiresAt) {
        setActiveTab('grace');
      } else {
        setActiveTab('pay');
      }
    } else {
      setSelectedTx(null);
    }
  };

  // Handle Pay Click
  const handlePaymentConfirm = () => {
    if (!selectedTx) return;
    setIsPaying(true);

    setTimeout(() => {
      onPay(selectedTx.id);
      setIsPaying(false);

      // Trigger Confetti effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Switch to Grace Period tab
      const updatedTx = transactions.find((t) => t.id === selectedTx.id);
      if (updatedTx) {
        setSelectedTx(updatedTx);
      }
      setActiveTab('grace');
    }, 1000);
  };

  const currentGraceTx =
    selectedTx && selectedTx.status === 'paid' && selectedTx.gracePeriodExpiresAt
      ? selectedTx
      : activeTransactions.find((t) => t.status === 'paid' && t.gracePeriodExpiresAt);

  const renderContent = () => (
    <div className="space-y-5">
      {/* Persona Header Card */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-md ring-2 ring-blue-400/30">
            👩‍💼
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">คุณณิชา (28 ปี)</h2>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 font-semibold px-2 py-0.5 rounded-full border border-pink-500/30">
                Customer / Driver
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Senior Marketing • สแกน QR เช็กช่องว่าง & ชำระเงินไร้เงินสด 100%
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <button
          onClick={() => setIsMobileMode(!isMobileMode)}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
          title="สลับโหมดมุมมอง"
        >
          {isMobileMode ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>โหมดจอใหญ่</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-pink-400" />
              <span>โหมดมือถือ (Mobile-First)</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('spots')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'spots'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>เช็กช่องว่าง</span>
        </button>

        <button
          onClick={() => setActiveTab('pay')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'pay'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>สแกนจ่าย ThaiQR</span>
        </button>

        <button
          onClick={() => setActiveTab('grace')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all relative ${
            activeTab === 'grace'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>เวลาผ่อนผัน</span>
          {currentGraceTx && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-2" />
          )}
        </button>
      </div>

      {/* TAB 1: SPOT CHECK */}
      {activeTab === 'spots' && (
        <div className="space-y-4">
          {/* Floor & Stats Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">เลือกระดับชั้น:</span>
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                  <button
                    onClick={() => setSelectedFloor('P1')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      selectedFloor === 'P1'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ชั้น P1 (A01 - A12)
                  </button>
                  <button
                    onClick={() => setSelectedFloor('P2')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      selectedFloor === 'P2'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ชั้น P2 (B01 - B12)
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">สถานะ: </span>
                <span className="text-xs font-bold text-emerald-400">
                  ว่าง {availableCount} / {floorSpots.length}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                <div className="text-lg font-black text-emerald-400">{availableCount}</div>
                <div className="text-[10px] text-emerald-300 font-medium">ช่องว่างพร้อมจอด</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
                <div className="text-lg font-black text-rose-400">{occupiedCount}</div>
                <div className="text-[10px] text-rose-300 font-medium">มีรถจอดอยู่</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2">
                <div className="text-lg font-black text-amber-400">{maintenanceCount}</div>
                <div className="text-[10px] text-amber-300 font-medium">ปิดปรับปรุง</div>
              </div>
            </div>
          </div>

          {/* Interactive 2D Parking Floor Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>แผนผังช่องจอด Real-time ({selectedFloor})</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>ว่าง</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>ไม่ว่าง</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>ปิดซ่อม</span>
                </span>
              </div>
            </div>

            {/* Parking Lane Visual */}
            <div className="border border-slate-700/60 rounded-xl p-3 bg-slate-950/60">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {floorSpots.map((spot) => {
                  const isAvailable = spot.status === 'available';
                  const isOccupied = spot.status === 'occupied';
                  const isMaint = spot.status === 'maintenance';

                  return (
                    <div
                      key={spot.id}
                      className={`relative rounded-xl p-3 border transition-all flex flex-col justify-between h-24 ${
                        isAvailable
                          ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.02] shadow-sm shadow-emerald-500/10'
                          : isOccupied
                            ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                            : 'bg-amber-950/20 border-amber-500/30 opacity-70'
                      }`}
                    >
                      {/* Top bar with ID & Type Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black font-mono tracking-wider text-white">
                          {spot.id}
                        </span>
                        {spot.type === 'ev' && (
                          <span title="จุดชาร์จ EV">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          </span>
                        )}
                        {spot.type === 'lady' && (
                          <span title="Lady Parking">
                            <Heart className="w-3.5 h-3.5 text-pink-400" />
                          </span>
                        )}
                        {spot.type === 'disabled' && (
                          <span title="ผู้พิการ">
                            <Accessibility className="w-3.5 h-3.5 text-blue-400" />
                          </span>
                        )}
                      </div>

                      {/* Middle icon or Plate */}
                      <div className="text-center my-auto">
                        {isAvailable && (
                          <div className="text-emerald-400 flex flex-col items-center">
                            <span className="text-xs font-bold">ว่าง</span>
                            <span className="text-[9px] text-emerald-500/90 font-mono">
                              AVAILABLE
                            </span>
                          </div>
                        )}
                        {isOccupied && (
                          <div className="text-rose-400 flex flex-col items-center">
                            <Car className="w-5 h-5 text-rose-400 animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-rose-500/30 mt-0.5">
                              {spot.currentPlate || 'มีรถจอด'}
                            </span>
                          </div>
                        )}
                        {isMaint && (
                          <div className="text-amber-400 text-[10px] font-medium">ปิดซ่อมบำรุง</div>
                        )}
                      </div>

                      {/* Floor Indicator Pill */}
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span>{spot.floor}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAvailable
                              ? 'bg-emerald-400'
                              : isOccupied
                                ? 'bg-rose-400'
                                : 'bg-amber-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driving Road Marker */}
              <div className="mt-3 pt-2 border-t border-dashed border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>◀ เลนขับรถเข้า</span>
                <span className="tracking-widest font-mono text-[10px]">
                  DRIVEWAY • FLOOR {selectedFloor}
                </span>
                <span>ทางออก ▶</span>
              </div>
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
            <h4 className="font-bold text-white mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ขั้นตอนง่ายๆ ในการใช้งาน</span>
            </h4>
            <div className="space-y-1.5 text-slate-400">
              <p>1. สแกน QR หน้าทางเข้าหรือเสาอาคารเพื่อตรวจสอบช่องจอดว่าง Real-time</p>
              <p>
                2. เมื่อต้องการนำรถออก ไปที่แท็บ <strong>สแกนจ่าย ThaiQR</strong> ค้นหาป้ายทะเบียน
              </p>
              <p>3. ชำระเงินผ่าน Mobile Banking และนำรถออกได้ทันทีภายใน Grace Period 15 นาที</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCAN & PAY (ค้นหาทะเบียน & สแกนจ่าย) */}
      {activeTab === 'pay' && (
        <div className="space-y-4">
          {/* Plate Search Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ค้นหาป้ายทะเบียนรถเพื่อชำระเงิน
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="เช่น 1กข1234, 2ขค5678, กท9999"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm tracking-wide"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mt-3">
              <div className="text-[11px] text-slate-400 mb-1.5">
                รถที่จอดอยู่ในระบบ (กดเพื่อทดสอบ):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeTransactions.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSearch(t.plate)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                      searchPlate === t.plate
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {t.plate} ({t.status === 'paid' ? 'จ่ายแล้ว' : `${t.amount}฿`})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Result or Selected Ticket */}
          {selectedTx ? (
            <div className="space-y-4">
              {/* Parking details summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400">ป้ายทะเบียน</span>
                    <h3 className="text-xl font-black text-white font-mono tracking-wider">
                      {selectedTx.plate}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedTx.vehicleModel} • {selectedTx.province}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">ช่องจอด</span>
                    <div className="text-lg font-black text-cyan-400 font-mono">
                      {selectedTx.spotId} (ชั้น {selectedTx.floor})
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">เวลาเข้าจอด:</span>
                    <div className="font-mono text-slate-200">
                      {new Date(selectedTx.entryTime).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      น.
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">รวมระยะเวลา:</span>
                    <div className="font-mono font-bold text-cyan-300">
                      {Math.floor(selectedTx.durationMinutes / 60)} ชม.{' '}
                      {selectedTx.durationMinutes % 60} นาที
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">สิทธิ์จอดฟรี:</span>
                    <div className="text-emerald-400 font-medium">
                      ฟรี {rates.firstHourFree} ชั่วโมงแรก
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">อัตราค่าบริการ:</span>
                    <div className="text-slate-200">
                      {rates.hourlyRate} บ./ชม. (สูงสุด {rates.maxCap} บ.)
                    </div>
                  </div>
                </div>

                {/* Amount to pay */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-bold text-slate-300">ยอดที่ต้องชำระ:</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-cyan-400 font-mono">
                      {selectedTx.amount.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 ml-1">บาท</span>
                  </div>
                </div>
              </div>

              {/* If already paid */}
              {selectedTx.status === 'paid' ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white text-base">ชำระเงินเรียบร้อยแล้ว</h4>
                  <p className="text-xs text-emerald-300 mt-1">
                    ระบบได้เปิดเวลานับถอยหลัง Grace Period 15 นาที สำหรับนำรถออก
                  </p>
                  <button
                    onClick={() => setActiveTab('grace')}
                    className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center space-x-1.5 shadow-md"
                  >
                    <span>ดูนาฬิกานับถอยหลัง Grace Period</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Dynamic Thai QR Payment UI */
                <div className="space-y-4">
                  <ThaiQRCode
                    amount={selectedTx.amount}
                    plate={selectedTx.plate}
                    refCode={selectedTx.paymentRef}
                  />

                  {/* Simulate Mobile Banking Pay Button */}
                  <button
                    onClick={handlePaymentConfirm}
                    disabled={isPaying}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isPaying ? (
                      <span>กำลังประมวลผลการชำระเงิน...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-200" />
                        <span>
                          จำลองยืนยันการโอนเงินสำเร็จ (
                          {selectedTx.amount === 0 ? 'จอดฟรียืนยันออก' : `${selectedTx.amount} บาท`}
                          )
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">
                พิมพ์เลขทะเบียน หรือเลือกป้ายด้านบน
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ระบบจะคำนวณยอดเงินและสร้าง ThaiQR Dynamic อัตโนมัติ
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GRACE PERIOD (เวลาผ่อนผัน 15 นาที) */}
      {activeTab === 'grace' && (
        <div className="space-y-4">
          {currentGraceTx && currentGraceTx.gracePeriodExpiresAt ? (
            <GracePeriodTimer
              graceExpiresAt={currentGraceTx.gracePeriodExpiresAt}
              plate={currentGraceTx.plate}
              onExitSimulated={() => {
                onExitVehicle(currentGraceTx.plate);
                alert(`รถทะเบียน ${currentGraceTx.plate} ขับถึงทางออกแล้ว ไม้กั้นเปิดอัตโนมัติ!`);
                setActiveTab('spots');
              }}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500/80 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">
                ยังไม่มีรายการที่อยู่ใน Grace Period
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                หลังจากคุณสแกนจ่ายเงินสำเร็จ ระบบจะเริ่มนับถอยหลัง 15 นาทีโดยอัตโนมัติ
              </p>
              <button
                onClick={() => {
                  setActiveTab('pay');
                  if (activeTransactions.length > 0) {
                    handleSearch(activeTransactions[0].plate);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                ไปที่หน้าสแกนจ่ายค่าจอด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {isMobileMode ? (
        /* Mobile Device Frame Mockup */
        <div className="max-w-md mx-auto bg-slate-950 p-2 sm:p-4 rounded-[40px] border-4 border-slate-700 shadow-2xl ring-1 ring-slate-800 relative">
          {/* Phone Top Notch */}
          <div className="flex justify-center mb-2">
            <div className="w-28 h-4 bg-slate-800 rounded-full flex items-center justify-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-3 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
          {renderContent()}
        </div>
      ) : (
        /* Full Desktop View */
        <div className="max-w-4xl mx-auto">{renderContent()}</div>
      )}
    </div>
  );
};
