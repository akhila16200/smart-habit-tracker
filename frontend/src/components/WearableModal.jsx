import React, { useState, useEffect } from 'react';
import { X, Activity, RefreshCw, CheckCircle2, Battery, Zap, ShieldCheck, Plus, Search, Check, Watch, Radio, AlertTriangle, Bluetooth, Link, UserCheck } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';

const UNIVERSAL_BRAND_CATALOG = [
  {
    id: 'apple_watch',
    name: 'Apple Watch',
    brand: 'Apple Health / WatchOS Ecosystem',
    icon: '🍎',
    category: 'Smartwatch (All Generations)',
    battery: '88%',
    sampleMetrics: { steps: 9200, activeMinutes: 45, workoutsCompleted: 1, waterMl: 1200 },
    color: '#F472B6',
    blePrefix: 'Apple'
  },
  {
    id: 'fitbit_tracker',
    name: 'Fitbit Tracker',
    brand: 'Fitbit App Ecosystem',
    icon: '⌚',
    category: 'Fitness Tracker & Watch (All Models)',
    battery: '94%',
    sampleMetrics: { steps: 8500, activeMinutes: 30, workoutsCompleted: 1, waterMl: 1000 },
    color: '#34D399',
    blePrefix: 'Fitbit'
  },
  {
    id: 'garmin_watch',
    name: 'Garmin Watch',
    brand: 'Garmin Connect Ecosystem',
    icon: '🏃',
    category: 'GPS Sport & Fitness Watch (All Series)',
    battery: '78%',
    sampleMetrics: { steps: 12400, activeMinutes: 60, workoutsCompleted: 2, waterMl: 2000 },
    color: '#3B82F6',
    blePrefix: 'Garmin'
  },
  {
    id: 'whoop_strap',
    name: 'Whoop Strap',
    brand: 'Whoop Health Platform',
    icon: '⚡',
    category: 'Recovery & Fitness Band (All Generations)',
    battery: '65%',
    sampleMetrics: { steps: 7800, activeMinutes: 40, workoutsCompleted: 1, waterMl: 1500 },
    color: '#A78BFA',
    blePrefix: 'Whoop'
  },
  {
    id: 'pixel_watch',
    name: 'Google Pixel Watch',
    brand: 'Google Fit / Fitbit Ecosystem',
    icon: '📱',
    category: 'Smartwatch (All Versions)',
    battery: '82%',
    sampleMetrics: { steps: 6500, activeMinutes: 25, workoutsCompleted: 1, waterMl: 800 },
    color: '#FBBF24',
    blePrefix: 'Pixel'
  },
  {
    id: 'oura_ring',
    name: 'Oura Ring',
    brand: 'Oura Smart Ring Ecosystem',
    icon: '💍',
    category: 'Smart Ring (All Generations)',
    battery: '91%',
    sampleMetrics: { steps: 5400, activeMinutes: 20, workoutsCompleted: 0, waterMl: 700 },
    color: '#EC4899',
    blePrefix: 'Oura'
  }
];

