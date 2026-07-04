"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Clock,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Settings,
  ShoppingBag,
  Tags,
  Truck
} from "lucide-react";
import type { MenuProduct, MenuStore, SizeOption } from "@/lib/menu-types";
import type { SiteSettings } from "@/lib/site-settings";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "products", label: "Products", icon: PackagePlus },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "settings", label: "Settings", icon: Settings }
] as const;

type AdminSection = (typeof sections)[number]["id"];

type AdminOrder = {
  id: string;
  status: string;
  createdAt: string;
  details: {
    mode: string;
    name: string;
    phone: string;
    address: string;
    zipcode: string;
    suburb?: string;
    time?: string;
  };
  items: Array<{ name?: string; quantity?: number; price?: number }>;
  total: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseSizeOptions(value: string): SizeOption[] {
  if (!value.trim()) return [];
  return value
    .split(",")
    .map((item) => {
      const [name, extra = "0"] = item.split(":").map((part) => part.trim());
      return { name, extra: Number(extra) || 0 };
    })
    .filter((item) => item.name);
}

function sizeOptionsToText(options: SizeOption[]) {
  return options.map((option) => `${option.name}:${option.extra}`).join(", ");
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginStatus, setLoginStatus] = useState("");
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [store, setStore] = useState<MenuStore | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const selectedProducts = useMemo(() => {
    return store?.products.filter((product) => product.categoryId === selectedCategory) ?? [];
  }, [selectedCategory, store]);

  const orderTotal = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );
  const showMenuSave = section === "categories" || section === "products" || section === "delivery";

  const loadAdminData = useCallback(async () => {
    const [menuResponse, settingsResponse, ordersResponse] = await Promise.all([
      fetch("/api/admin/menu"),
      fetch("/api/admin/settings"),
      fetch("/api/admin/orders")
    ]);
    if (!menuResponse.ok || !settingsResponse.ok || !ordersResponse.ok) {
      setAuthenticated(false);
      return;
    }
    const menuData = (await menuResponse.json()) as MenuStore;
    setStore(menuData);
    setSelectedCategory(menuData.categories[0]?.id ?? "");
    setSettings((await settingsResponse.json()) as SiteSettings);
    setOrders((await ordersResponse.json()) as AdminOrder[]);
  }, []);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data: { authenticated: boolean }) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) {
          loadAdminData();
        }
      });
  }, [loadAdminData]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginStatus("Signing in...");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });

    if (!response.ok) {
      setLoginStatus("Invalid email or password.");
      return;
    }

    setAuthenticated(true);
    setLoginStatus("");
    await loadAdminData();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
  }

  async function saveStore(nextStore = store) {
    if (!nextStore) return;
    setStatus("Saving menu...");
    const response = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextStore)
    });
    setStatus(response.ok ? "Menu saved." : "Could not save menu changes.");
  }

  async function saveSettings(nextSettings = settings, newPassword = "") {
    if (!nextSettings) return;
    setStatus("Saving settings...");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nextSettings,
        admin: {
          ...nextSettings.admin,
          newPassword
        }
      })
    });
    setStatus(response.ok ? "Settings saved." : "Could not save settings.");
  }

  function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    const category = {
      id: slugify(name),
      name,
      sortOrder: store.categories.length + 1
    };
    const nextStore = { ...store, categories: [...store.categories, category] };
    setStore(nextStore);
    setSelectedCategory(category.id);
    event.currentTarget.reset();
  }

  function deleteCategory(id: string) {
    if (!store) return;
    const nextCategories = store.categories.filter((category) => category.id !== id);
    const nextStore = {
      ...store,
      categories: nextCategories,
      products: store.products.filter((product) => product.categoryId !== id)
    };
    setStore(nextStore);
    setSelectedCategory(nextCategories[0]?.id ?? "");
    if (editingCategoryId === id) {
      setEditingCategoryId("");
      setEditingCategoryName("");
    }
  }

  function startEditCategory(category: MenuStore["categories"][number]) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }

  function saveCategoryName(id: string) {
    if (!store) return;
    const name = editingCategoryName.trim();
    if (!name) return;
    setStore({
      ...store,
      categories: store.categories.map((category) =>
        category.id === id ? { ...category, name } : category
      )
    });
    setEditingCategoryId("");
    setEditingCategoryName("");
  }

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await response.json()) as { url?: string };
    return data.url ?? "";
  }

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const file = form.get("image");
    const uploadedImage = file instanceof File && file.size ? await uploadImage(file) : "";
    const image = uploadedImage || String(form.get("imageUrl") ?? "/images/butter-chicken.webp");
    const product: MenuProduct = {
      id: `${slugify(name)}-${store.products.length + 1}`,
      categoryId: String(form.get("categoryId") ?? selectedCategory),
      name,
      description: String(form.get("description") ?? ""),
      price: Number(form.get("price") ?? 0),
      image,
      sizeOptions: parseSizeOptions(String(form.get("sizeOptions") ?? "")),
      spiceOptions: String(form.get("spiceOptions") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    setStore({ ...store, products: [...store.products, product] });
    event.currentTarget.reset();
  }

  function deleteProduct(id: string) {
    if (!store) return;
    setStore({ ...store, products: store.products.filter((product) => product.id !== id) });
  }

  async function uploadSettingImage(
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof SiteSettings["branding"]
  ) {
    const file = event.target.files?.[0];
    if (!file || !settings) return;
    const url = await uploadImage(file);
    setSettings({
      ...settings,
      branding: {
        ...settings.branding,
        [key]: url
      }
    });
  }

  if (authenticated === null) {
    return <main className="admin-login-page">Loading admin...</main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <Image src="/images/logo.png" width={230} height={52} alt="Shalimar Curries" />
          <h1>Admin Login</h1>
          <p>Sign in to manage menu, orders and website settings.</p>
          <label>
            <span>Email</span>
            <input name="email" type="email" defaultValue="rana33994@gmail.com" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="Password" required />
          </label>
          <button className="button button-green" type="submit">
            Sign In
          </button>
          <small>Default password: Shalimar@2026</small>
          {loginStatus ? <strong>{loginStatus}</strong> : null}
        </form>
      </main>
    );
  }

  if (!store || !settings) {
    return <main className="admin-login-page">Loading dashboard...</main>;
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Image src={settings.branding.logo} width={190} height={44} alt={settings.branding.siteName} />
        <nav>
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={section === item.id ? "active" : ""}
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button className="admin-logout" type="button" onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
          Logout
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>Admin Portal</p>
            <h1>{sections.find((item) => item.id === section)?.label}</h1>
          </div>
          <div className="admin-top-actions">
            <span>{settings.admin.email}</span>
            {showMenuSave ? (
              <button className="button button-green" type="button" onClick={() => saveStore()}>
                Save Menu
              </button>
            ) : null}
          </div>
        </header>

        {status ? <div className="admin-status">{status}</div> : null}

        {section === "dashboard" ? (
          <Dashboard
            categoryCount={store.categories.length}
            productCount={store.products.length}
            orderCount={orders.length}
            orderTotal={orderTotal}
            orders={orders}
          />
        ) : null}

        {section === "orders" ? <OrdersPanel orders={orders} /> : null}

        {section === "categories" ? (
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Categories</h2>
                <p>Create and organize menu categories.</p>
              </div>
            </div>
            <form className="admin-inline-form" onSubmit={addCategory}>
              <input name="name" placeholder="Category name" />
              <button className="button button-green" type="submit">
                Add Category
              </button>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table admin-category-table">
                <thead>
                  <tr>
                    <th>Sort</th>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {store.categories.map((category) => {
                    const isEditing = editingCategoryId === category.id;
                    const productCount = store.products.filter(
                      (product) => product.categoryId === category.id
                    ).length;

                    return (
                      <tr className={selectedCategory === category.id ? "active" : ""} key={category.id}>
                        <td>{category.sortOrder}</td>
                        <td>
                          {isEditing ? (
                            <input
                              value={editingCategoryName}
                              onChange={(event) => setEditingCategoryName(event.target.value)}
                            />
                          ) : (
                            <button
                              className="admin-text-button"
                              type="button"
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              {category.name}
                            </button>
                          )}
                          <small>{category.id}</small>
                        </td>
                        <td>{productCount}</td>
                        <td>
                          <div className="admin-actions">
                            {isEditing ? (
                              <>
                                <button
                                  className="button button-green"
                                  type="button"
                                  onClick={() => saveCategoryName(category.id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="button button-light admin-muted-button"
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryId("");
                                    setEditingCategoryName("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="button button-light admin-muted-button"
                                  type="button"
                                  onClick={() => startEditCategory(category)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="button admin-danger-button"
                                  type="button"
                                  onClick={() => deleteCategory(category.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {section === "products" ? (
          <section className="admin-stack">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Add Product</h2>
                  <p>Add product details, image, size options and spice options.</p>
                </div>
              </div>
              <form className="admin-product-form" onSubmit={addProduct}>
                <label>
                  <span>Category</span>
                  <select name="categoryId" defaultValue={selectedCategory}>
                    {store.categories.map((category) => (
                      <option value={category.id} key={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Product Name</span>
                  <input name="name" placeholder="Butter Naan" required />
                </label>
                <label>
                  <span>Price</span>
                  <input name="price" type="number" step="0.01" placeholder="5.60" required />
                </label>
                <label>
                  <span>Image Upload</span>
                  <input name="image" type="file" accept="image/*" />
                </label>
                <label className="full-field">
                  <span>Image URL</span>
                  <input name="imageUrl" placeholder="/images/butter-chicken.webp" />
                </label>
                <label className="full-field">
                  <span>Description</span>
                  <textarea name="description" rows={3} placeholder="Product description" />
                </label>
                <label className="full-field">
                  <span>Size Options</span>
                  <input name="sizeOptions" placeholder="Small:0, Large:2.80" />
                  <small>Example: Small:0, Large:2.80 means Large adds $2.80.</small>
                </label>
                <label className="full-field">
                  <span>Spice Options</span>
                  <input name="spiceOptions" placeholder="Sweet, Mild, Medium, Hot, Extra Hot" />
                </label>
                <button className="button button-green full-field" type="submit">
                  Add Product
                </button>
              </form>
            </div>
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Products</h2>
                  <p>Showing products from selected category.</p>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  {store.categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-products">
                {selectedProducts.map((product) => (
                  <article key={product.id}>
                    <Image src={product.image} width={120} height={80} alt={product.name} />
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <small>
                        {money(product.price)}
                        {product.sizeOptions.length
                          ? ` | Sizes: ${sizeOptionsToText(product.sizeOptions)}`
                          : ""}
                        {product.spiceOptions.length
                          ? ` | Spice: ${product.spiceOptions.join(", ")}`
                          : ""}
                      </small>
                    </div>
                    <button type="button" onClick={() => deleteProduct(product.id)}>
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {section === "delivery" ? (
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Delivery Settings</h2>
                <p>Manage delivery suburbs and time slots shown on the menu page.</p>
              </div>
            </div>
            <label className="admin-field">
              <span>Delivery Suburbs</span>
              <textarea
                value={store.suburbs.join("\n")}
                rows={5}
                onChange={(event) =>
                  setStore({
                    ...store,
                    suburbs: event.target.value
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  })
                }
              />
              <small>One suburb per line.</small>
            </label>
            <div className="time-slot-grid">
              {days.map((day) => (
                <label key={day}>
                  <span>{day}</span>
                  <input
                    value={(store.timeSlots[day] ?? []).join(", ")}
                    onChange={(event) =>
                      setStore({
                        ...store,
                        timeSlots: {
                          ...store.timeSlots,
                          [day]: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        }
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {section === "settings" ? (
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            uploadSettingImage={uploadSettingImage}
          />
        ) : null}
      </section>
    </main>
  );
}

function Dashboard({
  categoryCount,
  productCount,
  orderCount,
  orderTotal,
  orders
}: {
  categoryCount: number;
  productCount: number;
  orderCount: number;
  orderTotal: number;
  orders: AdminOrder[];
}) {
  return (
    <section className="admin-stack">
      <div className="admin-stat-grid">
        <Stat title="Orders" value={String(orderCount)} icon={ShoppingBag} />
        <Stat title="Revenue" value={money(orderTotal)} icon={Clock} />
        <Stat title="Products" value={String(productCount)} icon={PackagePlus} />
        <Stat title="Categories" value={String(categoryCount)} icon={Tags} />
      </div>
      <OrdersPanel orders={orders.slice(0, 6)} compact />
    </section>
  );
}

function Stat({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: string;
  icon: typeof ShoppingBag;
}) {
  return (
    <article className="admin-stat-card">
      <Icon size={22} aria-hidden="true" />
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function OrdersPanel({ orders, compact = false }: { orders: AdminOrder[]; compact?: boolean }) {
  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>{compact ? "Recent Orders" : "Orders List"}</h2>
          <p>Customer order details saved from checkout.</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Time</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id.slice(0, 8)}</strong>
                    <small>{new Date(order.createdAt).toLocaleString()}</small>
                  </td>
                  <td>
                    <strong>{order.details.name}</strong>
                    <small>{order.details.phone}</small>
                  </td>
                  <td>{order.details.mode}</td>
                  <td>{order.details.time || "-"}</td>
                  <td>{money(order.total)}</td>
                  <td>
                    <span className="order-status">{order.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SettingsPanel({
  settings,
  setSettings,
  saveSettings,
  uploadSettingImage
}: {
  settings: SiteSettings;
  setSettings: (settings: SiteSettings) => void;
  saveSettings: (settings: SiteSettings, newPassword?: string) => Promise<void>;
  uploadSettingImage: (
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof SiteSettings["branding"]
  ) => Promise<void>;
}) {
  const [newPassword, setNewPassword] = useState("");

  return (
    <section className="admin-stack">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Website Settings</h2>
            <p>Logo, favicon, contact details and social links.</p>
          </div>
        </div>
        <div className="admin-logo-preview-grid">
          <AdminImagePreview title="Website logo" src={settings.branding.logo} wide />
          <AdminImagePreview title="Footer logo" src={settings.branding.footerLogo} wide />
          <AdminImagePreview title="Favicon" src={settings.branding.favicon} />
        </div>
        <div className="admin-product-form">
          <label>
            <span>Website Name</span>
            <input
              value={settings.branding.siteName}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, siteName: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Logo URL</span>
            <input
              value={settings.branding.logo}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, logo: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Upload Website Logo</span>
            <input type="file" accept="image/*" onChange={(event) => uploadSettingImage(event, "logo")} />
          </label>
          <label>
            <span>Footer Logo URL</span>
            <input
              value={settings.branding.footerLogo}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, footerLogo: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Upload Footer Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => uploadSettingImage(event, "footerLogo")}
            />
          </label>
          <label>
            <span>Favicon URL</span>
            <input
              value={settings.branding.favicon}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, favicon: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Upload Favicon</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => uploadSettingImage(event, "favicon")}
            />
          </label>
          <label>
            <span>Phone</span>
            <input
              value={settings.contact.phone}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, phone: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Email</span>
            <input
              value={settings.contact.email}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, email: event.target.value }
                })
              }
            />
          </label>
          <label className="full-field">
            <span>Address</span>
            <input
              value={settings.contact.address}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, address: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Facebook</span>
            <input
              value={settings.contact.facebook}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, facebook: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Instagram</span>
            <input
              value={settings.contact.instagram}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, instagram: event.target.value }
                })
              }
            />
          </label>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Mail Settings</h2>
            <p>SMTP password is read from the environment variable, not saved in the database.</p>
          </div>
        </div>
        <div className="admin-product-form">
          <label>
            <span>Enable Email</span>
            <select
              value={settings.mail.enabled ? "yes" : "no"}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, enabled: event.target.value === "yes" }
                })
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <span>SMTP Host</span>
            <input
              value={settings.mail.host}
              onChange={(event) =>
                setSettings({ ...settings, mail: { ...settings.mail, host: event.target.value } })
              }
            />
          </label>
          <label>
            <span>SMTP Port</span>
            <input
              type="number"
              value={settings.mail.port}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, port: Number(event.target.value) }
                })
              }
            />
          </label>
          <label>
            <span>Secure</span>
            <select
              value={settings.mail.secure ? "yes" : "no"}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, secure: event.target.value === "yes" }
                })
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <span>SMTP Username</span>
            <input
              value={settings.mail.username}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, username: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Password Env Key</span>
            <input
              value={settings.mail.passwordEnvKey}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, passwordEnvKey: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>From Email</span>
            <input
              value={settings.mail.fromEmail}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, fromEmail: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Admin Email</span>
            <input
              value={settings.mail.adminEmail}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  mail: { ...settings.mail, adminEmail: event.target.value }
                })
              }
            />
          </label>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Admin Account</h2>
            <p>Change login email and password.</p>
          </div>
        </div>
        <div className="admin-product-form">
          <label>
            <span>Admin Email</span>
            <input
              value={settings.admin.email}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  admin: { ...settings.admin, email: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>New Password</span>
            <input
              type="password"
              value={newPassword}
              placeholder="Leave blank to keep current password"
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
        </div>
      </div>

      <button className="button button-green admin-save-settings" type="button" onClick={() => saveSettings(settings, newPassword)}>
        Save Settings
      </button>
    </section>
  );
}

function AdminImagePreview({
  title,
  src,
  wide = false
}: {
  title: string;
  src: string;
  wide?: boolean;
}) {
  return (
    <div className="admin-upload-preview">
      <span>{title}</span>
      <Image
        src={src || "/images/logo.png"}
        width={wide ? 210 : 54}
        height={wide ? 58 : 54}
        alt={title}
        unoptimized
      />
      <small>{src}</small>
    </div>
  );
}
