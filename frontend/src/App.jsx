import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const DEFAULT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Groceries",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("retailToken")
  );

  const [isSignup, setIsSignup] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("retailUser")) || null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [toast, setToast] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    description: "",
    status: "Active",
  });

  /* -------------------------------------------------------
     CATEGORY LIST
  ------------------------------------------------------- */

  const allCategoryNames = useMemo(() => {
    const productCategories = products
      .map((product) => product?.category)
      .filter(Boolean);

    const databaseCategories = categories
      .map((category) => category?.name)
      .filter(Boolean);

    return [
      ...new Set([
        ...databaseCategories,
        ...productCategories,
        ...DEFAULT_CATEGORIES,
      ]),
    ];
  }, [categories, products]);

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
      loadCategories();
    }
  }, [isLoggedIn]);

  /* -------------------------------------------------------
     TOAST
  ------------------------------------------------------- */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/login`,
        loginForm
      );

      const data = response.data || {};

      const loggedUser =
        data.user ||
        data.data?.user ||
        {
          email: loginForm.email,
          name: loginForm.email.split("@")[0],
          role: "admin",
        };

      const token =
        data.token ||
        data.data?.token ||
        "logged-in";

      localStorage.setItem("retailToken", token);
      localStorage.setItem(
        "retailUser",
        JSON.stringify(loggedUser)
      );

      setUser(loggedUser);
      setIsLoggedIn(true);
      setActivePage("dashboard");

      setToast(
        data.message || "Login successful"
      );

      setLoginForm({
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(error);

      setToast(
        error.response?.data?.message ||
          "Login failed. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     SIGNUP
  ------------------------------------------------------- */

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/signup`,
        signupForm
      );

      setToast(
        response.data?.message ||
          "Account created successfully"
      );

      setIsSignup(false);

      setLoginForm({
        email: signupForm.email,
        password: "",
      });

      setSignupForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
      });
    } catch (error) {
      console.error(error);

      setToast(
        error.response?.data?.message ||
          "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const handleLogout = () => {
    localStorage.removeItem("retailToken");
    localStorage.removeItem("retailUser");

    setIsLoggedIn(false);
    setUser(null);

    setProducts([]);
    setCategories([]);

    setActivePage("dashboard");

    setToast("Logged out successfully");
  };

  /* -------------------------------------------------------
     LOAD PRODUCTS
  ------------------------------------------------------- */

  const loadProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/products`
      );

      const data = response.data;

      let productList = [];

      if (Array.isArray(data)) {
        productList = data;
      } else if (Array.isArray(data?.products)) {
        productList = data.products;
      } else if (Array.isArray(data?.data)) {
        productList = data.data;
      }

      setProducts(productList);
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      setProducts([]);
    }
  };

  /* -------------------------------------------------------
     LOAD CATEGORIES
  ------------------------------------------------------- */

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/categories`
      );

      const data = response.data;

      let categoryList = [];

      if (Array.isArray(data)) {
        categoryList = data;
      } else if (Array.isArray(data?.categories)) {
        categoryList = data.categories;
      } else if (Array.isArray(data?.data)) {
        categoryList = data.data;
      }

      setCategories(categoryList);
    } catch (error) {
      console.log(
        "Categories endpoint unavailable. Using product/default categories."
      );

      setCategories([]);
    }
  };

  /* -------------------------------------------------------
     ADD / UPDATE PRODUCT
  ------------------------------------------------------- */

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        price: Number(productForm.price),
        stock_quantity: Number(
          productForm.stock_quantity
        ),
        image_url: productForm.image_url,
        description: productForm.description,
        status: productForm.status,
      };

      if (editingProduct) {
        await axios.put(
          `${API_URL}/products/${editingProduct.id}`,
          payload
        );

        setToast(
          "Product updated successfully"
        );
      } else {
        await axios.post(
          `${API_URL}/products`,
          payload
        );

        setToast(
          "Product added successfully"
        );
      }

      /*
       IMPORTANT:
       Reload products immediately after saving.
       Dashboard counts are calculated from this
       updated products array.
      */
      await loadProducts();

      await loadCategories();

      setShowProductModal(false);
      setEditingProduct(null);

      resetProductForm();
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      setToast(
        error.response?.data?.message ||
          "Unable to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     DELETE PRODUCT
  ------------------------------------------------------- */

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/products/${id}`
      );

      await loadProducts();

      setToast(
        "Product deleted successfully"
      );
    } catch (error) {
      console.error(error);

      setToast(
        error.response?.data?.message ||
          "Unable to delete product"
      );
    }
  };

  /* -------------------------------------------------------
     EDIT PRODUCT
  ------------------------------------------------------- */

  const handleEditProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price || "",
      stock_quantity:
        product.stock_quantity ??
        product.stock ??
        "",
      image_url: product.image_url || "",
      description: product.description || "",
      status: product.status || "Active",
    });

    setShowProductModal(true);
  };

  /* -------------------------------------------------------
     RESET PRODUCT FORM
  ------------------------------------------------------- */

  const resetProductForm = () => {
    setProductForm({
      name: "",
      brand: "",
      category: "",
      price: "",
      stock_quantity: "",
      image_url: "",
      description: "",
      status: "Active",
    });
  };

  /* -------------------------------------------------------
     OPEN ADD PRODUCT
  ------------------------------------------------------- */

  const openAddProduct = () => {
    setEditingProduct(null);
    resetProductForm();
    setShowProductModal(true);
  };

  /* -------------------------------------------------------
     FILTER PRODUCTS
  ------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName =
        product.name?.toLowerCase() || "";

      const brand =
        product.brand?.toLowerCase() || "";

      const category =
        product.category || "";

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        productName.includes(searchText) ||
        brand.includes(searchText) ||
        category
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    categoryFilter,
  ]);

  /* -------------------------------------------------------
     DASHBOARD COUNTS
     These are calculated directly from products.
  ------------------------------------------------------- */

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => {
      return (
        total +
        Number(
          product.stock_quantity ??
            product.stock ??
            0
        )
      );
    },
    0
  );

  const lowStockProducts = products.filter(
    (product) => {
      const stock = Number(
        product.stock_quantity ??
          product.stock ??
          0
      );

      return stock > 0 && stock <= 10;
    }
  );

  const outOfStockProducts = products.filter(
    (product) => {
      const stock = Number(
        product.stock_quantity ??
          product.stock ??
          0
      );

      return stock <= 0;
    }
  );

  const activeProducts = products.filter(
    (product) =>
      String(
        product.status || "Active"
      ).toLowerCase() === "active"
  );

  /* -------------------------------------------------------
     CATEGORY STATISTICS
  ------------------------------------------------------- */

  const categoryStatistics =
    allCategoryNames.map((categoryName) => {
      const categoryProducts =
        products.filter(
          (product) =>
            product.category ===
            categoryName
        );

      const stock = categoryProducts.reduce(
        (total, product) =>
          total +
          Number(
            product.stock_quantity ??
              product.stock ??
              0
          ),
        0
      );

      return {
        name: categoryName,
        products: categoryProducts.length,
        stock,
      };
    });

  /* -------------------------------------------------------
     LOGIN SCREEN
  ------------------------------------------------------- */

  if (!isLoggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            🛍️
          </div>

          <h1>
            Retail Product Catalog
          </h1>

          <p className="auth-subtitle">
            Cloud-Based Product Catalog
            Management System
          </p>

          {isSignup ? (
            <form
              onSubmit={handleSignup}
              className="auth-form"
            >
              <h2>Create Account</h2>

              <input
                type="text"
                placeholder="Full Name"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    password:
                      e.target.value,
                  })
                }
                required
              />

              <select
                value={signupForm.role}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    role: e.target.value,
                  })
                }
              >
                <option value="admin">
                  Admin
                </option>

                <option value="manager">
                  Manager
                </option>
              </select>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Account"}
              </button>

              <button
                type="button"
                className="link-btn"
                onClick={() =>
                  setIsSignup(false)
                }
              >
                Already have an account?
                Login
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleLogin}
              className="auth-form"
            >
              <h2>Login</h2>

              <input
                type="email"
                placeholder="Email Address"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password:
                      e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

              <button
                type="button"
                className="link-btn"
                onClick={() =>
                  setIsSignup(true)
                }
              >
                Create a new account
              </button>
            </form>
          )}

          {toast && (
            <div className="toast">
              {toast}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     DASHBOARD
  ------------------------------------------------------- */

  const renderDashboard = () => {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Overview of your retail
              product catalog
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={openAddProduct}
          >
            + Add Product
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <h3>Total Products</h3>
              <p>{totalProducts}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              📊
            </div>

            <div>
              <h3>Total Stock</h3>
              <p>{totalStock}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ⚠️
            </div>

            <div>
              <h3>Low Stock</h3>
              <p>
                {lowStockProducts.length}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🚫
            </div>

            <div>
              <h3>Out of Stock</h3>
              <p>
                {outOfStockProducts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="content-card">
            <div className="card-header">
              <div>
                <h2>Recent Products</h2>
                <p>
                  Latest products in your
                  catalog
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={() =>
                  setActivePage("products")
                }
              >
                View All
              </button>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <div>📦</div>
                <h3>No Products Yet</h3>
                <p>
                  Add your first product to
                  the catalog.
                </p>

                <button
                  className="primary-btn"
                  onClick={openAddProduct}
                >
                  + Add Product
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products
                      .slice(-5)
                      .reverse()
                      .map((product) => {
                        const stock =
                          Number(
                            product.stock_quantity ??
                              product.stock ??
                              0
                          );

                        return (
                          <tr
                            key={product.id}
                          >
                            <td>
                              <strong>
                                {product.name}
                              </strong>

                              <small>
                                {product.brand ||
                                  "No brand"}
                              </small>
                            </td>

                            <td>
                              {product.category ||
                                "-"}
                            </td>

                            <td>
                              ₹
                              {Number(
                                product.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              {stock}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${
                                  String(
                                    product.status ||
                                      "Active"
                                  ).toLowerCase() ===
                                  "active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {product.status ||
                                  "Active"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="content-card">
            <div className="card-header">
              <div>
                <h2>Inventory Alerts</h2>
                <p>
                  Products requiring
                  attention
                </p>
              </div>
            </div>

            {lowStockProducts.length ===
              0 &&
            outOfStockProducts.length ===
              0 ? (
              <div className="success-box">
                <div>✓</div>

                <h3>
                  Inventory looks good
                </h3>

                <p>
                  No low-stock or
                  out-of-stock products.
                </p>
              </div>
            ) : (
              <div className="alert-list">
                {outOfStockProducts
                  .slice(0, 5)
                  .map((product) => (
                    <div
                      className="alert-item danger"
                      key={product.id}
                    >
                      <span>🚫</span>

                      <div>
                        <strong>
                          {product.name}
                        </strong>

                        <p>
                          Out of stock
                        </p>
                      </div>
                    </div>
                  ))}

                {lowStockProducts
                  .slice(0, 5)
                  .map((product) => (
                    <div
                      className="alert-item warning"
                      key={product.id}
                    >
                      <span>⚠️</span>

                      <div>
                        <strong>
                          {product.name}
                        </strong>

                        <p>
                          Only{" "}
                          {Number(
                            product.stock_quantity ??
                              product.stock ??
                              0
                          )}{" "}
                          units left
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------
     PRODUCTS PAGE
  ------------------------------------------------------- */

  const renderProducts = () => {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Products</h1>
            <p>
              Manage your retail product
              catalog
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={openAddProduct}
          >
            + Add Product
          </button>
        </div>

        <div className="content-card">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Categories
              </option>

              {allCategoryNames.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          {filteredProducts.length ===
          0 ? (
            <div className="empty-state">
              <div>📦</div>
              <h3>No Products Found</h3>
              <p>
                Add a product or change
                your search.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const stock =
                        Number(
                          product.stock_quantity ??
                            product.stock ??
                            0
                        );

                      return (
                        <tr
                          key={product.id}
                        >
                          <td>
                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              {product.description ||
                                ""}
                            </small>
                          </td>

                          <td>
                            {product.brand ||
                              "-"}
                          </td>

                          <td>
                            {product.category ||
                              "-"}
                          </td>

                          <td>
                            ₹
                            {Number(
                              product.price ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                stock <= 0
                                  ? "stock-danger"
                                  : stock <= 10
                                  ? "stock-warning"
                                  : "stock-good"
                              }
                            >
                              {stock}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                String(
                                  product.status ||
                                    "Active"
                                ).toLowerCase() ===
                                "active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {product.status ||
                                "Active"}
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={() =>
                                  handleEditProduct(
                                    product
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() =>
                                  handleDeleteProduct(
                                    product.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------
     CATEGORIES PAGE
  ------------------------------------------------------- */

  const renderCategories = () => {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Categories</h1>
            <p>
              Product category overview
            </p>
          </div>
        </div>

        <div className="category-grid">
          {categoryStatistics.map(
            (category) => (
              <div
                className="category-card"
                key={category.name}
              >
                <div className="category-icon">
                  📁
                </div>

                <h3>
                  {category.name}
                </h3>

                <div className="category-stats">
                  <div>
                    <strong>
                      {category.products}
                    </strong>

                    <span>
                      Products
                    </span>
                  </div>

                  <div>
                    <strong>
                      {category.stock}
                    </strong>

                    <span>
                      Stock
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------
     INVENTORY PAGE
  ------------------------------------------------------- */

  const renderInventory = () => {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Inventory</h1>
            <p>
              Monitor product stock
              levels
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <h3>Total Stock</h3>
              <p>{totalStock}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ⚠️
            </div>

            <div>
              <h3>Low Stock</h3>
              <p>
                {lowStockProducts.length}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🚫
            </div>

            <div>
              <h3>Out of Stock</h3>
              <p>
                {outOfStockProducts.length}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✓
            </div>

            <div>
              <h3>Active Products</h3>
              <p>
                {activeProducts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Inventory Details</h2>
              <p>
                Current stock status of
                all products
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Inventory Status</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-table"
                    >
                      No products available
                    </td>
                  </tr>
                ) : (
                  products.map(
                    (product) => {
                      const stock =
                        Number(
                          product.stock_quantity ??
                            product.stock ??
                            0
                        );

                      let status =
                        "In Stock";

                      let statusClass =
                        "active";

                      if (stock <= 0) {
                        status =
                          "Out of Stock";
                        statusClass =
                          "inactive";
                      } else if (
                        stock <= 10
                      ) {
                        status =
                          "Low Stock";
                        statusClass =
                          "warning";
                      }

                      return (
                        <tr
                          key={product.id}
                        >
                          <td>
                            <strong>
                              {product.name}
                            </strong>
                          </td>

                          <td>
                            {product.category ||
                              "-"}
                          </td>

                          <td>
                            {stock}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${statusClass}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------
     PAGE ROUTER
  ------------------------------------------------------- */

  const renderPage = () => {
    switch (activePage) {
      case "products":
        return renderProducts();

      case "categories":
        return renderCategories();

      case "inventory":
        return renderInventory();

      default:
        return renderDashboard();
    }
  };

  /* -------------------------------------------------------
     MAIN APPLICATION
  ------------------------------------------------------- */

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            🛍️
          </div>

          <div>
            <h2>Retail Catalog</h2>
            <span>
              Cloud Management
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <span>📊</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "products"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("products")
            }
          >
            <span>📦</span>
            Products
          </button>

          <button
            className={
              activePage === "categories"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("categories")
            }
          >
            <span>📁</span>
            Categories
          </button>

          <button
            className={
              activePage === "inventory"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("inventory")
            }
          >
            <span>📋</span>
            Inventory
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">
              {(
                user?.name ||
                user?.email ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.name ||
                  "Administrator"}
              </strong>

              <span>
                {user?.email || ""}
              </span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-title">
              Cloud-Based Retail Product
              Catalog Management System
            </span>
          </div>

          <div className="topbar-user">
            <span>
              Welcome,{" "}
              {user?.name ||
                user?.email ||
                "Admin"}
            </span>
          </div>
        </header>

        <section className="page-content">
          {renderPage()}
        </section>
      </main>

      {/* ---------------------------------------------------
          PRODUCT MODAL
      --------------------------------------------------- */}

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  Enter product details
                  below
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => {
                  setShowProductModal(
                    false
                  );
                  setEditingProduct(
                    null
                  );
                  resetProductForm();
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleProductSubmit}
              className="product-form"
            >
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Product Name *
                  </label>

                  <input
                    type="text"
                    value={
                      productForm.name
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Brand
                  </label>

                  <input
                    type="text"
                    value={
                      productForm.brand
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        brand: e.target.value,
                      })
                    }
                    placeholder="Enter brand"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Category *
                  </label>

                  <select
                    value={
                      productForm.category
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select Category
                    </option>

                    {allCategoryNames.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      productForm.price
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price:
                          e.target.value,
                      })
                    }
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Stock Quantity *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      productForm.stock_quantity
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stock_quantity:
                          e.target.value,
                      })
                    }
                    placeholder="Enter stock quantity"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={
                      productForm.status
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        status:
                          e.target.value,
                      })
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>
                    Product Image URL
                  </label>

                  <input
                    type="url"
                    value={
                      productForm.image_url
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image_url:
                          e.target.value,
                      })
                    }
                    placeholder="https://example.com/product.jpg"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Description
                  </label>

                  <textarea
                    rows="4"
                    value={
                      productForm.description
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="Enter product description"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowProductModal(
                      false
                    );
                    setEditingProduct(
                      null
                    );
                    resetProductForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------
          TOAST
      --------------------------------------------------- */}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;