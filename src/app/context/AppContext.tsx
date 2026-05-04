import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "../data/products";
import { loginAPI, registerAPI, logoutAPI } from "../../services/authService";
import { getMyProfileAPI, updateMyProfileAPI, changePasswordAPI } from "../../services/userService";
import {
  getMyAddressesAPI,
  addAddressAPI,
  setDefaultAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
} from "../../services/addressService";
import cartService, { Cart as ApiCart, CartItem as ApiCartItem } from "../../services/cartService";
import orderService, { Order as ApiOrder } from "../../services/orderService";
import categoryService, { Category } from "../../services/categoryService";
import brandService, { Brand } from "../../services/brandService";

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

export interface Address {
  id?: number;
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
  orderCode: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  receiverName: string;
  phone: string;
  address: string;
  items: any[];
  trackingHistory?: TrackingEvent[];
}

export interface User {
  id?: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  avatar: string;
  addresses: Address[];
  role?: "user" | "admin";
}

interface AppContextType {
  cart: CartItem[];
  orders: Order[];
  user: User;
  wishlist: string[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  apiError: string | null;
  login: (email: string, password: string, role?: "user" | "admin") => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (order: Omit<Order, "id" | "orderDate" | "trackingHistory">) => string;
  cancelOrder: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  updateUser: (user: Partial<User>) => Promise<void>;
  addAddress: (addr: Omit<Address, "id">) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  updateAddress: (id: number, data: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  toggleWishlist: (productId: string) => void;
  refreshProfile: () => Promise<void>;
  categories: Category[];
  brands: Brand[];
  cartCount: number;
  cartTotal: number;
}

const defaultUser: User = {
  fullName: "Khách",
  email: "",
  phone: "",
  birthDate: "",
  gender: "Nam",
  avatar: "K",
  addresses: [],
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
    address: { fullName: "Nguyễn Văn Khách", phone: "0912345678", province: "TP. Hồ Chí Minh", district: "Quận 1", ward: "Phường Bến Nghé", street: "123 Nguyễn Huệ", isDefault: true },
    paymentMethod: "COD",
    note: "",
    trackingHistory: [
      { time: "15/03/2026 09:00", status: "Đặt hàng thành công", description: "Đơn hàng của bạn đã được xác nhận", done: true },
      { time: "15/03/2026 10:30", status: "Đang xử lý", description: "Người bán đang chuẩn bị hàng", done: true },
      { time: "16/03/2026 08:00", status: "Đang giao hàng", description: "Đơn hàng đã được giao cho đơn vị vận chuyển", done: true },
      { time: "17/03/2026 14:20", status: "Giao hàng thành công", description: "Đơn hàng đã được giao thành công", done: true },
    ],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User>(defaultUser);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Khôi phục session khi app load (nếu token còn trong localStorage)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole') as "user" | "admin" | null;
    if (token) {
      setIsLoggedIn(true);
      // Load profile từ API
      getMyProfileAPI()
        .then((profile) => {
          const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;
          const avatar = fullName.substring(0, 2).toUpperCase();
          setUser((prev) => ({
            ...prev,
            ...profile,
            fullName,
            avatar,
            role: role || 'user',
          }));
        })
        .catch(() => {
          // Token không hợp lệ -> đăng xuất
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          setIsLoggedIn(false);
        });

      // Load addresses
      getMyAddressesAPI()
        .then((addresses) => {
          setUser((prev) => ({ ...prev, addresses }));
        })
        .catch(() => {});

      setOrders(sampleOrders);
    }
  }, []);

