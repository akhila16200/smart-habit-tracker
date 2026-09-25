import React, { useState, useEffect } from 'react';
import { X, Activity, RefreshCw, CheckCircle2, Battery, Zap, ShieldCheck, Plus, Search, Check, Smartphone, Watch } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';

const SUPPORTED_DEVICES_CATALOG = [
  {
    id: 'apple_watch_9',
    name: 'Apple Watch Series 9',
    brand: 'Apple Health',
    icon: '🍎',
    category: 'Smartwatch',
    battery: '88%',
    sampleMetrics: { steps: 9200, activeMinutes: 45, workoutsCompleted: 1, waterMl: 1200 },
    color: '#F472B6'
  },
  {
    id: 'fitbit_charge_6',
    name: 'Fitbit Charge 6',
    brand: 'Fitbit OS',
    icon: '⌚',
    category: 'Fitness Tracker',
    battery: '94%',
    sampleMetrics: { steps: 8500, activeMinutes: 30, workoutsCompleted: 1, waterMl: 1000 },
    color: '#34D399'
  },
  {
    id: 'garmin_forerunner',
    name: 'Garmin Forerunner 965',
    brand: 'Garmin Connect',
    icon: '🏃',
    category: 'GPS Sport Watch',
    battery: '78%',
    sampleMetrics: { steps: 12400, activeMinutes: 60, workoutsCompleted: 2, waterMl: 2000 },
    color: '#3B82F6'
  },
  {
    id: 'whoop_4',
    name: 'Whoop 4.0 Strap',
    brand: 'Whoop Platform',
    icon: '⚡',
    category: 'Recovery Band',
    battery: '65%',
    sampleMetrics: { steps: 7800, activeMinutes: 40, workoutsCompleted: 1, waterMl: 1500 },
    color: '#A78BFA'
  },
  {
    id: 'pixel_watch_2',
    name: 'Google Pixel Watch 2',
    brand: 'Google Fit',
    icon: '📱',
    category: 'Smartwatch',
    battery: '82%',
    sampleMetrics: { steps: 6500, activeMinutes: 25, workoutsCompleted: 1, waterMl: 800 },
    color: '#FBBF24'
  },
  {
    id: 'oura_ring_3',
    name: 'Oura Ring Horizon Gen 3',
    brand: 'Oura Health',
    icon: '💍',
    category: 'Smart Ring',
    battery: '91%',
    sampleMetrics: { steps: 5400, activeMinutes: 20, workoutsCompleted: 0, waterMl: 700 },
    color: '#EC4899'
  }
];

export default function WearableModal({ isOpen, onClose }) {
  const { simulateWearableSync } = useHabits();
  const { user } = useAuth();

  const storageKey = `habitpulse_paired_devices_${user ? user.id : 'default'}`;

  const [pairedDeviceIds, setPairedDeviceIds] = useState(['fitbit_charge_6']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('connected'); // 'connected' | 'pair_new'
  const [syncingId, setSyncingId] = useState(null);
  const [lastSyncTimes, setLastSyncTimes] = useState({ fitbit_charge_6: '10 mins ago' });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPairedDeviceIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, [storageKey]);

  if (!isOpen) return null;

  const savePairedDevices = (newIds) => {
    setPairedDeviceIds(newIds);
    localStorage.setItem(storageKey, JSON.stringify(newIds));
  };

  const handlePairDevice = (device) => {
    if (!pairedDeviceIds.includes(device.id)) {
      const updated = [...pairedDeviceIds, device.id];
      savePairedDevices(updated);
      setLastSyncTimes(prev => ({ ...prev, [device.id]: 'Just paired' }));
    }
  };

  const handleUnpairDevice = (deviceId) => {
    const updated = pairedDeviceIds.filter(id => id !== deviceId);
    savePairedDevices(updated);
  };

  const handleSyncDevice = async (device) => {
    setSyncingId(device.id);
    await simulateWearableSync();
    setSyncingId(null);
    setLastSyncTimes(prev => ({ ...prev, [device.id]: 'Just now' }));
  };

  const pairedDevices = SUPPORTED_DEVICES_CATALOG.filter(d => pairedDeviceIds.includes(d.id));

  const availableDevices = SUPPORTED_DEVICES_CATALOG.filter(d =>
    !pairedDeviceIds.includes(d.id) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        position: 'relative',
        maxHeight: '88vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--accent-emerald)" />
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                Wearable Integration Hub
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Pair fitness trackers to auto-check habits & sync streaks
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('connected')}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'connected' ? 'var(--accent-purple)' : 'transparent',
              color: activeTab === 'connected' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            My Devices ({pairedDevices.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pair_new')}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'pair_new' ? 'var(--accent-purple)' : 'transparent',
              color: activeTab === 'pair_new' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            + Pair New Device
          </button>
        </div>

        {/* Tab 1: Paired Devices */}
        {activeTab === 'connected' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {pairedDevices.length > 0 ? (
              pairedDevices.map(device => (
                <div
                  key={device.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.8rem' }}>{device.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{device.name}</h4>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                            Connected
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {device.brand} • Last sync: {lastSyncTimes[device.id] || 'Recently'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnpairDevice(device.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#FCA5A5'
                      }}
                    >
                      Unpair
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Battery size={14} color="var(--accent-emerald)" /> {device.battery}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)' }}>
                        <ShieldCheck size={14} /> Auto-Sync Active
                      </span>
                    </div>

                    <button
                      onClick={() => handleSyncDevice(device)}
                      className="btn-secondary"
                      disabled={syncingId === device.id}
                      style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    >
                      <RefreshCw size={12} className={syncingId === device.id ? 'spin' : ''} />
                      {syncingId === device.id ? 'Syncing...' : 'Sync Webhook Data'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                <Watch size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Wearable Devices Paired</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click "+ Pair New Device" above to connect your smartwatch or tracker.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pair New Device Catalog */}
        {activeTab === 'pair_new' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                placeholder="Search device by name or brand (Fitbit, Apple, Garmin, Whoop)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {availableDevices.map(device => (
                <div
                  key={device.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{device.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{device.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {device.brand} • {device.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => { handlePairDevice(device); setActiveTab('connected'); }}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} /> Pair Device
                  </button>
                </div>
              ))}

              {availableDevices.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  All supported devices are currently paired to your profile!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Note Footer */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          fontSize: '0.78rem',
          color: '#C4B5FD',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={16} color="var(--accent-purple)" />
          Encrypted OAuth2 / HTTPS Webhook synchronization with Amazon DynamoDB.
        </div>
      </div>
    </div>
  );
}
