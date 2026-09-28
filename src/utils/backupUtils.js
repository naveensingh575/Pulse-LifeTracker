/**
 * backupUtils.js
 * Core utilities for exporting, validating, encrypting, and restoring
 * complete Pulse Life Tracker data snapshots.
 * 
 * Provides secure and portable data backups.
 */

export const BACKUP_SCHEMA_VERSION = '1.0';

/**
 * Creates a clean, portable JSON snapshot of user data.
 */
export function generateBackupPayload({
  habits = [],
  goals = [],
  tasks = [],
  transactions = [],
  activities = [],
  journalEntries = [],
  deadlines = [],
  monthlyAllocations = {},
  preferences = {}
} = {}) {
  const now = new Date();
  
  return {
    appName: 'Pulse Life Tracker',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    itemCounts: {
      habits: habits.length,
      goals: goals.length,
      tasks: tasks.length,
      transactions: transactions.length,
      activities: activities.length,
      journalEntries: journalEntries.length,
      deadlines: deadlines.length
    },
    data: {
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        category: h.category,
        color: h.color,
        icon: h.icon,
        target: h.target,
        unit: h.unit,
        streak: h.streak,
        createdAt: h.createdAt,
        completions: h.completions || {}
      })),
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        targetDate: g.targetDate,
        category: g.category,
        color: g.color,
        icon: g.icon,
        subGoals: (g.subGoals || []).map(sg => ({
          id: sg.id,
          title: sg.title,
          isCompleted: Boolean(sg.isCompleted)
        }))
      })),
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
        completed: Boolean(t.completed),
        completedAt: t.completedAt,
        linkedGoalTitle: t.linkedGoalTitle,
        notes: t.notes
      })),
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        assetName: tx.assetName,
        date: tx.date,
        notes: tx.notes
      })),
      activities: activities.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        date: a.date,
        durationMins: a.durationMins,
        notes: a.notes,
        sessionFocus: a.sessionFocus,
        totalVolumeKg: a.totalVolumeKg,
        exercises: a.exercises,
        distance: a.distance,
        pace: a.pace,
        heartRateZone: a.heartRateZone,
        stroke: a.stroke,
        laps: a.laps,
        poolLengthMeters: a.poolLengthMeters,
        sportType: a.sportType,
        intensity: a.intensity,
        readingSubType: a.readingSubType,
        bookTitle: a.bookTitle,
        pagesRead: a.pagesRead,
        skillName: a.skillName,
        moduleName: a.moduleName
      })),
      journalEntries: journalEntries.map(j => ({
        id: j.id,
        date: j.date,
        accomplished: j.accomplished,
        notes: j.notes,
        gratitude: j.gratitude,
        mood: j.mood
      })),
      deadlines: deadlines.map(d => ({
        id: d.id,
        title: d.title,
        date: d.date,
        category: d.category,
        tag: d.tag,
        priority: d.priority,
        isCompleted: Boolean(d.isCompleted)
      })),
      monthlyAllocations: { ...monthlyAllocations },
      preferences: {
        theme: preferences.theme || 'light',
        currency: preferences.currency || '₹',
        ...preferences
      }
    }
  };
}

/**
 * Triggers a browser download of the backup file.
 */
export function downloadBackupFile(backupPayload, filename = null) {
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `pulse_backup_${dateStr}.json`;
  const jsonBlob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(jsonBlob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Validates a parsed backup object or raw string.
 * Returns { valid: boolean, error?: string, counts?: object, data?: object }
 */
export function validateBackupFile(content) {
  let parsed = content;
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch {
      return { valid: false, error: 'Invalid JSON format. Please select a valid pulse_backup.json file.' };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Empty or corrupted backup file.' };
  }

  // Check if encrypted
  if (parsed.encrypted && parsed.ciphertext && parsed.iv && parsed.salt) {
    return {
      valid: true,
      isEncrypted: true,
      rawPayload: parsed
    };
  }

  // Validate unencrypted Pulse schema
  if (!parsed.appName && !parsed.data) {
    return { valid: false, error: 'Unrecognized file format. This does not appear to be a Pulse Life Tracker backup.' };
  }

  const data = parsed.data || parsed;
  const habits = Array.isArray(data.habits) ? data.habits : [];
  const goals = Array.isArray(data.goals) ? data.goals : [];
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const transactions = Array.isArray(data.transactions) ? data.transactions : [];
  const activities = Array.isArray(data.activities) ? data.activities : [];
  const journalEntries = Array.isArray(data.journalEntries) ? data.journalEntries : [];
  const deadlines = Array.isArray(data.deadlines) ? data.deadlines : [];
  const monthlyAllocations = (typeof data.monthlyAllocations === 'object' && data.monthlyAllocations) ? data.monthlyAllocations : {};

  const counts = {
    habits: habits.length,
    goals: goals.length,
    tasks: tasks.length,
    transactions: transactions.length,
    activities: activities.length,
    journalEntries: journalEntries.length,
    deadlines: deadlines.length
  };

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    valid: true,
    isEncrypted: false,
    schemaVersion: parsed.schemaVersion || '1.0',
    exportedAt: parsed.exportedAt || null,
    totalItems,
    counts,
    data: {
      habits,
      goals,
      tasks,
      transactions,
      activities,
      journalEntries,
      deadlines,
      monthlyAllocations,
      preferences: data.preferences || {}
    }
  };
}

/**
 * Optional Passphrase Encryption using AES-GCM 256-bit with PBKDF2 (Web Crypto API)
 */
export async function encryptBackupPayload(payload, passphrase) {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API is not supported in this environment.');
  }

  const enc = new TextEncoder();
  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));

  // Derive key from passphrase
  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await cryptoObj.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const plaintext = enc.encode(JSON.stringify(payload));
  const encryptedBuffer = await cryptoObj.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  const toBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return {
    appName: 'Pulse Life Tracker',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    encrypted: true,
    exportedAt: new Date().toISOString(),
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(encryptedBuffer)
  };
}

/**
 * Decrypts an encrypted backup using Web Crypto API.
 */
export async function decryptBackupPayload(encryptedPayload, passphrase) {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API is not supported in this environment.');
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const fromBase64 = (str) => {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const salt = fromBase64(encryptedPayload.salt);
  const iv = fromBase64(encryptedPayload.iv);
  const ciphertext = fromBase64(encryptedPayload.ciphertext);

  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await cryptoObj.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  try {
    const decryptedBuffer = await cryptoObj.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Incorrect passphrase or corrupted encrypted backup.');
  }
}

/**
 * Helper to deduplicate and merge two item arrays by 'id' or other identifier.
 */
export function mergeItemsById(existingItems = [], incomingItems = [], compareKey = 'id') {
  const existingMap = new Map();
  existingItems.forEach(item => {
    if (item[compareKey]) existingMap.set(String(item[compareKey]), item);
  });

  incomingItems.forEach(item => {
    const key = item[compareKey] ? String(item[compareKey]) : null;
    if (key) {
      existingMap.set(key, { ...(existingMap.get(key) || {}), ...item });
    } else {
      existingMap.set(`new_${Math.random()}`, item);
    }
  });

  return Array.from(existingMap.values());
}
