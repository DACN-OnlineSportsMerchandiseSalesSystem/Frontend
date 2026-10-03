import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronRight, Check, X, Ticket, ChevronDown, ChevronUp, ArrowLeftRight, CreditCard, Shield, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { products, formatPrice } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import productService from "../../services/productService";
import cartService from "../../services/cartService";
import paymentService from "../../services/paymentService";
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
  const {
    cart, removeFromCart, updateCartQty, cartTotal, validVouchers, isLoggedIn, isAdmin, categories,
    allCarts, refreshAllCarts, createNewCart, switchCart, renameCart, deleteCart, refreshCart, orders, cancelOrder, refreshOrders
  } = useApp();
  const navigate = useNavigate();

  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCartName, setNewCartName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameCartId, setRenameCartId] = useState<number | null>(null);
  const [renameCartName, setRenameCartName] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetCartId, setTargetCartId] = useState<number | "">("");
  const [itemToMove, setItemToMove] = useState<any | null>(null);

  const [activeCartId, setActiveCartId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn && allCarts.length > 0) {
      if (activeCartId === null || !allCarts.some(c => c.id === activeCartId)) {
        const defCart = allCarts.find(c => c.isDefault) || allCarts[0];
        setActiveCartId(defCart.id);
      }
    }
  }, [isLoggedIn, allCarts, activeCartId]);

  if (isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Chế độ Quản trị viên (Admin)</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          Tài khoản Quản trị viên chỉ dùng để quản lý hệ thống, sản phẩm và đơn hàng. Tính năng giỏ hàng và mua sắm không áp dụng cho tài khoản này.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200"
          >
            Về Trang Quản trị
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Xem danh mục sản phẩm
          </Link>
        </div>
      </div>
    );
  }

    const pendingOnlineOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    return orders.find(
      (o: any) =>
        o.status === "pending" &&
        (o.paymentMethod === "VNPay" || o.paymentMethod === "MoMo" || o.paymentMethod === "Card")
    );
  }, [orders]);

  const [isRedirectingPay, setIsRedirectingPay] = useState(false);

  const handlePayNow = async (order: any) => {
    setIsRedirectingPay(true);
    try {
      if (order.paymentMethod === "VNPay") {
        const payUrl = await paymentService.createVNPayPayment(order.id);
        if (payUrl) {
          window.location.href = payUrl;
          return;
        }
      } else if (order.paymentMethod === "MoMo") {
        const payUrl = await paymentService.createMomoPayment(order.id, order.total || order.totalPrice || 0);
        if (payUrl) {
          window.location.href = payUrl;
          return;
        }
      }
      navigate(`/track-order?id=${order.id}`);
    } catch (err) {
      console.error("Lỗi khi mở cổng thanh toán:", err);
      navigate(`/track-order?id=${order.id}`);
    } finally {
      setIsRedirectingPay(false);
    }
  };

  const handleCancelPending = async (orderId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng đang chờ thanh toán này?")) {
      try {
        await cancelOrder(orderId, "Khách hủy đơn để chọn lại sản phẩm");
        await refreshOrders();
        await refreshCart();
        await refreshAllCarts();
      } catch (err) {
        console.error("Lỗi khi hủy đơn hàng:", err);
      }
    }
  };

  const activeCart = useMemo(() => {
    if (!isLoggedIn) {
      return cart;
    }
    const currentCart = allCarts.find((c) => c.id === activeCartId);
    if (!currentCart) return [];

    return currentCart.items.map((item) => ({
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
      brand: '',
      childVariantIds: (item as any).childVariantIds,
      comboId: item.comboId,
      isCombo: item.isCombo ?? !!item.comboId,
      variantInfo: item.variantInfo
    }));
  }, [isLoggedIn, cart, allCarts, activeCartId]);

  const localCartTotal = useMemo(() => {
    return activeCart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  }, [activeCart]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshAllCarts();
    }
  }, [isLoggedIn, refreshAllCarts]);

  // Multicart move actions
  const handleMoveItems = async (destId: number) => {
    try {
      const itemsToMove = itemToMove 
        ? [itemToMove] 
        : activeCart.filter(i => i.id && selectedItemIds.includes(i.id));

      await Promise.all(
        itemsToMove.map(async (item) => {
          await cartService.addToCartToSpecific(destId, Number(item.productId), item.quantity, item.childVariantIds, item.comboId);
          if (item.id) {
            await cartService.removeCartItem(item.id);
          }
        })
      );
      setSelectedItemIds([]);
      setItemToMove(null);
      await refreshCart();
      await refreshAllCarts();
    } catch (err) {
      alert("Di chuyển sản phẩm thất bại");
    }
  };

  const handleCreateAndMove = async () => {
    if (!newCartName.trim()) return;
    try {
      const newCart = await cartService.createCart(newCartName.trim());
      await handleMoveItems(newCart.id);
      setShowCreateModal(false);
      setNewCartName("");
    } catch (err) {
      alert("Tạo giỏ hàng mới và di chuyển thất bại");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedItemIds.length} sản phẩm đã chọn khỏi giỏ hàng?`)) {
      try {
        await Promise.all(
          selectedItemIds.map(id => cartService.removeCartItem(id))
        );
        setSelectedItemIds([]);
        await refreshCart();
        await refreshAllCarts();
      } catch (err) {
        alert("Xóa các sản phẩm đã chọn thất bại");
      }
    }
  };

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
    if (activeCart.length === 0) return [];

    // 1. Get all unique root categories/sports of cart items.
    const cartProductSports = new Set<string>(); // for mock products
    const cartRootCategoryIds = new Set<number>(); // for API products

    activeCart.forEach((item) => {
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
        const isInCart = activeCart.some(
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
        const isInCart = activeCart.some(
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
  }, [activeCart, apiProducts, categories]);

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

    const item = activeCart.find(i => i.productId === productId && i.size === size && i.color === color);
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
  const totalProductDiscounts = activeCart.reduce((sum, item) => {
    return sum + calculateProductDiscount(item.productId, item.size, item.color);
  }, 0);

  const safeCartTotal = localCartTotal || 0;
  const cartTotalAfterProductCoupons = Math.max(0, safeCartTotal - totalProductDiscounts);

  const hasItems = activeCart.length > 0;
  const shippingFee = !hasItems || cartTotalAfterProductCoupons >= 500000 ? 0 : 30000;
  const discountAmount = appliedCoupon ? calcDiscount(appliedCoupon, cartTotalAfterProductCoupons, shippingFee) : 0;
  const shippingAfterCoupon = appliedCoupon?.type === "shipping" ? 0 : shippingFee;
  const total = !hasItems ? 0 : Math.max(0, cartTotalAfterProductCoupons - (appliedCoupon?.type !== "shipping" ? discountAmount : 0) + shippingAfterCoupon);

  const handleApplyCoupon = (code: string) => {
    if (!hasItems) {
      setCouponError("Giỏ hàng đang trống, không thể áp dụng mã!");
      setCouponSuccess("");
      return;
    }
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

    const item = activeCart.find(i => i.productId === productId && i.size === size && i.color === color);
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

  

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Giỏ hàng</span>
      </div>

      <h1 className="text-gray-900 mb-6">Giỏ hàng ({activeCart.length} sản phẩm)</h1>

      {/* Banner Đơn hàng đang chờ thanh toán */}
      {pendingOnlineOrder && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">
                Bạn có đơn hàng #{pendingOnlineOrder.id} đang chờ thanh toán ({formatPrice(pendingOnlineOrder.total || pendingOnlineOrder.totalPrice || 0)})
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Phương thức: <span className="font-semibold text-gray-800">{pendingOnlineOrder.paymentMethod}</span>. Các sản phẩm vẫn được lưu giữ an toàn trong giỏ hàng.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              disabled={isRedirectingPay}
              onClick={() => handlePayNow(pendingOnlineOrder)}
              className="flex-1 md:flex-initial text-center text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
            >
              {isRedirectingPay ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Thanh toán ngay</span>
            </button>
            <button
              type="button"
              onClick={() => handleCancelPending(pendingOnlineOrder.id)}
              className="flex-1 md:flex-initial text-xs bg-white hover:bg-red-50 text-red-600 font-semibold px-3 py-2.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
            >
              Hủy đơn này
            </button>
          </div>
        </div>
      )}

      {/* Multicart Tabs */}
      {isLoggedIn && (
        <div className="mb-6 bg-gray-50 border border-gray-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              🛒 Danh sách giỏ hàng của bạn:
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewCartName("");
                setShowCreateModal(true);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Tạo giỏ hàng mới
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {allCarts.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                  c.id === activeCartId
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                }`}
                onClick={() => setActiveCartId(c.id)}
              >
                <span>{c.name || `Giỏ hàng #${c.id}`}</span>
                <span className="text-xs text-gray-400 font-normal">
                  ({c.items?.length || 0} món)
                </span>
                
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameCartId(c.id);
                      setRenameCartName(c.name || "");
                      setShowRenameModal(true);
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                    title="Đổi tên giỏ hàng"
                  >
                    ✏️
                  </button>
                  {!c.isDefault && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn chắc chắn muốn xóa giỏ hàng "${c.name || `Giỏ hàng #${c.id}`}"? Các mặt hàng bên trong sẽ bị xóa.`)) {
                          await deleteCart(c.id);
                          if (activeCartId === c.id) {
                            setActiveCartId(null);
                          }
                        }
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-red-600"
                      title="Xóa giỏ hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedItemIds.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-fadeIn">
          <div className="text-sm text-blue-800 font-medium">
            🔔 Đang chọn <strong>{selectedItemIds.length}</strong> sản phẩm
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setNewCartName("");
                setShowCreateModal(true);
              }}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
            >
              📦 Gom vào giỏ hàng mới
            </button>
            
            {allCarts.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setTargetCartId("");
                  setShowMoveModal(true);
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
              >
                🚚 Di chuyển sang giỏ hàng khác
              </button>
            )}

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
            >
              🗑️ Xóa đã chọn
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedItemIds([])}
              className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
            >
              Hủy chọn
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {activeCart.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm animate-fadeIn">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-gray-800 font-bold mb-1">Giỏ hàng trống</h3>
              <p className="text-gray-500 text-sm mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng này</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-colors text-sm font-semibold shadow-md"
              >
                Tiếp tục mua sắm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            activeCart.map((item) => {
            const originalPrice = item.originalPrice || item.price;
            const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;
            const discountPct = item.discount || 0;

            return (
              <div
                key={`${item.productId}-${item.size}`}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all"
              >
                <div className="flex gap-4">
                  {/* Checkbox for multicart selection */}
                  {isLoggedIn && (
                    <div className="flex items-center justify-center flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id!)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItemIds(prev => [...prev, item.id!]);
                          } else {
                            setSelectedItemIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all hover:scale-105"
                      />
                    </div>
                  )}
                  {/* Image + Price block */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <Link to={`/products/${item.comboId || item.baseProductId || item.productId}`}>
                      <img loading="lazy" decoding="async"
                        src={optimizeImage(item.image)}
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
                          <span className="text-gray-500 text-xs line-through">
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {(item.isCombo || item.comboId) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                              COMBO
                            </span>
                          )}
                          <p className="text-xs text-blue-600 font-semibold">{item.brand}</p>
                        </div>
                        <Link
                          to={`/products/${item.comboId || item.baseProductId || item.productId}`}
                          className="text-sm font-semibold text-gray-800 hover:text-blue-700 transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {item.variantInfo ? (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/70 font-medium">
                              {item.variantInfo}
                            </span>
                          ) : item.size ? (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {item.size}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isLoggedIn && allCarts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setItemToMove(item);
                              setTargetCartId("");
                              setShowMoveModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="Chuyển sang giỏ hàng khác"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-blue-600 hover:text-red-600 active:text-red-700 transition-colors p-1"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                          <p className="text-gray-500 text-xs line-through">
                            {formatPrice(originalPrice * item.quantity)}
                          </p>
                        )}
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
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
          }))}

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
                    className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
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
                                Cần mua thêm {formatPrice(coupon.minOrder - localCartTotal)}
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
          <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
            <h3 className="text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({activeCart.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                <span>{formatPrice(localCartTotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                {!hasItems ? (
                  <span>{formatPrice(0)}</span>
                ) : shippingFee === 0 ? (
                  <span className="text-green-600 font-medium">Miễn phí</span>
                ) : (
                  <span>{formatPrice(shippingFee)}</span>
                )}
              </div>

              {hasItems && shippingFee > 0 && !appliedCoupon && (
                <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  💡 Mua thêm {formatPrice(500000 - cartTotalAfterProductCoupons)} để được miễn phí ship!
                </p>
              )}

              {/* Product-level discounts */}
              {hasItems && totalProductDiscounts > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Mã giảm giá sản phẩm
                  </span>
                  <span className="font-medium">-{formatPrice(totalProductDiscounts)}</span>
                </div>
              )}

              {/* Discount */}
              {hasItems && appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Giảm giá ({appliedCoupon.code})
                  </span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {hasItems && appliedCoupon?.type === "shipping" && shippingFee > 0 && (
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
                {hasItems && appliedCoupon && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Giá gốc</span>
                    <span className="line-through">{formatPrice(localCartTotal + shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-800">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-700">{formatPrice(total)}</span>
                    {hasItems && (totalProductDiscounts > 0 || appliedCoupon) && (
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
                  Vui lòng <Link to="/login" state={{ from: { pathname: "/cart" } }} className="underline font-bold hover:text-red-700">đăng nhập</Link> để tiến hành thanh toán
                </div>
              </div>
            ) : (
              <button
                disabled={!hasItems}
                onClick={() => {
                  if (!hasItems) return;
                  navigate("/checkout", { 
                    state: { 
                      voucherCode: appliedCoupon?.code, 
                      discountAmount: discountAmount,
                      checkoutCartId: activeCartId || undefined
                    } 
                  });
                }}
                className={`w-full mt-5 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  !hasItems 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-200"
                }`}
              >
                Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Payment icons */}
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              {["COD", "VNPAY-QR", "Thẻ ATM", "Visa/Mastercard"].map((m) => (
                <span key={m} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">{m}</span>
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
    
      {/* Create Cart Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleUp">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedItemIds.length > 0 ? "Gom vào giỏ hàng mới" : "Tạo giỏ hàng mới"}
            </h3>
            <input
              type="text"
              placeholder="Nhập tên giỏ hàng mới (ví dụ: Đồ chạy bộ)..."
              value={newCartName}
              onChange={(e) => setNewCartName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 mb-4 text-sm"
            />
            <div className="flex justify-end gap-2 text-sm">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={selectedItemIds.length > 0 ? handleCreateAndMove : () => {
                  console.log(">>> [DEBUG] Confirm create cart clicked, name:", newCartName);
                  if (newCartName.trim()) {
                    createNewCart(newCartName.trim());
                    setShowCreateModal(false);
                  } else {
                    alert("Vui lòng nhập tên giỏ hàng");
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Cart Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleUp">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Đổi tên giỏ hàng</h3>
            <input
              type="text"
              placeholder="Nhập tên mới..."
              value={renameCartName}
              onChange={(e) => setRenameCartName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 mb-4 text-sm"
            />
            <div className="flex justify-end gap-2 text-sm">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (renameCartId && renameCartName.trim()) {
                    renameCart(renameCartId, renameCartName.trim());
                    setShowRenameModal(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Cart Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleUp">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Di chuyển sang giỏ hàng khác</h3>
            <p className="text-sm text-gray-500 mb-4">
              {itemToMove 
                ? `Chọn giỏ hàng đích để chuyển sản phẩm "${itemToMove.name}":`
                : "Chọn giỏ hàng đích để chuyển các sản phẩm đã chọn:"}
            </p>
            <select
              value={targetCartId}
              onChange={(e) => setTargetCartId(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 mb-4 text-sm bg-white"
            >
              <option value="">-- Chọn giỏ hàng --</option>
              {allCarts.filter(c => !c.isDefault).map(c => (
                <option key={c.id} value={c.id}>{c.name || `Giỏ hàng #${c.id}`}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowMoveModal(false);
                  setItemToMove(null);
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (targetCartId) {
                    handleMoveItems(Number(targetCartId));
                    setShowMoveModal(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Di chuyển
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
