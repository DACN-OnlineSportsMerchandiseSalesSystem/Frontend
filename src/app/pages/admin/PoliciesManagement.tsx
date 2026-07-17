import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X, Save, FileText, CheckCircle, XCircle } from "lucide-react";
import storePolicyService, { StorePolicyDTO } from "../../../services/storePolicyService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function PoliciesManagement() {
  const [policies, setPolicies] = useState<StorePolicyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<StorePolicyDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<StorePolicyDTO>({
    policyKey: "",
    title: "",
    content: "",
    category: "General",
    isActive: true,
    displayOrder: 1
  });

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await storePolicyService.getAllPolicies();
      setPolicies(data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    } catch (error) {
      console.error("Failed to fetch policies", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openAddModal = () => {
    setEditingPolicy(null);
    setFormData({
      policyKey: "",
      title: "",
      content: "",
      category: "General",
      isActive: true,
      displayOrder: policies.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (policy: StorePolicyDTO) => {
    setEditingPolicy(policy);
    setFormData({ ...policy });
    setIsModalOpen(true);
  };

  const handleDelete = async (key: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chính sách này? Hành động này không thể hoàn tác.")) {
      try {
        await storePolicyService.deletePolicy(key);
        setPolicies(policies.filter(p => p.policyKey !== key));
      } catch (error) {
        alert("Lỗi khi xóa chính sách. Vui lòng thử lại.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPolicy) {
        const updated = await storePolicyService.updatePolicy(editingPolicy.policyKey, formData);
        setPolicies(policies.map(p => p.policyKey === editingPolicy.policyKey ? updated : p));
      } else {
        const created = await storePolicyService.createPolicy(formData);
        setPolicies([...policies, created]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu chính sách");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.policyKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý Chính sách</h2>
          <p className="text-sm text-gray-500 mt-1">Thiết lập các điều khoản, chính sách hiển thị cho khách hàng</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 font-bold"
        >
          <Plus className="w-5 h-5" />
          Thêm chính sách
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border-2 border-gray-300 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm chính sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Key (URL)</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 font-bold">
                    Không tìm thấy chính sách nào.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.policyKey} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">{policy.displayOrder}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900">{policy.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono bg-gray-50 rounded-lg inline-block my-2 mx-6">
                      {policy.policyKey}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{policy.category}</td>
                    <td className="px-6 py-4">
                      {policy.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Đã ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(policy)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(policy.policyKey)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
              <h3 className="text-xl font-black text-gray-900">
                {editingPolicy ? "Chỉnh sửa Chính sách" : "Thêm Chính sách mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề (Title) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium"
                    placeholder="VD: Chính sách giao hàng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mã định danh (Policy Key) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPolicy}
                    value={formData.policyKey}
                    onChange={(e) => setFormData({ ...formData, policyKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono disabled:opacity-50"
                    placeholder="VD: shipping-policy"
                  />
                  <p className="text-xs text-gray-500 mt-1">Dùng để làm URL. Không có dấu, không khoảng trắng.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục (Category) *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium"
                    placeholder="VD: Shipping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Thứ tự hiển thị (Display Order)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium"
                  />
                </div>
              </div>

              <div className={isFullscreen ? "fixed inset-0 z-[100] bg-gray-50 p-6 flex flex-col" : ""}>
                <style>{`
                  .quill-editor-container .ql-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                  }
                  .quill-editor-container .ql-editor {
                    flex: 1;
                    font-size: 16px;
                  }
                `}</style>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">Nội dung chi tiết (HTML) *</label>
                  <button 
                    type="button" 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-blue-700 font-semibold hover:bg-blue-100 px-4 py-1.5 rounded-lg text-sm transition-colors border border-blue-200 shadow-sm bg-white flex items-center gap-2"
                  >
                    {isFullscreen ? "↙️ Thu nhỏ lại" : "↗️ Phóng to toàn màn hình"}
                  </button>
                </div>
                <div className={`bg-white rounded-2xl border-2 border-gray-300 overflow-hidden flex-1 flex flex-col quill-editor-container shadow-sm ${isFullscreen ? 'h-full' : ''}`}>
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(content) => setFormData({ ...formData, content })}
                    className={`flex-1 flex flex-col ${isFullscreen ? 'h-full' : 'h-[400px] pb-10'}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border-2 border-gray-300">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-200 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                  Kích hoạt hiển thị cho khách hàng (Active)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingPolicy ? "Lưu thay đổi" : "Tạo mới"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
