/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AdminRole,
  DemoUser,
  ParkingData,
  ParkingFloor,
  ParkingSpot,
  Permission,
  Session,
  Vehicle,
} from '../types/parking';
import { createDemoData } from '../data/mockData';
import { hasPermission, ROLES } from '../data/permissions';
import {
  deleteUser,
  isParkingData,
  migrateParkingData,
  passGate,
  payVehicle,
  saveFloor,
  saveOperation,
  saveRolePermissions,
  saveSpot,
  saveUser,
  SESSION_KEY,
  STORAGE_KEY,
} from '../utils/demoState';
import { demoNow } from '../utils/parking';
import { withDemoLock } from '../utils/transaction';

function loadData() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    if (!savedText) return { data: createDemoData(), warning: '' };
    const savedData = migrateParkingData(JSON.parse(savedText));
    if (!isParkingData(savedData)) throw new Error('Invalid data');
    return { data: savedData, warning: '' };
  } catch {
    return {
      data: createDemoData(),
      warning: 'อ่านข้อมูลที่บันทึกไม่ได้ จึงเริ่มด้วยข้อมูล Demo ใหม่',
    };
  }
}

function loadSession(): Session | null {
  try {
    const savedSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
    if (!savedSession || typeof savedSession.userId !== 'string') return null;
    if (savedSession.previewRole && !ROLES.includes(savedSession.previewRole)) return null;
    return savedSession;
  } catch {
    return null;
  }
}

interface ParkingContextValue {
  data: ParkingData;
  now: string;
  user: DemoUser | undefined;
  role: AdminRole | undefined;
  storageWarning: string;
  dismissWarning: () => void;
  can: (permission: Permission) => boolean;
  login: (username: string, password: string) => DemoUser;
  logout: () => void;
  previewRole: (role: AdminRole) => void;
  pay: (id: string, qrDeadline?: number) => Promise<void>;
  exit: (id: string) => Promise<void>;
  updateSpot: (spot: ParkingSpot, originalOccupied?: boolean) => Promise<void>;
  updateFloor: (floor: ParkingFloor) => Promise<void>;
  updateUser: (user: DemoUser) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  updateRoles: (role: AdminRole, permissions: Permission[]) => Promise<void>;
  updateOperation: (vehicle: Vehicle) => Promise<void>;
  resetDemo: () => Promise<void>;
}

const ParkingContext = createContext<ParkingContextValue | null>(null);

