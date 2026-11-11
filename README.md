# Auto Parking — Frontend Demo

React + TypeScript + Vite + React Router + Recharts ตามสเปกและภาพอ้างอิงของทีม ใช้ข้อมูลร่วมกันระหว่าง User, Admin และ Kiosk ไม่มี Backend, Database, API ธนาคาร หรือการเชื่อมต่ออุปกรณ์จริง

## เปิดใช้งาน

```powershell
npm.cmd install
npm.cmd run dev
```

เปิด URL ที่ Vite แสดง (ปกติ `http://localhost:5173`) เครื่องนี้มี dependency พร้อมแล้ว ใช้ `npm` แทน `npm.cmd` ได้ถ้า PowerShell อนุญาต `npm.ps1`

| หน้า | URL |
| --- | --- |
| User / ค้นหารถ | `/user/search` หรือ `/` |
| รายละเอียด / QR / ผลชำระ | `/user/vehicle/v1`, `/user/payment/v1`, `/user/success/v1` |
| Admin Login | `/admin/login` |
| Dashboard | `/admin/dashboard` |
| Parking Layout / จัดการชั้น | `/admin/parking-layout`, `/admin/floors` |
| Operation | `/admin/operations` หรือ `?vehicle=v1` สำหรับเปิดรถที่เลือก |
| Reports 4 แท็บ | `/admin/reports` |
| บัญชีและสิทธิ์ตามบทบาท | `/admin/permissions` |
| Kiosk / ไม้กั้นทางออก | `/kiosk?vehicle=v1` |

หน้า `/user/summary/:id` เดิมยังเปิดได้ แต่ปุ่มชำระบนรายละเอียดรถไป QR โดยตรงตามแบบล่าสุด

## ข้อมูลทดลอง

- `admin / admin123` — Super Admin
- `kitti / demo123` — Admin
- `nat / demo123` — Operator
- `nicha / demo123` — Viewer (ดูรายงานได้ แต่ส่งออกไม่ได้โดยค่าเริ่มต้น)
- ค้น `กก1234`, `กก 1234` หรือเว้นวรรคเพิ่มได้ ชุด seed ใหม่มีรถทะเบียนนี้สองคันต่างจังหวัด แสดงการ์ดให้เลือกเสมอ
- 60 ช่อง / 2 ชั้น ตาม repo เดิม ตัวเลขในภาพเป็นตัวอย่าง หน้าจอและกราฟคำนวณจากข้อมูลชุดเดียว
- หากมีข้อมูลเก่าในเบราว์เซอร์ ระบบย้าย schema ให้โดยรักษารายการและใบเสร็จเดิม ต้องการชุด seed ล่าสุดให้เข้าสู่ระบบ admin แล้วเลือก **เครื่องมือ Demo → รีเซ็ตข้อมูล Demo** และยืนยัน

## ขั้นตอนทดลองที่สำคัญ

