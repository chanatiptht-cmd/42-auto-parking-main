import React from 'react';
import {
  FileText,
  X,
  Users,
  Layers,
  Server,
  Workflow,
  Shield,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DefenseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DefenseGuideModal: React.FC<DefenseGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              Auto Parking Web Application Project Blueprint
            </h2>
            <p className="text-xs text-indigo-300">
              Comprehensive System Blueprint & Architecture Specification (Academic / Project Final)
            </p>
          </div>
        </div>

        {/* Content sections 1 to 7 */}
        <div className="space-y-6 text-xs text-slate-300">
          {/* Section 7 Highlight: Oral Defense Q&A */}
          <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-2 border-blue-500/40 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-extrabold uppercase">
                7. แนวทางการตอบคำถามสำหรับการนำเสนอ (Oral Defense Strategy)
              </span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-1">
                <div className="font-bold text-white text-xs text-cyan-200">
                  Q1: หากไม่มีฮาร์ดแวร์จริง (เช่น ไม้กั้น/กล้อง LPR) จะนำเสนออาจารย์อย่างไร?
                </div>
                <div className="text-slate-300 pl-4 border-l-2 border-cyan-400 text-[11px] leading-relaxed">
                  <strong>คำตอบ (A):</strong> ชี้แจงว่าโปรเจกต์เน้นการพัฒนา{' '}
                  <strong>Web Application Layer</strong> โดยใช้{' '}
                  <strong>MockAPI และ Interactive Toggle</strong> บนหน้า UI
                  ในการจำลองสัญญาณภาพถ่ายป้ายทะเบียนและการส่งคำสั่งเปิด-ปิดไม้กั้นแบบ Real-time
                  (สามารถกดปุ่ม "🎮 Hardware Simulator" ด้านบนเพื่อจำลองให้ดูสดๆ ได้ทันที)
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-1">
                <div className="font-bold text-white text-xs text-cyan-200">
                  Q2: ทำไมจึงเลือกแบ่งเป็น 4 Personas แทนที่จะมีแค่ Customer และ Admin?
                </div>
                <div className="text-slate-300 pl-4 border-l-2 border-cyan-400 text-[11px] leading-relaxed">
                  <strong>คำตอบ (A):</strong> เพื่อให้การออกแบบ UI/UX
                  สอดคล้องกับบริบทการใช้งานจริงมากที่สุด เช่น <strong>รปภ. (พี่เดช)</strong> ต้องการ
                  Guard Mode UI ปุ่มใหญ่ ตัวหนังสือชัด สำหรับทำงานหน้างานกลางแดดและมีปุ่มฉุกเฉิน
                  ขณะที่ <strong>ผู้บริหาร (Executive Owner)</strong>{' '}
                  ต้องการภาพรวมตัวเลขทางการเงินและระบบไร้เงินสด 100% ต่างจาก{' '}
                  <strong>Admin (คุณสมชาย)</strong> ที่เน้นการตั้งค่าโครงสร้างราคาและปิดซ่อมช่องจอด
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: User Personas Matrix */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span>1. โครงสร้างวิเคราะห์กลุ่มผู้ใช้งาน (User Personas Matrix - 4 Roles)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-bold text-pink-300">1. Customer / Driver (คุณณิชา 28 ปี)</div>
                <div className="text-slate-400 mt-1">
                  Senior Marketing • ปัญหา: บัตรกระดาษยับ/หาย, เสียเวลาขับวนหาที่จอด,
                  ต่อคิวจ่ายเงินสด
                </div>
                <div className="text-slate-200 mt-1">
                  <strong>Needs:</strong> Web Mobile-First, ดูช่องว่าง Real-time แยกชั้น, สแกนจ่าย
                  ThaiQR และ Grace Period Timer 15 นาที
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-bold text-indigo-300">2. System Admin (คุณสมชาย 42 ปี)</div>
                <div className="text-slate-400 mt-1">
                  Facility Manager • ปัญหา: เปลี่ยนเกณฑ์ราคายากต้องรอเดฟ, เช็กประวัติย้อนหลังช้า,
                  ขาดข้อมูล Peak Hours
                </div>
                <div className="text-slate-200 mt-1">
                  <strong>Needs:</strong> Desktop Dashboard, UI ปรับราคา Rate Rules,
                  จัดการปิดซ่อมบำรุงช่องจอด, History Log
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-bold text-amber-300">3. Security Guard (พี่เดช 48 ปี)</div>
                <div className="text-slate-400 mt-1">
                  Field Security Officer • ปัญหา: หน้าจอซับซ้อนตัวหนังสือเล็ก,
                  ค้นหาป้ายทะเบียนที่อ่านไม่ติดช้า
                </div>
                <div className="text-slate-200 mt-1">
                  <strong>Needs:</strong> Guard Mode UI ปุ่มใหญ่ อ่านง่าย, Quick-Search รวดเร็ว,
                  Emergency Override พร้อมบันทึก
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-bold text-emerald-300">
                  4. Executive Owner (ผู้จัดการ / เจ้าของ)
                </div>
                <div className="text-slate-400 mt-1">
                  Business Executive • ปัญหา: รายงานช้า, ความเสี่ยงทุจริตเงินสด,
                  ไม่มีสถิติพฤติกรรมการจอด
                </div>
                <div className="text-slate-200 mt-1">
                  <strong>Needs:</strong> Executive Dashboard ยอดเงิน Real-time, อัตราไร้เงินสด
                  100%, สถิติความหนาแน่นและ Turnover
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: End-to-End Workflow */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Workflow className="w-4 h-4 text-cyan-400" />
              <span>5. ผังลำดับการทำงานของระบบ (End-to-End System Workflow 1-5)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-1">
                  1
                </div>
                <div className="font-bold text-white">Vehicle Entry</div>
                <div className="text-slate-400 mt-0.5">กล้อง LPR บันทึกเวลาเข้า อัปเดต MockAPI</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-1">
                  2
                </div>
                <div className="font-bold text-white">Spot Check</div>
                <div className="text-slate-400 mt-0.5">
                  ผู้ขับสแกน QR ดูช่องว่างแยกชั้น (P1, P2)
                </div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-1">
                  3
                </div>
                <div className="font-bold text-white">Scan & Pay</div>
                <div className="text-slate-400 mt-0.5">ค้นหาทะเบียน ตรวจสอบยอดเงิน สแกน ThaiQR</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-1">
                  4
                </div>
                <div className="font-bold text-white">Grace Period</div>
                <div className="text-slate-400 mt-0.5">อัปเดต paid แสดงเวลานับถอยหลัง 15 นาที</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-1">
                  5
                </div>
                <div className="font-bold text-white">Gate Exit</div>
                <div className="text-slate-400 mt-0.5">
                  กล้องตรวจตรงรายการที่ชำระ ไม้กั้นเปิดอัตโนมัติ
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: MockAPI Endpoints */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>3. โครงสร้างและการใช้งาน MockAPI Endpoints</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">GET, PUT /spots</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">
                  สถานะช่องจอดทั้งหมด และอัปเดตเมื่อมีรถจอดหรือปิดซ่อม
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">GET, POST, PUT /transactions</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">
                  คำนวณระยะเวลา ยอดเงินค่าจอด และอัปเดตเมื่อลูกค้าจ่ายสำเร็จ
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">GET, PUT /rates</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">
                  แอดมินตั้งค่าอัตราค่าจอดรถตามช่วงเวลา หรือชั่วโมงชดเชยฟรี
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">GET, POST /logs</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">
                  บันทึกประวัติเหตุการณ์สำคัญ เช่น การเปิดไม้กั้นฉุกเฉินโดย รปภ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            ปิดหน้าต่างข้อมูล (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
