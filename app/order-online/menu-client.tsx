"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, X } from "lucide-react";
import type { CartItem, MenuProduct, MenuStore, OrderMode, SizeOption } from "@/lib/menu-types";

const cartKey = "shalimar-cart";
const checkoutKey = "shalimar-checkout";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function cartLineId(productId: string, sizeName?: string, spice?: string) {
  return [productId, sizeName || "regular", spice || "no-spice"].join("-");
}

function normalizeCartItems(items: CartItem[]) {
  return items.reduce<CartItem[]>((merged, item) => {
    const id = cartLineId(item.productId, item.size?.name, item.spice);
    const existing = merged.find((entry) => entry.id === id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.push({ ...item, id });
    }
    return merged;
  }, []);
}

function spiceOptionsFor(product: MenuProduct) {
  if (!product.spiceOptions.length) {
    return [];
  }
  const options = ["Normal", ...product.spiceOptions];
  return options.filter((option, index) => {
    const key = option.toLowerCase();
    return option && options.findIndex((item) => item.toLowerCase() === key) === index;
  });
}

function todayName() {
  return new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(new Date());
}

export default function MenuClient() {
  const [store, setStore] = useState<MenuStore | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mode, setMode] = useState<OrderMode>("delivery");
  const [suburb, setSuburb] = useState("");
  const [time, setTime] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((response) => response.json())
      .then((data: MenuStore) => {
        setStore(data);
        setActiveCategory(data.categories[0]?.id ?? "");
        setSuburb(data.suburbs[0] ?? "");
        setMode(data.orderOptions.delivery ? "delivery" : "pickup");
    });

    const savedCart = window.localStorage.getItem(cartKey);
    if (savedCart) {
      queueMicrotask(() => setCart(normalizeCartItems(JSON.parse(savedCart) as CartItem[])));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart]);

  const products = useMemo(() => {
    return store?.products.filter((product) => product.categoryId === activeCategory) ?? [];
  }, [activeCategory, store]);

  const timeSlots = store?.timeSlots[todayName()] ?? Object.values(store?.timeSlots ?? {})[0] ?? [];
  const orderOptions = store?.orderOptions ?? { delivery: true, pickup: true };
  const hasOrderingOption = orderOptions.delivery || orderOptions.pickup;
  const currentModeAvailable = (mode === "delivery" && orderOptions.delivery) || (mode === "pickup" && orderOptions.pickup);

  function addConfiguredProduct(product: MenuProduct, options?: { size?: SizeOption; spice?: string; quantity?: number }) {
    const sizeExtra = options?.size?.extra ?? 0;
    const quantity = options?.quantity ?? 1;
    const linePrice = product.price + sizeExtra;
    setCart((items) => {
      const id = cartLineId(product.id, options?.size?.name, options?.spice);
      const existing = items.find((item) => item.id === id);
      if (existing) {
        return items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [...items, {
        id,
        productId: product.id,
        name: product.name,
        price: linePrice,
        quantity,
        size: options?.size,
        spice: options?.spice
      }];
    });
  }

  function addProduct(product: MenuProduct) {
    if (product.sizeOptions.length || product.spiceOptions.length) {
      setSelectedProduct(product);
      return;
    }
    addConfiguredProduct(product);
  }

  function removeItem(id: string) {
    setCart((items) => items.filter((item) => item.id !== id));
  }

  function proceedToCheckout() {
    window.localStorage.setItem(
      checkoutKey,
      JSON.stringify({ mode, suburb, time, items: cart })
    );
    window.location.href = "/checkout";
  }

  if (!store) {
    return (
      <main className="menu-loading">
        <span>Loading menu...</span>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero menu-page-hero">
        <Image
          src="/images/restaurant-spread.webp"
          alt=""
          fill
          sizes="100vw"
          className="page-hero-image"
          priority
        />
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Order Online</h1>
          <p>Choose your favourites, customise options and checkout quickly.</p>
        </div>
      </section>

      <section className="section order-section">
        <div className="container order-layout">
          <div>
            <div className="category-tabs" aria-label="Menu categories">
              {store.categories.map((category) => (
                <button
                  className={category.id === activeCategory ? "active" : ""}
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div>
                    <h2>{product.name}</h2>
                    {product.description ? <p>{product.description}</p> : null}
                    <strong>{money(product.price)}</strong>
                  </div>
                  <button className="button button-green" type="button" onClick={() => addProduct(product)}>
                    Add
                  </button>
                </article>
              ))}
            </div>
          </div>

          <aside className={`cart-panel ${isCartOpen ? "cart-panel-open" : "cart-panel-collapsed"}`}>
            <button
              className="mobile-cart-toggle"
              type="button"
              onClick={() => setIsCartOpen((open) => !open)}
              aria-expanded={isCartOpen}
            >
              <span>
                <ShoppingCart size={19} aria-hidden="true" />
                Cart ({cartItemCount(cart)})
              </span>
              <strong>{money(cartTotal(cart))}</strong>
              {isCartOpen ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronUp size={18} aria-hidden="true" />}
            </button>
            <div className="cart-panel-body">
              <div className="cart-mode-tabs">
                {orderOptions.delivery ? (
                  <button
                    className={mode === "delivery" ? "active" : ""}
                    type="button"
                    onClick={() => setMode("delivery")}
                  >
                    Delivery
                  </button>
                ) : null}
                {orderOptions.pickup ? (
                  <button
                    className={mode === "pickup" ? "active" : ""}
                    type="button"
                    onClick={() => setMode("pickup")}
                  >
                    Pickup
                  </button>
                ) : null}
              </div>
              {!hasOrderingOption ? (
                <p className="empty-cart">Online ordering is currently unavailable.</p>
              ) : null}
              {mode === "delivery" && orderOptions.delivery ? (
              <label>
                <span>Suburb *</span>
                <select value={suburb} onChange={(event) => setSuburb(event.target.value)}>
                  {store.suburbs.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              ) : null}
              <label>
                <span>{mode === "delivery" ? "Delivery Time *" : "Pickup Time *"}</span>
                <select value={time} onChange={(event) => setTime(event.target.value)}>
                  <option value="">Select time...</option>
                  {timeSlots.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </label>
              <div className="cart-title">
                <ShoppingCart size={28} aria-hidden="true" />
                <h2>Your Cart</h2>
                <span>{cartItemCount(cart)}</span>
                <button
                  className="mobile-cart-close"
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="cart-items">
                {cart.length ? (
                  cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          {item.quantity} x {money(item.price)}
                          {item.size ? ` | ${item.size.name}` : ""}
                          {item.spice ? ` | ${item.spice}` : ""}
                        </small>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-cart">Your cart is empty.</p>
                )}
              </div>
              <div className="cart-total">
                <span>Total:</span>
                <strong>{money(cartTotal(cart))}</strong>
              </div>
              <button
                className="button button-green checkout-button"
                type="button"
                disabled={!cart.length || !time || !currentModeAvailable || (mode === "delivery" && !suburb)}
                onClick={proceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      </section>

      {selectedProduct ? (
        <ProductOptionsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(options) => {
            addConfiguredProduct(selectedProduct, options);
            setSelectedProduct(null);
          }}
        />
      ) : null}
    </main>
  );
}

function ProductOptionsModal({
  product,
  onAdd,
  onClose
}: {
  product: MenuProduct;
  onAdd: (options: { size?: SizeOption; spice?: string; quantity: number }) => void;
  onClose: () => void;
}) {
  const [size, setSize] = useState<SizeOption | undefined>(product.sizeOptions[0]);
  const spiceOptions = spiceOptionsFor(product);
  const [spice, setSpice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const total = (product.price + (size?.extra ?? 0)) * quantity;
  const needsSpice = spiceOptions.length > 0;

  function addToCart() {
    if (needsSpice && !spice) {
      setError("Please select a spice option.");
      return;
    }
    onAdd({ size, spice: spice || undefined, quantity });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="option-modal">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={26} aria-hidden="true" />
        </button>
        <h2>{product.name}</h2>
        {product.sizeOptions.length ? (
          <label>
            <span>Size</span>
            <select
              value={size?.name}
              onChange={(event) =>
                setSize(product.sizeOptions.find((option) => option.name === event.target.value))
              }
            >
              {product.sizeOptions.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                  {option.extra ? ` (+${money(option.extra)})` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {needsSpice ? (
          <label>
            <span>Spice</span>
            <select
              required
              value={spice}
              onChange={(event) => {
                setSpice(event.target.value);
                setError("");
              }}
            >
              <option value="">Select...</option>
              {spiceOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="qty-control">
          <span>Qty</span>
          <div>
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus size={16} aria-hidden="true" />
            </button>
            <strong>{quantity}</strong>
            <button type="button" onClick={() => setQuantity(quantity + 1)}>
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="modal-total">Total: {money(total)}</div>
        {error ? <p className="form-status modal-error">{error}</p> : null}
        <button
          className="button button-green modal-add"
          type="button"
          onClick={addToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
