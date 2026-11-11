import { ChevronRight, CircleDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { VehicleCard, VehicleFacts, useVehicle } from '../../components/user/VehicleInfo';
import { money, vehicleTotal } from '../../utils/parking';
import { VehicleNotFound } from './VehicleNotFound';
import { useParking } from '../../context/ParkingContext';

export function PaymentSummary() {
  const { vehicle, payment } = useVehicle();
  const { now } = useParking();
  if (!vehicle) return <VehicleNotFound />;
  return (
    <>
      <PageHeader title="ชำระเงิน" backTo={`/user/vehicle/${vehicle.id}`} />
      <main className="user-page-content user-summary">
        <VehicleCard vehicle={vehicle} />
        <VehicleFacts vehicle={vehicle} payment={payment} showFee={false} estimate />
        <div className="user-total">
          <span>
            <CircleDollarSign size={22} />
            ค่าจอดรถ
          </span>
          <strong>{money(vehicleTotal(vehicle, payment, now))}</strong>
        </div>
        <div className="user-bottom-action">
          <Link
            className="sp-button sp-button--primary full-width"
            to={payment ? `/user/success/${vehicle.id}` : `/user/payment/${vehicle.id}`}
          >
            {payment ? 'ดูใบเสร็จ' : 'ชำระเงิน'}
            <ChevronRight size={19} />
          </Link>
        </div>
      </main>
    </>
  );
}
