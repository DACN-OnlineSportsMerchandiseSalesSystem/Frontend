import { useState, useEffect } from "react";
import { Search, Eye, Lock, Unlock, UserCheck, UserX, Mail, Phone, Calendar, ShoppingBag, X, Loader2, AlertCircle, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { getAllUsersAPI, deleteUserByIdAPI, adminCreateUserAPI, UserProfile } from "../../../services/userService";
import { formatPrice } from "../../data/products";

const roleLabel: Record<string, string> = {
  ROLE_ADMIN: "Quản trị",
  ROLE_USER: "Khách hàng",
};

export function CustomersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", roleName: "ROLE_USER", status: "ACTIVE" });
  const [createMsg, setCreateMsg] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAllUsersAPI();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await deleteUserByIdAPI(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg("");
    try {
      const newUser = await adminCreateUserAPI(createForm);
      setUsers(prev => [...prev, newUser]);
      setShowCreateModal(false);
      setCreateForm({ firstName: "", lastName: "", email: "", phone: "", password: "", roleName: "ROLE_USER", status: "ACTIVE" });
    } catch (err: any) {
      setCreateMsg(err?.response?.data?.message || "Tạo tài khoản thất bại");
    }
  };

  const filteredUsers = users.filter(u => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").toLowerCase();
    const matchSearch = name.includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || "").includes(searchQuery);
    const matchRole = filterRole === "all" || u.roleName === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Quản lý khách hàng</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin và lịch sử mua hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả hạng</option>
            <option value="normal">Thường</option>
            <option value="silver">Bạc</option>
            <option value="gold">Vàng</option>
            <option value="platinum">Bạch Kim</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Đã khóa</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">Tìm thấy {filteredUsers.length} người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng người dùng</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Quản trị viên</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {users.filter(u => u.roleName === "ROLE_ADMIN").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-black text-green-600 mt-1">
            {users.filter(u => u.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Bị khóa</p>
          <p className="text-2xl font-black text-red-600 mt-1">
            {users.filter(u => u.status !== "ACTIVE").length}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
                const avatar = fullName ? fullName.charAt(0).toUpperCase() : "U";
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                          {avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{fullName || "Người dùng"}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.roleName === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {roleLabel[user.roleName || 'ROLE_USER'] || 'Khách hàng'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <UserCheck className="w-3 h-3" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <UserX className="w-3 h-3" />
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

function CustomerDetailModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const tierInfo = tierConfig[customer.tier];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Thông tin khách hàng</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-2xl flex-shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">{customer.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{customer.id}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${tierInfo.color}-100 text-${tierInfo.color}-700`}>
                Khách hàng {tierInfo.label}
              </span>
            </div>
            <div className="flex gap-2">
              {customer.status === "active" ? (
                <button className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Khóa tài khoản
                </button>
              ) : (
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm">
                  <Unlock className="w-4 h-4 inline mr-1" />
                  Mở khóa
                </button>
              )}
            </div>
          </div>

          {/* Contact & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-3">Thông tin liên hệ</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Tham gia: {customer.joinDate}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-3">Thống kê mua hàng</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Tổng đơn hàng</p>
                  <p className="text-xl font-black text-blue-600">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tổng chi tiêu</p>
                  <p className="text-xl font-black text-green-600">{formatPrice(customer.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Giá trị TB/đơn</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(customer.totalSpent / customer.totalOrders)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">Lịch sử đơn hàng gần đây</h5>
            <div className="text-center py-8 text-gray-400 text-sm">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Chức năng đang phát triển
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