export function ParkingProvider({ children }: { children: ReactNode }) {
  // เหมือน products/carts ใน layout.tsx ของ React_W09: เก็บข้อมูลไว้ให้หลายหน้าใช้ร่วมกัน
  const [initial] = useState(loadData);
  const [data, setData] = useState(initial.data);
  const [session, setSession] = useState(loadSession);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [now, setNow] = useState(() => demoNow(initial.data));

  // ref ใช้เฉพาะงานบันทึก เพื่ออ่านค่าล่าสุดแม้กดปุ่มติดกันหรือเปิดหลายแท็บ
  const latestData = useRef(data);
  const storageFailed = useRef(false);
  const user = data.users.find((account) => account.id === session?.userId && account.active);
  const role = getCurrentRole(data);

  function getCurrentRole(currentData: ParkingData) {
    const currentUser = currentData.users.find(
      (account) => account.id === session?.userId && account.active,
    );
    if (!currentUser) return undefined;
    if (currentUser.role === 'Super Admin' && session?.previewRole) return session.previewRole;
    return currentUser.role;
  }

  function can(permission: Permission) {
    return hasPermission(role, permission, data.rolePermissions);
  }

  function checkPermission(currentData: ParkingData, permission: Permission) {
    const currentRole = getCurrentRole(currentData);
    if (!currentRole || !hasPermission(currentRole, permission, currentData.rolePermissions)) {
      throw new Error('บทบาทนี้ไม่มีสิทธิ์ดำเนินการ');
    }
    return currentRole;
  }

  function getLatestData() {
    if (storageFailed.current) return latestData.current;
    try {
      const savedText = localStorage.getItem(STORAGE_KEY);
      const savedData = migrateParkingData(JSON.parse(savedText ?? 'null'));
      if (isParkingData(savedData)) return savedData;
    } catch {
      // ถ้าอ่าน storage ไม่ได้ ให้ใช้ข้อมูลที่ยังอยู่ในหน้านี้
    }
    return latestData.current;
  }

  function showData(nextData: ParkingData) {
    latestData.current = nextData;
    setData(nextData);
    setNow(demoNow(nextData));
  }

  function saveData(nextData: ParkingData) {
    showData(nextData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      storageFailed.current = false;
    } catch {
      storageFailed.current = true;
      setStorageWarning('เบราว์เซอร์ไม่อนุญาตให้บันทึก ข้อมูลจะอยู่เฉพาะระหว่างเปิดหน้านี้');
    }
  }

  function login(username: string, password: string) {
    if (!username.trim() || !password) throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
    const foundUser = data.users.find(
      (account) =>
        account.username === username.trim().toLowerCase() && account.password === password,
    );
    if (!foundUser || !foundUser.active)
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกปิดใช้งาน');
    setSession({ userId: foundUser.id });
    return foundUser;
  }

  function logout() {
    setSession(null);
  }

  function previewRole(nextRole: AdminRole) {
    if (user?.role === 'Super Admin') setSession({ userId: user.id, previewRole: nextRole });
  }

  // ทุกงานเขียนเป็นขั้นตอนเดียวกัน: อ่านข้อมูลล่าสุด → ตรวจ → เปลี่ยนข้อมูล → บันทึก
  // withDemoLock ให้แต่ละแท็บรอคิวกัน รายละเอียดแยกไว้ใน utils/transaction.ts
  async function pay(vehicleId: string, qrDeadline?: number) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      if (qrDeadline !== undefined && Date.now() >= qrDeadline)
        throw new Error('QR หมดอายุแล้ว กรุณาสร้างรายการใหม่');
      const nextData = payVehicle(currentData, vehicleId, demoNow(currentData));
      saveData(nextData);
    });
  }

  async function exit(vehicleId: string) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      const nextData = passGate(currentData, vehicleId, demoNow(currentData));
      saveData(nextData);
    });
  }

  async function updateSpot(spot: ParkingSpot, originalOccupied?: boolean) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      const existingSpot = currentData.spots.find((item) => item.id === spot.id);
      if (existingSpot) checkPermission(currentData, 'edit-spots');
      else checkPermission(currentData, 'add-spots');
      const nextData = saveSpot(currentData, spot, originalOccupied);
      saveData(nextData);
    });
  }

  async function updateFloor(floor: ParkingFloor) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      checkPermission(currentData, 'manage-floors');
      const nextData = saveFloor(currentData, floor);
      saveData(nextData);
    });
  }

  async function updateUser(account: DemoUser) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      const currentRole = checkPermission(currentData, 'edit-users');
      const nextData = saveUser(currentData, account, currentRole);
      saveData(nextData);
    });
  }

  async function removeUser(userId: string) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      const currentRole = checkPermission(currentData, 'edit-users');
      const nextData = deleteUser(currentData, userId, currentRole);
      saveData(nextData);
    });
  }

  async function updateRoles(selectedRole: AdminRole, permissions: Permission[]) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      const currentRole = checkPermission(currentData, 'edit-roles');
      if (currentRole !== 'Super Admin') throw new Error('เฉพาะ Super Admin ที่แก้ไขสิทธิ์ได้');
      const nextData = saveRolePermissions(currentData, selectedRole, permissions);
      saveData(nextData);
    });
  }

  async function updateOperation(vehicle: Vehicle) {
    await withDemoLock(() => {
      const currentData = getLatestData();
      checkPermission(currentData, 'edit-operations');
      const nextData = saveOperation(currentData, vehicle);
      saveData(nextData);
    });
  }

  async function resetDemo() {
    await withDemoLock(() => {
      const currentData = getLatestData();
      checkPermission(currentData, 'reset');
      saveData(createDemoData());
    });
    setSession(null);
  }

  function dismissWarning() {
    setStorageWarning('');
  }

  useEffect(() => {
    void withDemoLock(() => saveData(getLatestData()));
  }, [initial]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(demoNow(latestData.current)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageWarning('บันทึกการเข้าสู่ระบบไม่ได้ เมื่อรีเฟรชอาจต้องเข้าสู่ระบบอีกครั้ง');
    }
  }, [session]);

  useEffect(() => {
    function syncData(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || storageFailed.current) return;
      try {
        const savedText = localStorage.getItem(STORAGE_KEY);
        const savedData = migrateParkingData(JSON.parse(savedText ?? 'null'));
        if (!isParkingData(savedData)) throw new Error('Invalid data');
        showData(savedData);
      } catch {
        setStorageWarning('ข้อมูลจากอีกแท็บไม่ถูกต้อง กรุณารีเซ็ตข้อมูล Demo');
      }
    }
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, []);

  const contextValue = {
    data,
    now,
    user,
    role,
    storageWarning,
    dismissWarning,
    can,
    login,
    logout,
    previewRole,
    pay,
    exit,
    updateSpot,
    updateFloor,
    updateUser,
    removeUser,
    updateRoles,
    updateOperation,
    resetDemo,
  };
  return <ParkingContext.Provider value={contextValue}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) throw new Error('useParking must be inside ParkingProvider');
  return context;
}
