import React, { useState, useEffect } from 'react';
import { Role } from './types';
import {
  getSpots,
  getTransactions,
  getRates,
  getLogs,
  getGateState,
  subscribeMockApi,
  payTransaction,
  completeExitTransaction,
  registerVehicleEntry,
  updateRates,
  updateSpotStatus,
  toggleManualGate,
  resetToInitialData,
} from './services/mockApi';
import { Header } from './components/Header';
import { CustomerView } from './components/customer/CustomerView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuardView } from './components/guard/GuardView';
import { ExecutiveDashboard } from './components/executive/ExecutiveDashboard';
import { SimulatorModal } from './components/SimulatorModal';
import { DefenseGuideModal } from './components/DefenseGuideModal';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('customer');
  const [spots, setSpots] = useState(getSpots());
  const [transactions, setTransactions] = useState(getTransactions());
  const [rates, setRates] = useState(getRates());
  const [logs, setLogs] = useState(getLogs());
  const [gateState, setGateState] = useState(getGateState());

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Subscribe to reactive MockAPI updates
  useEffect(() => {
    const syncState = () => {
      setSpots(getSpots());
      setTransactions(getTransactions());
      setRates(getRates());
      setLogs(getLogs());
      setGateState(getGateState());
    };

    const unsubscribe = subscribeMockApi(syncState);
    return () => unsubscribe();
  }, []);

  // Handlers
  const handlePay = (txId: string) => {
    payTransaction(txId);
  };

  const handleExitVehicle = (plate: string, overrideReason?: string) => {
    completeExitTransaction(plate, overrideReason);
  };

  const handleRegisterEntry = (
    plate: string,
    province: string,
    model: string,
    floor: 'P1' | 'P2',
  ) => {
    registerVehicleEntry(plate, province, model, floor);
  };

  const handleUpdateRates = (newRates: any) => {
    updateRates(newRates);
  };

  const handleUpdateSpotStatus = (id: string, status: any) => {
    updateSpotStatus(id, status);
  };

  const handleManualGateToggle = (gate: 'entry' | 'exit', state: boolean, reason?: string) => {
    toggleManualGate(gate, state, reason);
  };

  const handleResetData = () => {
    resetToInitialData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Main Header & Role Switcher */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentRole === 'customer' && (
          <CustomerView
            spots={spots}
            transactions={transactions}
            rates={rates}
            onPay={handlePay}
            onExitVehicle={handleExitVehicle}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            spots={spots}
            transactions={transactions}
            rates={rates}
            logs={logs}
            onUpdateRates={handleUpdateRates}
            onUpdateSpotStatus={handleUpdateSpotStatus}
          />
        )}

        {currentRole === 'guard' && (
          <GuardView
            spots={spots}
            transactions={transactions}
            gateState={gateState}
            logs={logs}
            onManualGateToggle={handleManualGateToggle}
            onExitVehicle={handleExitVehicle}
          />
        )}

        {currentRole === 'executive' && (
          <ExecutiveDashboard spots={spots} transactions={transactions} rates={rates} />
        )}
      </main>

      {/* Interactive Hardware Simulator Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        spots={spots}
        transactions={transactions}
        gateState={gateState}
        onRegisterEntry={handleRegisterEntry}
        onExitVehicle={handleExitVehicle}
        onPay={handlePay}
        onResetData={handleResetData}
      />

      {/* Blueprint & Oral Defense Guide Modal */}
      <DefenseGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Auto Parking Web Application • Comprehensive System Blueprint & Architecture</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-400">● 100% Cashless ThaiQR</span>
            <span className="text-cyan-400">● MockAPI REST Storage</span>
            <span className="text-indigo-400">● 4 User Personas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
