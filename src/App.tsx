import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { ParkingProvider, useParking } from './context/ParkingContext';
import { firstAllowedPath } from './data/permissions';
import { ManageFloors } from './pages/admin/ManageFloors';
import { Kiosk } from './pages/kiosk/Kiosk';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ParkingSearch } from './pages/user/ParkingSearch';
import { VehicleDetails } from './pages/user/VehicleDetails';
import { PaymentSummary } from './pages/user/PaymentSummary';
import { QrPayment } from './pages/user/QrPayment';
import { PaymentSuccess } from './pages/user/PaymentSuccess';
import { AdminLogin } from './pages/admin/AdminLogin';
import { ParkingLayout } from './pages/admin/ParkingLayout';
import { Operations } from './pages/admin/Operations';
import { Permissions } from './pages/admin/Permissions';

// Only admin charts load Recharts; the mobile payment flow stays lightweight.
const Dashboard = lazy(() =>
  import('./pages/admin/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const Reports = lazy(() =>
  import('./pages/admin/Reports').then((module) => ({ default: module.Reports })),
);

function NotFound() {
  return (
    <main className="not-found">
      <h1>ไม่พบหน้าที่ต้องการ</h1>
      <p>ลิงก์นี้อาจไม่ถูกต้อง กรุณาเลือกหน้าที่ต้องการใช้งาน</p>
      <Link className="sp-button sp-button--primary" to="/user/search">
        หน้าผู้ใช้
      </Link>
      <Link className="sp-button sp-button--secondary" to="/admin/login">
        หน้าผู้ดูแล
      </Link>
    </main>
  );
}

function AdminLanding() {
  const { role, data } = useParking();
  return (
    <Navigate to={role ? firstAllowedPath(role, data.rolePermissions) : '/admin/login'} replace />
  );
}

export function App() {
  return (
    <ParkingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/user/search" replace />} />
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="search" replace />} />
            <Route path="search" element={<ParkingSearch />} />
            <Route path="vehicle/:id" element={<VehicleDetails />} />
            <Route path="summary/:id" element={<PaymentSummary />} />
            <Route path="payment/:id" element={<QrPayment />} />
            <Route path="success/:id" element={<PaymentSuccess />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminLanding />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<p>กำลังโหลดภาพรวม…</p>}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route path="parking-layout" element={<ParkingLayout />} />
            <Route path="floors" element={<ManageFloors />} />
            <Route path="operations" element={<Operations />} />
            <Route
              path="reports"
              element={
                <Suspense fallback={<p>กำลังโหลดรายงาน…</p>}>
                  <Reports />
                </Suspense>
              }
            />
            <Route path="permissions" element={<Permissions />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ParkingProvider>
  );
}

export default App;
