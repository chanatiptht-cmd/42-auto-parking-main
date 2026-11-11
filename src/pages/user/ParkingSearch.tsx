import { useState } from 'react';
import { CarFront, Info, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useParking } from '../../context/ParkingContext';
import { floorName, normalizePlate, time, vehiclePhoto } from '../../utils/parking';

export function ParkingSearch() {
  const [plate, setPlate] = useState('');
  const [searched, setSearched] = useState('');
  const [error, setError] = useState('');
  const { data } = useParking();
  const results = data.vehicles.filter(
    (vehicle) => !vehicle.exitAt && normalizePlate(vehicle.plate) === searched,
  );
  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = normalizePlate(plate);
    setSearched(query);
    if (!query) {
      setError('กรุณากรอกทะเบียนรถ');
      return;
    }
    const foundVehicle = data.vehicles.find((vehicle) => {
      return !vehicle.exitAt && normalizePlate(vehicle.plate) === query;
    });
    if (!foundVehicle) {
      setError('ไม่พบทะเบียนรถนี้ กรุณาตรวจสอบแล้วลองอีกครั้ง');
      return;
    }
    setError('');
  }

  function handlePlateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPlate(event.target.value);
    setError('');
    setSearched('');
  }

  // function handleDemoPlate() {
  //   setPlate('กก 1234');
  //   setError('');
  // }
  return (
    <>
      <div className="user-search-band" />
      <header className="user-welcome">
        <div className="user-brand">
          <CarFront size={32} />
          <span>Auto Parking</span>
        </div>
        <h1>ยินดีต้อนรับ</h1>
        <p>ค้นหาทะเบียนรถของคุณ</p>
      </header>
      <main className="user-search-main">
        <Card className={`user-search-card ${error ? 'has-error' : ''}`}>
          <form onSubmit={handleSearch} noValidate>
            <Input
              label="ทะเบียนรถ"
              hideLabel
              icon={<CarFront size={26} />}
              placeholder="กรอกเลขทะเบียนรถ เช่น กก 1234"
              value={plate}
              onChange={handlePlateChange}
              aria-invalid={!!error}
              aria-describedby={error ? 'search-error' : undefined}
              autoComplete="off"
            />
            <Button type="submit" className="full-width">
              <Search size={21} />
              ค้นหา
            </Button>
            {error && (
              <p id="search-error" className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>
        </Card>
        {searched && results.length > 0 && (
          <section className="user-results">
            <h2>ผลการค้นหา · {results.length} รายการ</h2>
            <p>เลือกรถจากภาพและตำแหน่งจอด</p>
            <div className="user-result-grid">
              {results.map((vehicle) => {
                const spot = data.spots.find((spot) => spot.id === vehicle.spotId);
                return (
                  <Link
                    key={vehicle.id}
                    to={`/user/vehicle/${vehicle.id}`}
                    className="user-result-card"
                    aria-label={`${vehicle.plate} ${vehicle.province} ${spot ? floorName(data, spot.floor) + ' ช่อง ' + spot.name : 'ไม่ระบุช่อง'} เวลาเข้า ${time(vehicle.entryAt)}`}
                  >
                    <img
                      src={vehiclePhoto(vehicle)}
                      alt={`รถ ${vehicle.plate} ${vehicle.province}`}
                    />
                    <strong>
                      {vehicle.plate} · {vehicle.province}
                    </strong>
                    <small>
                      {time(vehicle.entryAt)} น.
                    </small>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
        <Card className="user-instructions">
          <Info size={24} />
          <div>
            <h2>วิธีการใช้งาน</h2>
            <ol>
              <li>กรอกเลขทะเบียนรถ</li>
              <li>กดปุ่มค้นหาแล้วเลือกรถที่จอด</li>
              <li>ชำระค่าจอดรถผ่าน QR Code</li>
            </ol>
          </div>
        </Card>
        {/* <p className="user-demo-hint">
          ทดลองค้นหา: <button onClick={handleDemoPlate}>กก 1234</button>
        </p> */}
      </main>
      <footer className="user-footer">
        <span>Auto Parking</span>
        <p>จอดง่าย · ชำระสะดวก · ปลอดภัย</p>
        <Link to="/admin/login">ผู้ดูแลระบบ</Link>
        <Link to="/kiosk">Door Parking</Link>
      </footer>
    </>
  );
}
