'use client';

import React, { useState, useEffect } from 'react';

export default function AdminConfigPage() {
  const [activeTab, setActiveTab] = useState<'master' | 'locations' | 'banks' | 'system'>('master');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Settings State
  const [seedInterestRate, setSeedInterestRate] = useState<number>(1.10);
  const [scaleTolerancePercent, setScaleTolerancePercent] = useState<number>(1.5);
  const [orgName, setOrgName] = useState<string>('IBIS RICE Cambodia');
  const [defaultCurrency, setDefaultCurrency] = useState<string>('KHR');

  // Master Lists
  const [paddySpecs, setPaddySpecs] = useState<any[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [banks, setBanks] = useState<string[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // New Item States
  const [newVillage, setNewVillage] = useState('');
  const [newBank, setNewBank] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('BUYING_STATION');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSeedInterestRate(data.settings.seedInterestRate ?? 1.10);
          setScaleTolerancePercent(data.settings.scaleTolerancePercent ?? 1.5);
          setOrgName(data.settings.orgName ?? 'IBIS RICE Cambodia');
          setDefaultCurrency(data.settings.defaultCurrency ?? 'KHR');
        }
        if (data.paddySpecs) setPaddySpecs(data.paddySpecs);
        if (data.villages) setVillages(data.villages);
        if (data.banks) setBanks(data.banks);
        if (data.locations) setLocations(data.locations);
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: any) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setMessage(`✅ System setting "${key}" updated successfully!`);
      } else {
        setMessage('❌ Failed to update setting.');
      }
    } catch (e) {
      setMessage('❌ Error saving setting.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVillage = () => {
    if (!newVillage.trim()) return;
    setVillages([...villages, newVillage.trim()]);
    setNewVillage('');
  };

  const handleAddBank = () => {
    if (!newBank.trim()) return;
    setBanks([...banks, newBank.trim()]);
    setNewBank('');
  };

  const handleAddLocation = () => {
    if (!newLocationName.trim()) return;
    setLocations([
      ...locations,
      { id: Date.now().toString(), name: newLocationName.trim(), type: newLocationType, status: 'ACTIVE' },
    ]);
    setNewLocationName('');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0F172A', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B', margin: 0 }}>⚙️ Administration & Master Configuration</h1>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
              Manage business parameters, purchasing prices, seed interest rates, locations, and banking options without code modifications.
            </p>
          </div>
          <button
            onClick={fetchConfig}
            style={{ padding: '8px 16px', backgroundColor: '#1E293B', color: '#38BDF8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            🔄 Refresh Settings
          </button>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', backgroundColor: message.startsWith('✅') ? '#065F46' : '#7F1D1D', color: '#FFFFFF', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
          {[
            { id: 'master', label: '🌾 Master Data & Thresholds' },
            { id: 'locations', label: '📍 Stations & Warehouses' },
            { id: 'banks', label: '💳 Commercial Banks & Villages' },
            { id: 'system', label: '🏢 System Info & Currency' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 16px',
                backgroundColor: activeTab === tab.id ? '#1E293B' : 'transparent',
                color: activeTab === tab.id ? '#F59E0B' : '#94A3B8',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #F59E0B' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading administrative configuration...</div>
        ) : (
          <div>
            {/* TAB 1: MASTER DATA & THRESHOLDS */}
            {activeTab === 'master' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#10B981', marginBottom: '16px' }}>💰 Seed Return & Scale Tolerance Thresholds</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Seed Return Multiplier (Interest Rate)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={seedInterestRate}
                          onChange={(e) => setSeedInterestRate(parseFloat(e.target.value) || 1.10)}
                          style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                        />
                        <button
                          onClick={() => handleSaveSetting('seedInterestRate', seedInterestRate)}
                          style={{ padding: '10px 16px', backgroundColor: '#10B981', color: '#0F172A', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                        1.10 = 10% Interest Rate (e.g. 10 kg borrowed → 11 kg returned)
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Max Scale Intake Variance Tolerance (%)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={scaleTolerancePercent}
                          onChange={(e) => setScaleTolerancePercent(parseFloat(e.target.value) || 1.5)}
                          style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                        />
                        <button
                          onClick={() => handleSaveSetting('scaleTolerancePercent', scaleTolerancePercent)}
                          style={{ padding: '10px 16px', backgroundColor: '#10B981', color: '#0F172A', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                        Alerts warehouse if truck intake weight differs by more than {scaleTolerancePercent}% from field loading weight.
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '16px' }}>🌾 Master Paddy Varieties & Quality Price Specifications</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F172A', color: '#94A3B8', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Variety</th>
                        <th style={{ padding: '10px' }}>Grade</th>
                        <th style={{ padding: '10px' }}>Base Price (KHR/kg)</th>
                        <th style={{ padding: '10px' }}>Organic Bonus (KHR)</th>
                        <th style={{ padding: '10px' }}>Max Moisture</th>
                        <th style={{ padding: '10px' }}>Max Foreign Matter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paddySpecs.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#10B981' }}>{item.variety}</td>
                          <td style={{ padding: '10px' }}>{item.grade}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#38BDF8' }}>{item.basePrice} KHR</td>
                          <td style={{ padding: '10px' }}>+{item.organicBonus} KHR</td>
                          <td style={{ padding: '10px' }}>{item.maxMoisture}%</td>
                          <td style={{ padding: '10px' }}>{item.maxForeignMatter}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: LOCATIONS & WAREHOUSES */}
            {activeTab === 'locations' && (
              <div style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38BDF8', marginBottom: '16px' }}>📍 Loading Stations & Destination Warehouses</h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Location Name (e.g. Choam Ksant Buying Station)"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    style={{ flex: 2, padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                  />
                  <select
                    value={newLocationType}
                    onChange={(e) => setNewLocationType(e.target.value)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                  >
                    <option value="BUYING_STATION">Buying Station (Loading)</option>
                    <option value="WAREHOUSE">Destination Warehouse</option>
                  </select>
                  <button
                    onClick={handleAddLocation}
                    style={{ padding: '10px 16px', backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    + Add Location
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#F59E0B', marginBottom: '8px' }}>Buying Stations (Loading Locations)</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {locations
                        .filter((l) => l.type === 'BUYING_STATION')
                        .map((l, i) => (
                          <li key={i} style={{ padding: '10px', backgroundColor: '#0F172A', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                            🏢 {l.name}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '13px', color: '#10B981', marginBottom: '8px' }}>Destination Warehouses</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {locations
                        .filter((l) => l.type === 'WAREHOUSE')
                        .map((l, i) => (
                          <li key={i} style={{ padding: '10px', backgroundColor: '#0F172A', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                            🏭 {l.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BANKS & VILLAGES */}
            {activeTab === 'banks' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38BDF8', marginBottom: '16px' }}>💳 Commercial Banks</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Bank Name (e.g. ABA Bank)"
                      value={newBank}
                      onChange={(e) => setNewBank(e.target.value)}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                    />
                    <button
                      onClick={handleAddBank}
                      style={{ padding: '10px 16px', backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {banks.map((b, i) => (
                      <li key={i} style={{ padding: '8px 12px', backgroundColor: '#0F172A', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                        🏦 {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#10B981', marginBottom: '16px' }}>🏡 Registered Villages</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Village Name (e.g. Sangkae)"
                      value={newVillage}
                      onChange={(e) => setNewVillage(e.target.value)}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                    />
                    <button
                      onClick={handleAddVillage}
                      style={{ padding: '10px 16px', backgroundColor: '#10B981', color: '#0F172A', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {villages.map((v, i) => (
                      <li key={i} style={{ padding: '8px 12px', backgroundColor: '#0F172A', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                        📍 {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: SYSTEM INFO */}
            {activeTab === 'system' && (
              <div style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '16px' }}>🏢 Organization & Currency Settings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Default Currency Symbol</label>
                    <input
                      type="text"
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
