import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { VehicleCard, VehicleFacts, useVehicle } from '../../components/user/VehicleInfo';
import { vehiclePhoto } from '../../utils/parking';
import { VehicleNotFound } from './VehicleNotFound';

export function VehicleDetails() {
  const { vehicle, payment } = useVehicle();
  if (!vehicle) return <VehicleNotFound />;
  return (
    <>
      <PageHeader title="รายละเอียดรถ" backTo="/user/search" />
      <main className="user-page-content">
        <figure className="user-camera-card">
          <img src={vehiclePhoto(vehicle)} alt={`ภาพขาเข้ารถ ${vehicle.plate}`} />
          <figcaption>ภาพตัวอย่างขาเข้า</figcaption>
        </figure>
        <section className="user-details-card">
          <VehicleCard vehicle={vehicle} bordered={false} />
          <VehicleFacts vehicle={vehicle} payment={payment} />
        </section>
        <div className="user-bottom-action">
          <Link
            className="sp-button sp-button--primary full-width"
            to={payment ? `/user/success/${vehicle.id}` : `/user/payment/${vehicle.id}`}
          >
            {payment ? 'ดูใบเสร็จ' : 'ชำระเงิน'}
            <ChevronRight size={20} />
          </Link>
        </div>
      </main>
    </>
  );
}
