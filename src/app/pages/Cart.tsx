import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronRight, Check, X, Ticket, ChevronDown, ChevronUp, Settings, Search, Edit, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import { products, formatPrice } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import productService from "../../services/productService";
import { optimizeImage } from "@/utils/imageOptimizer";

interface Coupon {
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

function calcDiscount(coupon: Coupon, cartTotal: number, shippingFee: number): number {
  if (cartTotal < coupon.minOrder) return 0;
  if (coupon.type === "percent") {
    const raw = (cartTotal * coupon.value) / 100;
    return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  }
  if (coupon.type === "fixed") return Math.min(coupon.value, cartTotal);
  if (coupon.type === "shipping") return shippingFee;
  return 0;
}

export function Cart() {
  const { 
    cart, removeFromCart, updateCartQty, cartTotal, validVouchers, isLoggedIn, categories,
    carts, currentCartId, selectCart, createCart, renameCart, setDefaultCart, deleteCart 
  } = useApp();
  const navigate = useNavigate();

  const [apiProducts, setApiProducts] = useState<any[]>([]);

  // Các state cho giao diện quản lý nhiều giỏ hàng
  const [isCreating, setIsCreating] = useState(false);
  const [newCartName, setNewCartName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const currentCart = useMemo(() => {
    return carts.find(c => c.id === currentCartId);
  }, [carts, currentCartId]);

  const handleCreateCart = async () => {
    if (!newCartName.trim()) return;
    await createCart(newCartName.trim());
    setIsCreating(false);
    setNewCartName("");
  };

  const handleRenameCart = async () => {
    if (!renameValue.trim() || !currentCartId) return;
    await renameCart(currentCartId, renameValue.trim());
    setIsRenaming(false);
  };

  const handleDeleteCart = async () => {
    if (!currentCartId) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa giỏ hàng "${currentCart?.name}" không?`)) {
      await deleteCart(currentCartId);
    }
  };

  // State và hàm cho custom modal đổi tên giỏ hàng
  const [cartToRenameModal, setCartToRenameModal] = useState<{ id: number; name: string } | null>(null);
  const [renameInputValue, setRenameInputValue] = useState("");

  const handleSaveRenameModal = async () => {
    if (!cartToRenameModal || !renameInputValue.trim()) return;
    await renameCart(cartToRenameModal.id, renameInputValue.trim());
    setCartToRenameModal(null);
    setRenameInputValue("");
  };

  const [activeView, setActiveView] = useState<"details" | "manage">("details");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredCarts = useMemo(() => {
    let result = [...carts];
    // 1. Lọc theo tìm kiếm tên
    if (searchQuery.trim()) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Sắp xếp theo tiêu chí
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "", "vi");
      }
      if (sortBy === "name-desc") {
        return (b.name || "").localeCompare(a.name || "", "vi");
      }
      if (sortBy === "items-desc") {
        const countA = (a.items || []).reduce((sum, item) => sum + item.quantity, 0);
        const countB = (b.items || []).reduce((sum, item) => sum + item.quantity, 0);
        return countB - countA;
      }
      return 0;
    });

    return result;
  }, [carts, searchQuery, sortBy]);

  useEffect(() => {
    productService.getAllProducts()
      .then((data) => {
        setApiProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products for recommendations", err);
      });
  }, []);

  // Helper to find the top-level root category of a given category
  const getRootCategory = (catId: number, allCats: any[]) => {
    let current = allCats.find((c) => c.id === catId);
    if (!current) return null;
    const visited = new Set<number>();
    while (
      current &&
      current.parentId !== undefined &&
      current.parentId !== null &&
      !visited.has(current.id)
    ) {
      visited.add(current.id);
      const parent = allCats.find((c) => c.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current;
  };

  const recommendedProducts = useMemo(() => {
    if (cart.length === 0) return [];

    // 1. Get all unique root categories/sports of cart items.
    const cartProductSports = new Set<string>(); // for mock products
    const cartRootCategoryIds = new Set<number>(); // for API products

    cart.forEach((item) => {
      // Find matching API product
      const apiProd = apiProducts.find(
        (p) =>
          p.id.toString() === item.baseProductId ||
          p.id.toString() === item.productId ||
          p.variants?.some((v: any) => v.id.toString() === item.productId) ||
          p.name === item.name
      );

      if (apiProd) {
        apiProd.categoryIds?.forEach((catId: number) => {
          const rootCat = getRootCategory(catId, categories);
          if (rootCat) {
            cartRootCategoryIds.add(rootCat.id);
          }
        });
      }

      // Find matching mock product
      const mockProd = products.find(
        (p) => p.id === item.productId || p.id === item.baseProductId || p.name === item.name
      );
      if (mockProd && mockProd.sport) {
        cartProductSports.add(mockProd.sport);
      }
    });

    // 2. Filter products based on root categories or sports
    let matchedProducts: any[] = [];

    if (apiProducts.length > 0 && cartRootCategoryIds.size > 0) {
      // Filter API products
      matchedProducts = apiProducts.filter((p) => {
        // Exclude if already in cart
        const isInCart = cart.some(
          (item) =>
            item.productId === p.id.toString() ||
            item.baseProductId === p.id.toString() ||
            p.variants?.some((v: any) => v.id.toString() === item.productId) ||
            item.name === p.name
        );
        if (isInCart) return false;

        // Check if any of its categoryIds traces to our cart root categories
        return p.categoryIds?.some((catId: number) => {
          const rootCat = getRootCategory(catId, categories);
          return rootCat && cartRootCategoryIds.has(rootCat.id);
        });
      });
    }

    // If no API products matched (or we are using mock data), use mock products
    if (matchedProducts.length === 0) {
      matchedProducts = products.filter((p) => {
        // Exclude if already in cart
        const isInCart = cart.some(
          (item) =>
            item.productId === p.id ||
            item.baseProductId === p.id ||
            item.name === p.name
        );
        if (isInCart) return false;

        // Check sport matching
        return p.sport && cartProductSports.has(p.sport);
      });
    }

    // Limit results to 4
    return matchedProducts.slice(0, 4);
  }, [cart, apiProducts, categories]);

  // Map backend vouchers to frontend Coupon interface
  const availableCoupons: Coupon[] = [
    ...(validVouchers || []).map((v: any) => {
      const discountVal = Number(v.discountAmount) || 0;
      return {
        code: v.code,
        label: `Mã ${v.code} - Giảm ${formatPrice(discountVal)}`,
        desc: v.categoryName 
          ? `Áp dụng cho danh mục ${v.categoryName}` 
          : v.brandName 
            ? `Áp dụng cho thương hiệu ${v.brandName}` 
            : "Áp dụng cho toàn bộ đơn hàng",
        type: "fixed" as const,
        value: discountVal,
        minOrder: Number(v.minOrderValue) || 0,
        maxDiscount: discountVal,
        badge: v.categoryName 
          ? v.categoryName.toUpperCase() 
          : v.brandName 
            ? v.brandName.toUpperCase() 
            : "TOÀN SÀN",
        badgeColor: "bg-blue-100 text-blue-700",
      };
    })
  ];

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [showCouponList, setShowCouponList] = useState(false);

  // Product-level coupons
  const [productCoupons, setProductCoupons] = useState<{[key: string]: string}>({});
  const [productCouponInputs, setProductCouponInputs] = useState<{[key: string]: string}>({});
  const [productCouponErrors, setProductCouponErrors] = useState<{[key: string]: string}>({});

  const getProductKey = (productId: string, size: string, color: string) => {
    return `${productId}-${size}-${color}`;
  };

  const calculateProductDiscount = (productId: string, size: string, color: string): number => {
    const key = getProductKey(productId, size, color);
    const couponCode = productCoupons[key];
    if (!couponCode) return 0;

    const coupon = availableCoupons.find(c => c.code === couponCode);
    if (!coupon) return 0;

    const item = cart.find(i => i.productId === productId && i.size === size && i.color === color);
    if (!item) return 0;

    const itemTotal = (item.price || 0) * (item.quantity || 0);
    if (itemTotal < coupon.minOrder) return 0;

    if (coupon.type === "percent") {
      const raw = (itemTotal * coupon.value) / 100;
      return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    }
    if (coupon.type === "fixed") return Math.min(coupon.value, itemTotal);
    return 0;
  };

  // Calculate product-level discounts
  const totalProductDiscounts = cart.reduce((sum, item) => {
    return sum + calculateProductDiscount(item.productId, item.size, item.color);
  }, 0);

  const safeCartTotal = cartTotal || 0;
  const cartTotalAfterProductCoupons = Math.max(0, safeCartTotal - totalProductDiscounts);

  const shippingFee = cartTotalAfterProductCoupons >= 500000 ? 0 : 30000;
  const discountAmount = appliedCoupon ? calcDiscount(appliedCoupon, cartTotalAfterProductCoupons, shippingFee) : 0;
  const shippingAfterCoupon = appliedCoupon?.type === "shipping" ? 0 : shippingFee;
  const total = Math.max(0, cartTotalAfterProductCoupons - (appliedCoupon?.type !== "shipping" ? discountAmount : 0) + shippingAfterCoupon);

  const handleApplyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = availableCoupons.find((c) => c.code === trimmed);
    if (!found) {
      setCouponError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      setCouponSuccess("");
      return;
    }
    if (cartTotalAfterProductCoupons < found.minOrder) {
      setCouponError(`Đơn hàng tối thiểu ${formatPrice(found.minOrder)} để dùng mã này`);
      setCouponSuccess("");
      return;
    }
    setAppliedCoupon(found);
    setCouponInput(found.code);
    setCouponError("");
    setCouponSuccess(`Áp dụng mã "${found.code}" thành công!`);
    setShowCouponList(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  const handleApplyProductCoupon = (productId: string, size: string, color: string, code: string) => {
    const key = getProductKey(productId, size, color);
    const trimmed = code.trim().toUpperCase();

    const found = availableCoupons.find((c) => c.code === trimmed);
    if (!found) {
      setProductCouponErrors({...productCouponErrors, [key]: "Mã không hợp lệ"});
      return;
    }

    const item = cart.find(i => i.productId === productId && i.size === size && i.color === color);
    if (!item) return;

    const itemTotal = (item.price || 0) * (item.quantity || 0);
    if (itemTotal < found.minOrder) {
      setProductCouponErrors({...productCouponErrors, [key]: `Cần tối thiểu ${formatPrice(found.minOrder)}`});
      return;
    }

    setProductCoupons({...productCoupons, [key]: trimmed});
    setProductCouponInputs({...productCouponInputs, [key]: trimmed});
    setProductCouponErrors({...productCouponErrors, [key]: ""});
  };

  const handleRemoveProductCoupon = (productId: string, size: string, color: string) => {
    const key = getProductKey(productId, size, color);
    const newCoupons = {...productCoupons};
    const newInputs = {...productCouponInputs};
    const newErrors = {...productCouponErrors};
    delete newCoupons[key];
    delete newInputs[key];
    delete newErrors[key];
    setProductCoupons(newCoupons);
    setProductCouponInputs(newInputs);
    setProductCouponErrors(newErrors);
  };

  // Nếu chưa đăng nhập và giỏ hàng trống thì dùng giao diện trống cũ
  if (!isLoggedIn && cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-blue-300" />
        </div>
        <h2 className="text-gray-800 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-3.5 rounded-xl transition-colors font-medium"
        >
          Tiếp tục mua sắm <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Giỏ hàng</span>
      </div>

      {/* Tab Switcher */}
      {isLoggedIn && (
        <div className="flex border-b border-gray-200 mb-6 flex-wrap gap-2">
          <button
            onClick={() => setActiveView("details")}
            className={`py-3 px-6 font-bold text-sm md:text-base border-b-2 transition-all flex items-center gap-2 -mb-[1px] ${
              activeView === "details"
                ? "border-blue-600 text-blue-700 font-bold"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>Chi tiết giỏ hàng hiện tại</span>
            {currentCart && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
                {currentCart.name}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView("manage")}
            className={`py-3 px-6 font-bold text-sm md:text-base border-b-2 transition-all flex items-center gap-2 -mb-[1px] ${
              activeView === "manage"
                ? "border-blue-600 text-blue-700 font-bold"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Danh sách & Quản lý giỏ hàng ({carts.length})</span>
          </button>
        </div>
      )}

      {/* VIEW 1: CHI TIẾT GIỎ HÀNG */}
      {(!isLoggedIn || activeView === "details") && (
        <>
          {/* Tên giỏ hàng đang hoạt động */}
          {isLoggedIn && currentCart && (
            <div className="bg-white rounded-2xl px-5 py-4 border-2 border-gray-300 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3">
                <span className="text-gray-550 text-sm font-semibold">Giỏ hàng đang xem:</span>
                <span className="text-base font-bold text-gray-800 flex items-center gap-2">
                  {currentCart.name}
                  {currentCart.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      Giỏ hàng chính
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setActiveView("manage")}
                className="text-xs font-bold text-blue-650 hover:text-blue-800 hover:bg-blue-50/50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" /> Quản lý các giỏ hàng khác
              </button>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-10 h-10 text-blue-300" />
              </div>
              <h2 className="text-gray-800 mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng này</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl transition-colors font-medium text-sm"
              >
                Tiếp tục mua sắm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-gray-900 mb-6 text-xl font-bold">
                Chi tiết giỏ hàng ({cart.length} sản phẩm)
              </h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            const originalPrice = item.originalPrice || item.price;
            const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;
            const discountPct = item.discount || 0;

            return (
              <div
                key={`${item.productId}-${item.size}`}
                className="bg-white rounded-2xl p-5 border-2 border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  {/* Image + Price block */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <Link to={`/product/${item.baseProductId || item.productId}`}>
                      <img loading="lazy" decoding="async"
                        src={optimizeImage(item.image)}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-gray-300"
                      />
                    </Link>
                    {/* Price right below image */}
                    <div className="text-center">
                      <p className="text-blue-700 font-extrabold text-base leading-tight">
                        {formatPrice(item.price)}
                      </p>
                      {hasDiscount && (
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <span className="text-gray-500 text-xs line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="text-[10px] font-bold text-red-650 bg-red-100 px-1 rounded border border-red-200">
                            -{discountPct}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-700 font-bold mb-0.5">{item.brand}</p>
                        <Link
                          to={`/product/${item.baseProductId || item.productId}`}
                          className="text-base font-bold text-gray-900 hover:text-blue-700 transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-705 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full border-2 border-gray-300">
                            Size: {item.size}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-blue-600 hover:text-red-600 active:text-red-700 transition-colors flex-shrink-0 p-1.5 border border-transparent hover:border-red-200 rounded-lg"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Quantity + subtotal */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => updateCartQty(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-150 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-750 font-bold" />
                        </button>
                        <span className="w-11 text-center text-sm text-gray-900 font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-150 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-750 font-bold" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-blue-700 font-black text-lg">{formatPrice(item.price * item.quantity)}</p>
                        {hasDiscount && (
                          <p className="text-gray-500 text-xs line-through">
                            {formatPrice(originalPrice * item.quantity)}
                          </p>
                        )}
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-600 font-medium">{formatPrice(item.price)} × {item.quantity}</p>
                        )}
                      </div>
                    </div>

                    {/* Product-level coupon */}
                    {(() => {
                      const key = getProductKey(item.productId, item.size, item.color);
                      const appliedCode = productCoupons[key];
                      const inputValue = productCouponInputs[key] || "";
                      const error = productCouponErrors[key] || "";
                      const discount = calculateProductDiscount(item.productId, item.size, item.color);

                      return (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {!appliedCode ? (
                            <>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={inputValue}
                                  onChange={(e) => {
                                    setProductCouponInputs({...productCouponInputs, [key]: e.target.value.toUpperCase()});
                                    setProductCouponErrors({...productCouponErrors, [key]: ""});
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleApplyProductCoupon(item.productId, item.size, item.color, inputValue);
                                    }
                                  }}
                                  placeholder="Mã giảm giá sản phẩm..."
                                  className="flex-1 px-2.5 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 uppercase placeholder-normal"
                                  style={{ textTransform: "uppercase" }}
                                />
                                <button
                                  onClick={() => handleApplyProductCoupon(item.productId, item.size, item.color, inputValue)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                  Áp dụng
                                </button>
                              </div>
                              {error && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <X className="w-3 h-3" /> {error}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-between gap-2 bg-green-50 border border-green-200 rounded-lg px-2.5 py-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-green-700 font-medium">{appliedCode}</p>
                                  <p className="text-xs text-green-600">-{formatPrice(discount)}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveProductCoupon(item.productId, item.size, item.color)}
                                className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}

          <Link to="/products" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm transition-colors pt-1">
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Coupon section */}
          <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-sm">
            <div className="px-4 py-3.5 border-b-2 border-gray-200 flex items-center gap-2 bg-gray-50/50">
              <Tag className="w-4.5 h-4.5 text-blue-600" />
              <p className="text-sm font-bold text-gray-850">Mã giảm giá / Khuyến mãi</p>
            </div>

            <div className="p-4">
              {/* Input row */}
              {!appliedCoupon ? (
                <>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon(couponInput)}
                      placeholder="Nhập mã khuyến mãi..."
                      className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 uppercase placeholder-normal font-semibold text-gray-800"
                      style={{ textTransform: "uppercase" }}
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-xl hover:bg-blue-800 transition-colors whitespace-nowrap font-bold"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mb-2 flex items-center gap-1 font-medium">
                      <X className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-xl px-3 py-2.5 mb-3">
                  <Check className="w-4.5 h-4.5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-green-800 font-bold">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600 font-medium">{appliedCoupon.label}</p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

              {/* Toggle coupon list */}
              <button
                onClick={() => setShowCouponList(!showCouponList)}
                className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 text-sm font-bold transition-colors w-full"
              >
                <Ticket className="w-4 h-4" />
                <span>Mã có thể áp dụng ({availableCoupons.filter(c => cartTotalAfterProductCoupons >= c.minOrder).length})</span>
                {showCouponList ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
              </button>

              {/* Coupon list */}
              {showCouponList && (
                <div className="mt-3 space-y-2">
                  {availableCoupons.map((coupon) => {
                    const applicable = cartTotalAfterProductCoupons >= coupon.minOrder;
                    const isApplied = appliedCoupon?.code === coupon.code;
                    return (
                      <div
                        key={coupon.code}
                        className={`border rounded-xl p-3 transition-all ${
                          isApplied
                            ? "border-green-300 bg-green-50"
                            : applicable
                            ? "border-blue-100 bg-blue-50/50 hover:border-blue-300 cursor-pointer"
                            : "border-gray-200 bg-gray-50 opacity-60"
                        }`}
                        onClick={() => applicable && !isApplied && handleApplyCoupon(coupon.code)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-bold text-blue-700 font-mono tracking-wider">{coupon.code}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${coupon.badgeColor}`}>
                                {coupon.badge}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{coupon.desc}</p>
                            {!applicable && (
                              <p className="text-xs text-orange-500 mt-1">
                                Cần mua thêm {formatPrice(coupon.minOrder - cartTotal)}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {isApplied ? (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đã dùng
                              </span>
                            ) : applicable ? (
                              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-300 px-2.5 py-1 rounded-lg transition-colors">
                                Dùng ngay
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">Chưa đủ</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 sticky top-24 shadow-md">
            <h3 className="text-gray-900 font-black text-lg mb-4 pb-3 border-b-2 border-gray-200">Tóm tắt đơn hàng</h3>
            <div className="space-y-3.5 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                <span className="font-extrabold text-gray-905">{formatPrice(cartTotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="text-green-700 font-extrabold bg-green-150 border border-green-300 px-2 py-0.5 rounded text-xs">Miễn phí</span>
                ) : (
                  <span className="font-extrabold text-gray-905">{formatPrice(shippingFee)}</span>
                )}
              </div>

              {shippingFee > 0 && !appliedCoupon && (
                <p className="text-xs text-blue-800 bg-blue-105 px-3 py-2 rounded-lg border border-blue-200 font-medium">
                  💡 Mua thêm {formatPrice(500000 - cartTotalAfterProductCoupons)} để được miễn phí ship!
                </p>
              )}

              {/* Product-level discounts */}
              {totalProductDiscounts > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    Mã giảm giá sản phẩm
                  </span>
                  <span className="font-extrabold">-{formatPrice(totalProductDiscounts)}</span>
                </div>
              )}

              {/* Discount */}
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    Giảm giá ({appliedCoupon.code})
                  </span>
                  <span className="font-extrabold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {appliedCoupon?.type === "shipping" && shippingFee > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    Miễn phí ship ({appliedCoupon.code})
                  </span>
                  <span className="font-extrabold">-{formatPrice(shippingFee)}</span>
                </div>
              )}

              {/* Divider + Total */}
              <div className="border-t-2 border-gray-200 pt-4 space-y-1.5">
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-gray-500 font-semibold">
                    <span>Giá gốc</span>
                    <span className="line-through">{formatPrice(cartTotal + shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-900 font-extrabold text-base">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-700">{formatPrice(total)}</span>
                    {(totalProductDiscounts > 0 || appliedCoupon) && (
                      <p className="text-xs text-green-600 mt-1 font-bold">
                        Tiết kiệm {formatPrice(
                          totalProductDiscounts +
                          (appliedCoupon ? discountAmount + (appliedCoupon.type === "shipping" ? shippingFee : 0) : 0)
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!isLoggedIn ? (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full mt-5 py-3.5 bg-gray-300 text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
                </button>
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-center text-xs font-medium">
                  Vui lòng <Link to="/login" className="underline font-bold hover:text-red-700">đăng nhập</Link> để tiến hành thanh toán
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/checkout", { 
                  state: { 
                    voucherCode: appliedCoupon?.code, 
                    discountAmount: discountAmount 
                  } 
                })}
                className="w-full mt-5 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
              >
                Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Payment icons */}
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              {["COD", "MoMo", "VNPay", "Thẻ"].map((m) => (
                <span key={m} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border-2 border-gray-300">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
      
      {/* Đóng thẻ fragment & điều kiện cho VIEW 1: CHI TIẾT GIỎ HÀNG */}
        </>
      )}

      {/* VIEW 2: QUẢN LÝ DANH SÁCH GIỎ HÀNG */}
      {activeView === "manage" && isLoggedIn && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Danh sách giỏ hàng của bạn</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm giỏ hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-medium text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold bg-white cursor-pointer text-gray-800"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="items-desc">Nhiều sản phẩm nhất</option>
              </select>

              {/* Create new */}
              {!isCreating ? (
                <button
                  onClick={() => {
                    setNewCartName("");
                    setIsCreating(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-bold text-sm flex items-center gap-1 whitespace-nowrap shadow-sm"
                >
                  + Tạo giỏ mới
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border-2 border-gray-300">
                  <input
                    type="text"
                    placeholder="Tên giỏ hàng..."
                    value={newCartName}
                    onChange={(e) => setNewCartName(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-36 font-semibold text-gray-800"
                  />
                  <button
                    onClick={handleCreateCart}
                    className="text-sm bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 font-bold"
                  >
                    Tạo
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Grid */}
          {filteredCarts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm font-medium">
              Không tìm thấy giỏ hàng nào phù hợp với điều kiện tìm kiếm.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCarts.map((c) => {
                const isActive = c.id === currentCartId;
                const itemsCount = (c.items || []).reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = (c.items || []).reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);
                return (
                  <div
                    key={c.id}
                    className={`border-2 rounded-2xl p-5 transition-all relative flex flex-col justify-between ${
                      isActive
                        ? "border-blue-500 bg-blue-50/10 scale-[1.01]"
                        : "border-gray-350 bg-white hover:border-gray-450 hover:shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Badges & Date */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-[11px] text-gray-400 font-medium">
                          Tạo ngày: {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {c.isDefault && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Giỏ chính
                            </span>
                          )}
                          {isActive && (
                            <span className="bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Đang xem
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="font-bold text-gray-800 text-sm md:text-base mb-2.5 flex items-center gap-2">
                        {c.name}
                      </h3>

                      {/* Stats */}
                      <div className="space-y-1.5 text-xs text-gray-500 mb-5">
                        <div className="flex justify-between items-center">
                          <span>Số lượng sản phẩm:</span>
                          <span className="font-bold text-gray-700">{itemsCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tổng giá trị:</span>
                          <span className="font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-gray-150 pt-3.5 mt-auto">
                      {!isActive ? (
                        <button
                          onClick={() => {
                            selectCart(c.id);
                            setActiveView("details");
                          }}
                          className="flex-1 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-150 rounded-xl hover:bg-blue-100 transition-colors text-center"
                        >
                          Sử dụng giỏ này
                        </button>
                      ) : (
                        <span className="flex-1 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-150 rounded-xl text-center">
                          Đang sử dụng
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {/* Rename */}
                        <button
                          onClick={() => {
                            setCartToRenameModal({ id: c.id, name: c.name });
                            setRenameInputValue(c.name);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 border-2 border-gray-300 rounded-xl transition-colors"
                          title="Đổi tên"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Set default */}
                        {!c.isDefault && (
                          <button
                            onClick={() => setDefaultCart(c.id)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-gray-50 border-2 border-gray-300 rounded-xl transition-colors"
                            title="Đặt làm giỏ hàng chính"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        {(carts.length > 1) && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Bạn có chắc muốn xóa giỏ hàng "${c.name}" không?`)) {
                                await deleteCart(c.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-gray-50 border-2 border-gray-300 rounded-xl transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommended products */}
      {recommendedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 text-xl font-bold flex items-center gap-2">
              <span className="text-blue-600">✨</span>
              Sản phẩm có thể bạn quan tâm
            </h2>
            <Link to="/products" className="text-blue-600 text-sm hover:underline font-medium">
              Xem thêm
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
      {/* Custom Rename Cart Modal */}
      {cartToRenameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-opacity">
          <div className="bg-white rounded-3xl border-2 border-gray-300 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-205">
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900">Đổi tên giỏ hàng</h3>
              <button
                onClick={() => setCartToRenameModal(null)}
                className="text-gray-400 hover:text-gray-650 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Tên giỏ hàng mới
                </label>
                <input
                  type="text"
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveRenameModal()}
                  placeholder="Nhập tên mới..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-800"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setCartToRenameModal(null)}
                className="px-4 py-2 text-sm font-bold text-gray-650 hover:text-gray-800 hover:bg-gray-100 border-2 border-gray-300 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveRenameModal}
                disabled={!renameInputValue.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-55 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
