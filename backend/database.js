const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./retail_catalog.db", (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("SQLite database connected successfully");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      image_url TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const categories = [
    ["Electronics", "Electronic devices and accessories"],
    ["Clothing", "Fashion and clothing products"],
    ["Groceries", "Daily grocery and food products"],
    ["Home & Kitchen", "Home and kitchen products"],
    ["Beauty", "Beauty and personal care products"]
  ];

  const categoryStmt = db.prepare(`
    INSERT OR IGNORE INTO categories (name, description)
    VALUES (?, ?)
  `);

  categories.forEach((category) => {
    categoryStmt.run(category[0], category[1]);
  });

  categoryStmt.finalize();

  console.log("Database tables initialized successfully");
});

module.exports = db;