import { useState } from 'react';
import type { ParkingSpot } from '../../types/parking';
import { useParking } from '../../context/ParkingContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function SpotEditor({
  spot,
  floor,
  onSaved,
  onCancel,
}: {
  spot?: ParkingSpot;
  floor: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { data, updateSpot } = useParking();
  const [name, setName] = useState(spot?.name ?? '');
  const [selectedFloor, setSelectedFloor] = useState(String(spot?.floor ?? floor));
  const [occupied, setOccupied] = useState(spot?.occupied ?? false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateSpot(
        { id: spot?.id ?? crypto.randomUUID(), name, floor: Number(selectedFloor), occupied },
        spot?.occupied,
      );
      onSaved();
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  return (
    <form className="modal-form" onSubmit={submit} noValidate>
      <Input
        label="ชื่อช่องจอด"
        placeholder="เช่น A11"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={8}
        autoFocus
      />
      <label className="sp-field">
        ชั้น
        <select value={selectedFloor} onChange={(event) => setSelectedFloor(event.target.value)}>
          {data.floors.map((floorItem) => (
            <option key={floorItem.id} value={floorItem.id}>
              {floorItem.name}
            </option>
          ))}
        </select>
      </label>
      <div className="sp-field">
        <label htmlFor="spot-status">สถานะช่องจอด</label>
        <select
          id="spot-status"
          value={occupied ? 'occupied' : 'available'}
          onChange={(event) => setOccupied(event.target.value === 'occupied')}
        >
          <option value="available">ว่าง</option>
          <option value="occupied">ไม่ว่าง</option>
        </select>
      </div>
      {spot?.occupied && !occupied && (
        <p className="form-hint">ช่องที่มีรถจอดจะคืนเป็นว่างเมื่อรถผ่านไม้กั้นที่ Kiosk</p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึกช่องจอด</Button>
      </div>
    </form>
  );
}
