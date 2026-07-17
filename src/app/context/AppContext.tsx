import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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
import voucherService from "../../services/voucherService";
import returnService from '../../services/returnService';

export interface CartItem {
  id?: number; // Database CartItem ID
  productId: string; // ID of the VARIANT (for cart operations)
  baseProductId?: string; // ID of the PRODUCT (for linking)
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  brand: string;
}

export interface Address {
  id?: number;
  receiverName: string;
  phone: string;
  city: string;
  state: string;
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
  total: number;
  subtotal?: number;
  shippingFee?: number;
  paymentMethod: string;
  receiverName: string;
  phone: string;
  address: any;
  items: any[];
  trackingHistory?: TrackingEvent[];
  cancelReason?: string;
  returnReason?: string;
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
  roleName?: string;
  rank?: string;
  level?: number;
  status?: string;
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
  login: (email: string, password: string, role?: "user" | "admin", turnstileToken?: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    turnstileToken?: string;
    otp?: string;
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
  validVouchers: any[];
  refreshVouchers: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  carts: ApiCart[];
  currentCartId: number | null;
  selectCart: (cartId: number) => void;
  createCart: (name: string) => Promise<void>;
  renameCart: (cartId: number, name: string) => Promise<void>;
  setDefaultCart: (cartId: number) => Promise<void>;
  deleteCart: (cartId: number) => Promise<void>;
}

const defaultUser: User = {
  fullName: "Khách",
  email: "",
  phone: "",
  birthDate: "",
  gender: "Nam",
  avatar: "K",
  addresses: [],
  roleName: "USER",
  rank: "NEW",
  level: 0,
  status: "ACTIVE",
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
  const [carts, setCarts] = useState<ApiCart[]>([]);
  const [currentCartId, setCurrentCartId] = useState<number | null>(null);
  const currentCartIdRef = useRef<number | null>(null);

  useEffect(() => {
    currentCartIdRef.current = currentCartId;
  }, [currentCartId]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User>(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      return { ...defaultUser, role: 'admin' };
    }
    return defaultUser;
  });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [validVouchers, setValidVouchers] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ==================== CART ====================
  const refreshCart = useCallback(async (targetCartId?: number | null) => {
    if (!isLoggedIn) return;
    try {
      let activeCarts = await cartService.getCarts('ACTIVE');

      // Nếu không có giỏ hàng hoạt động nào, tự động gọi API lấy/tạo giỏ hàng mặc định
      if (activeCarts.length === 0) {
        const defaultCart = await cartService.getDefaultCart();
        activeCarts = [defaultCart];
      }
      
      setCarts(activeCarts);

      let selectedCart: ApiCart | undefined;
      
      if (targetCartId !== undefined && targetCartId !== null) {
        selectedCart = activeCarts.find(c => c.id === targetCartId);
      }
      
      if (!selectedCart && currentCartIdRef.current !== null) {
        selectedCart = activeCarts.find(c => c.id === currentCartIdRef.current);
      }

      if (!selectedCart) {
        selectedCart = activeCarts.find(c => c.isDefault) || activeCarts[0];
      }

      if (selectedCart) {
        setCurrentCartId(selectedCart.id);
        const mappedItems: CartItem[] = (selectedCart.items || []).map(item => ({
          id: item.id,
          productId: item.productVariantId.toString(),
          baseProductId: item.productId.toString(),
          name: item.productName,
          price: Number(item.unitPrice) || 0,
          originalPrice: item.originalPrice !== undefined && item.originalPrice !== null ? Number(item.originalPrice) : undefined,
          discount: item.discount !== undefined && item.discount !== null ? Number(item.discount) : undefined,
          image: item.imageUrl,
          quantity: item.quantity,
          size: item.variantInfo,
          color: '',
          brand: ''
        }));
        setCart(mappedItems);
      } else {
        setCurrentCartId(null);
        setCart([]);
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  }, [isLoggedIn]);

  const refreshVouchers = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const vouchers = await voucherService.getValidVouchers();
      setValidVouchers(vouchers);
    } catch (err) {}
  }, [isLoggedIn]);

  // Khôi phục session khi app load (nếu token còn trong localStorage)
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log(">>> [EVENT] Nhận tín hiệu cập nhật giỏ hàng!");
      refreshCart();
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    
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
            role: (profile.roleName === 'ROLE_ADMIN' || profile.roleName === 'ADMIN') ? 'admin' : 'user',
          }));
        })
        .catch(() => {
          // Token không hợp lệ -> đăng xuất
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          setIsLoggedIn(false);
          setUser(defaultUser);
        });

      // Load addresses
      getMyAddressesAPI()
        .then((addresses) => {
          setUser((prev) => ({ ...prev, addresses }));
        })
        .catch(() => {});

      refreshCart();
      refreshVouchers();
      refreshOrders();
    }
  }, [refreshCart, refreshVouchers]);

  // Load Categories & Brands
  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => {});
    brandService.getAllBrands().then(setBrands).catch(() => {});
  }, []);

  const addToCart = useCallback(async (item: CartItem) => {
    if (!isLoggedIn) {
      const guestItem = { ...item, price: Number(item.price) || 0 };
      setCart((prev) => {
        const existing = prev.find(c => c.productId === guestItem.productId);
        if (existing) return prev.map(c => c.productId === guestItem.productId ? { ...c, quantity: c.quantity + guestItem.quantity } : c);
        return [...prev, guestItem];
      });
      return;
    }
    try {
      const targetCartId = currentCartIdRef.current || undefined;
      await cartService.addToCart(parseInt(item.productId), item.quantity, targetCartId);
      await refreshCart(targetCartId);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  }, [isLoggedIn, refreshCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isLoggedIn) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      return;
    }
    try {
      const itemToDelete = cart.find(i => i.productId === productId);
      if (itemToDelete && itemToDelete.id) {
        const targetCartId = currentCartIdRef.current || undefined;
        await cartService.removeCartItem(itemToDelete.id, targetCartId);
        await refreshCart(targetCartId);
      }
    } catch (err) {}
  }, [isLoggedIn, cart, refreshCart]);

  const updateCartQty = useCallback(async (productId: string, size: string, color: string, qty: number) => {
    if (!isLoggedIn) {
      if (qty <= 0) {
        setCart((prev) => prev.filter((c) => c.productId !== productId));
      } else {
        setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, quantity: qty } : c));
      }
      return;
    }
    try {
      const itemToUpdate = cart.find(i => i.productId === productId);
      if (itemToUpdate && itemToUpdate.id) {
        const targetCartId = currentCartIdRef.current || undefined;
        await cartService.updateCartItem(itemToUpdate.id, qty, targetCartId);
        await refreshCart(targetCartId);
      }
    } catch (err) {}
  }, [isLoggedIn, cart, refreshCart]);

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      const targetCartId = currentCartIdRef.current || undefined;
      await cartService.clearCart(targetCartId);
    }
    setCart([]);
  }, [isLoggedIn]);

  const selectCart = useCallback((cartId: number) => {
    refreshCart(cartId);
  }, [refreshCart]);

  const createCart = useCallback(async (name: string) => {
    if (!isLoggedIn) return;
    try {
      const newCart = await cartService.createCart(name);
      await refreshCart(newCart.id);
    } catch (err) {
      console.error("Create cart failed", err);
    }
  }, [isLoggedIn, refreshCart]);

  const renameCart = useCallback(async (cartId: number, name: string) => {
    if (!isLoggedIn) return;
    try {
      await cartService.updateCart(cartId, { name });
      await refreshCart(currentCartIdRef.current);
    } catch (err) {
      console.error("Rename cart failed", err);
    }
  }, [isLoggedIn, refreshCart]);

  const setDefaultCart = useCallback(async (cartId: number) => {
    if (!isLoggedIn) return;
    try {
      await cartService.updateCart(cartId, { isDefault: true });
      await refreshCart(cartId);
    } catch (err) {
      console.error("Set default cart failed", err);
    }
  }, [isLoggedIn, refreshCart]);

  const deleteCart = useCallback(async (cartId: number) => {
    if (!isLoggedIn) return;
    try {
      await cartService.archiveCart(cartId);
      await refreshCart(null);
    } catch (err) {
      console.error("Delete cart failed", err);
    }
  }, [isLoggedIn, refreshCart]);

  // ==================== ORDERS ====================
  const mapApiOrderToUI = useCallback((o: any): Order => ({
    id: o.id.toString(),
    orderCode: o.orderCode || `SZ${o.id}`, 
    orderDate: o.createAt ? new Date(o.createAt).toLocaleDateString('vi-VN') : '',
    status: (o.status || 'pending').toLowerCase(),
    total: Number(o.totalPrice) || 0,
    subtotal: (Number(o.totalPrice) || 0) - (o.shippingFee !== undefined ? Number(o.shippingFee) : 30000),
    shippingFee: o.shippingFee !== undefined ? Number(o.shippingFee) : 30000,
    voucherCode: o.voucher?.code || null,
    voucherDiscount: o.voucher?.discountAmount ? Number(o.voucher.discountAmount) : 0,
    paymentMethod: o.paymentMethod || "COD",
    receiverName: o.receiverName,
    phone: o.phone,
    address: {
      fullName: o.receiverName,
      phone: o.phone,
      street: o.billingAddress?.street || '',
      ward: o.billingAddress?.state || '',
      district: '',
      province: o.billingAddress?.city || ''
    },
    items: (o.orderItems || []).map((item: any) => ({
      orderItemId: item.id || 0,
      name: item.productName || 'Sản phẩm',
      image: item.imageUrl || '',
      price: Number(item.priceAtPurchase) || 0,
      originalPrice: item.originalPrice !== undefined && item.originalPrice !== null ? Number(item.originalPrice) : undefined,
      quantity: item.quantity || 1,
      size: item.size || '',
      color: item.color || ''
    })),
    trackingHistory: [
      { time: o.createAt ? new Date(o.createAt).toLocaleString('vi-VN') : '', status: "Đặt hàng thành công", description: "Đơn hàng đã được xác nhận", done: true },
      { time: "", status: "Đang xử lý", description: "Người bán đang chuẩn bị hàng", done: o.status !== 'PENDING' },
      { time: "", status: "Đang giao hàng", description: "Đơn hàng đã được giao cho đơn vị vận chuyển", done: ['SHIPPING', 'DELIVERED'].includes(o.status) },
      { time: "", status: "Giao hàng thành công", description: "Đơn hàng đã được giao thành công", done: o.status === 'DELIVERED' },
    ]
  }), []);

  const refreshOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const apiOrders = await orderService.getMyOrders();
      const mappedOrders: Order[] = apiOrders.map(mapApiOrderToUI)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id));
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  }, [isLoggedIn, mapApiOrderToUI]);

  const placeOrder = useCallback(async (orderData: any): Promise<any> => {
    try {
      const newOrder = await orderService.createOrder(orderData);
      await refreshOrders();
      await refreshCart();
      return newOrder;
    } catch (err) {
      throw err;
    }
  }, [refreshOrders, refreshCart]);

  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      await orderService.deleteOrder(parseInt(orderId));
      await refreshOrders();
      // Vẫn cập nhật local để có lý do (dù backend chưa lưu)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "canceled", cancelReason: reason } : o))
      );
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  }, [refreshOrders]);

  const requestReturn = useCallback(async (orderId: string, reason: string) => {
    try {
      // Lấy đơn hàng để lấy danh sách items
      const order = orders.find(o => o.id === orderId);
      const items = (order?.items || []).map((item: any) => ({
        orderItemId: item.orderItemId || item.id || 0,
        quantity: item.quantity || 1,
        imageProof: ''
      }));

      await returnService.createReturn({
        orderId: parseInt(orderId),
        reason,
        items
      });
      await refreshOrders();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'return_requested', returnReason: reason } : o))
      );
    } catch (err) {
      console.error('Failed to request return', err);
      throw err;
    }
  }, [refreshOrders, orders]);

  // ==================== AUTH ====================
  const login = useCallback(async (email: string, password: string, role: "user" | "admin" = "user", turnstileToken?: string): Promise<boolean> => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Gọi API đăng nhập thực
      await loginAPI({ email, password, turnstileToken });

      // Lấy thông tin profile
      const profile = await getMyProfileAPI();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || email;
      const avatar = fullName.substring(0, 2).toUpperCase();
      const dbRole = profile.roleName === 'ROLE_ADMIN' || profile.roleName === 'ADMIN' ? 'admin' : 'user';
      
      setUser({
        ...defaultUser,
        ...profile,
        fullName,
        avatar,
        role: dbRole as "user" | "admin",
      });
      localStorage.setItem('userRole', dbRole);

      // Lấy danh sách địa chỉ
      try {
        const addresses = await getMyAddressesAPI();
        setUser((prev) => ({ ...prev, addresses }));
      } catch {}

      setIsLoggedIn(true);
      refreshOrders();
      refreshVouchers();
      return true;
    } catch (err: any) {
      const msg = typeof err?.response?.data === 'string' 
        ? err.response.data 
        : (err?.response?.data?.message || err?.message || 'Đăng nhập thất bại');
      setApiError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutAPI();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
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
    turnstileToken?: string;
    otp?: string;
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
        turnstileToken: userData.turnstileToken,
        otp: userData.otp,
        roleName: 'ROLE_USER',
        status: 'ACTIVE',
      });

      // Sau khi đăng ký thành công, tự động đăng nhập
      await loginAPI({ email: userData.email, password: userData.password, turnstileToken: userData.turnstileToken });
      
      const profile = await getMyProfileAPI();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || userData.email;
      const avatar = fullName.substring(0, 2).toUpperCase();
      const dbRole = profile.roleName === 'ROLE_ADMIN' || profile.roleName === 'ADMIN' ? 'admin' : 'user';
      setUser({ 
        ...profile, 
        fullName: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.firstName?.charAt(0).toUpperCase() || 'U', 
        role: dbRole as "user" | "admin",
        addresses: [] // Addresses will be loaded via refreshProfile or similar if needed
      });
      setIsLoggedIn(true);
      localStorage.setItem('userRole', dbRole);
      return true;
    } catch (err: any) {
      const msg = typeof err?.response?.data === 'string' 
        ? err.response.data 
        : (err?.response?.data?.message || err?.message || 'Đăng ký thất bại');
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
  const isAdmin = isLoggedIn && (user.role === "admin" || user.roleName === "ROLE_ADMIN" || user.roleName === "ADMIN");

  return (
    <AppContext.Provider
      value={{
        cart, orders, user, wishlist, isLoggedIn, isAdmin, isLoading, apiError,
        login, logout, register,
        addToCart, removeFromCart, updateCartQty, clearCart,
        placeOrder, cancelOrder, requestReturn, mapApiOrderToUI,
        updateUser, addAddress, setDefaultAddress, updateAddress, deleteAddress,
        changePassword, refreshProfile,
        toggleWishlist,
        categories, brands, validVouchers, refreshVouchers, refreshOrders, refreshCart,
        cartCount, cartTotal,
        carts, currentCartId, selectCart, createCart, renameCart, setDefaultCart, deleteCart,
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
