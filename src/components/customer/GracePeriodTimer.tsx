import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, CheckCircle, Car, ArrowRight } from 'lucide-react';

interface GracePeriodTimerProps {
  graceExpiresAt: string; // ISO timestamp
  plate: string;
  onExitSimulated?: () => void;
}

export const GracePeriodTimer: React.FC<GracePeriodTimerProps> = ({
  graceExpiresAt,
  plate,
  onExitSimulated,
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const totalGraceMs = 15 * 60 * 1000;

  useEffect(() => {
    const update = () => {
      const expTime = new Date(graceExpiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, expTime - now);
      setTimeLeftMs(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [graceExpiresAt]);

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progressPercent = Math.min(100, Math.max(0, (timeLeftMs / totalGraceMs) * 100));

  const isExpired = timeLeftMs <= 0;
  const isUrgent = timeLeftMs < 3 * 60 * 1000; // Less than 3 mins

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
      {/* Background glow */}
      <div
        className={`absolute -top-24 -left-24 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isExpired ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      {/* Header status */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        <span>ชำระเงินสำเร็จแล้ว • Grace Period Active</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-1">เวลาผ่อนผันนำรถออก (15 นาที)</h3>
      <p className="text-xs text-slate-400 mb-6">
        ระบบเปิดโอกาสให้ท่านขับรถออกจากลานจอดโดยไม่มีค่าใช้จ่ายเพิ่มเติม
      </p>

      {/* Timer Circle Display */}
      <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress */}
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 68}
            strokeDashoffset={2 * Math.PI * 68 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              isExpired ? 'text-red-500' : isUrgent ? 'text-amber-400' : 'text-emerald-400'
            }`}
            fill="transparent"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <Timer
            className={`w-6 h-6 mb-1 ${
              isExpired
                ? 'text-red-400'
                : isUrgent
                  ? 'text-amber-400 animate-pulse'
                  : 'text-emerald-400'
            }`}
          />
          <div className="text-3xl font-extrabold tracking-tight font-mono text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
            {isExpired ? 'หมดเวลาผ่อนผัน' : 'เวลาที่เหลือ'}
          </span>
        </div>
      </div>

      {/* Plate Badge */}
      <div className="mt-4 bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 max-w-xs mx-auto">
        <div className="text-[11px] text-slate-400">ป้ายทะเบียนที่อนุญาตให้ออก</div>
        <div className="text-lg font-bold text-cyan-300 font-mono tracking-wider">{plate}</div>
      </div>

      {/* Guide notice */}
      <div
        className={`mt-4 p-3 rounded-xl text-xs flex items-start space-x-2 text-left ${
          isExpired
            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
            : isUrgent
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
              : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
        }`}
      >
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          {isExpired ? (
            <span>
              <strong>เกินเวลา 15 นาที:</strong> กรุณาติดต่อเจ้าหน้าที่ รปภ.
              หรือชำระเงินส่วนเกินก่อนออกจากลานจอด
            </span>
          ) : (
            <span>
              ขับรถไปยังทางออก กล้อง LPR จะตรวจจับป้ายทะเบียนและเปิดไม้กั้นอัตโนมัติ
              ไม่ต้องลดกระจกแตะบัตร
            </span>
          )}
        </div>
      </div>

      {/* Simulated drive out trigger */}
      {onExitSimulated && (
        <button
          onClick={onExitSimulated}
          className="mt-6 w-full py-3 px-4 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <Car className="w-4 h-4" />
          <span>จำลองขับรถถึงไม้กั้นทางออก (Exit Gate)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
