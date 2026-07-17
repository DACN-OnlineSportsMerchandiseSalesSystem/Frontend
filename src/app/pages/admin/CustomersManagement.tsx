import { useState, useEffect } from "react";
import { Search, Eye, Lock, Unlock, UserCheck, UserX, Mail, Phone, Calendar, ShoppingBag, X, Loader2, AlertCircle, RefreshCw, Trash2, UserPlus, Edit2 } from "lucide-react";
import { getAllUsersAPI, deleteUserByIdAPI, adminCreateUserAPI, updateUserByIdAPI, UserProfile } from "../../../services/userService";
import { formatPrice } from "../../data/products";

const roleLabel: Record<string, string> = {
  ROLE_ADMIN: "Quản trị",
  ADMIN: "Quản trị",
  ROLE_USER: "Khách hàng",
  USER: "Khách hàng",
};

export function CustomersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", roleName: "ROLE_USER", status: "ACTIVE" });

  const [sortBy, setSortBy] = useState("id_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [createMsg, setCreateMsg] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAllUsersAPI();
      console.log(">>> [ADMIN] Danh sách người dùng từ API:", data);
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
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const idA = a.id || 0;
    const idB = b.id || 0;
    switch (sortBy) {
      case "id_desc":
        return idB - idA;
      case "id_asc":
        return idA - idB;
      case "name_asc": {
        const nameA = [a.firstName, a.lastName].filter(Boolean).join(" ");
        const nameB = [b.firstName, b.lastName].filter(Boolean).join(" ");
        return nameA.localeCompare(nameB, "vi");
      }
      case "name_desc": {
        const nameA = [a.firstName, a.lastName].filter(Boolean).join(" ");
        const nameB = [b.firstName, b.lastName].filter(Boolean).join(" ");
        return nameB.localeCompare(nameA, "vi");
      }
      default:
        return 0;
    }
  });

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin và tài khoản hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <UserPlus className="w-4 h-4" />
          Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border-2 border-gray-300 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Quản trị</option>
            <option value="ROLE_USER">Khách hàng</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Đã khóa</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="id_desc">Mới nhất</option>
            <option value="id_asc">Cũ nhất</option>
            <option value="name_asc">Tên: A - Z</option>
            <option value="name_desc">Tên: Z - A</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">Tìm thấy {filteredUsers.length} người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
          <p className="text-sm text-gray-600">Tổng người dùng</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
          <p className="text-sm text-gray-600">Quản trị viên</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {users.filter(u => u.roleName === "ROLE_ADMIN").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-black text-green-600 mt-1">
            {users.filter(u => u.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
          <p className="text-sm text-gray-600">Bị khóa</p>
          <p className="text-2xl font-black text-red-600 mt-1">
            {users.filter(u => u.status !== "ACTIVE").length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-gray-300 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách người dùng...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => {
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
                          (user.roleName === 'ROLE_ADMIN' || user.roleName === 'ADMIN') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
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
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
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
            <span className="text-sm text-gray-500">người dùng trên mỗi trang</span>
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

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
          onUpdate={fetchUsers}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <form onSubmit={handleCreate}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Thêm người dùng mới</h3>
                <button type="button" onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                {createMsg && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{createMsg}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Họ" required className="px-4 py-2 border rounded-xl" value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} />
                  <input placeholder="Tên" required className="px-4 py-2 border rounded-xl" value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} />
                </div>
                <input placeholder="Email" type="email" required className="w-full px-4 py-2 border rounded-xl" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} />
                <input placeholder="Số điện thoại" className="w-full px-4 py-2 border rounded-xl" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
                <input placeholder="Mật khẩu" type="password" required className="w-full px-4 py-2 border rounded-xl" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} />
                <select className="w-full px-4 py-2 border rounded-xl" value={createForm.roleName} onChange={e => setCreateForm({...createForm, roleName: e.target.value})}>
                  <option value="ROLE_USER">Khách hàng</option>
                  <option value="ROLE_ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-xl">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose, onUpdate }: { user: UserProfile; onClose: () => void; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const normalizeRole = (role?: string) => {
    if (!role) return "ROLE_USER";
    if (role === "ADMIN") return "ROLE_ADMIN";
    if (role === "USER") return "ROLE_USER";
    return role;
  };

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    roleName: normalizeRole(user.roleName),
    status: user.status || "ACTIVE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const handleUpdate = async () => {
    if (!user.id) return;
    setIsSubmitting(true);
    setError("");
    try {
      await updateUserByIdAPI(user.id, formData);
      onUpdate();
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900">Thông tin người dùng</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <p className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</p>}
          
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-2xl flex-shrink-0">
              {fullName.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input 
                    className="px-3 py-1.5 border rounded-lg text-sm" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    placeholder="Họ"
                  />
                  <input 
                    className="px-3 py-1.5 border rounded-lg text-sm" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    placeholder="Tên"
                  />
                </div>
              ) : (
                <h4 className="text-xl font-bold text-gray-900">{fullName || "Người dùng"}</h4>
              )}
              <p className="text-sm text-gray-500 mb-2">ID: {user.id}</p>
              {!isEditing && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  (user.roleName === 'ROLE_ADMIN' || user.roleName === 'ADMIN') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {roleLabel[user.roleName || 'ROLE_USER']}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Liên hệ
              </h5>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email (Không thể sửa)</label>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Số điện thoại</label>
                  {isEditing ? (
                    <input 
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{user.phone || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Hệ thống
              </h5>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Vai trò</label>
                  {isEditing ? (
                    <select 
                      className="w-full px-3 py-2 border rounded-lg bg-white" 
                      value={formData.roleName} 
                      onChange={e => setFormData({...formData, roleName: e.target.value})}
                    >
                      <option value="ROLE_USER">Khách hàng</option>
                      <option value="ROLE_ADMIN">Quản trị viên</option>
                    </select>
                  ) : (
                    <p className="font-medium text-gray-800">{roleLabel[user.roleName || 'ROLE_USER']}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Hạng thành viên / Điểm tích lũy</label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-bold text-xs">
                      {user.rank || 'NEW'}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {user.level || 0} điểm
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Trạng thái tài khoản</label>
                  {isEditing ? (
                    <select 
                      className="w-full px-3 py-2 border rounded-lg bg-white" 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Khóa tài khoản</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <p className="font-medium text-gray-800">{user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3 border-t border-gray-200">
          {isEditing ? (
            <>
              <button 
                onClick={() => { 
                  setIsEditing(false); 
                  setFormData({ 
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    phone: user.phone || "", 
                    roleName: normalizeRole(user.roleName), 
                    status: user.status || "ACTIVE" 
                  }); 
                }} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Lưu thay đổi
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
