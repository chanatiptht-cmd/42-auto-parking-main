import React, { useState } from 'react';
import { ParkingSpot, ParkingTransaction, GateState, AuditLog } from '../../types';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  AlertOctagon,
  Car,
  Unlock,
  Lock,
  Camera,
  ArrowUpRight,
  Clock,
  Sparkles,
  PhoneCall,
  X,
} from 'lucide-react';

interface GuardViewProps {
  spots: ParkingSpot[];
  transactions: ParkingTransaction[];
  gateState: GateState;
  logs: AuditLog[];
  onManualGateToggle: (gate: 'entry' | 'exit', state: boolean, reason?: string) => void;
  onExitVehicle: (plate: string, overrideReason?: string) => void;
}

export const GuardView: React.FC<GuardViewProps> = ({
  spots,
  transactions,
  gateState,
  logs,
  onManualGateToggle,
  onExitVehicle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideTargetGate, setOverrideTargetGate] = useState<'entry' | 'exit'>('exit');
  const [overrideReason, setOverrideReason] = useState('กล้อง LPR อ่านป้ายไม่ชัดเจน');
  const [customReason, setCustomReason] = useState('');

  // Active parked cars
  const activeCars = transactions.filter((t) => t.status !== 'completed');

  // Quick search match
  const searchResults = searchQuery
    ? activeCars.filter((c) =>
        c.plate.toLowerCase().includes(searchQuery.toLowerCase().replace(/\s+/g, '')),
      )
    : [];

  const handleConfirmOverride = () => {
    const finalReason = customReason.trim() ? customReason : overrideReason;
    onManualGateToggle(overrideTargetGate, true, finalReason);
    setOverrideModalOpen(false);
    setCustomReason('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Guard Persona Banner - High contrast & large touch friendly */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-amber-400/40">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-white/80 flex items-center justify-center font-bold text-3xl shadow-inner">
            👮‍♂️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black tracking-tight">พี่เดช (48 ปี)</h2>
              <span className="text-xs bg-black/40 text-amber-200 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Guard Mode UI
              </span>
            </div>
            <p className="text-sm text-amber-100 font-medium mt-0.5">
              Field Security Officer • หน้าจอขนาดใหญ่ อ่านง่ายกลางแดด ควบคุมไม้กั้นฉุกเฉิน
            </p>
          </div>
        </div>

        {/* Emergency Override Master Button */}
        <button
          onClick={() => {
            setOverrideTargetGate('exit');
            setOverrideModalOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-3 border-2 border-white/80 transition-transform cursor-pointer"
        >
          <ShieldAlert className="w-6 h-6 animate-bounce" />
          <span className="tracking-wide">กดเปิดไม้กั้นฉุกเฉิน (OVERRIDE)</span>
        </button>
      </div>

      {/* Barrier Gate Live Status Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Entry Barrier Gate */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-black text-white">ไม้กั้นทางเข้า (Entry Gate 01)</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                gateState.entryGateOpen
                  ? 'bg-emerald-500 text-slate-950 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {gateState.entryGateOpen ? '● ไม้กั้นเปิด (OPEN)' : '■ ไม้กั้นปิด (CLOSED)'}
            </span>
          </div>

          {/* Animated Barrier Graphic */}
          <div className="h-32 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative flex items-center justify-between overflow-hidden">
            {/* Barrier Gate Post */}
            <div className="w-12 h-20 bg-amber-500 rounded-lg border-2 border-amber-300 flex flex-col items-center justify-center shadow-lg z-10">
              <div className="w-3 h-3 rounded-full bg-white mb-2" />
              <div className="text-[9px] font-black text-slate-950">GATE</div>
            </div>

            {/* Barrier Arm */}
            <div
              className={`h-4 bg-gradient-to-r from-red-600 via-white to-red-600 rounded-r-full shadow-lg border border-slate-400 absolute left-14 transition-transform duration-700 origin-left ${
                gateState.entryGateOpen ? '-rotate-65 translate-y-[-20px]' : 'rotate-0 w-52'
              }`}
              style={{ width: gateState.entryGateOpen ? '180px' : '220px' }}
            />

            {/* Car simulation */}
            <div className="ml-auto z-10 text-right">
              <span className="text-[10px] text-slate-400 block">รถคันล่าสุดที่สแกน:</span>
              <span className="text-base font-black font-mono text-cyan-300">
                {gateState.lastEntryPlate || 'ไม่มี'}
              </span>
            </div>
          </div>

          {/* Gate Controls */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => onManualGateToggle('entry', true, 'รปภ. กดเปิดทางเข้า')}
              disabled={gateState.entryGateOpen}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>สั่งยกไม้กั้นทางเข้า</span>
            </button>
            <button
              onClick={() => onManualGateToggle('entry', false)}
              disabled={!gateState.entryGateOpen}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition-all active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>สั่งปิดไม้กั้น</span>
            </button>
          </div>
        </div>

        {/* Exit Barrier Gate */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white">ไม้กั้นทางออก (Exit Gate 01)</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                gateState.exitGateOpen
                  ? 'bg-emerald-500 text-slate-950 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {gateState.exitGateOpen ? '● ไม้กั้นเปิด (OPEN)' : '■ ไม้กั้นปิด (CLOSED)'}
            </span>
          </div>

          {/* Animated Barrier Graphic */}
          <div className="h-32 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative flex items-center justify-between overflow-hidden">
            {/* Barrier Gate Post */}
            <div className="w-12 h-20 bg-amber-500 rounded-lg border-2 border-amber-300 flex flex-col items-center justify-center shadow-lg z-10">
              <div className="w-3 h-3 rounded-full bg-white mb-2" />
              <div className="text-[9px] font-black text-slate-950">EXIT</div>
            </div>

            {/* Barrier Arm */}
            <div
              className={`h-4 bg-gradient-to-r from-red-600 via-white to-red-600 rounded-r-full shadow-lg border border-slate-400 absolute left-14 transition-transform duration-700 origin-left ${
                gateState.exitGateOpen ? '-rotate-65 translate-y-[-20px]' : 'rotate-0'
              }`}
              style={{ width: gateState.exitGateOpen ? '180px' : '220px' }}
            />

            {/* Car simulation */}
            <div className="ml-auto z-10 text-right">
              <span className="text-[10px] text-slate-400 block">รถคันล่าสุดที่ออก:</span>
              <span className="text-base font-black font-mono text-emerald-300">
                {gateState.lastExitPlate || 'ไม่มี'}
              </span>
            </div>
          </div>

          {/* Gate Controls */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => onManualGateToggle('exit', true, 'รปภ. กดเปิดทางออก')}
              disabled={gateState.exitGateOpen}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>สั่งยกไม้กั้นทางออก</span>
            </button>
            <button
              onClick={() => onManualGateToggle('exit', false)}
              disabled={!gateState.exitGateOpen}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition-all active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>สั่งปิดไม้กั้น</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guard Quick-Search: Extra Large Buttons & Big Text */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center space-x-2">
            <Search className="w-6 h-6 text-amber-400" />
            <span>ค้นหาทะเบียนรถด่วน (Guard Quick-Search)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ใช้เมื่อกล้อง LPR อ่านป้ายไม่ชัดเจน หรือลูกค้าลืมช่องจอด / ขอความช่วยเหลือหน้างาน
          </p>
        </div>

        {/* Big Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="พิมพ์เลขทะเบียนรถ (เช่น 1กข1234, 2ขค5678, กท9999)..."
            className="w-full bg-slate-950 border-2 border-amber-500/50 rounded-2xl py-4 pl-12 pr-4 text-white text-lg font-mono placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
          />
          <Search className="w-6 h-6 text-amber-400 absolute left-4 top-4.5" />
        </div>

        {/* Quick Suggestion buttons for Guard */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400">
            รถที่จอดอยู่ในลานตอนนี้ ({activeCars.length} คัน):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {activeCars.map((car) => (
              <button
                key={car.id}
                onClick={() => setSearchQuery(car.plate)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  searchQuery === car.plate
                    ? 'bg-amber-500 text-slate-950 border-white font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-white border-slate-800'
                }`}
              >
                <div className="font-mono font-bold text-sm">{car.plate}</div>
                <div className="text-[11px] opacity-80 truncate">{car.vehicleModel}</div>
                <div className="flex justify-between items-center text-[10px] mt-1">
                  <span className="font-mono text-cyan-300 font-bold">{car.spotId}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      car.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {car.status === 'paid' ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Result Action Card */}
        {searchResults.length > 0 && (
          <div className="mt-4 p-4 bg-slate-950 rounded-2xl border-2 border-amber-500/60 space-y-3">
            <h4 className="text-sm font-bold text-amber-300">
              ผลการค้นหา ({searchResults.length} คัน):
            </h4>
            {searchResults.map((car) => (
              <div
                key={car.id}
                className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black font-mono text-white">{car.plate}</span>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {car.province}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        car.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {car.status === 'paid'
                        ? 'ชำระเงินแล้ว (ใน Grace Period)'
                        : `ค้างชำระ ฿${car.amount}`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    ช่องจอด:{' '}
                    <strong className="text-cyan-400 font-mono">
                      {car.spotId} ({car.floor})
                    </strong>{' '}
                    • เวลาเข้า: {new Date(car.entryTime).toLocaleTimeString('th-TH')} • รุ่นรถ:{' '}
                    {car.vehicleModel}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onExitVehicle(car.plate, 'รปภ. ช่วยปล่อยรถออก');
                      alert(`ปล่อยรถทะเบียน ${car.plate} ออกจากลานจอดเรียบร้อยแล้ว!`);
                      setSearchQuery('');
                    }}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ปล่อยรถผ่านทางออก (Force Exit)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setOverrideModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <AlertOctagon className="w-8 h-8 animate-pulse" />
              <div>
                <h3 className="text-lg font-black text-white">
                  ยืนยันการเปิดไม้กั้นฉุกเฉิน (Emergency Override)
                </h3>
                <p className="text-xs text-red-300">
                  ระบบจะทำการบันทึกประวัติ Audit Trail เพื่อความโปร่งใส
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  เลือกไม้กั้นที่ต้องการสั่งเปิด:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideTargetGate('entry')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      overrideTargetGate === 'entry'
                        ? 'bg-red-600 text-white border-white'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ไม้กั้นทางเข้า (Entry Gate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideTargetGate('exit')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      overrideTargetGate === 'exit'
                        ? 'bg-red-600 text-white border-white'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ไม้กั้นทางออก (Exit Gate)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ระบุเหตุผลในการเปิดไม้กั้นฉุกเฉิน (บังคับ):
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs font-medium focus:ring-2 focus:ring-red-500"
                >
                  <option value="กล้อง LPR อ่านป้ายไม่ชัดเจน">กล้อง LPR อ่านป้ายไม่ชัดเจน</option>
                  <option value="รถพยาบาล / กู้ภัยฉุกเฉิน (Emergency Vehicle)">
                    รถพยาบาล / กู้ภัยฉุกเฉิน (Emergency Vehicle)
                  </option>
                  <option value="ระบบเน็ตเวิร์กธนาคารขัดข้อง ชำระเงินสดหน้าร้าน">
                    ระบบเน็ตเวิร์กธนาคารขัดข้อง ชำระเงินสดหน้าร้าน
                  </option>
                  <option value="ผู้ขับขี่มีเหตุจำเป็นเร่งด่วน / อุบัติเหตุ">
                    ผู้ขับขี่มีเหตุจำเป็นเร่งด่วน / อุบัติเหตุ
                  </option>
                  <option value="อื่นๆ (ระบุเพิ่มเติมด้านล่าง)">
                    อื่นๆ (ระบุเพิ่มเติมด้านล่าง)
                  </option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs placeholder-slate-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOverride}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/30 flex items-center space-x-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>บันทึกและเปิดไม้กั้นทันที</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
