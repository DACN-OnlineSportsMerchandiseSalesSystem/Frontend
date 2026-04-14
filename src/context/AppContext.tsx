import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/constants/productsData";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  brand: string;
}

export interface Coupon {
  code: string;
  label: string;
  desc: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  badge: string;
  badgeColor: string;
}

export interface Address {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

export interface TrackingEvent {
  time: string;
  status: string;
  description: string;
  done: boolean;
}

export interface Order {
  id: string;
  orderDate: string;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled" | "return_requested" | "returned";
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: Address;
  paymentMethod: string;
  note: string;
  trackingHistory: TrackingEvent[];
  cancelReason?: string;
  returnReason?: string;
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  avatar: string;
  interestedSports: string[];
  addresses: Address[];
}

interface AppContextType {
  cart: CartItem[];
  orders: Order[];
  user: User;
  wishlist: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (order: Omit<Order, "id" | "orderDate" | "trackingHistory">) => string;
  cancelOrder: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  updateUser: (user: Partial<User>) => void;
  addAddress: (addr: Address) => void;
  toggleWishlist: (productId: string) => void;
  cartCount: number;
  cartTotal: number;
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
}

const defaultUser: User = {
  fullName: "Nguyễn Văn Khách",
  email: "khachhang@email.com",
  phone: "0912345678",
  birthDate: "01/01/1995",
  gender: "Nam",
  avatar: "NK",
  interestedSports: ["Chạy bộ", "Gym & Fitness"],
  addresses: [
    {
      fullName: "Nguyễn Văn Khách",
      phone: "0912345678",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street: "123 Nguyễn Huệ",
      isDefault: true,
    },
  ],
};

const sampleOrders: Order[] = [
  {
    id: "SZ20260315001",
    orderDate: "15/03/2026",
    status: "delivered",
    items: [
      {
        productId: "p1",
        name: "Giày Chạy Bộ ProRun X5",
        price: 1850000,
        image: "https://images.unsplash.com/photo-1762943107238-a87f6f7bf6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        quantity: 1,
        size: "42",
        color: "Xanh dương",
        brand: "Nike",
      },
    ],
    subtotal: 1850000,
    shippingFee: 30000,
    total: 1880000,
    address: defaultUser.addresses[0],
    paymentMethod: "COD",
    note: "",
    trackingHistory: [
      { time: "15/03/2026 09:00", status: "Đặt hàng thành công", description: "Đơn hàng của bạn đã được xác nhận", done: true },
      { time: "15/03/2026 10:30", status: "Đang xử lý", description: "Người bán đang chuẩn bị hàng", done: true },
      { time: "16/03/2026 08:00", status: "Đang giao hàng", description: "Đơn hàng đã được giao cho đơn vị vận chuyển", done: true },
      { time: "17/03/2026 14:20", status: "Giao hàng thành công", description: "Đơn hàng đã được giao thành công", done: true },
    ],
  },
  {
    id: "SZ20260320002",
    orderDate: "20/03/2026",
    status: "shipping",
    items: [
      {
        productId: "p4",
        name: "Áo Đấu Thể Thao DryFit Pro",
        price: 280000,
        image: "https://images.unsplash.com/photo-1659081469066-c88ca2dec240?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        quantity: 2,
        size: "L",
        color: "Xanh dương",
        brand: "SportZone",
      },
    ],
    subtotal: 560000,
    shippingFee: 30000,
    total: 590000,
    address: defaultUser.addresses[0],
    paymentMethod: "MoMo",
    note: "Giao giờ hành chính",
    trackingHistory: [
      { time: "20/03/2026 10:00", status: "Đặt hàng thành công", description: "Đơn hàng của bạn đã được xác nhận", done: true },
      { time: "20/03/2026 14:00", status: "Đang xử lý", description: "Người bán đang chuẩn bị hàng", done: true },
      { time: "21/03/2026 09:00", status: "Đang giao hàng", description: "Đơn hàng đã được giao cho đơn vị vận chuyển", done: true },
      { time: "22/03/2026 14:20", status: "Giao hàng thành công", description: "Đơn hàng đã được giao thành công", done: false },
    ],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [user, setUser] = useState<User>(defaultUser);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.productId === item.productId && c.size === item.size && c.color === item.color
      );
      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId && c.size === item.size && c.color === item.color
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size: string, color: string) => {
    setCart((prev) => prev.filter((c) => !(c.productId === productId && c.size === size && c.color === color)));
  }, []);

  const updateCartQty = useCallback((productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => !(c.productId === productId && c.size === size && c.color === color)));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.productId === productId && c.size === size && c.color === color ? { ...c, quantity: qty } : c
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback((orderData: Omit<Order, "id" | "orderDate" | "trackingHistory">): string => {
    const id = "SZ" + Date.now().toString().slice(-11);
    const now = new Date();
    const date = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    const newOrder: Order = {
      ...orderData,
      id,
      orderDate: date,
      trackingHistory: [
        { time: `${date} ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`, status: "Đặt hàng thành công", description: "Đơn hàng của bạn đã được xác nhận", done: true },
        { time: "", status: "Đang xử lý", description: "Người bán đang chuẩn bị hàng", done: false },
        { time: "", status: "Đang giao hàng", description: "Đơn hàng đã được giao cho đơn vị vận chuyển", done: false },
        { time: "", status: "Giao hàng thành công", description: "Đơn hàng đã được giao thành công", done: false },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);
    return id;
  }, []);

  const cancelOrder = useCallback((orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled", cancelReason: reason } : o))
    );
  }, []);

  const requestReturn = useCallback((orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "return_requested", returnReason: reason } : o))
    );
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data }));
  }, []);

  const addAddress = useCallback((addr: Address) => {
    setUser((prev) => ({
      ...prev,
      addresses: addr.isDefault
        ? [...prev.addresses.map((a) => ({ ...a, isDefault: false })), addr]
        : [...prev.addresses, addr],
    }));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingFee = cartTotal >= 500000 ? 0 : 30000;
  
  const calcDiscount = (coupon: Coupon, cartTotal: number, shippingFee: number): number => {
    if (cartTotal < coupon.minOrder) return 0;
    if (coupon.type === "percent") {
      const raw = (cartTotal * coupon.value) / 100;
      return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    }
    if (coupon.type === "fixed") return Math.min(coupon.value, cartTotal);
    if (coupon.type === "shipping") return shippingFee;
    return 0;
  };

  const discountAmount = appliedCoupon ? calcDiscount(appliedCoupon, cartTotal, shippingFee) : 0;
  const shippingAfterCoupon = appliedCoupon?.type === "shipping" ? 0 : shippingFee;
  const finalTotal = cartTotal - (appliedCoupon?.type !== "shipping" ? discountAmount : 0) + shippingAfterCoupon;

  return (
    <AppContext.Provider
      value={{
        cart, orders, user, wishlist,
        addToCart, removeFromCart, updateCartQty, clearCart,
        placeOrder, cancelOrder, requestReturn,
        updateUser, addAddress, toggleWishlist,
        cartCount, cartTotal,
        appliedCoupon, setAppliedCoupon,
        shippingFee, discountAmount, finalTotal
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
