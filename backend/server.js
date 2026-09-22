const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./database");

const app = express();

const PORT = 5000;
const JWT_SECRET = "retail_catalog_secret_key_2026";

app.use(cors());
app.use(express.json());


// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message:
      "Cloud-Based Retail Product Catalog Management System API is running",
    database: "SQLite",
    project: "Cloud-Based Retail Product Catalog Management System"
  });
});


// ========================================
// SIGNUP
// ========================================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    db.run(
      sql,
      [name, email, hashedPassword, "admin"],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({
              message: "Email already exists"
            });
          }

          return res.status(500).json({
            message: "Failed to create account",
            error: err.message
          });
        }

        res.status(201).json({
          message: "Account created successfully",
          userId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ========================================
// LOGIN
// ========================================

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const sql = `
    SELECT * FROM users
    WHERE email = ?
  `;

  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "24h"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});


// ========================================
// GET ALL PRODUCTS
// ========================================

app.get("/api/products", (req, res) => {
  const sql = `
    SELECT * FROM products
    ORDER BY id DESC
  `;

  db.all(sql, [], (err, products) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch products",
        error: err.message
      });
    }

    res.json(products);
  });
});


// ========================================
// GET SINGLE PRODUCT
// ========================================

app.get("/api/products/:id", (req, res) => {
  const sql = `
    SELECT * FROM products
    WHERE id = ?
  `;

  db.get(sql, [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch product",
        error: err.message
      });
    }

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  });
});


// ========================================
// ADD PRODUCT
// ========================================

app.post("/api/products", (req, res) => {
  const {
    name,
    category,
    brand,
    description,
    price,
    stock,
    image_url,
    status
  } = req.body;

  if (!name || !category || !brand || price === undefined) {
    return res.status(400).json({
      message: "Name, category, brand and price are required"
    });
  }

  const sql = `
    INSERT INTO products
    (
      name,
      category,
      brand,
      description,
      price,
      stock,
      image_url,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      name,
      category,
      brand,
      description || "",
      price,
      stock || 0,
      image_url || "",
      status || "Active"
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Failed to add product",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Product added successfully",
        productId: this.lastID
      });
    }
  );
});


// ========================================
// UPDATE PRODUCT
// ========================================

app.put("/api/products/:id", (req, res) => {
  const {
    name,
    category,
    brand,
    description,
    price,
    stock,
    image_url,
    status
  } = req.body;

  const sql = `
    UPDATE products
    SET
      name = ?,
      category = ?,
      brand = ?,
      description = ?,
      price = ?,
      stock = ?,
      image_url = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      name,
      category,
      brand,
      description || "",
      price,
      stock || 0,
      image_url || "",
      status || "Active",
      req.params.id
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Failed to update product",
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message: "Product updated successfully"
      });
    }
  );
});


// ========================================
// DELETE PRODUCT
// ========================================

app.delete("/api/products/:id", (req, res) => {
  const sql = `
    DELETE FROM products
    WHERE id = ?
  `;

  db.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete product",
        error: err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });
  });
});


// ========================================
// GET CATEGORIES
// ========================================

app.get("/api/categories", (req, res) => {
  const sql = `
    SELECT * FROM categories
    ORDER BY name ASC
  `;

  db.all(sql, [], (err, categories) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch categories",
        error: err.message
      });
    }

    res.json(categories);
  });
});


// ========================================
// ADD CATEGORY
// ========================================

app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Category name is required"
    });
  }

  const sql = `
    INSERT INTO categories (name, description)
    VALUES (?, ?)
  `;

  db.run(
    sql,
    [name, description || ""],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({
            message: "Category already exists"
          });
        }

        return res.status(500).json({
          message: "Failed to add category",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Category added successfully",
        categoryId: this.lastID
      });
    }
  );
});


// ========================================
// DASHBOARD
// ========================================

app.get("/api/dashboard", (req, res) => {
  const queries = {
    totalProducts: `
      SELECT COUNT(*) AS count
      FROM products
    `,

    activeProducts: `
      SELECT COUNT(*) AS count
      FROM products
      WHERE status = 'Active'
    `,

    outOfStock: `
      SELECT COUNT(*) AS count
      FROM products
      WHERE stock = 0
    `,

    lowStock: `
      SELECT COUNT(*) AS count
      FROM products
      WHERE stock > 0 AND stock <= 10
    `,

    totalCategories: `
      SELECT COUNT(*) AS count
      FROM categories
    `
  };

  const dashboard = {};

  db.get(queries.totalProducts, [], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Dashboard error",
        error: err.message
      });
    }

    dashboard.totalProducts = result.count;

    db.get(queries.activeProducts, [], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Dashboard error",
          error: err.message
        });
      }

      dashboard.activeProducts = result.count;

      db.get(queries.outOfStock, [], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Dashboard error",
            error: err.message
          });
        }

        dashboard.outOfStock = result.count;

        db.get(queries.lowStock, [], (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Dashboard error",
              error: err.message
            });
          }

          dashboard.lowStock = result.count;

          db.get(
            queries.totalCategories,
            [],
            (err, result) => {
              if (err) {
                return res.status(500).json({
                  message: "Dashboard error",
                  error: err.message
                });
              }

              dashboard.totalCategories = result.count;

              res.json(dashboard);
            }
          );
        });
      });
    });
  });
});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("Cloud Retail Product Catalog");
  console.log("Backend Server");
  console.log("========================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API:    http://localhost:${PORT}/api`);
  console.log("========================================");
});