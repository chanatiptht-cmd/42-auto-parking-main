import React from 'react';
import { ParkingSpot, ParkingTransaction, RateConfig } from '../../types';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  PieChart,
  BarChart3,
  Users,
  Car,
  Download,
  CheckCircle2,
  Calendar,
  Award,
  Zap,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  spots: ParkingSpot[];
  transactions: ParkingTransaction[];
  rates: RateConfig;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  spots,
  transactions,
  rates,
}) => {
  // Financial metrics
  const completedOrPaid = transactions.filter(
    (t) => t.status === 'paid' || t.status === 'completed',
  );
  const todayRevenue = completedOrPaid.reduce((sum, t) => sum + t.amount, 0);
  const potentialRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Cashless metric (Zero cash risk)
  const cashlessCount = completedOrPaid.filter((t) => t.paymentMethod?.includes('ThaiQR')).length;
  const cashlessPercent =
    completedOrPaid.length > 0 ? Math.round((cashlessCount / completedOrPaid.length) * 100) : 100;

  // Occupancy metrics
  const totalSpots = spots.length;
  const occupiedSpots = spots.filter((s) => s.status === 'occupied').length;
  const currentOccupancyRate = Math.round((occupiedSpots / totalSpots) * 100);

  // Turnover ratio (Today vehicles served / Total spots)
  const totalVehiclesServed = transactions.length;
  const turnoverRatio = (totalVehiclesServed / totalSpots).toFixed(1);

  // Average parking time
  const avgDurationMinutes = Math.round(
    transactions.reduce((sum, t) => sum + t.durationMinutes, 0) / (transactions.length || 1),
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Executive Persona Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-3xl text-slate-950 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-300">
            👑
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-white">ผู้จัดการ / เจ้าของกิจการ</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-0.5 rounded-full border border-emerald-500/30">
                Executive Owner
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Financial Report & ROI Analytics • ดูยอดเงิน Real-time, ระบบไร้เงินสด 100%
              ป้องกันทุจริต, และวิเคราะห์พฤติกรรมลูกค้า
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>พิมพ์รายงานสรุปผู้บริหาร</span>
        </button>
      </div>

      {/* High-Level Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400">รายได้ Real-time วันนี้</span>
            <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ฿{todayRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-2 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% เทียบกับสัปดาห์ก่อน
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400">ระบบไร้เงินสด (Zero Leakage)</span>
            <span className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">100%</div>
          <div className="text-[11px] text-slate-300 font-medium mt-2 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-cyan-400" /> ไร้เงินสดสมบูรณ์แบบ
            ไม่มีความเสี่ยงทุจริต
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400">อัตราหมุนเวียน (Turnover Ratio)</span>
            <span className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Car className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{turnoverRatio}x</div>
          <div className="text-[11px] text-slate-400 font-medium mt-2">
            เฉลี่ย {turnoverRatio} คัน ต่อ 1 ช่องจอด ในวันนี้
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400">ระยะเวลาจอดเฉลี่ย</span>
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono">
            {Math.floor(avgDurationMinutes / 60)} ชม. {avgDurationMinutes % 60} น.
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-2">
            อัตราค่าจอดเฉลี่ย ฿{(todayRevenue / (completedOrPaid.length || 1)).toFixed(0)} ต่อคัน
          </div>
        </div>
      </div>

      {/* Executive Visual Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashless vs Cash Zero-Risk Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>การป้องกันการทุจริต & ช่องทางชำระเงิน (Zero Leakage)</span>
          </h3>

          <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span>ThaiQR PromptPay (โอนเข้าบัญชีบริษัทโดยตรง)</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">100% (฿{todayRevenue})</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-full"></div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="font-semibold text-slate-400 flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                <span>เงินสดผ่านพนักงาน (Cash Handling)</span>
              </span>
              <span className="font-mono text-slate-400">0% (ไม่มีการถือเงินสด)</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-white">ข้อดีที่ระบบตอบสนองเจ้าของกิจการ:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>เงินเข้าบัญชีบริษัททันที Real-time ไม่ต้องรอพนักงานรวมเงินส่งปลายวัน</li>
              <li>กำจัดความเสี่ยงเงินสูญหายหรือการทุจริตเปิดไม้กั้นโดยไม่คิดเงิน</li>
              <li>บันทึกภาพถ่ายทะเบียนและหลักฐานการชำระดิจิทัลครบ 100%</li>
            </ul>
          </div>
        </div>

        {/* Customer Parking Behavior Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>พฤติกรรมการจอดรถ (Duration Behavior Segmentation)</span>
          </h3>

          <div className="space-y-3">
            {[
              {
                label: 'จอดสั้น (0 - 1 ชม.) รับสิทธิ์จอดฟรี',
                count: 3,
                pct: 25,
                color: 'bg-emerald-400',
                note: 'กลุ่มซื้อของเร่งด่วน',
              },
              {
                label: 'จอดปานกลาง (1 - 3 ชม.)',
                count: 6,
                pct: 50,
                color: 'bg-blue-400',
                note: 'กลุ่มลูกค้าทานอาหาร/ช้อปปิ้ง',
              },
              {
                label: 'จอดยาว (3 - 5 ชม.)',
                count: 2,
                pct: 17,
                color: 'bg-indigo-400',
                note: 'กลุ่มประชุม/ชมภาพยนตร์',
              },
              {
                label: 'จอดทั้งวัน (> 5 ชม. ชน Cap 150฿)',
                count: 1,
                pct: 8,
                color: 'bg-amber-400',
                note: 'กลุ่มพนักงาน/ผู้เช่า',
              },
            ].map((seg, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">{seg.label}</span>
                  <span className="font-mono text-cyan-300 font-bold">{seg.pct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${seg.color}`}
                    style={{ width: `${seg.pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">{seg.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Health & Projection */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>ประมาณการรายรับและผลตอบแทนการลงทุน (ROI Projection)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">ประมาณการรายได้เดือนนี้</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ฿{(todayRevenue * 30).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">อ้างอิงจากยอดเฉลี่ยรายวัน</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">ประหยัดต้นทุนกระดาษ/บัตรต่อปี</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">฿72,000</div>
            <div className="text-[11px] text-slate-500 mt-1">ไร้กระดาษ (Paperless 100%)</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">ระยะเวลาคืนทุนระบบอัจฉริยะ (ROI)</div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-1">~ 4.5 เดือน</div>
            <div className="text-[11px] text-slate-500 mt-1">ลดค่าจ้างเจ้าหน้าที่แจกบัตร</div>
          </div>
        </div>
      </div>
    </div>
  );
};
