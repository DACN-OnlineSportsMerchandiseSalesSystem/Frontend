import { Search, Plus, Edit2, Trash2, Eye, Filter, Image as ImageIcon, X, Upload } from "lucide-react";
import { formatPrice } from "../../data/products";
import productService, { Product as ApiProduct } from "../../../services/productService";
import brandService from "../../../services/brandService";
import categoryService from "../../../services/categoryService";
import uploadService from "../../../services/uploadService";
import { useState, useEffect, useRef } from "react";

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
      const mapped = data.map(p => ({
        id: p.id.toString(),
        name: p.name,
        brand: p.brandName || "",
        price: p.price || 0,
        originalPrice: p.originalPrice || 0,
        image: p.images?.[0]?.imageUrl || "",
        sport: p.categoryNames?.join(", ") || "",
        rating: p.rating || 5,
        stock: p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0
      }));
      setProducts(mapped);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
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
    const matchCategory = filterCategory === "all" || p.sport === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Quản lý sản phẩm</h2>
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
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Chạy bộ">Chạy bộ</option>
            <option value="Bóng đá">Bóng đá</option>
            <option value="Gym">Gym</option>
            <option value="Bơi lội">Bơi lội</option>
            <option value="Yoga">Yoga</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Tìm thấy {filteredProducts.length} sản phẩm</span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {product.sport}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
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
    product?.variants ? Array.from(new Set(product.variants.map((v: any) => v.size))).filter((s: any) => s !== "Default").join(", ") : ""
  );
  const [colors, setColors] = useState<string>(
    product?.variants ? Array.from(new Set(product.variants.map((v: any) => v.color))).filter((c: any) => c !== "Default").join(", ") : ""
  );
  const [stockQuantity, setStockQuantity] = useState<number>(
    product?.variants && product.variants.length > 0 ? product.variants[0].stockQuantity || 0 : 0
  );

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
    setCategoryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
      const productData = {
        name,
        brandId: Number(brandId),
        categoryIds,
        description,
        productCode,
        imageUrl,
        originalPrice: Number(price),
        discount: Number(discount),
        stockQuantity: Number(stockQuantity),
        sizes: sizes.split(",").map(s => s.trim()).filter(s => s !== ""),
        colors: colors.split(",").map(c => c.trim()).filter(c => c !== ""),
        status: "active",
        slug: name.toLowerCase().replace(/ /g, "-") // Simple slug
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer min-h-[150px] flex flex-col items-center justify-center gap-2 ${
                  imageUrl ? 'border-blue-200 bg-blue-50' : 'border-gray-300'
                }`}
              >
                {isUploading ? (
                  <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                ) : imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="max-h-[120px] rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-1" />
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
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={brandId}
                  onChange={(e) => setBrandId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-medium"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mã sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-mono"
                  placeholder="SP001..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Danh mục <span className="text-red-500">* (Có thể chọn nhiều)</span>
              </label>
              <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto border border-gray-100 grid grid-cols-2 gap-2">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer group p-1">
                    <div 
                      onClick={() => handleCategoryToggle(c.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${categoryIds.includes(c.id) ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}
                    >
                      {categoryIds.includes(c.id) && <X className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${categoryIds.includes(c.id) ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                      {c.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giá gốc (VNĐ)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-bold text-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giảm (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-bold text-orange-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tồn kho</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 font-bold text-green-600"
                />
              </div>
            </div>

            {/* Colors & Sizes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Màu sắc <span className="text-gray-400 font-normal">(Ví dụ: Đỏ, Đen, Trắng)</span>
                </label>
                <input
                  type="text"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="Đỏ, Đen, Trắng..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kích cỡ <span className="text-gray-400 font-normal">(Ví dụ: 38, 39, 40)</span>
                </label>
                <input
                  type="text"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="38, 39, 40..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả sản phẩm</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || isUploading}
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

function ProductDetailModal({ product, onClose }: { product: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
          <h3 className="text-xl font-black text-gray-900">Chi tiết sản phẩm</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="aspect-square rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 p-4 shadow-inner">
                <img 
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
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h4>
                <p className="text-gray-400 font-mono text-sm mt-2">Mã SP: {product.productCode}</p>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Danh mục</p>
                  <div className="flex flex-wrap gap-2">
                    {(product.categoryNames || []).map((name: string) => (
                      <span key={name} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Màu sắc & Kích cỡ có sẵn</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants && product.variants.length > 0 ? (
                      Array.from(new Set(product.variants.map((v: any) => `${v.color} - ${v.size}`))).map((variant: any) => (
                        <span key={variant} className="px-4 py-2 bg-white border-2 border-gray-100 text-gray-900 rounded-xl text-sm font-black shadow-sm">
                          {variant}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic px-1">Không có thông tin</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Mô tả sản phẩm</p>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    {product.description || "Chưa có mô tả chi tiết."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50 flex justify-end">
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
