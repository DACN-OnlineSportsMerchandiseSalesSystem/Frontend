import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronRight, Check, X, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { products, formatPrice } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import productService from "../../services/productService";

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

const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "SPORT10",
    label: "Giảm 10%",
    desc: "Giảm 10% cho đơn từ 300.000đ (tối đa 80.000đ)",
    type: "percent",
    value: 10,
    minOrder: 300000,
    maxDiscount: 80000,
    badge: "PHỔ BIẾN",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    code: "SALE20",
    label: "Giảm 20%",
    desc: "Giảm 20% cho đơn từ 1.000.000đ (tối đa 200.000đ)",
    type: "percent",
    value: 20,
    minOrder: 1000000,
    maxDiscount: 200000,
    badge: "HOT",
    badgeColor: "bg-red-100 text-red-600",
  },
  {
    code: "FREESHIP",
    label: "Miễn phí vận chuyển",
    desc: "Miễn phí ship cho mọi đơn hàng",
    type: "shipping",
    value: 0,
    minOrder: 0,
    badge: "MỚI",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    code: "NEWUSER",
    label: "Giảm 50.000đ",
    desc: "Giảm 50.000đ cho đơn hàng đầu tiên từ 200.000đ",
    type: "fixed",
    value: 50000,
    minOrder: 200000,
    badge: "THÀNH VIÊN MỚI",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

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
  const { cart, removeFromCart, updateCartQty, cartTotal, validVouchers, isLoggedIn, categories } = useApp();
  const navigate = useNavigate();

  const [apiProducts, setApiProducts] = useState<any[]>([]);

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
    ...AVAILABLE_COUPONS, // Keep legacy ones for now or remove if wanted
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

  if (cart.length === 0) {
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

      <h1 className="text-gray-900 mb-6">Giỏ hàng ({cart.length} sản phẩm)</h1>

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
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all"
              >
                <div className="flex gap-4">
                  {/* Image + Price block */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <Link to={`/product/${item.baseProductId || item.productId}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                      />
                    </Link>
                    {/* Price right below image */}
                    <div className="text-center">
                      <p className="text-blue-700 font-black text-base leading-tight">
                        {formatPrice(item.price)}
                      </p>
                      {hasDiscount && (
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <span className="text-gray-400 text-xs line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded">
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
                        <p className="text-xs text-blue-600 mb-0.5">{item.brand}</p>
                        <Link
                          to={`/product/${item.baseProductId || item.productId}`}
                          className="text-sm text-gray-800 hover:text-blue-700 transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.size}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-blue-600 hover:text-red-600 active:text-red-700 transition-colors flex-shrink-0 p-1"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity + subtotal */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateCartQty(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="w-10 text-center text-sm text-gray-800 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-blue-700 font-black">{formatPrice(item.price * item.quantity)}</p>
                        {hasDiscount && (
                          <p className="text-gray-400 text-xs line-through">
                            {formatPrice(originalPrice * item.quantity)}
                          </p>
                        )}
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
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
                        <div className="mt-3 pt-3 border-t border-gray-100">
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
                                  className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 uppercase placeholder-normal"
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
                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
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
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-700">Mã giảm giá / Khuyến mãi</p>
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
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 uppercase placeholder-normal"
                      style={{ textTransform: "uppercase" }}
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                      <X className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-green-700 font-medium">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600">{appliedCoupon.label}</p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Toggle coupon list */}
              <button
                onClick={() => setShowCouponList(!showCouponList)}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs transition-colors w-full"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Mã có thể áp dụng ({availableCoupons.filter(c => cartTotalAfterProductCoupons >= c.minOrder).length})</span>
                {showCouponList ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
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
                            : "border-gray-100 bg-gray-50 opacity-60"
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
                              <span className="text-xs text-gray-400">Chưa đủ</span>
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
          <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
            <h3 className="text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="text-green-600">Miễn phí</span>
                ) : (
                  <span>{formatPrice(shippingFee)}</span>
                )}
              </div>

              {shippingFee > 0 && !appliedCoupon && (
                <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  💡 Mua thêm {formatPrice(500000 - cartTotalAfterProductCoupons)} để được miễn phí ship!
                </p>
              )}

              {/* Product-level discounts */}
              {totalProductDiscounts > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Mã giảm giá sản phẩm
                  </span>
                  <span className="font-medium">-{formatPrice(totalProductDiscounts)}</span>
                </div>
              )}

              {/* Discount */}
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Giảm giá ({appliedCoupon.code})
                  </span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {appliedCoupon?.type === "shipping" && shippingFee > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Miễn phí ship ({appliedCoupon.code})
                  </span>
                  <span className="font-medium">-{formatPrice(shippingFee)}</span>
                </div>
              )}

              {/* Divider + Total */}
              <div className="border-t border-gray-100 pt-3 space-y-1">
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Giá gốc</span>
                    <span className="line-through">{formatPrice(cartTotal + shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-800">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-700">{formatPrice(total)}</span>
                    {(totalProductDiscounts > 0 || appliedCoupon) && (
                      <p className="text-xs text-green-600 mt-0.5">
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
                <span key={m} className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended products */}
      {recommendedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-100">
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
    </div>
  );
}