1. ค้นรถ → เลือกการ์ดจากภาพ จังหวัด ชั้น ช่อง และเวลาเข้า → รายละเอียด → ชำระเงิน
2. หน้า QR เปิดแอปธนาคาร → เลือก K PLUS หรือ Krungthai NEXT → ยืนยันการชำระเงินจำลอง จึงบันทึกรายรับ ปุ่มตรวจสถานะอ่านข้อมูลร่วม ไม่ทำให้สำเร็จเอง
3. บันทึกรูป QR ได้เป็นไฟล์ SVG จริงสำหรับสาธิต QR ไม่มี payment payload และใช้ชำระเงินจริงไม่ได้ หมดอายุใน 10 นาที การรีเฟรชไม่ต่ออายุ
4. หน้าสำเร็จแสดงเลขอ้างอิง เวลาชำระ ตำแหน่ง และเวลาออกภายใน 15 นาที ปุ่มใบเสร็จอ่าน payment ของรายการจอดนั้น กดซ้ำหรือรีเฟรชไม่สร้างรายรับซ้ำ
5. เปิด Kiosk ใน origin เดียวกัน เลือกรายการรถ เมื่อชำระและยังอยู่ในเวลาออก ไม้กั้นจะแสดงเปิด กด **จำลองรถผ่านไม้กั้น** จึงบันทึกเวลาออกและคืนช่องจอด การแก้ช่องจอดไม่สามารถคืนช่องที่มีรถจอดอยู่ได้
6. Admin เลือกชั้น/ช่อง เพิ่มหรือแก้ช่อง ตรวจชื่อซ้ำ จัดการชื่อ ลำดับ และสถานะชั้น จำนวนช่องต่อชั้นคำนวณจากผัง ชั้นใหม่อาจมี 0 ช่องและเพิ่มช่องภายหลังได้
7. Operation ใช้ทะเบียน วันที่ เวลาเริ่ม–สิ้นสุด และสถานะ กดค้นหาแล้วเลือกรายการเพื่อดูภาพเข้า/ออก สถานะชำระแยกจากจอดอยู่/ออกแล้ว ส่งออกเฉพาะรายการตามตัวกรองเมื่อมีสิทธิ์
8. Reports เลือกช่วงรายวัน/เดือน/ปี/กำหนดเองแล้วกด **แสดงรายงาน** ก่อน ตัวกรองที่ยังไม่กดไม่เปลี่ยนรายงานหรือ CSV Finance ใช้เวลาชำระ Activity แยกนับเวลาเข้า/ออก Vehicle Types ใช้รถเข้า Heat Map ใช้ประวัติช่องและเปิดตำแหน่งในผังได้
9. Super Admin ค้น/กรองบัญชี เพิ่ม ดู แก้ เปิด/ปิด ลบโดยยืนยัน และตั้งสิทธิ์รายบทบาท ปิดเมนูจะปิดสิทธิ์ย่อย ตรวจสิทธิ์ที่เมนู URL และก่อนบันทึก ป้องกันลบ/ปิด/ลดบทบาท Super Admin คนสุดท้าย และผู้จัดการบัญชีทั่วไปยกระดับตัวเองเป็น Super Admin ไม่ได้

## เวลาและการเก็บข้อมูล

- เวลาเริ่มเดโมเดิมคือ **14 ตุลาคม 2568 เวลา 12:45 น. Asia/Bangkok** นาฬิกาเดินต่อจาก anchor ที่เก็บไว้ การรีเฟรชไม่เริ่มระยะเวลาออกใหม่
- 30 บาทต่อชั่วโมง ปัดขึ้นตามชั่วโมงที่เริ่มใช้ รวมเศษวินาที ยอดที่ชำระถูกตรึงในใบเสร็จ ระยะเวลาจอดนับถึงเวลาออกจริงหรือเวลาปัจจุบันของเดโม
- `localStorage`: `smart-parking-demo-v1` เก็บข้อมูลเดโม / ชั้น / สิทธิ์ / นาฬิกา, `parking-remembered-username` เก็บเฉพาะชื่อผู้ใช้ที่เลือกจดจำ
- `sessionStorage`: `smart-parking-session-v1` เก็บ session ผู้ดูแล, `parking-qr-<id>` เก็บเวลาหมดอายุ QR ของรายการจอด
- Web Locks ครอบการอ่าน–ตรวจ–แก้–บันทึกข้อมูลทั้งหมด ป้องกันรายการจากหลายแท็บเขียนทับกันบนเบราว์เซอร์ที่รองรับ (ใช้ origin เดียวกัน เช่น localhost) เบราว์เซอร์ที่ไม่มี Web Locks ใช้ได้ทีละแท็บเท่านั้น
- หาก browser storage เขียนไม่ได้ จะเตือนและใช้ข้อมูลในหน่วยความจำต่อ การเปลี่ยนแปลงนั้นจะไม่อยู่หลังปิดหรือรีเฟรช
- รูปกล้องเป็นภาพตัวอย่างสองรูปที่คัดลอกจากไฟล์อ้างอิง Figma ของทีม ไม่ใช่กล้องสดหรือภาพเฉพาะรถแต่ละคัน

## อ่านโค้ดแบบ React_W09

เปิด [คู่มืออ่านโค้ด](docs/READING_THE_CODE.md) เพื่อดูว่า Context, useState, filter/map และฟังก์ชันจัดการปุ่มในงาน W09 ตรงกับไฟล์ไหนของ Auto Parking แนะนำเริ่มจาก `ParkingSearch.tsx` → `ManageFloors.tsx` → `SpotEditor.tsx` → `ParkingContext.tsx`

รอบปรับนี้เปิดอ่าน source จริงของ React_W09 แล้ว จัดฟังก์ชันเป็นงานที่มีชื่อ เช่น `handleSearch`, `handleDeleteUser`, `handleSaveFloor` และแยกฟังก์ชันข้อมูลกลาง `pay`/`updateSpot`/`removeUser` ให้ตามขั้นตอนตรง ๆ พร้อมใช้ชื่อตัวแปรเต็มและลดเงื่อนไขซ้อนใน JSX

