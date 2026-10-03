import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, X, Save, FileText, CheckCircle, XCircle, Eye, Maximize2, Minimize2 } from "lucide-react";
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
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");

  // Form State
  const [formData, setFormData] = useState<StorePolicyDTO>({
    policyKey: "",
    title: "",
    content: "",
    category: "General",
    isActive: true,
    displayOrder: 1
  });

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'clean']
    ]
  }), []);

  const applyTemplate = (type: "warranty" | "return" | "shipping") => {
    if (formData.content && formData.content.trim() !== "" && formData.content !== "<p><br></p>") {
      if (!window.confirm("Thao tác này sẽ thay thế nội dung đang soạn thảo bằng mẫu chuẩn. Bạn có muốn tiếp tục?")) {
        return;
      }
    }
    if (type === "warranty") {
      setFormData(prev => ({
        ...prev,
        title: prev.title || "Chính sách bảo hành",
        category: prev.category || "Warranty",
        policyKey: prev.policyKey || "warranty-policy",
        content: `<h3>1. Điều kiện bảo hành hợp lệ</h3>
<ul>
  <li>Sản phẩm được mua chính hãng trên hệ thống <strong>SportZone</strong> có thông tin đơn hàng hợp lệ.</li>
  <li>Lỗi phát sinh do kỹ thuật của nhà sản xuất hoặc lỗi gia công từ xưởng.</li>
  <li>Tem bảo hành, mã vạch, phiếu bảo hành (nếu có) còn nguyên vẹn, không có dấu hiệu cạo sửa, tẩy xóa.</li>
</ul>

<h3>2. Quy định thời gian và hạng mục bảo hành</h3>
<ul>
  <li><strong>Giày thể thao:</strong> Bảo hành từ 3 đến 6 tháng đối với các lỗi bung keo, đứt chỉ, hỏng khóa kéo hoặc mòn gãy đế bất thường do lỗi vật liệu.</li>
  <li><strong>Thiết bị & Máy tập (máy chạy bộ, xe đạp tập):</strong> Bảo hành chính hãng từ 12 đến 24 tháng theo quy định nhà sản xuất. Hỗ trợ thay thế linh kiện chính hãng.</li>
  <li><strong>Phụ kiện kỹ thuật (Vợt cầu lông, vợt tennis):</strong> Bảo hành 2 đến 3 tháng đối với các lỗi nứt/gãy khung do lỗi cấu trúc vật liệu từ nhà sản xuất.</li>
  <li><strong>Quần áo, Đồ lót & Phụ kiện nhỏ:</strong> Không áp dụng bảo hành dài hạn sau khi đã qua sử dụng. Áp dụng chính sách đổi/trả trong vòng 15 ngày nếu phát hiện lỗi từ NSX khi vừa khui hàng.</li>
</ul>

<h3>3. Các trường hợp từ chối bảo hành</h3>
<ul>
  <li>Hao mòn tự nhiên trong quá trình sử dụng (mòn đế giày, xước xát, phai màu vải, rão thun).</li>
  <li>Hư hỏng do sử dụng sai mục đích, sai môi trường hoặc vận hành quá tải trọng cho phép.</li>
  <li>Hư hỏng do bảo quản sai cách (ngâm nước lâu ngày, phơi dưới nhiệt độ cao, giặt bằng hóa chất tẩy rửa mạnh, bị chuột bọ cắn phá).</li>
  <li>Sản phẩm đã bị khách hàng tự ý can thiệp, thay đổi cấu trúc hoặc mang đi sửa chữa tại các cơ sở bên ngoài.</li>
</ul>

<h3>4. Quy trình xử lý bảo hành</h3>
<ol>
  <li><strong>Bước 1:</strong> Khách hàng liên hệ bộ phận CSKH qua Hotline hoặc tạo "Yêu cầu hỗ trợ" trên hệ thống quản lý tài khoản, kèm theo hình ảnh/video cận cảnh lỗi.</li>
  <li><strong>Bước 2:</strong> CSKH tiếp nhận, xác minh đơn hàng và hướng dẫn đóng gói gửi sản phẩm về Trung tâm bảo hành của SportZone.</li>
  <li><strong>Bước 3:</strong> Đội ngũ kỹ thuật thẩm định nguyên nhân lỗi (2 - 3 ngày làm việc).</li>
  <li><strong>Bước 4:</strong> SportZone tiến hành sửa chữa, khắc phục lỗi hoặc chuyển về hãng bảo hành (xử lý từ 7 - 14 ngày làm việc).</li>
</ol>

<h3>5. Chi phí vận chuyển khi bảo hành</h3>
<ul>
  <li><strong>Trong 15 ngày đầu tiên:</strong> Nếu phát sinh lỗi cần bảo hành, SportZone chịu 100% cước phí vận chuyển hai chiều.</li>
  <li><strong>Sau 15 ngày sử dụng:</strong> Khách hàng vui lòng thanh toán cước phí gửi sản phẩm về Trung tâm bảo hành. SportZone sẽ chịu trách nhiệm thanh toán cước phí gửi trả lại sản phẩm sau khi đã bảo hành xong.</li>
</ul>`
      }));
    } else if (type === "return") {
      setFormData(prev => ({
        ...prev,
        title: prev.title || "Chính sách đổi trả hàng",
        category: prev.category || "Return",
        policyKey: prev.policyKey || "return-policy",
        content: `<h3>1. Thời hạn đổi trả</h3>
<ul>
  <li>Khách hàng được hỗ trợ đổi trả sản phẩm trong vòng <strong>15 ngày</strong> kể từ ngày nhận hàng thành công.</li>
</ul>

<h3>2. Điều kiện chấp nhận đổi trả</h3>
<ul>
  <li>Sản phẩm còn nguyên tem mác, hộp đựng ban đầu và chưa qua sử dụng, chưa giặt ủi.</li>
  <li>Có hóa đơn hoặc thông tin đơn hàng mua tại <strong>SportZone</strong>.</li>
  <li>Sản phẩm không bị bẩn, trầy xước, có mùi lạ hoặc hư hỏng do tác động từ người dùng.</li>
</ul>

<h3>3. Quy trình thực hiện</h3>
<ol>
  <li>Khách hàng truy cập <strong>Tài khoản &gt; Đơn hàng của tôi</strong> và chọn <strong>Yêu cầu đổi trả</strong>.</li>
  <li>Điền lý do và hình ảnh/video tình trạng sản phẩm.</li>
  <li>CSKH tiếp nhận và điều phối shipper thu hồi hàng tận nhà.</li>
</ol>`
      }));
    } else if (type === "shipping") {
      setFormData(prev => ({
        ...prev,
        title: prev.title || "Chính sách giao hàng & Vận chuyển",
        category: prev.category || "Shipping",
        policyKey: prev.policyKey || "shipping-policy",
        content: `<h3>1. Phạm vi giao hàng</h3>
<p>SportZone cung cấp dịch vụ giao hàng tận nơi trên toàn bộ 63 tỉnh thành cả nước.</p>

<h3>2. Thời gian giao hàng dự kiến</h3>
<ul>
  <li><strong>Nội thành (Hà Nội, TP.HCM):</strong> 1 - 2 ngày làm việc. Hỗ trợ giao hỏa tốc trong 2 giờ.</li>
  <li><strong>Các tỉnh thành khác:</strong> 2 - 4 ngày làm việc.</li>
</ul>

<h3>3. Phí vận chuyển</h3>
<ul>
  <li><strong>Miễn phí vận chuyển (Freeship):</strong> Đơn hàng từ <strong>500.000đ</strong> trở lên.</li>
  <li><strong>Đơn hàng dưới 500.000đ:</strong> Cước phí đồng giá 30.000đ toàn quốc.</li>
</ul>`
      }));
    }
  };

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
    setEditorTab("edit");
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
    setEditorTab("edit");
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

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm chính sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-white rounded-3xl w-full shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 ${
            isFullscreen ? "fixed inset-0 rounded-none z-[60] max-h-screen" : "max-w-5xl max-h-[92vh]"
          }`}>
            <style>{`
              .custom-quill .ql-toolbar.ql-snow {
                border: none;
                border-bottom: 1px solid #e2e8f0;
                background-color: #f8fafc;
                padding: 10px 14px;
                border-top-left-radius: 1rem;
                border-top-right-radius: 1rem;
              }
              .custom-quill .ql-container.ql-snow {
                border: none;
                font-family: inherit;
                border-bottom-left-radius: 1rem;
                border-bottom-right-radius: 1rem;
              }
              .custom-quill .ql-editor {
                min-height: 320px;
                font-size: 15px;
                line-height: 1.75;
                color: #1e293b;
                padding: 18px 22px;
              }
              .custom-quill .ql-editor.ql-blank::before {
                font-style: normal;
                color: #94a3b8;
                left: 22px;
              }
              .custom-quill .ql-editor h1, .policy-preview-content h1 {
                font-size: 1.5rem;
                font-weight: 800;
                margin-top: 1.25rem;
                margin-bottom: 0.5rem;
                color: #0f172a;
              }
              .custom-quill .ql-editor h2, .policy-preview-content h2 {
                font-size: 1.3rem;
                font-weight: 700;
                margin-top: 1.1rem;
                margin-bottom: 0.5rem;
                color: #1e293b;
              }
              .custom-quill .ql-editor h3, .policy-preview-content h3 {
                font-size: 1.15rem;
                font-weight: 700;
                margin-top: 1rem;
                margin-bottom: 0.4rem;
                color: #1d4ed8;
              }
              .custom-quill .ql-editor ul, .policy-preview-content ul {
                list-style-type: disc;
                padding-left: 1.6rem;
                margin-bottom: 0.85rem;
              }
              .custom-quill .ql-editor ol, .policy-preview-content ol {
                list-style-type: decimal;
                padding-left: 1.6rem;
                margin-bottom: 0.85rem;
              }
              .custom-quill .ql-editor li, .policy-preview-content li {
                margin-bottom: 0.4rem;
              }
              .custom-quill .ql-editor strong, .policy-preview-content strong {
                color: #0f172a;
                font-weight: 700;
              }
              .custom-quill .ql-editor p, .policy-preview-content p {
                margin-bottom: 0.6rem;
              }
            `}</style>

            {/* Header Cố Định */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingPolicy ? "Chỉnh sửa Chính sách" : "Thêm Chính sách mới"}
                  </h3>
                  <p className="text-xs text-gray-500">Thiết lập nội dung và quy định hiển thị tại trang Chính sách khách hàng</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title={isFullscreen ? "Thu nhỏ lại" : "Toàn màn hình"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Đóng modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form & Body Cuộn Độc Lập */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
              <div className="p-6 space-y-6 flex-1">
                {/* Meta Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Tiêu đề (Title) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-semibold text-gray-800"
                      placeholder="VD: Chính sách bảo hành"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Mã Policy Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingPolicy}
                      value={formData.policyKey}
                      onChange={(e) => setFormData({ ...formData, policyKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-mono text-gray-800 disabled:bg-gray-100 disabled:opacity-60"
                      placeholder="VD: warranty-policy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-semibold text-gray-800"
                      placeholder="VD: Warranty"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-semibold text-gray-800"
                    />
                  </div>
                </div>

                {/* Editor Section */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* View mode tabs */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-gray-800">Nội dung chi tiết</label>
                      <div className="inline-flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setEditorTab("edit")}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            editorTab === "edit"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          Soạn thảo
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorTab("preview")}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            editorTab === "preview"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Xem trước
                        </button>
                      </div>
                    </div>

                    {/* Quick Template Dropdown */}
                    <div className="flex items-center gap-2">
                      <label htmlFor="quick-template-select" className="text-xs text-gray-500 font-medium">
                        Mẫu văn bản:
                      </label>
                      <select
                        id="quick-template-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            applyTemplate(e.target.value as "warranty" | "return" | "shipping");
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>-- Chọn mẫu chính sách có sẵn --</option>
                        <option value="warranty">Chính sách bảo hành</option>
                        <option value="return">Chính sách đổi trả hàng</option>
                        <option value="shipping">Chính sách giao hàng & vận chuyển</option>
                      </select>
                    </div>
                  </div>

                  {/* Editor or Preview */}
                  {editorTab === "edit" ? (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm custom-quill">
                      <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="Nhập nội dung quy định, sử dụng các công cụ tiêu đề (H2, H3) và gạch đầu dòng để văn bản rõ ràng..."
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl border border-gray-200 p-5 min-h-[380px]">
                      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
                          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            {formData.title || "Tiêu đề chính sách"}
                          </h2>
                          <span className="text-xs text-blue-700 bg-blue-50 font-bold px-3 py-1 rounded-full border border-blue-100">
                            {formData.category || "General"}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-gray-700 policy-preview-content"
                          dangerouslySetInnerHTML={{
                            __html: formData.content || "<p class='text-gray-400 italic py-6 text-center'>Chưa có nội dung để xem trước. Vui lòng quay lại tab Soạn thảo để nhập nội dung.</p>"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Cố Định */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                    Kích hoạt hiển thị công khai (Active)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingPolicy ? "Lưu thay đổi" : "Tạo chính sách"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
