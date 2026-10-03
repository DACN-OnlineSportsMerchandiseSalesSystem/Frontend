import { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart, Star, Eye, IdCard } from "lucide-react";
import { Product, formatPrice } from "../data/products";
import { useApp } from "../context/AppContext";
import { optimizeImage } from "@/utils/imageOptimizer";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist, allCarts, isLoggedIn, isAdmin } = useApp();
  const isWishlisted = wishlist.includes(product.id.toString());

  const price = product.price || 0;
  const originalPrice = (product as any).originalPrice || price;
  const discount = originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  // Xử lý ảnh (API trả về mảng images)
  const image = (product as any).image || (product as any).images?.[0]?.imageUrl || "https://placehold.co/400x400?text=No+Image";

  const [selectedCartId, setSelectedCartId] = useState<number | "">("");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdmin) {
      alert("Tài khoản Quản trị viên (Admin) không thể mua hàng!");
      return;
    }

    // Tìm biến thể đầu tiên để thêm vào giỏ (nếu có)
    const firstVariantId = (product as any).variants?.[0]?.id?.toString() || product.id.toString();
    const size = (product as any).variants?.[0]?.size || (product as any).sizes?.[0] || "";
    const color = (product as any).variants?.[0]?.color || (product as any).colors?.[0]?.name || "";

    addToCart({
      productId: firstVariantId,
      name: product.name,
      price: price,
      image: image,
      quantity: 1,
      size: size,
      color: color,
      brand: product.brand || (product as any).brandName || "",
    }, selectedCartId || undefined);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id.toString());
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img loading="lazy" decoding="async"
            src={optimizeImage(image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Mới
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Bán chạy
              </span>
            )}
          </div>
          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              aria-label={isWishlisted ? "Bỏ thích" : "Yêu thích"}
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${isWishlisted ? "bg-red-600 text-white" : "bg-white text-gray-600 hover:text-red-500"
                }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
            <Link
              aria-label="Xem chi tiết"
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          {/* Add to cart overlay - Only for customers / guests */}
          {!isAdmin && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm p-2 flex flex-col gap-1.5 shadow-lg border-t border-gray-100/50">
              {isLoggedIn && allCarts && allCarts.length > 1 && (
                <select
                  value={selectedCartId}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => setSelectedCartId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full text-[11px] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 bg-white text-gray-700 cursor-pointer font-medium"
                >
                  <option value="">Giỏ chính (Mặc định)</option>
                  {allCarts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || `Giỏ hàng #${c.id}`}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleAddToCart}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Thêm vào giỏ
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-blue-600 mb-1">{product.brand || (product as any).brandName}</p>
          <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
            {product.name}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-blue-700 font-bold">{formatPrice(price)}</span>
            {originalPrice > price && (
              <span className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
