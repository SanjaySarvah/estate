import * as SQLite from "expo-sqlite";

// ✅ Open database
const db = SQLite.openDatabaseSync("app.db");

// ✅ Initialize table
export function initFaceTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS faceEntries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workerId TEXT UNIQUE,
      name TEXT,
      photoPath TEXT,
      timestamp TEXT
    );
  `);
}

// ✅ Insert or update face entry
export function saveFaceEntry(workerId: string, name: string, photoPath: string) {
  const timestamp = new Date().toISOString();
  db.runSync(
    `INSERT OR REPLACE INTO faceEntries (workerId, name, photoPath, timestamp)
     VALUES (?, ?, ?, ?)`,
    [workerId, name, photoPath, timestamp]
  );
}

// ✅ Fetch all entries
export function getAllFaces() {
  return db.getAllSync("SELECT * FROM faceEntries ORDER BY id DESC;");
}

// ✅ Fetch single entry by workerId
export function getFaceByWorker(workerId: string) {
  return db.getFirstSync("SELECT * FROM faceEntries WHERE workerId = ?", [
    workerId,
  ]);
}

// ✅ Delete face entry
export function deleteFace(workerId: string) {
  db.runSync("DELETE FROM faceEntries WHERE workerId = ?", [workerId]);
}
