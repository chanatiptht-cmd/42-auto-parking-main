import { Outlet } from 'react-router-dom';
import { useParking } from '../context/ParkingContext';
import '../styles/user.css';

export function UserLayout() {
  const { storageWarning, dismissWarning } = useParking();
  return (
    <div className="user-shell">
      <div className="user-app">
        {storageWarning && (
          <div role="status" className="storage-notice">
            {storageWarning}
            <button onClick={dismissWarning} aria-label="ปิดข้อความ">
              ×
            </button>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