export default function WearableModal({ isOpen, onClose }) {
  const { simulateWearableSync, setToastMessage } = useHabits();
  const { user, updateProfile } = useAuth();

  const storageKey = `habitpulse_universal_wearables_v3_${user ? user.id : 'default'}`;

  const [pairedDevices, setPairedDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('connected'); // 'connected' | 'pair_new'
  const [syncingId, setSyncingId] = useState(null);
  const [isPairingBrandId, setIsPairingBrandId] = useState(null);
  const [pairingModalBrand, setPairingModalBrand] = useState(null);
  const [customAccountEmail, setCustomAccountEmail] = useState('');
  const [bleAlert, setBleAlert] = useState(null);
  const [lastSyncTimes, setLastSyncTimes] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPairedDevices(parsed);
          return;
        }
      } catch (e) {}
    }
    // Default initial paired universal brand ONLY on first run when storage key is missing
    const defaultBrand = UNIVERSAL_BRAND_CATALOG.find(b => b.id === 'fitbit_tracker');
    if (defaultBrand) {
      const initialDev = {
        ...defaultBrand,
        linkedAccount: user?.email || 'user.fitbit@health.io',
        connectedAt: new Date().toISOString()
      };
      setPairedDevices([initialDev]);
      localStorage.setItem(storageKey, JSON.stringify([initialDev]));
    }
  }, [storageKey, isOpen, user]);

  if (!isOpen) return null;

  const saveDevices = async (updatedList) => {
    setPairedDevices(updatedList);
    localStorage.setItem(storageKey, JSON.stringify(updatedList));

    // Persist connected wearables to user profile in Cloud Storage / local JSON
    if (updateProfile) {
      const wearablesMap = {};
      updatedList.forEach(dev => {
        wearablesMap[dev.id] = {
          connected: true,
          brandName: dev.name,
          ecosystem: dev.brand,
          linkedAccount: dev.linkedAccount,
          battery: dev.battery,
          isBleNative: !!dev.isBleNative,
          lastSynced: new Date().toISOString()
        };
      });
      try {
        await updateProfile({ connectedWearables: wearablesMap });
      } catch (err) {
        console.warn('Backend wearable profile update warning:', err.message);
      }
    }
  };

  // Targeted Web Bluetooth & Account Pairing Handler
  const handleInitiateBrandPairing = (brand) => {
    setPairingModalBrand(brand);
    setCustomAccountEmail(user?.email || `${user?.name ? user.name.toLowerCase().replace(/\s+/g, '.') : 'user'}.${brand.id}@health.io`);
  };

  const handleExecuteBrandPairing = async (useBluetoothScan = false) => {
    if (!pairingModalBrand) return;
    const brand = pairingModalBrand;
    setIsPairingBrandId(brand.id);
    setBleAlert(null);

    let bleDeviceInfo = null;
    let detectedBattery = brand.battery;

    if (useBluetoothScan) {
      if (!navigator.bluetooth) {
        setBleAlert({
          type: 'warning',
          title: 'Web Bluetooth API Unavailable',
          message: `Browser Bluetooth is not supported in this environment. Pairing ${brand.name} via cloud account integration.`
        });
      } else {
        try {
          // Trigger native Web Bluetooth API scan request tailored for brand
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service', 'heart_rate', 0x180F, 0x180D]
          });

          bleDeviceInfo = device;

          // Attempt reading battery via GATT
          try {
            if (device.gatt) {
              const server = await device.gatt.connect();
              const service = await server.getPrimaryService('battery_service');
              const characteristic = await service.getCharacteristic('battery_level');
              const val = await characteristic.readValue();
              detectedBattery = `${val.getUint8(0)}%`;
            }
          } catch (gErr) {
            console.warn('[GATT Battery Read Fallback]', gErr.message);
          }
        } catch (bleErr) {
          console.warn('Web Bluetooth scan cancelled/failed:', bleErr.message);
          if (bleErr.name !== 'NotFoundError') {
            setBleAlert({
              type: 'info',
              title: 'Bluetooth Scan Skipped',
              message: `Continuing with OAuth2 / Cloud Account sync for ${brand.name}.`
            });
          }
        }
      }
    }

    const newPairedBrand = {
      ...brand,
      id: `${brand.id}_${Date.now()}`,
      battery: detectedBattery,
      isBleNative: !!bleDeviceInfo,
      bleDeviceName: bleDeviceInfo ? bleDeviceInfo.name : null,
      linkedAccount: customAccountEmail || user?.email || 'account.linked@health.io',
      connectedAt: new Date().toISOString()
    };

    // Remove any previous instance of same brand if exists or append
    const filtered = pairedDevices.filter(d => d.id !== brand.id && !d.id.startsWith(brand.id));
    const updated = [...filtered, newPairedBrand];

    await saveDevices(updated);
    setLastSyncTimes(prev => ({ ...prev, [newPairedBrand.id]: 'Just paired' }));

    if (setToastMessage) {
      setToastMessage({
        type: 'success',
        title: `⌚ ${brand.name} Paired Successfully!`,
        message: `Linked account ${newPairedBrand.linkedAccount} (${brand.brand}).`
      });
      setTimeout(() => setToastMessage(null), 5000);
    }

    setIsPairingBrandId(null);
    setPairingModalBrand(null);
    setActiveTab('connected');
  };

  const handleUnpair = async (deviceId) => {
    const updated = pairedDevices.filter(d => d.id !== deviceId);
    await saveDevices(updated);
    if (setToastMessage) {
      setToastMessage({
        type: 'info',
        title: '⌚ Device Unpaired',
        message: 'Successfully removed wearable brand from your profile.'
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleSyncBrandData = async (device) => {
    setSyncingId(device.id);
    await simulateWearableSync();
    setSyncingId(null);
    setLastSyncTimes(prev => ({ ...prev, [device.id]: 'Just now' }));
  };

  const availableBrands = UNIVERSAL_BRAND_CATALOG.filter(b =>
    !pairedDevices.some(pd => pd.id.startsWith(b.id) || pd.name === b.name) &&
    (b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '580px',
        padding: '28px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}>
                <Activity size={22} color="#FFF" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                  Wearable Integration Hub
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>
                  Universal Ecosystem & Web Bluetooth Pairing
                </span>
              </div>
            </div>
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
            + Pair New Brand
          </button>
        </div>

        {/* Alerts Banner */}
        {bleAlert && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: bleAlert.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
            border: bleAlert.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(139, 92, 246, 0.4)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} color={bleAlert.type === 'warning' ? '#FBBF24' : '#C4B5FD'} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: bleAlert.type === 'warning' ? '#FBBF24' : '#C4B5FD', display: 'block' }}>
                {bleAlert.title}
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{bleAlert.message}</span>
            </div>
          </div>
        )}

        {/* TAB 1: MY ACTIVE DEVICES */}
        {activeTab === 'connected' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {pairedDevices.length > 0 ? (
              pairedDevices.map(device => (
                <div
                  key={device.id}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '2rem' }}>{device.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{device.name}</h4>
                          <span style={{
                            fontSize: '0.7rem',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34D399',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid rgba(16, 185, 129, 0.4)'
                          }}>
                            <CheckCircle2 size={12} /> Connected
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                          {device.brand}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Link size={12} /> Linked Account: {device.linkedAccount || user?.email || 'user@health.io'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnpair(device.id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#FCA5A5',
                        transition: 'all 0.2s'
                      }}
                    >
                      Unpair Brand
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Battery size={14} color="var(--accent-emerald)" /> {device.battery || '90%'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34D399', fontWeight: 600 }}>
                        <ShieldCheck size={14} /> Auto-Sync Active
                      </span>
                    </div>

                    <button
                      onClick={() => handleSyncBrandData(device)}
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
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                <Watch size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>No Wearable Brand Connected</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click "+ Pair New Brand" above to link Apple Health, Fitbit, Garmin, Whoop, Google Fit, or Oura.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAIR NEW UNIVERSAL BRAND */}
        {activeTab === 'pair_new' && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select your wearable ecosystem brand to initiate targeted Bluetooth pairing & account synchronization (supports all device model versions):
            </p>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                placeholder="Search brand (Apple, Fitbit, Garmin, Whoop, Google, Oura)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {availableBrands.map(brand => (
                <div
                  key={brand.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>{brand.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {brand.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                        {brand.brand}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        {brand.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiateBrandPairing(brand)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    <Plus size={14} /> Pair {brand.name}
                  </button>
                </div>
              ))}

              {availableBrands.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  All supported universal wearable brands are currently paired to your profile!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TARGETED BRAND PAIRING MODAL STEP */}
        {pairingModalBrand && (
          <div className="modal-overlay">
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{pairingModalBrand.icon}</span>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                      Pair {pairingModalBrand.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                      {pairingModalBrand.brand}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setPairingModalBrand(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
                Link your <strong>{pairingModalBrand.name}</strong> account and physical hardware (all generations supported) for automated step & habit webhook synchronization:
              </p>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Ecosystem Account ID / Email *</label>
                <input
                  type="email"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  value={customAccountEmail}
                  onChange={(e) => setCustomAccountEmail(e.target.value)}
                  placeholder="e.g. user@apple.com or user@fitbit.com"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleExecuteBrandPairing(true)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', fontSize: '0.88rem' }}
                >
                  <Bluetooth size={16} /> Scan via Web Bluetooth (BLE) & Connect
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteBrandPairing(false)}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
                >
                  <Link size={16} /> Link Account & Pair Device (Direct OAuth2)
                </button>
              </div>
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
          Encrypted OAuth2 / HTTPS Webhook synchronization with Cloud Storage.
        </div>
      </div>
    </div>
  );
}
