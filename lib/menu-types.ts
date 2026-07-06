export type SizeOption = {
  name: string;
  extra: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
};

export type MenuProduct = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizeOptions: SizeOption[];
  spiceOptions: string[];
};

export type MenuStore = {
  categories: MenuCategory[];
  products: MenuProduct[];
  suburbs: string[];
  timeSlots: Record<string, string[]>;
  orderOptions: {
    delivery: boolean;
    pickup: boolean;
  };
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: SizeOption;
  spice?: string;
};

export type OrderMode = "delivery" | "pickup";

export type CheckoutDetails = {
  mode: OrderMode;
  suburb?: string;
  time?: string;
  name: string;
  phone: string;
  address: string;
  zipcode: string;
  notes?: string;
};
