import { Search, Plus, Edit2, Trash2, Eye, Filter, Image as ImageIcon, X, Upload } from "lucide-react";
import { formatPrice } from "../../data/products";
import productService, { Product as ApiProduct } from "../../../services/productService";
import { useEffect } from "react";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAllProducts();
      const mapped = data.map(p => ({
        id: p.id.toString(),
        name: p.name,
        brand: (p as any).brandName || "",
        price: (p as any).variants?.[0]?.price || 0,
        image: p.images?.[0]?.imageUrl || "",
        sport: (p as any).categoryName || "",
        rating: 5,
        stock: (p as any).variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0
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
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
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
    </div>
  );
}

function ProductFormModal({ product, onClose, onRefresh }: { product?: any; onClose: () => void; onRefresh: () => void }) {
  const isEdit = !!product;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Product Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Click để tải ảnh lên</p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF (Max 5MB)</p>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={product?.name}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={product?.brand}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="Nike, Adidas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                defaultValue={product?.sport}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              >
                <option value="">Chọn danh mục</option>
                <option value="Chạy bộ">Chạy bộ</option>
                <option value="Bóng đá">Bóng đá</option>
                <option value="Gym">Gym</option>
                <option value="Bơi lội">Bơi lội</option>
                <option value="Yoga">Yoga</option>
              </select>
            </div>
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                defaultValue={product?.price}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc</label>
              <input
                type="number"
                defaultValue={product?.originalPrice}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng tồn kho <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              defaultValue={product?.stock}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              placeholder="0"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả sản phẩm</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              placeholder="Nhập mô tả chi tiết về sản phẩm..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
            {isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}
