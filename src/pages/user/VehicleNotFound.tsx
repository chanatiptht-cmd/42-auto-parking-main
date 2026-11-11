import { CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';

export function VehicleNotFound() {
  return (
    <>
      <PageHeader title="ไม่พบข้อมูลรถ" backTo="/user/search" />
      <main className="user-empty">
        <CarFront size={44} />
        <h2>ไม่พบรายการนี้</h2>
        <p>กรุณาค้นหาด้วยทะเบียนรถอีกครั้ง</p>
        <Link className="sp-button sp-button--primary" to="/user/search">
          กลับหน้าค้นหา
        </Link>
      </main>
    </>
  );
}
