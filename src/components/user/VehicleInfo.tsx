import { CarFront, CircleDollarSign, Clock3, Timer } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { calculationTime, dateTime, duration, money, vehicleTotal } from '../../utils/parking';
import type { Payment, Vehicle } from '../../types/parking';
import { Card } from '../common/Card';

// Shared by details, summary, and receipt so the vehicle and fee stay consistent.
export function VehicleCard({
  vehicle,
  bordered = true,
}: {
  vehicle: Vehicle;
  bordered?: boolean;
}) {
  return (
    <Card className={`user-vehicle-card ${bordered ? '' : 'without-border'}`}>
      <span className="user-car-circle">
        <CarFront size={30} />
      </span>
      <div>
        <span>เลขทะเบียน</span>
        <strong>{vehicle.plate}</strong>
        <small>{vehicle.province}</small>
      </div>
    </Card>
  );
}

export function VehicleFacts({
  vehicle,
  payment,
  showFee = true,
  estimate = false,
}: {
  vehicle: Vehicle;
  payment?: Payment;
  showFee?: boolean;
  estimate?: boolean;
}) {
  const { now } = useParking();
  const endAt = calculationTime(vehicle, payment, now);
  return (
    <dl className="user-facts">
      <div>
        <dt>
          <Clock3 />
          เวลาเข้า
        </dt>
        <dd>{dateTime(vehicle.entryAt)}</dd>
      </div>
      <div>
        <dt>
          <Clock3 />
          เวลาออก
        </dt>
        <dd>-</dd>
      </div>
      <div>
        <dt>
          <Clock3 />
          {estimate && !vehicle.exitAt ? 'เวลาคำนวณค่าจอด' : 'เวลาออก'}
        </dt>
        <dd>{vehicle.exitAt ? dateTime(vehicle.exitAt) : estimate ? dateTime(endAt) : '–'}</dd>
      </div>
      <div>
        <dt>
          <Timer />
          ระยะเวลาการจอด
        </dt>
        <dd>{duration(vehicle.entryAt, endAt)}</dd>
      </div>
      {showFee && (
        <div>
          <dt>
            <CircleDollarSign />
            ค่าจอด
          </dt>
          <dd>{money(vehicleTotal(vehicle, payment, now))}</dd>
        </div>
      )}
    </dl>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useVehicle() {
  const { id } = useParams();
  const { data } = useParking();
  return {
    vehicle: data.vehicles.find((item) => item.id === id),
    payment: data.payments.find((item) => item.vehicleId === id),
  };
}
