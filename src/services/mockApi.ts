import { ParkingSpot, ParkingTransaction, RateConfig, AuditLog, GateState } from '../types';

const SPOTS_STORAGE_KEY = 'autopark_spots_v1';
const TRANSACTIONS_STORAGE_KEY = 'autopark_transactions_v1';
const RATES_STORAGE_KEY = 'autopark_rates_v1';
const LOGS_STORAGE_KEY = 'autopark_logs_v1';
const GATE_STORAGE_KEY = 'autopark_gate_v1';

// Default initial rates based on document
const DEFAULT_RATES: RateConfig = {
  firstHourFree: 1, // 1 hr free
  hourlyRate: 20, // 20 baht/hr
  maxCap: 150, // Max 150 baht/day
  gracePeriodMinutes: 15, // 15 mins Grace Period
  lostTicketFee: 300,
};

// Helper for relative timestamps
const getPastDate = (minutesAgo: number) => {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
};

const INITIAL_SPOTS: ParkingSpot[] = [
  // Floor P1 (A01 - A12)
  {
    id: 'A01',
    floor: 'P1',
    row: 'A',
    number: 1,
    status: 'occupied',
    type: 'regular',
    currentPlate: '1กข1234',
    occupiedSince: getPastDate(135),
  },
  {
    id: 'A02',
    floor: 'P1',
    row: 'A',
    number: 2,
    status: 'occupied',
    type: 'regular',
    currentPlate: '2ขค5678',
    occupiedSince: getPastDate(75),
  },
  {
    id: 'A03',
    floor: 'P1',
    row: 'A',
    number: 3,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'A04',
    floor: 'P1',
    row: 'A',
    number: 4,
    status: 'occupied',
    type: 'ev',
    currentPlate: '3ฆฮ9012',
    occupiedSince: getPastDate(190),
  },
  {
    id: 'A05',
    floor: 'P1',
    row: 'A',
    number: 5,
    status: 'available',
    type: 'ev',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'A06',
    floor: 'P1',
    row: 'A',
    number: 6,
    status: 'maintenance',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'A07',
    floor: 'P1',
    row: 'A',
    number: 7,
    status: 'occupied',
    type: 'lady',
    currentPlate: '5วย4321',
    occupiedSince: getPastDate(45),
  },
  {
    id: 'A08',
    floor: 'P1',
    row: 'A',
    number: 8,
    status: 'available',
    type: 'lady',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'A09',
    floor: 'P1',
    row: 'A',
    number: 9,
    status: 'available',
    type: 'disabled',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'A10',
    floor: 'P1',
    row: 'A',
    number: 10,
    status: 'occupied',
    type: 'regular',
    currentPlate: '6ศษ8899',
    occupiedSince: getPastDate(260),
  },
  {
    id: 'A11',
    floor: 'P1',
    row: 'A',
    number: 11,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'A12',
    floor: 'P1',
    row: 'A',
    number: 12,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },

  // Floor P2 (B01 - B12)
  {
    id: 'B01',
    floor: 'P2',
    row: 'B',
    number: 1,
    status: 'occupied',
    type: 'regular',
    currentPlate: 'กท9999',
    occupiedSince: getPastDate(110),
  },
  {
    id: 'B02',
    floor: 'P2',
    row: 'B',
    number: 2,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B03',
    floor: 'P2',
    row: 'B',
    number: 3,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B04',
    floor: 'P2',
    row: 'B',
    number: 4,
    status: 'occupied',
    type: 'ev',
    currentPlate: '8สน7766',
    occupiedSince: getPastDate(50),
  },
  {
    id: 'B05',
    floor: 'P2',
    row: 'B',
    number: 5,
    status: 'available',
    type: 'ev',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B06',
    floor: 'P2',
    row: 'B',
    number: 6,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B07',
    floor: 'P2',
    row: 'B',
    number: 7,
    status: 'maintenance',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B08',
    floor: 'P2',
    row: 'B',
    number: 8,
    status: 'occupied',
    type: 'regular',
    currentPlate: '9วร3344',
    occupiedSince: getPastDate(180),
  },
  {
    id: 'B09',
    floor: 'P2',
    row: 'B',
    number: 9,
    status: 'available',
    type: 'disabled',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B10',
    floor: 'P2',
    row: 'B',
    number: 10,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B11',
    floor: 'P2',
    row: 'B',
    number: 11,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
  {
    id: 'B12',
    floor: 'P2',
    row: 'B',
    number: 12,
    status: 'available',
    type: 'regular',
    currentPlate: null,
    occupiedSince: null,
  },
];

const INITIAL_TRANSACTIONS: ParkingTransaction[] = [
  {
    id: 'TX-20261013-001',
    plate: '1กข1234',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'Honda Civic (สีขาว)',
    spotId: 'A01',
    floor: 'P1',
    entryTime: getPastDate(135),
    exitTime: null,
    durationMinutes: 135,
    amount: 40, // 2 hr 15 min -> 3 hrs total minus 1 free hr = 2 hrs * 20 = 40 THB
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-884920',
  },
  {
    id: 'TX-20261013-002',
    plate: '2ขค5678',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'Toyota Corolla Cross (สีเทา)',
    spotId: 'A02',
    floor: 'P1',
    entryTime: getPastDate(75),
    exitTime: null,
    durationMinutes: 75,
    amount: 20, // 1 hr 15 min -> 2 hrs minus 1 free = 1 hr * 20 = 20 THB
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-332194',
  },
  {
    id: 'TX-20261013-003',
    plate: '3ฆฮ9012',
    province: 'นนทบุรี',
    vehicleModel: 'BYD Atto 3 EV (สีฟ้า)',
    spotId: 'A04',
    floor: 'P1',
    entryTime: getPastDate(190),
    exitTime: null,
    durationMinutes: 190,
    amount: 60,
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-772183',
  },
  {
    id: 'TX-20261013-004',
    plate: '5วย4321',
    province: 'ชลบุรี',
    vehicleModel: 'Mazda 2 (สีแดง)',
    spotId: 'A07',
    floor: 'P1',
    entryTime: getPastDate(45),
    exitTime: null,
    durationMinutes: 45,
    amount: 0, // 45 min is under 1 hr free
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-119932',
  },
  {
    id: 'TX-20261013-005',
    plate: '6ศษ8899',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'Mercedes-Benz C220d (สีดำ)',
    spotId: 'A10',
    floor: 'P1',
    entryTime: getPastDate(260),
    exitTime: null,
    durationMinutes: 260,
    amount: 80,
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-645312',
  },
  {
    id: 'TX-20261013-006',
    plate: 'กท9999',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'BMW 330e (สีขาว)',
    spotId: 'B01',
    floor: 'P2',
    entryTime: getPastDate(110),
    exitTime: null,
    durationMinutes: 110,
    amount: 40,
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-994411',
  },
  {
    id: 'TX-20261013-007',
    plate: '8สน7766',
    province: 'ปทุมธานี',
    vehicleModel: 'Tesla Model Y (สีดำ)',
    spotId: 'B04',
    floor: 'P2',
    entryTime: getPastDate(50),
    exitTime: null,
    durationMinutes: 50,
    amount: 0,
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: 'REF-552211',
  },
  {
    id: 'TX-20261013-008',
    plate: '9วร3344',
    province: 'สมุทรปราการ',
    vehicleModel: 'Honda HR-V (สีบรอนซ์)',
    spotId: 'B08',
    floor: 'P2',
    entryTime: getPastDate(180),
    exitTime: null,
    durationMinutes: 180,
    amount: 40,
    status: 'paid', // already paid, in grace period!
    paidAt: getPastDate(5),
    paymentMethod: 'ThaiQR PromptPay',
    gracePeriodExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    paymentRef: 'REF-442299',
  },
  // Past completed transactions for today
  {
    id: 'TX-20261013-009',
    plate: '4กล1122',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'Toyota Yaris (สีขาว)',
    spotId: 'A03',
    floor: 'P1',
    entryTime: getPastDate(320),
    exitTime: getPastDate(180),
    durationMinutes: 140,
    amount: 40,
    status: 'completed',
    paidAt: getPastDate(190),
    paymentMethod: 'ThaiQR PromptPay',
    gracePeriodExpiresAt: getPastDate(175),
    paymentRef: 'REF-109923',
  },
  {
    id: 'TX-20261013-010',
    plate: '7ฬร6655',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'Isuzu D-Max (สีเงิน)',
    spotId: 'B02',
    floor: 'P2',
    entryTime: getPastDate(420),
    exitTime: getPastDate(200),
    durationMinutes: 220,
    amount: 60,
    status: 'completed',
    paidAt: getPastDate(210),
    paymentMethod: 'ThaiQR PromptPay',
    gracePeriodExpiresAt: getPastDate(195),
    paymentRef: 'REF-998811',
  },
  {
    id: 'TX-20261013-011',
    plate: '2ชข7711',
    province: 'นนทบุรี',
    vehicleModel: 'MG 4 Electric (สีส้ม)',
    spotId: 'A05',
    floor: 'P1',
    entryTime: getPastDate(500),
    exitTime: getPastDate(300),
    durationMinutes: 200,
    amount: 60,
    status: 'completed',
    paidAt: getPastDate(310),
    paymentMethod: 'ThaiQR PromptPay',
    gracePeriodExpiresAt: getPastDate(295),
    paymentRef: 'REF-771199',
  },
  {
    id: 'TX-20261013-012',
    plate: 'ภง8888',
    province: 'กรุงเทพมหานคร',
    vehicleModel: 'Porsche Cayenne (สีดำ)',
    spotId: 'A11',
    floor: 'P1',
    entryTime: getPastDate(600),
    exitTime: getPastDate(120),
    durationMinutes: 480,
    amount: 150, // Hit max cap
    status: 'completed',
    paidAt: getPastDate(130),
    paymentMethod: 'ThaiQR PromptPay',
    gracePeriodExpiresAt: getPastDate(115),
    paymentRef: 'REF-888899',
  },
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: getPastDate(240),
    action: 'RATE_UPDATE',
    actorRole: 'Admin',
    actorName: 'คุณสมชาย (Facility Manager)',
    details: 'อัปเดตอัตราค่าจอดรถ: ฟรี 1 ชม. แรก, อัตรา 20 บ./ชม., เพดานสูงสุด 150 บ.',
    type: 'info',
  },
  {
    id: 'LOG-002',
    timestamp: getPastDate(210),
    action: 'MAINTENANCE_TOGGLE',
    actorRole: 'Admin',
    actorName: 'คุณสมชาย (Facility Manager)',
    details: 'ปิดซ่อมบำรุงช่องจอด A06 และ B07 ชั่วคราว (ซ่อมเซนเซอร์ตรวจจับ)',
    type: 'warning',
  },
  {
    id: 'LOG-003',
    timestamp: getPastDate(135),
    action: 'VEHICLE_ENTRY',
    actorRole: 'System LPR',
    actorName: 'กล้อง LPR ทางเข้า 01',
    details: 'ตรวจจับรถป้ายทะเบียน 1กข1234 ขับเข้าสู่ช่องจอด A01 (ชั้น P1)',
    type: 'info',
  },
  {
    id: 'LOG-004',
    timestamp: getPastDate(80),
    action: 'OVERRIDE_GATE',
    actorRole: 'Guard',
    actorName: 'พี่เดช (Field Security Officer)',
    details: 'เปิดไม้กั้นฉุกเฉินสำหรับรถพยาบาลฉุกเฉิน (Manual Override)',
    type: 'danger',
  },
  {
    id: 'LOG-005',
    timestamp: getPastDate(5),
    action: 'PAYMENT_CONFIRMED',
    actorRole: 'Customer',
    actorName: 'ระบบ ThaiQR Gateway',
    details:
      'ชำระเงินค่าจอด 40.00 บาท สำเร็จ สำหรับทะเบียน 9วร3344 (เริ่มนับถอยหลัง Grace Period 15 นาที)',
    type: 'success',
  },
];

