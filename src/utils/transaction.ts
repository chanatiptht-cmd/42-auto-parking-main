// ให้การบันทึกรอคิวกัน เพื่อไม่ให้ข้อมูลจากสองแท็บเขียนทับกัน
// เบราว์เซอร์ที่ไม่มี Web Locks จะรอคิวได้เฉพาะในแท็บเดียว
let waiting = Promise.resolve();

export function withDemoLock(save: () => void): Promise<void> {
  if (navigator.locks?.request) {
    return navigator.locks.request('auto-parking-demo-state-v1', save);
  }
  const nextSave = waiting.then(save);
  waiting = nextSave.catch(() => {});
  return nextSave;
}
