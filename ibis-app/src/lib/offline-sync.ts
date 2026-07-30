import { openDB, DBSchema } from 'idb';

interface IbisOfflineDB extends DBSchema {
  specs_queue: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
  farmers_queue: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
  purchases_queue: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
  transport_queue: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
}

const DB_NAME = 'ibis_rice_field_offline_v1';

export async function getOfflineDB() {
  return openDB<IbisOfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('specs_queue')) {
        db.createObjectStore('specs_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('farmers_queue')) {
        db.createObjectStore('farmers_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('purchases_queue')) {
        db.createObjectStore('purchases_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transport_queue')) {
        db.createObjectStore('transport_queue', { keyPath: 'id' });
      }
    },
  });
}

// Queue offline item
export async function queueOfflineRecord(storeName: 'specs_queue' | 'farmers_queue' | 'purchases_queue' | 'transport_queue', data: any) {
  const db = await getOfflineDB();
  const id = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.put(storeName, {
    id,
    data,
    timestamp: Date.now(),
  });
  console.log(`📦 Saved draft to offline store [${storeName}]:`, id);
  return id;
}

// Get all offline queued items count
export async function getPendingOfflineCount(): Promise<number> {
  try {
    const db = await getOfflineDB();
    const specs = await db.getAll('specs_queue');
    const farmers = await db.getAll('farmers_queue');
    const purchases = await db.getAll('purchases_queue');
    const transport = await db.getAll('transport_queue');
    return specs.length + farmers.length + purchases.length + transport.length;
  } catch (e) {
    return 0;
  }
}

// Auto-sync offline queued items to server when online
export async function triggerAutoSync(onStatusUpdate?: (msg: string) => void): Promise<{ syncedCount: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0 };
  }

  let totalSynced = 0;
  try {
    const db = await getOfflineDB();

    // 1. Sync Specs Queue
    const specs = await db.getAll('specs_queue');
    for (const item of specs) {
      try {
        const res = await fetch('/api/specs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          await db.delete('specs_queue', item.id);
          totalSynced++;
        }
      } catch (e) {
        console.error('Offline sync error (specs):', e);
      }
    }

    // 2. Sync Farmers Queue
    const farmers = await db.getAll('farmers_queue');
    for (const item of farmers) {
      try {
        const res = await fetch('/api/farmers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          await db.delete('farmers_queue', item.id);
          totalSynced++;
        }
      } catch (e) {
        console.error('Offline sync error (farmers):', e);
      }
    }

    // 3. Sync Purchases Queue
    const purchases = await db.getAll('purchases_queue');
    for (const item of purchases) {
      try {
        const res = await fetch('/api/purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          await db.delete('purchases_queue', item.id);
          totalSynced++;
        }
      } catch (e) {
        console.error('Offline sync error (purchases):', e);
      }
    }

    // 4. Sync Transport Queue
    const transport = await db.getAll('transport_queue');
    for (const item of transport) {
      try {
        const res = await fetch('/api/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          await db.delete('transport_queue', item.id);
          totalSynced++;
        }
      } catch (e) {
        console.error('Offline sync error (transport):', e);
      }
    }

    if (totalSynced > 0 && onStatusUpdate) {
      onStatusUpdate(`⚡ Auto-synced ${totalSynced} offline record(s) to central database!`);
    }
  } catch (e) {
    console.error('Auto sync engine error:', e);
  }

  return { syncedCount: totalSynced };
}