const INITIAL_GATE: GateState = {
  entryGateOpen: false,
  exitGateOpen: false,
  lastEntryPlate: '1กข1234',
  lastExitPlate: '4กล1122',
  entryCameraDetecting: false,
  exitCameraDetecting: false,
};

// LocalStorage helpers
function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}

// Memory caching
let spotsCache: ParkingSpot[] = loadStorage(SPOTS_STORAGE_KEY, INITIAL_SPOTS);
let transactionsCache: ParkingTransaction[] = loadStorage(
  TRANSACTIONS_STORAGE_KEY,
  INITIAL_TRANSACTIONS,
);
let ratesCache: RateConfig = loadStorage(RATES_STORAGE_KEY, DEFAULT_RATES);
let logsCache: AuditLog[] = loadStorage(LOGS_STORAGE_KEY, INITIAL_LOGS);
let gateCache: GateState = loadStorage(GATE_STORAGE_KEY, INITIAL_GATE);

// Reactive listeners
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeMockApi(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

// Fee calculation engine based on current rates
export function calculateParkingFee(
  entryTimeStr: string,
  exitTimeStr?: string,
): { durationMinutes: number; amount: number; billableHours: number } {
  const entry = new Date(entryTimeStr).getTime();
  const exit = exitTimeStr ? new Date(exitTimeStr).getTime() : Date.now();
  const diffMs = Math.max(0, exit - entry);
  const durationMinutes = Math.floor(diffMs / (1000 * 60));

  const rates = getRates();
  // Duration in hours (any fraction of an hour is counted as full hour)
  const totalHours = Math.ceil(durationMinutes / 60);

  let billableHours = Math.max(0, totalHours - rates.firstHourFree);
  let amount = billableHours * rates.hourlyRate;

  if (amount > rates.maxCap) {
    amount = rates.maxCap;
  }

  return { durationMinutes, amount, billableHours };
}

// Service Methods (RESTful mock endpoints)
export function getSpots(): ParkingSpot[] {
  return [...spotsCache];
}

export function updateSpotStatus(
  id: string,
  status: ParkingSpot['status'],
  currentPlate: string | null = null,
): ParkingSpot | null {
  const index = spotsCache.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const prev = spotsCache[index];
  const updated: ParkingSpot = {
    ...prev,
    status,
    currentPlate: status === 'occupied' ? (currentPlate ?? prev.currentPlate) : null,
    occupiedSince: status === 'occupied' ? prev.occupiedSince || new Date().toISOString() : null,
  };

  spotsCache[index] = updated;
  saveStorage(SPOTS_STORAGE_KEY, spotsCache);

  if (prev.status !== status) {
    addAuditLog({
      action: 'MAINTENANCE_TOGGLE',
      actorRole: 'Admin',
      actorName: 'คุณสมชาย (Facility Manager)',
      details: `ปรับสถานะช่องจอด ${id} (ชั้น ${updated.floor}) เป็น ${status === 'maintenance' ? 'ปิดซ่อมบำรุง' : status === 'available' ? 'พร้อมใช้งาน' : 'มีรถจอด'}`,
      type: status === 'maintenance' ? 'warning' : 'info',
    });
  }

  notify();
  return updated;
}

export function getTransactions(): ParkingTransaction[] {
  // Update live duration & amount for unpaid cars
  return transactionsCache.map((tx) => {
    if (tx.status === 'unpaid') {
      const { durationMinutes, amount } = calculateParkingFee(tx.entryTime);
      return { ...tx, durationMinutes, amount };
    }
    return tx;
  });
}

export function findTransactionByPlate(plate: string): ParkingTransaction | null {
  const cleanPlate = plate.replace(/\s+/g, '').toLowerCase();
  const all = getTransactions();
  return (
    all.find(
      (tx) =>
        tx.plate.replace(/\s+/g, '').toLowerCase() === cleanPlate &&
        (tx.status === 'unpaid' || tx.status === 'paid'),
    ) || null
  );
}

export function payTransaction(
  txId: string,
  method: string = 'ThaiQR PromptPay',
): ParkingTransaction | null {
  const index = transactionsCache.findIndex((t) => t.id === txId);
  if (index === -1) return null;

  const current = transactionsCache[index];
  const now = new Date();
  const rates = getRates();
  const graceExpires = new Date(now.getTime() + rates.gracePeriodMinutes * 60 * 1000);

  const updated: ParkingTransaction = {
    ...current,
    status: 'paid',
    paidAt: now.toISOString(),
    paymentMethod: method,
    gracePeriodExpiresAt: graceExpires.toISOString(),
  };

  transactionsCache[index] = updated;
  saveStorage(TRANSACTIONS_STORAGE_KEY, transactionsCache);

  addAuditLog({
    action: 'PAYMENT_CONFIRMED',
    actorRole: 'Customer',
    actorName: 'ThaiQR Gateway (Cashless)',
    details: `ชำระเงินค่าจอดรถสำเร็จ ทะเบียน ${current.plate} ยอด ${current.amount.toFixed(2)} บาท ผ่าน ${method} (Grace Period ${rates.gracePeriodMinutes} นาที)`,
    type: 'success',
  });

  notify();
  return updated;
}

export function completeExitTransaction(plate: string, overrideReason?: string): boolean {
  const index = transactionsCache.findIndex(
    (t) => t.plate.replace(/\s+/g, '') === plate.replace(/\s+/g, '') && t.status !== 'completed',
  );

  const now = new Date().toISOString();
  if (index !== -1) {
    const tx = transactionsCache[index];
    transactionsCache[index] = {
      ...tx,
      status: 'completed',
      exitTime: now,
    };
    saveStorage(TRANSACTIONS_STORAGE_KEY, transactionsCache);

    // Free the parking spot
    const spotIdx = spotsCache.findIndex((s) => s.id === tx.spotId);
    if (spotIdx !== -1) {
      spotsCache[spotIdx] = {
        ...spotsCache[spotIdx],
        status: 'available',
        currentPlate: null,
        occupiedSince: null,
      };
      saveStorage(SPOTS_STORAGE_KEY, spotsCache);
    }
  }

  // Trigger Exit Gate Open
  gateCache = {
    ...gateCache,
    exitGateOpen: true,
    lastExitPlate: plate,
    exitCameraDetecting: false,
  };
  saveStorage(GATE_STORAGE_KEY, gateCache);

  addAuditLog({
    action: overrideReason ? 'OVERRIDE_GATE' : 'VEHICLE_EXIT',
    actorRole: overrideReason ? 'Guard' : 'System LPR',
    actorName: overrideReason ? 'พี่เดช (Field Security Officer)' : 'กล้อง LPR ประตูทางออก',
    details: overrideReason
      ? `เปิดไม้กั้นฉุกเฉิน (Manual Override) ทะเบียน ${plate} เหตุผล: ${overrideReason}`
      : `รถทะเบียน ${plate} ผ่านการตรวจเช็คชำระเงินเรียบร้อย ไม้กั้นทางออกเปิดอัตโนมัติ`,
    type: overrideReason ? 'danger' : 'success',
  });

  notify();

  // Auto close barrier after 4 seconds
  setTimeout(() => {
    gateCache = { ...gateCache, exitGateOpen: false };
    saveStorage(GATE_STORAGE_KEY, gateCache);
    notify();
  }, 4000);

  return true;
}

export function registerVehicleEntry(
  plate: string,
  province: string,
  vehicleModel: string,
  floorPreference: 'P1' | 'P2' = 'P1',
): ParkingTransaction | null {
  // Find available spot on preferred floor or fallback
  let spot = spotsCache.find((s) => s.floor === floorPreference && s.status === 'available');
  if (!spot) {
    spot = spotsCache.find((s) => s.status === 'available');
  }

  if (!spot) {
    alert('ที่จอดรถเต็มทุกช่อง!');
    return null;
  }

  const now = new Date().toISOString();
  const txId = `TX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

  const newTx: ParkingTransaction = {
    id: txId,
    plate,
    province,
    vehicleModel,
    spotId: spot.id,
    floor: spot.floor,
    entryTime: now,
    exitTime: null,
    durationMinutes: 0,
    amount: 0,
    status: 'unpaid',
    paidAt: null,
    paymentMethod: null,
    gracePeriodExpiresAt: null,
    paymentRef: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  transactionsCache.unshift(newTx);
  saveStorage(TRANSACTIONS_STORAGE_KEY, transactionsCache);

  // Mark spot occupied
  const spotIdx = spotsCache.findIndex((s) => s.id === spot!.id);
  spotsCache[spotIdx] = {
    ...spotsCache[spotIdx],
    status: 'occupied',
    currentPlate: plate,
    occupiedSince: now,
  };
  saveStorage(SPOTS_STORAGE_KEY, spotsCache);

  // Trigger Entry Gate Open
  gateCache = {
    ...gateCache,
    entryGateOpen: true,
    lastEntryPlate: plate,
    entryCameraDetecting: false,
  };
  saveStorage(GATE_STORAGE_KEY, gateCache);

  addAuditLog({
    action: 'VEHICLE_ENTRY',
    actorRole: 'System LPR',
    actorName: 'กล้อง LPR ประตูทางเข้า',
    details: `รถทะเบียน ${plate} (${vehicleModel}) สแกนเข้าลานจอด มอบหมายช่อง ${spot.id} (ชั้น ${spot.floor}) ไม้กั้นเปิดอัตโนมัติ`,
    type: 'info',
  });

  notify();

  // Auto close barrier after 4 seconds
  setTimeout(() => {
    gateCache = { ...gateCache, entryGateOpen: false };
    saveStorage(GATE_STORAGE_KEY, gateCache);
    notify();
  }, 4000);

  return newTx;
}

export function getRates(): RateConfig {
  return { ...ratesCache };
}

export function updateRates(rates: Partial<RateConfig>): RateConfig {
  ratesCache = { ...ratesCache, ...rates };
  saveStorage(RATES_STORAGE_KEY, ratesCache);

  addAuditLog({
    action: 'RATE_UPDATE',
    actorRole: 'Admin',
    actorName: 'คุณสมชาย (Facility Manager)',
    details: `ปรับเกณฑ์ราคา: ฟรี ${ratesCache.firstHourFree} ชม. แรก, อัตรา ${ratesCache.hourlyRate} บ./ชม., เพดานสูงสุด ${ratesCache.maxCap} บ./วัน, Grace Period ${ratesCache.gracePeriodMinutes} นาที`,
    type: 'info',
  });

  notify();
  return { ...ratesCache };
}

export function getLogs(): AuditLog[] {
  return [...logsCache];
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const newLog: AuditLog = {
    ...log,
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
  };
  logsCache.unshift(newLog);
  saveStorage(LOGS_STORAGE_KEY, logsCache);
  notify();
}

export function getGateState(): GateState {
  return { ...gateCache };
}

export function toggleManualGate(gate: 'entry' | 'exit', state: boolean, reason?: string): void {
  if (gate === 'entry') {
    gateCache = { ...gateCache, entryGateOpen: state };
  } else {
    gateCache = { ...gateCache, exitGateOpen: state };
  }
  saveStorage(GATE_STORAGE_KEY, gateCache);

  if (state) {
    addAuditLog({
      action: 'OVERRIDE_GATE',
      actorRole: 'Guard',
      actorName: 'พี่เดช (Field Security Officer)',
      details: `สั่งเปิดไม้กั้น${gate === 'entry' ? 'ทางเข้า' : 'ทางออก'}แบบ Manual Override${reason ? ` เหตุผล: ${reason}` : ''}`,
      type: 'danger',
    });
  }

  notify();
}

export function resetToInitialData(): void {
  localStorage.removeItem(SPOTS_STORAGE_KEY);
  localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  localStorage.removeItem(RATES_STORAGE_KEY);
  localStorage.removeItem(LOGS_STORAGE_KEY);
  localStorage.removeItem(GATE_STORAGE_KEY);

  spotsCache = [...INITIAL_SPOTS];
  transactionsCache = [...INITIAL_TRANSACTIONS];
  ratesCache = { ...DEFAULT_RATES };
  logsCache = [...INITIAL_LOGS];
  gateCache = { ...INITIAL_GATE };

  saveStorage(SPOTS_STORAGE_KEY, spotsCache);
  saveStorage(TRANSACTIONS_STORAGE_KEY, transactionsCache);
  saveStorage(RATES_STORAGE_KEY, ratesCache);
  saveStorage(LOGS_STORAGE_KEY, logsCache);
  saveStorage(GATE_STORAGE_KEY, gateCache);

  notify();
}
