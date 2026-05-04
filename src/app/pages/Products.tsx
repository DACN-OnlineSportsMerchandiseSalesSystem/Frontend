import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { SlidersHorizontal, Grid3X3, List, ChevronDown, X } from "lucide-react";
import { sportCategories, brands } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import productService, { Product } from "../../services/productService";
import { useEffect } from "react";

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { categories, brands: apiBrands } = useApp();

  const sport = searchParams.get("sport") || "all";
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 10000000);

  const filteredProducts = useMemo(() => {
    let result = [...apiProducts];
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p as any).brandName?.toLowerCase().includes(search.toLowerCase()));
    if (brand) result = result.filter((p) => (p as any).brandName === brand);
    if (minPrice > 0 || maxPrice < 10000000) result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    switch (sortBy) {
      case "price_asc": return result.sort((a, b) => a.price - b.price);
      case "price_desc": return result.sort((a, b) => b.price - a.price);
      default: return result;
    }
  }, [apiProducts, search, brand, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    setIsLoading(true);
    // Map sport (id/name) to categoryId if applicable
    const categoryId = categories.find(c => c.name === sport)?.id;
    productService.getAllProducts(categoryId)
      .then(data => {
        setApiProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [sport, categories]);

  const activeFilters: { label: string; key: string }[] = [];
  if (sport && sport !== "all") activeFilters.push({ label: `Môn: ${sport}`, key: "sport" });
  if (search) activeFilters.push({ label: `Tìm: "${search}"`, key: "search" });
  if (filter) {
    const fMap: Record<string, string> = { sale: "Đang sale", new: "Hàng mới", bestseller: "Bán chạy" };
    activeFilters.push({ label: fMap[filter] || filter, key: "filter" });
  }
  if (brand) activeFilters.push({ label: `Thương hiệu: ${brand}`, key: "brand" });

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };

  const pageTitle = sport && sport !== "all" ? `${sportCategories.find(c => c.id === sport)?.icon} ${sport}` :
    search ? `Kết quả tìm kiếm: "${search}"` :
    filter === "sale" ? "🔥 Đang giảm giá" :
    filter === "new" ? "✨ Hàng mới về" :
    filter === "bestseller" ? "⭐ Bán chạy nhất" :
    "Tất cả sản phẩm";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-800">Sản phẩm</span>
      </div>

      {/* Title & active filters */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500">{filteredProducts.length} sản phẩm</p>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600 self-center">Đang lọc:</span>
          {activeFilters.map((f) => (
            <span key={f.key} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-200">
              {f.label}
              <button onClick={() => removeFilter(f.key)} className="hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button onClick={() => setSearchParams({})} className="text-sm text-red-500 hover:text-red-700 underline">
            Xóa tất cả
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Filters - desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Bộ lọc
              </h3>
            </div>

            {/* Categories */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Danh mục</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete("sport");
                    setSearchParams(p);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    !sport || sport === "all" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>📦</span>Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const p = new URLSearchParams(searchParams);
                      p.set("sport", cat.name);
                      setSearchParams(p);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                      sport === cat.name
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>📁</span>{cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Thương hiệu</p>
              <div className="flex flex-wrap gap-1.5">
                {apiBrands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      const p = new URLSearchParams(searchParams);
                      brand === b.name ? p.delete("brand") : p.set("brand", b.name);
                      setSearchParams(p);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                      brand === b.name ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price ranges */}
            <div className="p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Khoảng giá</p>
              {[
                { label: "Dưới 200K", min: 0, max: 200000 },
                { label: "200K - 500K", min: 200000, max: 500000 },
                { label: "500K - 1 triệu", min: 500000, max: 1000000 },
                { label: "1 - 3 triệu", min: 1000000, max: 3000000 },
                { label: "Trên 3 triệu", min: 3000000, max: 100000000 },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set("minPrice", r.min.toString()); p.set("maxPrice", r.max.toString());
                    setSearchParams(p);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    minPrice === r.min && maxPrice === r.max ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0" />{r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort & View */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-gray-700"
              >
                <option value="default">Mặc định</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-400 text-sm mb-4">Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác</p>
              <button onClick={() => setSearchParams({})} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
