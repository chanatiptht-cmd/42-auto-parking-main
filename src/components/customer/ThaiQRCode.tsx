import React from 'react';
import { QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ThaiQRCodeProps {
  amount: number;
  plate: string;
  refCode: string;
}

export const ThaiQRCode: React.FC<ThaiQRCodeProps> = ({ amount, plate, refCode }) => {
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 max-w-sm mx-auto text-center relative overflow-hidden">
      {/* Thai QR Payment Official Style Header */}
      <div className="bg-[#0b3c61] text-white -mx-6 -mt-6 p-4 mb-4 flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="bg-white text-[#0b3c61] text-xs font-black px-2 py-0.5 rounded tracking-wider">
            THAI QR
          </div>
          <span className="font-bold text-sm tracking-wide">PAYMENT</span>
        </div>
        <p className="text-[11px] text-cyan-200 mt-1">
          พร้อมเพย์ (PromptPay) • Biller ID: 0107537000888
        </p>
      </div>

      {/* QR Code Container */}
      <div className="p-3 bg-white inline-block rounded-xl border-2 border-slate-900/10 shadow-inner my-2 relative">
        {/* Real looking Thai PromptPay QR pattern SVG */}
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="currentColor">
          {/* Outer corner finders */}
          <rect x="10" y="10" width="45" height="45" rx="6" fill="#0f172a" />
          <rect x="18" y="18" width="29" height="29" rx="3" fill="#ffffff" />
          <rect x="25" y="25" width="15" height="15" rx="2" fill="#0f172a" />

          <rect x="145" y="10" width="45" height="45" rx="6" fill="#0f172a" />
          <rect x="153" y="18" width="29" height="29" rx="3" fill="#ffffff" />
          <rect x="160" y="25" width="15" height="15" rx="2" fill="#0f172a" />

          <rect x="10" y="145" width="45" height="45" rx="6" fill="#0f172a" />
          <rect x="18" y="153" width="29" height="29" rx="3" fill="#ffffff" />
          <rect x="25" y="160" width="15" height="15" rx="2" fill="#0f172a" />

          {/* Decorative QR data bits matrix */}
          <rect x="65" y="15" width="8" height="8" fill="#0f172a" />
          <rect x="80" y="15" width="14" height="8" fill="#0f172a" />
          <rect x="105" y="15" width="8" height="8" fill="#0f172a" />
          <rect x="125" y="15" width="8" height="8" fill="#0f172a" />

          <rect x="65" y="30" width="16" height="8" fill="#0f172a" />
          <rect x="90" y="30" width="8" height="8" fill="#0f172a" />
          <rect x="115" y="30" width="18" height="8" fill="#0f172a" />

          <rect x="15" y="65" width="8" height="16" fill="#0f172a" />
          <rect x="30" y="70" width="8" height="8" fill="#0f172a" />
          <rect x="45" y="65" width="8" height="16" fill="#0f172a" />

          {/* Center PromptPay badge */}
          <circle cx="100" cy="100" r="22" fill="#0b3c61" />
          <path
            d="M92 100 L98 106 L109 94"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Bottom data bits */}
          <rect x="65" y="145" width="12" height="12" fill="#0f172a" />
          <rect x="85" y="150" width="15" height="8" fill="#0f172a" />
          <rect x="110" y="145" width="8" height="12" fill="#0f172a" />
          <rect x="130" y="150" width="20" height="8" fill="#0f172a" />

          <rect x="70" y="170" width="18" height="8" fill="#0f172a" />
          <rect x="95" y="170" width="12" height="15" fill="#0f172a" />
          <rect x="115" y="175" width="18" height="8" fill="#0f172a" />
          <rect x="145" y="170" width="15" height="15" fill="#0f172a" />
          <rect x="170" y="145" width="15" height="12" fill="#0f172a" />

          <rect x="150" y="70" width="16" height="12" fill="#0f172a" />
          <rect x="175" y="75" width="10" height="18" fill="#0f172a" />
          <rect x="145" y="95" width="20" height="12" fill="#0f172a" />
          <rect x="175" y="115" width="10" height="12" fill="#0f172a" />
        </svg>

        <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-1">
          REF: {refCode}
        </div>
      </div>

      {/* Payment details summary */}
      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-left">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">ทะเบียนรถ:</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {plate}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">ผู้รับเงิน:</span>
          <span className="font-semibold text-slate-700">Auto Parking Smart Co.</span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-sm font-semibold text-slate-600">ยอดชำระสุทธิ:</span>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-blue-700">
              {amount.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-slate-600 ml-1">บาท</span>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-emerald-50 rounded-lg p-2.5 flex items-center justify-center space-x-2 text-emerald-800 text-xs font-medium border border-emerald-200">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>รองรับ Mobile Banking ทุกธนาคาร (100% Cashless)</span>
      </div>
    </div>
  );
};
