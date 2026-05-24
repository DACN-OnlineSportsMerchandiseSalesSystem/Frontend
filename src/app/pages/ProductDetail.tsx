import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, ShoppingCart, Zap, Heart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Check, MessageSquare } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ProductCard } from "../components/ProductCard";
import { products as mockProducts, formatPrice } from "../data/products";
import productService, { Product } from "../../services/productService";
import reviewService, { Review } from "../../services/reviewService";
import { sortCategoryNamesParentFirst } from "../../utils/categoryHelpers";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, user, categories } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedBySport, setRecommendedBySport] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  useEffect(() => {
    if (id) {
      const pid = parseInt(id);
      setIsLoading(true);
      
      // Fetch Product Detail
      productService.getProductById(pid)
        .then(data => {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedSize(data.variants[0].size);
            setSelectedColor(data.variants[0].color);
          }

          // Fetch all products to perform filtering for recommendations
          productService.getAllProducts()
            .then(allProducts => {
              // 1. Root categories for sport recommendation
              const currentRootCatIds = new Set<number>();
              data.categoryIds?.forEach(catId => {
                const rootCat = getRootCategory(catId, categories);
                if (rootCat) currentRootCatIds.add(rootCat.id);
              });

              // 2. Sub-categories (deepest categories) for similar products
              const currentSubCatIds = data.categoryIds?.filter(catId => {
                const cat = categories.find(c => c.id === catId);
                return cat && cat.parentId !== null && cat.parentId !== undefined;
              }) || [];
              const targetCatIdsForSimilar = currentSubCatIds.length > 0 ? currentSubCatIds : (data.categoryIds || []);

              // Filter Recommended by Sport (same root category)
              const bySport = allProducts.filter(p => {
                if (p.id === pid) return false;
                return p.categoryIds?.some(catId => {
                  const root = getRootCategory(catId, categories);
                  return root && currentRootCatIds.has(root.id);
                });
              });

              // Filter Similar Products (same specific category)
              const similar = allProducts.filter(p => {
                if (p.id === pid) return false;
                return p.categoryIds?.some(catId => targetCatIdsForSimilar.includes(catId));
              });

              // If API results found, set them
              if (bySport.length > 0) {
                setRecommendedBySport(bySport.slice(0, 4));
              } else {
                // Fallback to mock products by sport
                const mockCurrent = mockProducts.find(p => p.id === id || p.name === data.name);
                if (mockCurrent) {
                  const fallbackBySport = mockProducts.filter(p => p.id !== mockCurrent.id && p.sport === mockCurrent.sport);
                  setRecommendedBySport(fallbackBySport.slice(0, 4) as any);
                }
              }

              if (similar.length > 0) {
                setSimilarProducts(similar.slice(0, 4));
              } else {
                // Fallback to mock products by category
                const mockCurrent = mockProducts.find(p => p.id === id || p.name === data.name);
                if (mockCurrent) {
                  const fallbackSimilar = mockProducts.filter(p => p.id !== mockCurrent.id && p.category === mockCurrent.category);
                  setSimilarProducts(fallbackSimilar.slice(0, 4) as any);
                }
              }
            })
            .catch(() => {
              // Fallback to mock products on error
              const mockCurrent = mockProducts.find(p => p.id === id || p.name === data.name);
              if (mockCurrent) {
                const fallbackBySport = mockProducts.filter(p => p.id !== mockCurrent.id && p.sport === mockCurrent.sport);
                setRecommendedBySport(fallbackBySport.slice(0, 4) as any);

                const fallbackSimilar = mockProducts.filter(p => p.id !== mockCurrent.id && p.category === mockCurrent.category);
                setSimilarProducts(fallbackSimilar.slice(0, 4) as any);
              }
            });

          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));

      // Fetch Reviews
      reviewService.getReviewsByProduct(pid)
        .then(setReviews)
        .catch(console.error);
    }
  }, [id, categories]);

  const handleSubmitReview = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!reviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview(parseInt(id!), {
        title: reviewTitle || "Đánh giá từ khách hàng",
        comment: reviewText,
        rating: reviewRating
      });
      // Refresh reviews
      const updated = await reviewService.getReviewsByProduct(parseInt(id!));
      setReviews(updated);
      setReviewText("");
      setReviewTitle("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center">Đang tải...</div>;

  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-gray-600 mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id.toString());
  const sortedCats = sortCategoryNamesParentFirst(product.categoryNames, categories);
  const categoryName = sortedCats[0] || "Sản phẩm";

  const handleAddToCart = () => {
    const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor) || product.variants[0];
    if (!variant) return;

    const finalPrice = product.discount > 0 ? variant.price * (1 - product.discount / 100) : variant.price;

    addToCart({
      productId: variant.id.toString(),
      name: product.name,
      price: finalPrice,
      image: product.images[0]?.imageUrl || "",
      quantity: qty,
      size: variant.size,
      color: variant.color,
      brand: product.brandName,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {categoryName !== "Sản phẩm" && (
          <>
            <Link to={`/products?sport=${categoryName}`} className="hover:text-blue-600 transition-colors">{categoryName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3 aspect-square">
            <img loading="lazy" decoding="async"
              src={product.images[activeImage]?.imageUrl || "https://placehold.co/600x600?text=No+Image"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${activeImage === i ? "border-blue-600" : "border-gray-200 hover:border-gray-300"}`}
              >
                <img loading="lazy" decoding="async" src={img.imageUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full mb-2">{product.brandName}</span>
              <h1 className="text-gray-900 text-2xl md:text-3xl font-bold">{product.name}</h1>
            </div>
            <button
              onClick={() => toggleWishlist(product.id.toString())}
              className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                isWishlisted ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
              ))}
            </div>
            <span className="text-yellow-600 font-medium">{(product.rating || 0).toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({product.reviewCount || 0} đánh giá)</span>
            <span className="text-green-600 text-sm flex items-center gap-1">✓ Còn hàng</span>
          </div>

          {/* Price */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-5">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl text-blue-700 font-black">{formatPrice(product.price)}</span>
              {(product.discount || 0) > 0 && (
                <>
                  <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-bold">-{product.discount}%</span>
                </>
              )}
            </div>
          </div>

          {/* Variants selection */}
          <div className="mb-5">
            <p className="text-sm text-gray-600 mb-2">Chọn phiên bản (Kích cỡ - Màu sắc):</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedSize(v.size);
                    setSelectedColor(v.color);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${
                    selectedSize === v.size && selectedColor === v.color
                      ? "border-blue-600 bg-blue-600 text-white font-medium shadow-md"
                      : "border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
                >
                  {v.size} - {v.color}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm text-gray-600">Số lượng:</p>
            <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Giảm" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-12 text-center text-gray-800 font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Tăng" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-medium transition-all ${
                addedToCart
                  ? "border-green-500 bg-green-50 text-green-600"
                  : "border-blue-600 text-blue-600 hover:bg-blue-50"
              }`}
            >
              {addedToCart ? <><Check className="w-5 h-5" /> Đã thêm</> : <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ</>}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium transition-colors shadow-lg shadow-blue-200"
            >
              <Zap className="w-5 h-5" /> Mua ngay
            </button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Truck className="w-4 h-4" />, text: "Giao hàng toàn quốc" },
              { icon: <RotateCcw className="w-4 h-4" />, text: "Đổi trả 30 ngày" },
              { icon: <Shield className="w-4 h-4" />, text: "Hàng chính hãng" },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-blue-600">{b.icon}</span>
                <span className="text-xs text-gray-600">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
        <div className="flex border-b border-gray-100">
          {([
            { key: "desc", label: "Mô tả sản phẩm" },
            { key: "specs", label: "Thông số kỹ thuật" },
            { key: "reviews", label: `Đánh giá (${reviews.length})` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "desc" && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 text-gray-500 w-1/3 border-r border-gray-100">Mã sản phẩm</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{product.productCode}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-3 px-4 text-gray-500 w-1/3 border-r border-gray-100">Thương hiệu</td>
                    <td className="py-3 px-4 text-gray-800">{product.brandName}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 text-gray-500 w-1/3 border-r border-gray-100">Danh mục</td>
                    <td className="py-3 px-4 text-gray-800">{sortedCats.join(", ") || "Chưa phân loại"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {/* Summary */}
              <div className="flex items-center gap-8 pb-6 border-b border-gray-100 mb-6">
                <div className="text-center bg-blue-50 px-8 py-4 rounded-2xl">
                  <div className="text-5xl font-black text-blue-700">{(product.rating || 0).toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{reviews.length} đánh giá thực tế</p>
                </div>
                <div className="flex-1 hidden md:block">
                  {[5, 4, 3, 2, 1].map(num => {
                    const count = reviews.filter(r => r.rating === num).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={num} className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-gray-500 w-4">{num}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-6 mb-10">
                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b border-gray-50 pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                          {r.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{r.userName || "Khách hàng"}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </div>
                      <h5 className="text-sm font-bold text-gray-800 mb-1">{r.title}</h5>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{r.comment}</p>
                      
                      {r.adminReply && (
                        <div className="ml-8 bg-gray-50 p-4 rounded-xl border-l-4 border-blue-600">
                          <p className="text-xs font-bold text-blue-700 mb-1">SportZone Phản hồi:</p>
                          <p className="text-gray-600 text-sm italic">"{r.adminReply}"</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Write review */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                <h4 className="text-gray-800 font-bold mb-1">Viết đánh giá của bạn</h4>
                <p className="text-xs text-gray-500 mb-5">Chia sẻ ý kiến của bạn về sản phẩm để giúp người khác lựa chọn tốt hơn.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Mức độ hài lòng:</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(s)}
                          className="transition-transform active:scale-90"
                        >
                          <Star className={`w-8 h-8 transition-colors ${s <= (hoverRating || reviewRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tiêu đề:</p>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Ví dụ: Sản phẩm rất tốt, Giao hàng nhanh..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-white text-sm text-gray-700"
                    />
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-700 mb-2">Nội dung chi tiết:</p>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Mô tả cảm nhận của bạn về chất lượng, kiểu dáng, dịch vụ..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-white text-sm resize-none text-gray-700 placeholder-gray-400 mb-4"
                />
                
                <div className="flex justify-end">
                  <button
                    disabled={isSubmittingReview || !reviewText.trim()}
                    onClick={handleSubmitReview}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá ngay"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 text-xl font-bold">Sản phẩm tương tự</h2>
            <Link to="/products" className="text-blue-600 text-sm hover:underline">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended by sport */}
      {recommendedBySport.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 text-xl font-bold">Gợi ý sản phẩm cho bạn</h2>
            <Link to="/products" className="text-blue-600 text-sm hover:underline">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedBySport.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
