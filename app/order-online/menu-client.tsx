"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import type { CartItem, MenuProduct, MenuStore, OrderMode, SizeOption } from "@/lib/menu-types";

const cartKey = "shalimar-cart";
const checkoutKey = "shalimar-checkout";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

  useEffect(() => {
    fetch("/api/menu")
      .then((response) => response.json())
      .then((data: MenuStore) => {
        setStore(data);
        setActiveCategory(data.categories[0]?.id ?? "");
        setSuburb(data.suburbs[0] ?? "");
    });

    const savedCart = window.localStorage.getItem(cartKey);
    if (savedCart) {
      queueMicrotask(() => setCart(JSON.parse(savedCart) as CartItem[]));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart]);

  const products = useMemo(() => {
    return store?.products.filter((product) => product.categoryId === activeCategory) ?? [];
  }, [activeCategory, store]);

  const timeSlots = store?.timeSlots[todayName()] ?? Object.values(store?.timeSlots ?? {})[0] ?? [];

  function addConfiguredProduct(product: MenuProduct, options?: { size?: SizeOption; spice?: string; quantity?: number }) {
    const sizeExtra = options?.size?.extra ?? 0;
    const quantity = options?.quantity ?? 1;
    const linePrice = product.price + sizeExtra;
    setCart((items) => {
      const id = [
        product.id,
        options?.size?.name ?? "regular",
        options?.spice ?? "no-spice",
        items.length + 1
      ].join("-");

      return [
        ...items,
        {
          id,
          productId: product.id,
          name: product.name,
          price: linePrice,
          quantity,
          size: options?.size,
          spice: options?.spice
        }
      ];
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
                  <Image
                    src={product.image}
                    width={180}
                    height={130}
                    alt={product.name}
                    className="product-thumb"
                  />
                  <div>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    <strong>{money(product.price)}</strong>
                  </div>
                  <button className="button button-green" type="button" onClick={() => addProduct(product)}>
                    Add
                  </button>
                </article>
              ))}
            </div>
          </div>

          <aside className="cart-panel">
            <div className="cart-mode-tabs">
              <button
                className={mode === "delivery" ? "active" : ""}
                type="button"
                onClick={() => setMode("delivery")}
              >
                Delivery
              </button>
              <button
                className={mode === "pickup" ? "active" : ""}
                type="button"
                onClick={() => setMode("pickup")}
              >
                Pickup
              </button>
            </div>
            {mode === "delivery" ? (
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
              <span>{cart.length}</span>
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
              disabled={!cart.length || !time || (mode === "delivery" && !suburb)}
              onClick={proceedToCheckout}
            >
              Proceed to Checkout
            </button>
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
  const [spice, setSpice] = useState(product.spiceOptions[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const total = (product.price + (size?.extra ?? 0)) * quantity;

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
        {product.spiceOptions.length ? (
          <label>
            <span>Spice</span>
            <select value={spice} onChange={(event) => setSpice(event.target.value)}>
              {product.spiceOptions.map((option) => (
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
        <button
          className="button button-green modal-add"
          type="button"
          onClick={() => onAdd({ size, spice: spice || undefined, quantity })}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
