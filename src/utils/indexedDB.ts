// Utility functions to interact with IndexedDB data stored by the content script

const DB_NAME = 'spenddy_data';
const DB_VERSION = 1;
const STORE_NAME = 'orders';

// Storage keys used by the content script
const STORAGE_KEYS = {
  // Swiggy food delivery orders
  SWIGGY_FILE_INFO: 'swiggy_file_info',
  SWIGGY_RAW_DATA: 'swiggy_raw_data',
  
  // Swiggy Instamart orders
  SWIGGY_INSTAMART_FILE_INFO: 'swiggy_instamart_file_info',
  SWIGGY_INSTAMART_RAW_DATA: 'swiggy_instamart_raw_data',
  
  // Swiggy Dineout orders
  SWIGGY_DINEOUT_FILE_INFO: 'swiggy_dineout_file_info',
  SWIGGY_DINEOUT_RAW_DATA: 'swiggy_dineout_raw_data',
} as const;

/**
 * Initialize IndexedDB connection
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get data from IndexedDB
 */
async function getDataFromIndexedDB(key: string): Promise<any> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get data from IndexedDB:', error);
    return null;
  }
}

/**
 * Get file info from IndexedDB
 */
async function getFileInfoFromIndexedDB(key: string): Promise<any> {
  const data = await getDataFromIndexedDB(key);
  if (data) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('Failed to parse file info:', error);
      return null;
    }
  }
  return null;
}

/**
 * Get raw data from IndexedDB
 */
async function getRawDataFromIndexedDB(key: string): Promise<any> {
  const data = await getDataFromIndexedDB(key);
  if (data) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('Failed to parse raw data:', error);
      return null;
    }
  }
  return null;
}

/**
 * Check if data exists in IndexedDB for a specific source
 */
export async function hasIndexedDBData(sourceId: string): Promise<boolean> {
  let key: string;
  
  switch (sourceId) {
    case 'swiggy':
      key = STORAGE_KEYS.SWIGGY_RAW_DATA;
      break;
    case 'swiggy-instamart':
      key = STORAGE_KEYS.SWIGGY_INSTAMART_RAW_DATA;
      break;
    case 'swiggy-dineout':
      key = STORAGE_KEYS.SWIGGY_DINEOUT_RAW_DATA;
      break;
    default:
      return false;
  }
  
  const data = await getDataFromIndexedDB(key);
  return data !== null;
}

/**
 * Get file info from IndexedDB for a specific source
 */
export async function getFileInfo(sourceId: string): Promise<any> {
  let key: string;
  
  switch (sourceId) {
    case 'swiggy':
      key = STORAGE_KEYS.SWIGGY_FILE_INFO;
      break;
    case 'swiggy-instamart':
      key = STORAGE_KEYS.SWIGGY_INSTAMART_FILE_INFO;
      break;
    case 'swiggy-dineout':
      key = STORAGE_KEYS.SWIGGY_DINEOUT_FILE_INFO;
      break;
    default:
      return null;
  }
  
  return getFileInfoFromIndexedDB(key);
}

/**
 * Get raw data from IndexedDB for a specific source
 */
export async function getRawData(sourceId: string): Promise<any> {
  let key: string;
  
  switch (sourceId) {
    case 'swiggy':
      key = STORAGE_KEYS.SWIGGY_RAW_DATA;
      break;
    case 'swiggy-instamart':
      key = STORAGE_KEYS.SWIGGY_INSTAMART_RAW_DATA;
      break;
    case 'swiggy-dineout':
      key = STORAGE_KEYS.SWIGGY_DINEOUT_RAW_DATA;
      break;
    default:
      return null;
  }
  
  const rawData = await getRawDataFromIndexedDB(key);
  console.log(`Raw data for ${sourceId}:`, rawData);
  
  if (rawData && Array.isArray(rawData) && rawData.length > 0) {
    console.log(`First item in ${sourceId} raw data:`, rawData[0]);
    console.log(`Keys in first item:`, Object.keys(rawData[0]));
  }
  
  return rawData;
}

/**
 * Load data from IndexedDB and return it in the format expected by the source system
 */
export async function loadDataFromIndexedDB(sourceId: string): Promise<{
  raw: any;
  fileInfo: any;
} | null> {
  const raw = await getRawData(sourceId);
  const fileInfo = await getFileInfo(sourceId);
  
  if (raw) {
    return { raw, fileInfo };
  }
  
  return null;
} 