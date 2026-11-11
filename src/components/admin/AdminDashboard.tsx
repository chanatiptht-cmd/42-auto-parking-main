import React, { useState } from 'react';
import { ParkingSpot, ParkingTransaction, RateConfig, AuditLog } from '../../types';
import {
  DollarSign,
  TrendingUp,
  Settings,
  Car,
  Shield,
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  History,
  Sliders,
  Filter,
  Search,
  Save,
  RotateCcw,
} from 'lucide-react';

interface AdminDashboardProps {
  spots: ParkingSpot[];
  transactions: ParkingTransaction[];
  rates: RateConfig;
  logs: AuditLog[];
  onUpdateRates: (rates: Partial<RateConfig>) => void;
  onUpdateSpotStatus: (id: string, status: ParkingSpot['status']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  spots,
  transactions,
  rates,
  logs,
  onUpdateRates,
  onUpdateSpotStatus,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'rates' | 'spots' | 'transactions' | 'logs'
  >('overview');

  // Rate config form state
  const [editRates, setEditRates] = useState<RateConfig>(rates);
  const [rateSavedAlert, setRateSavedAlert] = useState(false);

  // Search & Filters
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'unpaid' | 'paid' | 'completed'>('all');
  const [selectedFloor, setSelectedFloor] = useState<'P1' | 'P2'>('P1');

  // Stats calculation
  const totalSpots = spots.length;
  const occupiedSpots = spots.filter((s) => s.status === 'occupied').length;
  const maintenanceSpots = spots.filter((s) => s.status === 'maintenance').length;
  const availableSpots = spots.filter((s) => s.status === 'available').length;
  const occupancyPercent = Math.round((occupiedSpots / (totalSpots - maintenanceSpots || 1)) * 100);

  // Revenue stats
  const totalRevenue = transactions
    .filter((t) => t.status === 'paid' || t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingRevenue = transactions
    .filter((t) => t.status === 'unpaid')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRates(editRates);
    setRateSavedAlert(true);
    setTimeout(() => setRateSavedAlert(false), 3000);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.plate.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.spotId.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(txSearch.toLowerCase());
    const matchFilter = txFilter === 'all' || t.status === txFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Persona Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/30">
            👨‍💼
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">คุณสมชาย (42 ปี)</h2>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                System Admin / Facility Manager
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Desktop Management Dashboard • ตั้งค่าราคา, จัดการ Layout ลานจอด, ปิดซ่อมบำรุง,
              และสรุปรายงาน
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>MockAPI Online</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            RBAC: Full Access
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>รายได้สะสมวันนี้</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ฿{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" /> 100% Cashless ThaiQR
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>อัตราครองช่องจอด (Occupancy)</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{occupancyPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            จอดแล้ว {occupiedSpots} จาก {totalSpots - maintenanceSpots} ช่อง
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ช่องจอดว่างพร้อมใช้</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {availableSpots} ช่อง
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ชั้น P1 ({spots.filter((s) => s.floor === 'P1' && s.status === 'available').length}) •
            ชั้น P2 ({spots.filter((s) => s.floor === 'P2' && s.status === 'available').length})
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ปิดซ่อมบำรุง (Maintenance)</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {maintenanceSpots} ช่อง
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Maintenance Mode Active</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>ภาพรวมและ Peak Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'rates'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>ตั้งค่าอัตราค่าจอด (Rate Rules)</span>
        </button>

        <button
          onClick={() => setActiveTab('spots')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'spots'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>จัดการช่องจอด & ปิดซ่อม</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติธุรกรรม (Transactions)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>ความหนาแน่นและ Peak Hours ตลอดทั้งวัน</span>
            </h3>

            {/* Hourly Peak Chart Visual */}
            <div className="space-y-3">
              {[
                {
                  time: '07:00 - 09:00',
                  label: 'ช่วงเช้าเร่งด่วน',
                  count: 18,
                  pct: 75,
                  peak: false,
                },
                {
                  time: '11:00 - 13:30',
                  label: 'ช่วงเที่ยงทานอาหาร (Peak 1)',
                  count: 23,
                  pct: 95,
                  peak: true,
                },
                { time: '14:00 - 17:00', label: 'ช่วงบ่ายทำงาน', count: 16, pct: 66, peak: false },
                {
                  time: '17:30 - 20:00',
                  label: 'ช่วงเย็นช้อปปิ้ง/กลับบ้าน (Peak 2)',
                  count: 24,
                  pct: 100,
                  peak: true,
                },
                { time: '20:30 - 23:00', label: 'ช่วงดึก', count: 7, pct: 29, peak: false },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      {item.time} • <span className="text-slate-400 font-normal">{item.label}</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${item.peak ? 'text-amber-400' : 'text-slate-400'}`}
                    >
                      {item.count} คัน ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.peak
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>
                สรุปช่วงเวลาที่ควรจัดเจ้าหน้าที่อำนวยความสะดวก: <strong>11:00-13:30</strong> และ{' '}
                <strong>17:30-20:00</strong>
              </span>
              <span className="text-cyan-400 font-medium">Auto-Analyzed by MockAPI</span>
            </div>
          </div>

          {/* Quick Rate Rules Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>เกณฑ์ราคาปัจจุบันที่ใช้งานอยู่</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400">ชั่วโมงฟรีแรก:</span>
                <span className="font-bold text-emerald-400">
                  {rates.firstHourFree} ชม. แรก (ฟรี)
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400">อัตราค่าบริการ:</span>
                <span className="font-bold text-white">{rates.hourlyRate} บาท / ชม.</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400">เพดานสูงสุดต่อวัน (Cap):</span>
                <span className="font-bold text-cyan-400">{rates.maxCap} บาท / วัน</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400">Grace Period ผ่อนผัน:</span>
                <span className="font-bold text-indigo-300">{rates.gracePeriodMinutes} นาที</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('rates')}
              className="w-full py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition-all text-center"
            >
              แก้ไขอัตราค่าบริการ (Change Rates)
            </button>
          </div>
        </div>
      )}

      {/* TAB: RATE RULES (ตั้งค่าราคา) */}
      {activeTab === 'rates' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                ตั้งค่าอัตราค่าจอดรถ (Rate Rules Management)
              </h3>
              <p className="text-xs text-slate-400">
                ปรับเกณฑ์ราคาได้ทันที โดยไม่ต้องรอทีมนักพัฒนา (ตอบโจทย์ Pain Point คุณสมชาย)
              </p>
            </div>
            <Settings className="w-6 h-6 text-indigo-400" />
          </div>

          {rateSavedAlert && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>บันทึกอัตราค่าจอดรถใหม่เรียบร้อยแล้ว! ระบบคำนวณเงินจะใช้เรทใหม่ทันที</span>
            </div>
          )}

          <form onSubmit={handleSaveRates} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  จำนวนชั่วโมงจอดฟรีแรก (ชั่วโมง)
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={editRates.firstHourFree}
                  onChange={(e) =>
                    setEditRates({ ...editRates, firstHourFree: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
                <span className="text-[11px] text-slate-500">
                  เช่น 0 (ไม่มีฟรี), 1 (ฟรี 1 ชม. แรก)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  อัตราค่าบริการรายชั่วโมง (บาท / ชม.)
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={editRates.hourlyRate}
                  onChange={(e) =>
                    setEditRates({ ...editRates, hourlyRate: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
                <span className="text-[11px] text-slate-500">
                  เศษของชั่วโมงคิดเป็น 1 ชั่วโมงเต็ม
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เพดานราคาสูงสุดต่อวัน (Max Cap ในบาท)
                </label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={editRates.maxCap}
                  onChange={(e) => setEditRates({ ...editRates, maxCap: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
                <span className="text-[11px] text-slate-500">
                  เพดานสูงสุดเพื่อจูงใจลูกค้าจอดทั้งวัน
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เวลาผ่อนผันนำรถออก (Grace Period นาที)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={editRates.gracePeriodMinutes}
                  onChange={(e) =>
                    setEditRates({ ...editRates, gracePeriodMinutes: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
                <span className="text-[11px] text-slate-500">ตามมาตรฐานระบบคือ 15 นาที</span>
              </div>
            </div>

            {/* Price Preview Simulation */}
            <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                ตัวอย่างการคิดราคาตามเรทใหม่นี้:
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-slate-400">จอด 45 นาที</div>
                  <div className="font-bold text-emerald-400">
                    ฿
                    {Math.min(
                      editRates.maxCap,
                      Math.max(0, 1 - editRates.firstHourFree) * editRates.hourlyRate,
                    )}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-slate-400">จอด 2 ชม. 15 น. (คิด 3 ชม.)</div>
                  <div className="font-bold text-cyan-400">
                    ฿
                    {Math.min(
                      editRates.maxCap,
                      Math.max(0, 3 - editRates.firstHourFree) * editRates.hourlyRate,
                    )}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-slate-400">จอดทั้งวัน (8 ชม.)</div>
                  <div className="font-bold text-amber-400">
                    ฿
                    {Math.min(
                      editRates.maxCap,
                      Math.max(0, 8 - editRates.firstHourFree) * editRates.hourlyRate,
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setEditRates(rates)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                คืนค่าเดิม
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่า (Save Rates)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: SPOTS & MAINTENANCE MODE */}
      {activeTab === 'spots' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                จัดการสถานะช่องจอด & ปิดซ่อมบำรุง (Maintenance Mode)
              </h3>
              <p className="text-xs text-slate-400">
                คลิกปุ่ม "ปิดซ่อม" เพื่อปิดช่องจอดชั่วคราว หรือคลิก "เปิดใช้งาน" เมื่อพร้อม
              </p>
            </div>

            {/* Floor Filter */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setSelectedFloor('P1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFloor === 'P1' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                ชั้น P1
              </button>
              <button
                onClick={() => setSelectedFloor('P2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFloor === 'P2' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                ชั้น P2
              </button>
            </div>
          </div>

          {/* Spots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {spots
              .filter((s) => s.floor === selectedFloor)
              .map((spot) => {
                const isAvailable = spot.status === 'available';
                const isOccupied = spot.status === 'occupied';
                const isMaint = spot.status === 'maintenance';

                return (
                  <div
                    key={spot.id}
                    className={`rounded-xl p-3 border flex flex-col justify-between h-32 ${
                      isAvailable
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : isOccupied
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-amber-950/20 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-white">{spot.id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isOccupied
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isAvailable ? 'ว่าง' : isOccupied ? 'มีรถ' : 'ปิดซ่อม'}
                      </span>
                    </div>

                    <div className="my-1 text-center">
                      {isOccupied && (
                        <div className="text-[11px] font-mono text-cyan-300 font-bold truncate">
                          {spot.currentPlate}
                        </div>
                      )}
                      {isMaint && (
                        <div className="text-[11px] text-amber-300 flex items-center justify-center space-x-1">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>ซ่อมเซนเซอร์</span>
                        </div>
                      )}
                      {isAvailable && (
                        <div className="text-[11px] text-emerald-400">พร้อมใช้งาน</div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-1 border-t border-slate-800">
                      {isMaint ? (
                        <button
                          onClick={() => onUpdateSpotStatus(spot.id, 'available')}
                          className="w-full py-1 text-[10px] font-bold bg-emerald-600/80 hover:bg-emerald-600 text-white rounded transition-all"
                        >
                          เปิดใช้งาน
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateSpotStatus(spot.id, 'maintenance')}
                          className="w-full py-1 text-[10px] font-bold bg-amber-600/80 hover:bg-amber-600 text-white rounded transition-all"
                        >
                          ปิดซ่อมบำรุง
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB: TRANSACTIONS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                บันทึกธุรกรรมทั้งหมด (Transaction History)
              </h3>
              <p className="text-xs text-slate-400">ตรวจสอบประวัติย้อนหลังและข้อมูลการชำระเงิน</p>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาทะเบียน..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={txFilter}
                onChange={(e) => setTxFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="unpaid">ยังไม่ชำระ</option>
                <option value="paid">ชำระแล้ว (ในลาน)</option>
                <option value="completed">ออกจากลานแล้ว</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">รหัส Transaction</th>
                  <th className="p-3">ป้ายทะเบียน</th>
                  <th className="p-3">ช่องจอด</th>
                  <th className="p-3">เวลาเข้า</th>
                  <th className="p-3">เวลาออก</th>
                  <th className="p-3">ระยะเวลา</th>
                  <th className="p-3">ยอดเงิน</th>
                  <th className="p-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{tx.id}</td>
                    <td className="p-3 font-mono font-bold text-white">
                      {tx.plate}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal">
                        {tx.vehicleModel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-cyan-400">
                      {tx.spotId} ({tx.floor})
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(tx.entryTime).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {tx.exitTime
                        ? new Date(tx.exitTime).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="p-3 font-mono">
                      {Math.floor(tx.durationMinutes / 60)}ชม. {tx.durationMinutes % 60}น.
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      ฿{tx.amount.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'completed'
                            ? 'bg-slate-800 text-slate-300'
                            : tx.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.status === 'completed'
                          ? 'เสร็จสิ้น'
                          : tx.status === 'paid'
                            ? 'ชำระแล้ว'
                            : 'ยังไม่ชำระ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                บันทึกเหตุการณ์ Audit Trail ทั้งหมด
              </h3>
              <p className="text-xs text-slate-400">
                เก็บบันทึกการเปิดไม้กั้นฉุกเฉิน, เปลี่ยนราคา, เข้า-ออก และระบบการเงิน
              </p>
            </div>
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="flex items-start space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                      log.type === 'danger'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : log.type === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : log.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {log.action}
                  </span>
                  <div>
                    <div className="text-white font-medium">{log.details}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      โดย: <span className="text-slate-300 font-semibold">{log.actorName}</span> (
                      {log.actorRole})
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('th-TH')} น.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