## ไฟล์ที่เพิ่มหรือแก้

| ส่วน | ไฟล์ |
| --- | --- |
| Routes / layouts | `src/App.tsx`, `src/layouts/AdminLayout.tsx` |
| ข้อมูลและกฎร่วม | `src/types/parking.ts`, `src/data/mockData.ts`, `src/data/permissions.ts`, `src/context/ParkingContext.tsx`, `src/utils/demoState.ts`, `src/utils/parking.ts`, `src/utils/csv.ts`, `src/utils/transaction.ts` |
| User | `src/pages/user/ParkingSearch.tsx`, `VehicleDetails.tsx`, `PaymentSummary.tsx`, `QrPayment.tsx`, `PaymentSuccess.tsx` |
| Admin | `src/pages/admin/AdminLogin.tsx`, `Dashboard.tsx`, `ParkingLayout.tsx`, `ManageFloors.tsx`, `Operations.tsx`, `Permissions.tsx`, `Reports.tsx` |
| Kiosk | `src/pages/kiosk/Kiosk.tsx` |
| Components | `src/components/common/Modal.tsx`, `PageHeader.tsx`; `src/components/user/DemoQr.tsx`, `VehicleInfo.tsx`; `src/components/admin/Sidebar.tsx`, `SpotEditor.tsx`, `UserEditor.tsx`, `RoleEditor.tsx` |
| CSS / รูป | `src/styles/user.css`, `admin.css`, `reports.css`, `kiosk.css`; `public/images/white-car.jpg`, `blue-car.jpg` |
| Tests | `tests/parking.test.ts`, `flows.test.tsx`, `extensions.test.ts`, `features.test.tsx`, `storage.test.tsx`, `csv.test.ts` |
| เอกสาร | README นี้, `docs/auto-parking-requirements.md`, `docs/superpowers/plans/2026-11-08-auto-parking.md`, `docs/verification/2026-11-08-qa.md` |

## ตรวจงานและข้อจำกัด

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

ชุดทดสอบครอบคลุมค่าจอด เศษชั่วโมง ทะเบียนซ้ำ QR หมดอายุ/รีเฟรช การยืนยันชำระซ้ำ ใบเสร็จ ไม้กั้น/คืนช่อง สิทธิ์/การยกระดับบัญชี ชั้นว่าง การแก้ข้อมูล ตัวกรอง รายงานทั้ง 4 แท็บ ช่วงไม่มีข้อมูล CSV ภาษาไทย การบันทึกพร้อมกันในคิว และ storage เสีย/เขียนไม่ได้/เหตุการณ์เก่า

การตรวจภาพ responsive และกราฟในเบราว์เซอร์จริงยังไม่สำเร็จ: browser access host ใช้ไม่ได้ และ Computer Use หยุดเพราะยืนยัน URL บน Windows ไม่ได้ จึงยังไม่ยืนยันความตรงของภาพทุกขนาดหรือทดสอบหลายแท็บจริง มีการตรวจ DOM/logic และ review โค้ดแยกโดยผู้ตรวจอีกตัวหนึ่ง รายละเอียดผลตรวจอยู่ใน `docs/verification/2026-11-08-qa.md`

ระบบสิทธิ์/รหัสผ่านทั้งหมดเป็น frontend demo บัญชีและรหัสผ่านตัวอย่างอ่านได้จาก browser storage ไม่เหมาะเป็น authentication จริง ไม่แชร์ข้ามอุปกรณ์ ไม่มีการเรียกธนาคารจริง ไม่เปิดแอปธนาคารจริง และไม่มีอุปกรณ์ไม้กั้นจริง

โค้ดเก่าที่ไม่ได้อยู่ใน routes ใหม่ยังเก็บไว้โดยไม่แก้ จึงอาจมี lint warnings จากไฟล์เก่า หาก deploy บน static hosting ต้องตั้ง SPA fallback ให้ทุก URL ตอบ `index.html`

ยังไม่ได้ commit หรือเปลี่ยน branch ของ parent repository เนื่องจากโฟลเดอร์โปรเจกต์นี้เป็น untracked directory ใน repo แม่ และยังไม่มีชื่อ branch สมาชิกที่ทีมตกลงไว้
