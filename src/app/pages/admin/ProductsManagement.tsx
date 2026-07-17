import { Search, Plus, Edit2, Trash2, Eye, Filter, Image as ImageIcon, X, Upload, ChevronDown, ChevronRight, MessageSquare, Send, Star, CornerDownRight } from "lucide-react";
import { formatPrice } from "../../data/products";
import productService, { Product as ApiProduct } from "../../../services/productService";
import brandService from "../../../services/brandService";
import categoryService from "../../../services/categoryService";
import uploadService from "../../../services/uploadService";
import reviewService, { Review } from "../../../services/reviewService";
import { useState, useEffect, useRef } from "react";
import { sortCategoryNamesParentFirst } from "../../../utils/categoryHelpers";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  sport: string;
  rating: number;
  stock: number;
}

export function ProductsManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("id_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleEdit = async (product: any) => {
    setIsFetchingDetail(true);
    try {
      const fullProduct = await productService.getProductById(parseInt(product.id));
      setSelectedProduct(fullProduct);
      setShowEditModal(true);
    } catch (err) {
      alert("Không thể lấy thông tin chi tiết sản phẩm");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleViewDetail = async (product: any) => {
    setIsFetchingDetail(true);
    try {
      const fullProduct = await productService.getProductById(parseInt(product.id));
      setSelectedProduct(fullProduct);
      setShowDetailModal(true);
    } catch (err) {
      alert("Không thể lấy thông tin chi tiết sản phẩm");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAllProducts();
      const mapped = data.map(p => {
        // Tính tổng tồn kho = tổng stockQuantity của tất cả variants
        const totalStock = Array.isArray(p.variants)
          ? p.variants.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) || 0), 0)
          : 0;
        return {
          id: p.id.toString(),
          name: p.name,
          brand: p.brandName || "",
          price: p.price || 0,
          originalPrice: p.originalPrice || 0,
          image: p.images?.[0]?.imageUrl || "",
          sport: p.categoryNames?.join(", ") || "",
          rating: p.rating || 5,
          stock: totalStock,
          categoryNames: p.categoryNames || []
        };
      });
      setProducts(mapped);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    categoryService.getAllCategories().then(setCategories).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.deleteProduct(parseInt(id));
        fetchProducts();
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === "all" || 
                          (p.categoryNames || []).includes(filterCategory) ||
                          p.sport === filterCategory;
    return matchSearch && matchCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "id_desc":
        return Number(b.id) - Number(a.id);
      case "id_asc":
        return Number(a.id) - Number(b.id);
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "name_asc":
        return a.name.localeCompare(b.name, "vi");
      case "name_desc":
        return b.name.localeCompare(a.name, "vi");
      case "stock_asc":
        return a.stock - b.stock;
      case "stock_desc":
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ sản phẩm trong cửa hàng</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border-2 border-gray-300 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu..."
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.filter(c => !c.parentId).map((c: any) => (
              <optgroup key={c.id} label={c.name}>
                <option value={c.name}>{c.name}</option>
                {categories.filter(sub => sub.parentId === c.id).map((sub: any) => (
                  <option key={sub.id} value={sub.name}>-- {sub.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="id_desc">Mới nhất</option>
            <option value="id_asc">Cũ nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="name_asc">Tên: A - Z</option>
            <option value="name_desc">Tên: Z - A</option>
            <option value="stock_asc">Tồn kho: Ít đến Nhiều</option>
            <option value="stock_desc">Tồn kho: Nhiều đến Ít</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Tìm thấy {filteredProducts.length} sản phẩm</span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img loading="lazy" decoding="async" src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border-2 border-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {sortCategoryNamesParentFirst(product.categoryNames, categories).join(", ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stock > 20 ? 'bg-green-100 text-green-700' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">⭐ {product.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(product)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4 text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 border-2 border-gray-300 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500">sản phẩm trên mỗi trang</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-sm font-medium"
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <div key={page} className="flex items-center gap-1.5">
                    {prev && page - prev > 1 && <span className="px-1 text-gray-500">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                          : "border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-sm font-medium"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && <ProductFormModal onClose={() => setShowAddModal(false)} onRefresh={fetchProducts} />}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onRefresh={fetchProducts}
        />
      )}

      {/* Detail Product Modal */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          categories={categories}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Loading Overlay */}
      {isFetchingDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-700">Đang tải thông tin...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onRefresh }: { product?: any; onClose: () => void; onRefresh: () => void }) {
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data from API
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Danh mục cha nào đang được mở rộng
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

  const toggleParent = (id: number) =>
    setExpandedParents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Form states
  const [name, setName] = useState(product?.name || "");
  const [brandId, setBrandId] = useState<number | "">(product?.brandId || "");
  const [categoryIds, setCategoryIds] = useState<number[]>(product?.categoryIds || []);
  const [price, setPrice] = useState(product?.originalPrice || product?.price || 0);
  const [discount, setDiscount] = useState(product?.discount || 0);
  const [description, setDescription] = useState(product?.description || "");
  const [productCode, setProductCode] = useState(product?.productCode || "");
  const [imageUrl, setImageUrl] = useState(product?.images?.[0]?.imageUrl || product?.image || "");

  const [sizes, setSizes] = useState<string>(
    product?.variants
      ? Array.from(new Set(product.variants.map((v: any) => v.size))).filter((s: any) => s !== "Default").join(", ")
      : ""
  );
  const [colors, setColors] = useState<string>(
    product?.variants
      ? Array.from(new Set(product.variants.map((v: any) => v.color))).filter((c: any) => c !== "Default").join(", ")
      : ""
  );

  // variantStocks: key = "color|size", value = stockQuantity
  const buildInitialStocks = (): Record<string, number> => {
    if (!product?.variants || product.variants.length === 0) return {};
    const map: Record<string, number> = {};
    for (const v of product.variants) {
      const key = `${v.color}|${v.size}`;
      map[key] = v.stockQuantity ?? 0;
    }
    return map;
  };
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>(buildInitialStocks);

  // Derived: parsed colors & sizes lists
  const colorList = colors.split(",").map(s => s.trim()).filter(s => s !== "");
  const sizeList = sizes.split(",").map(s => s.trim()).filter(s => s !== "");

  // Tổng tồn kho = sum toàn bộ ô trong bảng
  const totalStock = (() => {
    if (colorList.length === 0 || sizeList.length === 0) return 0;
    return colorList.reduce((sum, c) =>
      sum + sizeList.reduce((s2, sz) => s2 + (variantStocks[`${c}|${sz}`] ?? 0), 0), 0);
  })();

  const setStock = (color: string, size: string, val: number) => {
    setVariantStocks(prev => ({ ...prev, [`${color}|${size}`]: val < 0 ? 0 : val }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          brandService.getAllBrands(),
          categoryService.getAllCategories()
        ]);
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu bổ trợ:", err);
      }
    };
    fetchData();
  }, []);

  const handleCategoryToggle = (id: number) => {
    const clickedCat = categories.find((c: any) => c.id === id);
    const isChild = !!clickedCat?.parentId;

    setCategoryIds(prev => {
      const isChecked = prev.includes(id);

      if (isChecked) {
        // Bỏ chọn: nếu là cha → bỏ chọn tất cả con của nó luôn
        const childIds = categories
          .filter((c: any) => c.parentId === id)
          .map((c: any) => c.id);
        return prev.filter(item => item !== id && !childIds.includes(item));
      } else {
        // Chọn: nếu là con → chỉ cho phép chọn nếu cha đã được chọn
        if (isChild) {
          const parentId = clickedCat.parentId;
          if (!prev.includes(parentId)) {
            return prev; // Bỏ qua nếu cha chưa được chọn
          }
          return [...prev, id];
        }
        return [...prev, id];
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadService.uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      alert("Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Vui lòng tải lên hình ảnh sản phẩm!");
      return;
    }
    setIsSubmitting(true);
    try {
      // Build variantStocks array
      const effectiveColors = colorList.length > 0 ? colorList : ["Default"];
      const effectiveSizes = sizeList.length > 0 ? sizeList : ["Default"];
      const variantStocksArr = effectiveColors.flatMap(c =>
        effectiveSizes.map(s => ({
          color: c,
          size: s,
          stockQuantity: variantStocks[`${c}|${s}`] ?? 0
        }))
      );

      const productData = {
        name,
        brandId: Number(brandId),
        categoryIds,
        description,
        productCode,
        imageUrl,
        originalPrice: Number(price),
        discount: Number(discount),
        sizes: sizeList,
        colors: colorList,
        variantStocks: variantStocksArr,
        status: "active",
        slug: name.toLowerCase().replace(/ /g, "-")
      };

      if (isEdit) {
        await productService.updateProduct(product.id, productData as any);
      } else {
        await productService.createProduct(productData as any);
      }
      onRefresh();
      onClose();
    } catch (err) {
      alert(isEdit ? "Cập nhật thất bại" : "Thêm mới thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-lg font-bold text-gray-900">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer min-h-[150px] flex flex-col items-center justify-center gap-2 ${imageUrl ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
              >
                {isUploading ? (
                  <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                ) : imageUrl ? (
                  <img loading="lazy" decoding="async" src={imageUrl} alt="Preview" className="max-h-[120px] rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Click để tải ảnh lên</p>
                  </>
                )}
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            {/* Brand & Product Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                  required value={brandId} onChange={(e) => setBrandId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-medium"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mã sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required value={productCode} onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-mono"
                  placeholder="SP001..."
                />
              </div>
            </div>

            {/* Categories — cây cha / con */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Danh mục <span className="text-red-500">* (Có thể chọn nhiều)</span>
                </label>
                {categoryIds.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">
                    Đã chọn: {categoryIds.length}
                  </span>
                )}
              </div>
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {(() => {
                  const parents = categories.filter((c: any) => !c.parentId);
                  const childrenOf = (parentId: number) => categories.filter((c: any) => c.parentId === parentId);
                  return parents.map((parent: any) => {
                    const children = childrenOf(parent.id);
                    const isOpen = expandedParents.has(parent.id);
                    const isParentChecked = categoryIds.includes(parent.id);
                    const hasChildren = children.length > 0;
                    return (
                      <div key={parent.id}>
                        {/* Hàng danh mục cha */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors ${isParentChecked ? 'bg-blue-50/60' : 'bg-white'} ${hasChildren ? 'border-b border-gray-200' : ''}`}>
                          {/* Checkbox cha */}
                          <div
                            onClick={() => handleCategoryToggle(parent.id)}
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                              isParentChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
                            }`}
                          >
                            {isParentChecked && <X className="w-3 h-3 text-white" />}
                          </div>
                          {/* Tên cha — click để expand/collapse */}
                          <button
                            type="button"
                            onClick={() => hasChildren && toggleParent(parent.id)}
                            className={`flex-1 flex items-center gap-1.5 text-left transition-colors ${
                              hasChildren ? 'cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <span className={`text-sm font-bold ${ isParentChecked ? 'text-blue-700' : 'text-gray-800' }`}>
                              {parent.name}
                            </span>
                            {hasChildren && (
                              <span className="ml-auto flex items-center gap-1">
                                <span className="text-[10px] text-gray-500 font-normal">{children.length} mục con</span>
                                {isOpen
                                  ? <ChevronDown className="w-4 h-4 text-gray-500" />
                                  : <ChevronRight className="w-4 h-4 text-gray-500" />
                                }
                              </span>
                            )}
                          </button>
                        </div>
                        {/* Danh sách con — chỉ hiện khi expanded */}
                        {hasChildren && isOpen && (
                          <div className="bg-gray-50/80">
                            {children.map((child: any) => {
                              const isChildChecked = categoryIds.includes(child.id);
                              const isParentSelected = categoryIds.includes(parent.id);
                              return (
                                <div
                                  key={child.id}
                                  title={!isParentSelected ? `Cần chọn "${parent.name}" trước` : ''}
                                  className={`flex items-center gap-2 pl-9 pr-3 py-2 border-b border-gray-200 last:border-0 transition-colors ${
                                    isChildChecked
                                      ? 'bg-blue-50/50 cursor-pointer hover:bg-blue-50'
                                      : isParentSelected
                                        ? 'cursor-pointer hover:bg-blue-50/40'
                                        : 'cursor-not-allowed opacity-45 bg-gray-100/60'
                                  }`}
                                  onClick={() => isParentSelected && handleCategoryToggle(child.id)}
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                    isChildChecked
                                      ? 'bg-blue-500 border-blue-500'
                                      : isParentSelected
                                        ? 'bg-white border-gray-200'
                                        : 'bg-gray-200 border-gray-200'
                                  }`}>
                                    {isChildChecked && <X className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <span className={`text-sm ${
                                    isChildChecked
                                      ? 'text-blue-600 font-semibold'
                                      : isParentSelected
                                        ? 'text-gray-600'
                                        : 'text-gray-500 italic'
                                  }`}>
                                    {child.name}
                                  </span>
                                  {!isParentSelected && (
                                    <span className="ml-auto text-[10px] text-gray-500 font-medium">
                                      🔒 chọn cha trước
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">💡 Click vào tên danh mục cha để xem/ẩn danh mục con. Tích ô vuông để chọn.</p>
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giá gốc (VNĐ)</label>
                <input
                  type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-bold text-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giảm giá (%)</label>
                <input
                  type="number" value={discount} min={0} max={100} onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-bold text-orange-600"
                />
              </div>
            </div>

            {/* Colors & Sizes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Màu sắc <span className="text-gray-500 font-normal">(Ví dụ: Đỏ, Đen, Trắng)</span>
                </label>
                <input
                  type="text" value={colors} onChange={(e) => setColors(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="Đỏ, Đen, Trắng..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kích cỡ <span className="text-gray-500 font-normal">(Ví dụ: 38, 39, 40)</span>
                </label>
                <input
                  type="text" value={sizes} onChange={(e) => setSizes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="38, 39, 40..."
                />
              </div>
            </div>

            {/* Variant Stock Grid */}
            {(colorList.length > 0 || sizeList.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Tồn kho theo biến thể
                  </label>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
                    Tổng: {totalStock} sản phẩm
                  </span>
                </div>
                <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 uppercase w-28">Màu \ Cỡ</th>
                          {(sizeList.length > 0 ? sizeList : ["Default"]).map(sz => (
                            <th key={sz} className="px-3 py-2.5 text-center text-xs font-bold text-gray-500 uppercase min-w-[80px]">{sz}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(colorList.length > 0 ? colorList : ["Default"]).map((c, ci) => (
                          <tr key={c} className={ci % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-1.5 font-bold text-gray-700 text-xs">
                                <span className="w-3 h-3 rounded-full border-2 border-gray-300 flex-shrink-0" style={{ backgroundColor: 'transparent' }} />
                                {c}
                              </span>
                            </td>
                            {(sizeList.length > 0 ? sizeList : ["Default"]).map(sz => {
                              const key = `${c}|${sz}`;
                              const val = variantStocks[key] ?? 0;
                              return (
                                <td key={sz} className="px-2 py-1.5 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={val}
                                    onChange={e => setStock(c, sz, Number(e.target.value))}
                                    className={`w-full text-center px-1 py-1.5 rounded-lg border text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                      val > 0
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-500"
                                    }`}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">💡 Nhập số lượng tồn kho cho từng tổ hợp màu sắc và kích cỡ. Ô đỏ = hết hàng.</p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả sản phẩm</label>
              <textarea
                rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={isSubmitting || isUploading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductDetailModal({ product, categories, onClose }: { product: any; categories: any[]; onClose: () => void }) {
  const variants: any[] = product.variants || [];
  const totalStock = variants.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) || 0), 0);

  // Group by color để hiển thị bảng
  const colors = Array.from(new Set(variants.map((v: any) => v.color)));
  const sizes = Array.from(new Set(variants.map((v: any) => v.size)));

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getReviewsByProduct(product.id);
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.")) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews(reviews.filter(r => r.id !== reviewId));
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa đánh giá.");
      }
    }
  };

  const handleReplyReview = async (reviewId: number) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    setSubmittingReply(reviewId);
    try {
      const updatedReview = await reviewService.replyReview(reviewId, text);
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
      setReplyText({ ...replyText, [reviewId]: "" });
    } catch (error) {
      alert("Có lỗi xảy ra khi gửi phản hồi.");
    } finally {
      setSubmittingReply(null);
    }
  };

  const getStock = (color: string, size: string) => {
    const v = variants.find((vv: any) => vv.color === color && vv.size === size);
    return v ? (v.stockQuantity ?? 0) : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
          <h3 className="text-xl font-black text-gray-900">Chi tiết sản phẩm</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Image + Price */}
            <div className="space-y-6">
              <div className="aspect-square rounded-3xl overflow-hidden border-2 border-gray-300 bg-gray-50 p-4 shadow-inner">
                <img loading="lazy" decoding="async"
                  src={product.images?.[0]?.imageUrl || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-black uppercase mb-1">Giá bán</p>
                  <p className="text-2xl font-black text-blue-700">{formatPrice(product.price)}</p>
                </div>
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                  <p className="text-[10px] text-orange-600 font-black uppercase mb-1">Giảm giá</p>
                  <p className="text-2xl font-black text-orange-700">{product.discount || 0}%</p>
                </div>
              </div>
              <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                <p className="text-[10px] text-green-600 font-black uppercase mb-2">Tổng tồn kho</p>
                <p className="text-3xl font-black text-green-700">{totalStock} <span className="text-base font-bold text-green-500">sản phẩm</span></p>
              </div>
            </div>

            {/* Right: Info + Variant Stock Table */}
            <div className="space-y-6">
              <div>
                <h4 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h4>
                <p className="text-gray-500 font-mono text-sm mt-2">Mã SP: {product.productCode}</p>
              </div>

              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Danh mục</p>
                <div className="flex flex-wrap gap-2">
                  {sortCategoryNamesParentFirst(product.categoryNames, categories).map((name: string) => (
                    <span key={name} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold">{name}</span>
                  ))}
                </div>
              </div>

              {/* Variant Stock Table */}
              {variants.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Tồn kho theo biến thể</p>
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Màu \ Cỡ</th>
                            {sizes.map(sz => (
                              <th key={sz as string} className="px-3 py-2.5 text-center text-xs font-bold text-gray-500 uppercase">{sz as string}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {colors.map((c, ci) => (
                            <tr key={c as string} className={ci % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                              <td className="px-3 py-2.5 font-bold text-gray-700 text-xs">{c as string}</td>
                              {sizes.map(sz => {
                                const stock = getStock(c as string, sz as string);
                                return (
                                  <td key={sz as string} className="px-3 py-2.5 text-center">
                                    {stock !== null ? (
                                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                        stock > 20 ? "bg-green-100 text-green-700" :
                                        stock > 0  ? "bg-yellow-100 text-yellow-700" :
                                                     "bg-red-100 text-red-600"
                                      }`}>
                                        {stock > 0 ? stock : "Hết"}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300 text-xs">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">🟡 Sắp hết (≤20) &nbsp;🟢 Còn hàng &nbsp;🔴 Hết hàng</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Mô tả sản phẩm</p>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line bg-gray-50 p-5 rounded-2xl border-2 border-gray-300">
                  {product.description || "Chưa có mô tả chi tiết."}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 pt-10 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h4 className="text-xl font-black text-gray-900">Đánh giá của khách hàng ({reviews.length})</h4>
              </div>
            </div>

            {isLoadingReviews ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-300">
                <p className="text-gray-500 font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                          {review.userFirstName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.userFirstName} {review.userLastName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                              ))}
                            </span>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h5 className="font-bold text-gray-800 mb-1">{review.title}</h5>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>

                    {review.adminReply ? (
                      <div className="bg-gray-50 rounded-xl p-4 ml-8 border-2 border-gray-300 relative">
                        <CornerDownRight className="w-5 h-5 text-gray-300 absolute -left-7 top-4" />
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-gray-900">Phản hồi của người bán</span>
                          <span className="text-xs text-gray-500">• {new Date(review.repliedAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.adminReply}</p>
                      </div>
                    ) : (
                      <div className="ml-8 relative">
                        <CornerDownRight className="w-5 h-5 text-gray-300 absolute -left-7 top-3" />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập phản hồi..."
                            value={replyText[review.id] || ""}
                            onChange={e => setReplyText({ ...replyText, [review.id]: e.target.value })}
                            className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleReplyReview(review.id);
                            }}
                          />
                          <button
                            onClick={() => handleReplyReview(review.id)}
                            disabled={submittingReply === review.id || !replyText[review.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {submittingReply === review.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Gửi
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