  // Load Categories & Brands
  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => {});
    brandService.getAllBrands().then(setBrands).catch(() => {});
  }, []);

  // ==================== CART ====================
  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const apiCart = await cartService.getMyCart();
      const mappedItems: CartItem[] = apiCart.items.map(item => ({
        productId: item.productVariantId.toString(),
        name: item.productName,
        price: item.price,
        image: item.imageUrl,
        quantity: item.quantity,
        size: item.variantInfo,
        color: '',
        brand: ''
      }));
      setCart(mappedItems);
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  }, [isLoggedIn]);

  const addToCart = useCallback(async (item: CartItem) => {
    if (!isLoggedIn) {
      // Local cart if not logged in
      setCart((prev) => {
        const existing = prev.find(c => c.productId === item.productId);
        if (existing) return prev.map(c => c.productId === item.productId ? { ...c, quantity: c.quantity + item.quantity } : c);
        return [...prev, item];
      });
      return;
    }
    try {
      await cartService.addToCart(parseInt(item.productId), item.quantity);
      await refreshCart();
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  }, [isLoggedIn, refreshCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isLoggedIn) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      return;
    }
    // Note: This requires knowing the CartItem ID from the API
    // For simplicity, we'll need the full cart data to find the item ID
    try {
      const apiCart = await cartService.getMyCart();
      const itemToDelete = apiCart.items.find(i => i.productVariantId.toString() === productId);
      if (itemToDelete) {
        await cartService.removeCartItem(itemToDelete.id);
        await refreshCart();
      }
    } catch (err) {}
  }, [isLoggedIn, refreshCart]);

  const updateCartQty = useCallback(async (productId: string, size: string, color: string, qty: number) => {
    if (!isLoggedIn) {
      setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, quantity: qty } : c));
      return;
    }
    // Standard update: remove and add or wait for backend update endpoint
    // For now, let's just clear and refresh if backend doesn't have direct update
    try {
      const apiCart = await cartService.getMyCart();
      const item = apiCart.items.find(i => i.productVariantId.toString() === productId);
      if (item) {
        await cartService.removeCartItem(item.id);
        await cartService.addToCart(parseInt(productId), qty);
        await refreshCart();
      }
    } catch (err) {}
  }, [isLoggedIn, refreshCart]);

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      await cartService.clearCart();
    }
    setCart([]);
  }, [isLoggedIn]);

  // ==================== ORDERS ====================
  const refreshOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const apiOrders = await orderService.getMyOrders();
      const mappedOrders: Order[] = apiOrders.map(o => ({
        id: o.id.toString(),
        orderCode: o.orderCode,
        orderDate: o.orderDate,
        status: o.status,
        totalAmount: o.totalAmount,
        receiverName: o.receiverName,
        phone: o.phone,
        address: o.address,
        items: o.items
      }));
      setOrders(mappedOrders);
    } catch (err) {}
  }, [isLoggedIn]);

  const placeOrder = useCallback(async (orderData: any): Promise<string> => {
    try {
      const newOrder = await orderService.createOrder(orderData);
      await refreshOrders();
      await clearCart();
      return newOrder.orderCode;
    } catch (err) {
      throw err;
    }
  }, [refreshOrders, clearCart]);

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

  // ==================== AUTH ====================
  const login = useCallback(async (email: string, password: string, role: "user" | "admin" = "user"): Promise<boolean> => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Gọi API đăng nhập thực
      await loginAPI({ email, password });
      localStorage.setItem('userRole', role);

      // Lấy thông tin profile
      const profile = await getMyProfileAPI();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || email;
      const avatar = fullName.substring(0, 2).toUpperCase();
      setUser({
        ...defaultUser,
        ...profile,
        fullName,
        avatar,
        role,
      });

      // Lấy danh sách địa chỉ
      try {
        const addresses = await getMyAddressesAPI();
        setUser((prev) => ({ ...prev, addresses }));
      } catch {}

      setIsLoggedIn(true);
      setOrders(sampleOrders);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại';
      setApiError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutAPI();
    setIsLoggedIn(false);
    setCart([]);
    setOrders([]);
    setWishlist([]);
    setUser(defaultUser);
    setApiError(null);
  }, []);

  const register = useCallback(async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setApiError(null);
    try {
      await registerAPI({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        roleName: 'ROLE_USER',
        status: 'ACTIVE',
      });

      // Sau khi đăng ký thành công, tự động đăng nhập
      await loginAPI({ email: userData.email, password: userData.password });
      localStorage.setItem('userRole', 'user');

      const profile = await getMyProfileAPI();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || userData.email;
      const avatar = fullName.substring(0, 2).toUpperCase();
      setUser({
        ...defaultUser,
        ...profile,
        fullName,
        avatar,
        role: 'user',
      });
      setIsLoggedIn(true);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
      setApiError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== USER / PROFILE ====================
  const updateUser = useCallback(async (data: Partial<User>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Tách firstName/lastName từ fullName nếu cần
      let payload: any = { ...data };
      if (data.fullName && !data.firstName && !data.lastName) {
        const parts = data.fullName.trim().split(' ');
        payload.firstName = parts[0];
        payload.lastName = parts.slice(1).join(' ') || parts[0];
      }
      const updated = await updateMyProfileAPI(payload);
      const fullName = [updated.firstName, updated.lastName].filter(Boolean).join(' ') || updated.email;
      setUser((prev) => ({
        ...prev,
        ...updated,
        fullName,
        avatar: fullName.substring(0, 2).toUpperCase(),
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Cập nhật thất bại';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMyProfileAPI();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;
      setUser((prev) => ({
        ...prev,
        ...profile,
        fullName,
        avatar: fullName.substring(0, 2).toUpperCase(),
      }));
    } catch {}
  }, []);

  // ==================== PASSWORD ====================
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await changePasswordAPI({ oldPassword, newPassword });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đổi mật khẩu thất bại';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== ADDRESSES ====================
  const addAddress = useCallback(async (addr: Omit<Address, 'id'>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const newAddr = await addAddressAPI(addr);
      setUser((prev) => ({
        ...prev,
        addresses: addr.isDefault
          ? [...prev.addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
          : [...prev.addresses, newAddr],
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Thêm địa chỉ thất bại';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: number) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await setDefaultAddressAPI(id);
      setUser((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        })),
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Cập nhật địa chỉ mặc định thất bại';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAddress = useCallback(async (id: number, data: Partial<Address>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const updated = await updateAddressAPI(id, data);
      setUser((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Cập nhật địa chỉ thất bại';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(async (id: number) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await deleteAddressAPI(id);
      setUser((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((a) => a.id !== id),
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Xóa địa chỉ thất bại';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== WISHLIST ====================
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isAdmin = isLoggedIn && user.role === "admin";

  return (
    <AppContext.Provider
      value={{
        cart, orders, user, wishlist, isLoggedIn, isAdmin, isLoading, apiError,
        login, logout, register,
        addToCart, removeFromCart, updateCartQty, clearCart,
        placeOrder, cancelOrder, requestReturn,
        updateUser, addAddress, setDefaultAddress, updateAddress, deleteAddress,
        changePassword, refreshProfile,
        toggleWishlist,
        categories, brands,
        cartCount, cartTotal,
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
