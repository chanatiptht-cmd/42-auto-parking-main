import React, { useState } from 'react';
import { ParkingSpot, ParkingTransaction, GateState } from '../types';
import {
  Camera,
  Car,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spots: ParkingSpot[];
  transactions: ParkingTransaction[];
  gateState: GateState;
  onRegisterEntry: (plate: string, province: string, model: string, floor: 'P1' | 'P2') => void;
  onExitVehicle: (plate: string) => void;
  onPay: (txId: string) => void;
  onResetData: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  spots,
  transactions,
  gateState,
  onRegisterEntry,
  onExitVehicle,
  onPay,
  onResetData,
}) => {
  const [entryPlate, setEntryPlate] = useState('7ฮฮ3344');
  const [entryProvince, setEntryProvince] = useState('กรุงเทพมหานคร');
  const [entryModel, setEntryModel] = useState('Honda CR-V (สีดำ)');
  const [entryFloor, setEntryFloor] = useState<'P1' | 'P2'>('P1');
  const [exitSelectedPlate, setExitSelectedPlate] = useState('');
  const [simMessage, setSimMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const parkedCars = transactions.filter((t) => t.status !== 'completed');

  const handleSimulateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryPlate) return;

    onRegisterEntry(entryPlate, entryProvince, entryModel, entryFloor);
    setSimMessage(
      `✅ รถทะเบียน ${entryPlate} ผ่านกล้อง LPR เข้าสู่ลานจอดเรียบร้อย ไม้กั้นเปิดและปิดอัตโนมัติ!`,
    );
    setTimeout(() => setSimMessage(null), 4000);
  };

  const handleSimulateExit = () => {
    if (!exitSelectedPlate) return;
    const target = parkedCars.find((c) => c.plate === exitSelectedPlate);
    if (!target) return;

    if (target.status !== 'paid') {
      alert(
        `⚠️ รถทะเบียน ${target.plate} ยังไม่ได้ชำระเงิน (ค้างชำระ ${target.amount} บาท) ไม้กั้นทางออกจะยังไม่เปิด! กรุณาชำระเงินผ่าน ThaiQR ก่อน หรือให้ รปภ. กด Emergency Override`,
      );
      return;
    }

    onExitVehicle(exitSelectedPlate);
    setSimMessage(
      `🎉 รถทะเบียน ${exitSelectedPlate} ตรวจพบสถานะชำระเงินแล้ว ไม้กั้นทางออกเปิดอัตโนมัติ รถเดินทางออกจากลานจอดสำเร็จ!`,
    );
    setTimeout(() => setSimMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center space-x-2">
              <span>Interactive Hardware & LPR Simulator</span>
              <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                Defense Tool
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              เครื่องมือจำลองกล้องอ่านป้ายทะเบียน (LPR) และสัญญาณเปิด-ปิดไม้กั้นสำหรับนำเสนออาจารย์
            </p>
          </div>
        </div>

        {simMessage && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold animate-pulse">
            {simMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* SIMULATOR 1: VEHICLE ENTRY */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                <Car className="w-4 h-4" />
                <span>1. จำลองรถขับเข้า (Vehicle Entry & Camera LPR)</span>
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                Entry Gate 01
              </span>
            </div>

            <form onSubmit={handleSimulateEntry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">ป้ายทะเบียนรถ:</label>
                  <input
                    type="text"
                    value={entryPlate}
                    onChange={(e) => setEntryPlate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                    placeholder="เช่น 1กข1234"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">รุ่นรถและสี:</label>
                  <input
                    type="text"
                    value={entryModel}
                    onChange={(e) => setEntryModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="เช่น Toyota Yaris"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">เลือกชั้น:</span>
                  <select
                    value={entryFloor}
                    onChange={(e) => setEntryFloor(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="P1">ชั้น P1</option>
                    <option value="P2">ชั้น P2</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>จำลองรถเข้า (สแกนป้าย & เปิดไม้กั้น)</span>
                </button>
              </div>
            </form>
          </div>

          {/* SIMULATOR 2: VEHICLE EXIT */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <Car className="w-4 h-4" />
                <span>2. จำลองรถขับถึงทางออก (Vehicle Exit Verification)</span>
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                Exit Gate 01
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">เลือกรถที่ต้องการขับออก:</label>
                <select
                  value={exitSelectedPlate}
                  onChange={(e) => setExitSelectedPlate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs"
                >
                  <option value="">-- เลือกรถที่จอดอยู่ในระบบ ({parkedCars.length} คัน) --</option>
                  {parkedCars.map((c) => (
                    <option key={c.id} value={c.plate}>
                      {c.plate} ({c.vehicleModel}) - สถานะ:{' '}
                      {c.status === 'paid'
                        ? 'ชำระเงินแล้ว (พร้อมออก)'
                        : `ยังไม่จ่าย (฿${c.amount})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                {exitSelectedPlate && (
                  <button
                    type="button"
                    onClick={() => {
                      const t = parkedCars.find((c) => c.plate === exitSelectedPlate);
                      if (t) onPay(t.id);
                    }}
                    className="py-2 px-3 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                  >
                    กดชำระเงินให้คันนี้ทันที
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSimulateExit}
                  disabled={!exitSelectedPlate}
                  className="ml-auto py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>จำลองรถออก (ตรวจสถานะชำระ & ยกไม้กั้น)</span>
                </button>
              </div>
            </div>
          </div>

          {/* RESET DATA */}
          <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-800">
            <span className="text-slate-500">
              สถานะไม้กั้น: ทางเข้า {gateState.entryGateOpen ? '🟢 เปิด' : '🔴 ปิด'} | ทางออก{' '}
              {gateState.exitGateOpen ? '🟢 เปิด' : '🔴 ปิด'}
            </span>
            <button
              onClick={() => {
                if (confirm('ต้องการรีเซ็ตข้อมูล MockAPI กลับสู่ค่าเริ่มต้นหรือไม่?')) {
                  onResetData();
                  alert('รีเซ็ตข้อมูลสำเร็จ!');
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูลตัวอย่าง (Reset Demo Data)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
