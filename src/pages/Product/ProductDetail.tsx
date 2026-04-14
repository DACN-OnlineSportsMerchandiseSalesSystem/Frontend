import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, ShoppingCart, Zap, Heart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Check } from "lucide-react";
import { products, formatPrice } from "@/constants/productsData";
import { useApp } from "@/context/AppContext";
import { ProductCard } from "@/components/common/ProductCard/ProductCard";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useApp();

  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || "");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

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

  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const isWishlisted = wishlist.includes(product.id);
  const related = products.filter((p) => p.sport === product.sport && p.id !== product.id).slice(0, 4);

  const suggested = useMemo(() => {
    return products.filter((p) => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
      brand: product.brand,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
      brand: product.brand,
    });
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
        <Link to={`/products?sport=${encodeURIComponent(product.sport)}`} className="hover:text-blue-600 transition-colors">{product.sport}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3 aspect-square">
            <img
              src={product.images[activeImage] || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${activeImage === i ? "border-blue-600" : "border-gray-200 hover:border-gray-300"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full mb-2">{product.brand}</span>
              <h1 className="text-gray-900 text-2xl md:text-3xl">{product.name}</h1>
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                isWishlisted ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
              ))}
            </div>
            <span className="text-yellow-600 font-medium">{product.rating}</span>
            <span className="text-gray-400 text-sm">({product.reviewCount} đánh giá)</span>
            <span className="text-green-600 text-sm flex items-center gap-1">✓ {product.isBestSeller ? "Bán chạy" : "Còn hàng"}</span>
          </div>

          {/* Price */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-5">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl text-blue-700 font-black">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-bold">-{discount}%</span>
                </>
              )}
            </div>
            {discount > 0 && (
              <p className="text-sm text-green-600">Tiết kiệm {formatPrice(product.originalPrice - product.price)}</p>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Màu sắc: <span className="text-gray-900 font-medium">{selectedColor}</span></p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.name ? "border-blue-600 scale-110 ring-2 ring-blue-300" : "border-gray-200 hover:border-gray-400"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mb-5">
              <p className="text-sm text-gray-600 mb-2">Kích thước: <span className="text-gray-900 font-medium">{selectedSize}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${
                      selectedSize === s ? "border-blue-600 bg-blue-600 text-white font-medium" : "border-gray-200 text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm text-gray-600">Số lượng:</p>
            <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-12 text-center text-gray-800 font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
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
            { key: "reviews", label: `Đánh giá (${product.reviews.length})` },
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
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
              <p className="text-gray-500 text-sm">{product.shortDescription}</p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 px-4 text-gray-500 w-1/3 border-r border-gray-100">{key}</td>
                      <td className="py-3 px-4 text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {/* Summary */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-700">{product.rating}</div>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{product.reviewCount} đánh giá</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = star === 5 ? 80 : star === 4 ? 15 : star === 3 ? 3 : star === 2 ? 1 : 1;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${count}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{count}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-5 mb-8">
                {product.reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                        {r.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800 text-sm">{r.author}</span>
                          {r.verified && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Đã mua hàng</span>}
                          <span className="text-xs text-gray-400 ml-auto">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Write review */}
              <div className="bg-blue-50 rounded-2xl p-5">
                <h4 className="text-gray-800 mb-4">Viết đánh giá của bạn</h4>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Đánh giá:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(s)}
                      >
                        <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || reviewRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-white text-sm resize-none text-gray-700 placeholder-gray-400"
                />
                <button
                  onClick={() => { setReviewText(""); setReviewRating(5); }}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mb-12">
          <h2 className="text-gray-900 mb-5">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Suggested products */}
      {suggested.length > 0 && (
        <div>
          <h2 className="text-gray-900 mb-5">Sản phẩm bạn có thể quan tâm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggested.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
