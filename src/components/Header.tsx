import React from 'react';
import { Role } from '../types';
import {
  Car,
  Shield,
  Sliders,
  DollarSign,
  Smartphone,
  Cpu,
  BookOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onOpenSimulator: () => void;
  onOpenGuide: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  onOpenSimulator,
  onOpenGuide,
  onResetData,
}) => {
  const roles: {
    id: Role;
    label: string;
    name: string;
    age: string;
    roleDesc: string;
    icon: string;
    color: string;
  }[] = [
    {
      id: 'customer',
      label: 'Customer / Driver',
      name: 'คุณณิชา',
      age: '28 ปี',
      roleDesc: 'Mobile Web (Scan & Pay)',
      icon: '👩‍💼',
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/40 text-pink-300',
    },
    {
      id: 'admin',
      label: 'System Admin',
      name: 'คุณสมชาย',
      age: '42 ปี',
      roleDesc: 'Desktop Control & Rates',
      icon: '👨‍💼',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-300',
    },
    {
      id: 'guard',
      label: 'Security Guard',
      name: 'พี่เดช',
      age: '48 ปี',
      roleDesc: 'Guard Mode UI & Override',
      icon: '👮‍♂️',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
    },
    {
      id: 'executive',
      label: 'Executive Owner',
      name: 'ผู้จัดการ/เจ้าของ',
      age: 'เจ้าของ',
      roleDesc: '100% Cashless & ROI',
      icon: '👑',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar: Brand & Action tools */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black text-white tracking-tight flex items-center space-x-1.5">
                  <span>AUTO PARKING</span>
                  <span className="text-cyan-400 font-mono text-xs bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 rounded">
                    PRO V2.0
                  </span>
                </h1>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>100% Cashless ThaiQR</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Comprehensive System Blueprint & Architecture Specification (Academic Final)
              </p>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSimulator}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="เปิดเครื่องมือจำลอง LPR & ไม้กั้นสำหรับนำเสนออาจารย์"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>🎮 Hardware Simulator</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="เปิดพิมพ์เขียวโครงการและแนวทางตอบคำถาม Oral Defense"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>📑 Blueprint & Defense Guide</span>
            </button>

            <button
              onClick={() => {
                if (confirm('ต้องการรีเซ็ตข้อมูล MockAPI กลับสู่ค่าเริ่มต้นหรือไม่?')) {
                  onResetData();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="รีเซ็ตข้อมูล MockAPI"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Roles Switcher - Persona Bar */}
        <div className="pt-3">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>สลับบทบาทกลุ่มผู้ใช้งาน (4 User Personas):</span>
            <span className="text-[10px] text-slate-500">
              เลือกดูมุมมองตามบทบาทเพื่อทดสอบสิทธิ์ RBAC
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {roles.map((r) => {
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center space-x-2.5 cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${r.color} shadow-lg shadow-cyan-500/5 ring-2 ring-white/20`
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-2xl shrink-0">{r.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}
                      >
                        {r.name}
                      </span>
                      <span className="text-[10px] text-slate-500">({r.age})</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 truncate">{r.label}</div>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
