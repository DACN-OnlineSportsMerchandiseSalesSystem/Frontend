import { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart, Star, Eye, Check } from "lucide-react";
import { formatPrice } from "@/constants/productsData";
import type { Product } from "@/constants/productsData";
import { useApp } from "@/context/AppContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const [isAdded, setIsAdded] = useState(false);
  
  const isWishlisted = wishlist.includes(product.id);
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0]?.name || "",
      brand: product.brand,
    });
    
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
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
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:text-red-500"
                }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 text-white text-sm flex items-center justify-center gap-2 transition-colors ${
                isAdded ? "bg-green-600 hover:bg-green-700" : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Đã thêm vào giỏ
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Thêm vào giỏ
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-blue-600 mb-1">{product.brand}</p>
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
            <span className="text-blue-700 font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
