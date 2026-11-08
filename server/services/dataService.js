import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");

// Helper to ensure data directory exists
export const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Already exists
  }
};

const getFilePath = (collection) => {
  return path.join(DATA_DIR, `${collection}.json`);
};

/**
 * Read all records from a JSON file.
 * Returns empty array if file does not exist.
 */
export const readData = async (collection) => {
  await ensureDataDir();
  const filePath = getFilePath(collection);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    throw error;
  }
};

/**
 * Write full dataset to a JSON file.
 */
export const writeData = async (collection, data) => {
  await ensureDataDir();
  const filePath = getFilePath(collection);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

/**
 * Get all records optionally filtered.
 */
export const getAll = async (collection, filterFn = null) => {
  const items = await readData(collection);
  if (filterFn && typeof filterFn === "function") {
    return items.filter(filterFn);
  }
  return items;
};

/**
 * Find record by ID (handles both string and numeric id comparisons).
 */
export const getById = async (collection, id) => {
  const items = await readData(collection);
  return items.find((item) => String(item.id) === String(id)) || null;
};

/**
 * Create a new record with auto-increment ID if not provided.
 */
export const create = async (collection, newItem) => {
  const items = await readData(collection);
  let id = newItem.id;
  if (!id) {
    // Auto-generate numeric ID or prefix-based
    const maxId = items.reduce((max, curr) => {
      const num = parseInt(curr.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    id = maxId > 0 ? maxId + 1 : Date.now();
  }
  const record = { ...newItem, id };
  items.push(record);
  await writeData(collection, items);
  return record;
};

/**
 * Update an existing record by ID.
 */
export const update = async (collection, id, updates) => {
  const items = await readData(collection);
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return null;
  }
  const updatedRecord = { ...items[index], ...updates, id: items[index].id };
  items[index] = updatedRecord;
  await writeData(collection, items);
  return updatedRecord;
};

/**
 * Remove an existing record by ID.
 */
export const remove = async (collection, id) => {
  const items = await readData(collection);
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  await writeData(collection, items);
  return true;
};
