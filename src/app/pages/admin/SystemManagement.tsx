import { useState, useEffect } from "react";
import { Server, Activity, ShieldAlert, RefreshCw, Trash2, Database, ListFilter, Search, Clock, Shield } from "lucide-react";
import systemService, { SystemHealth, AuditLog } from "../../../services/systemService";

export function SystemManagement() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await systemService.getSystemHealth();
      setHealth(data);
    } catch (err: any) {
      console.error(err);
      // Fallback/Error state for display
      setHealth({
        database: "DOWN (Lỗi kết nối API)",
        redis: "DOWN (Lỗi kết nối API)",
        elasticsearch: "DOWN (Lỗi kết nối API)",
        chroma: "DOWN (Lỗi kết nối API)"
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await systemService.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchLogs();
  }, []);

  const handleClearCache = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ bộ nhớ đệm (Redis Cache)?")) return;
    setActionLoading("clear-cache");
    setMessage(null);
    try {
      const res = await systemService.clearCache();
      setMessage({ type: "success", text: res || "Xóa bộ nhớ đệm thành công!" });
      fetchLogs(); // refresh audit logs
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data || "Xóa bộ nhớ đệm thất bại." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetVector = async () => {
    if (!confirm("Bạn có chắc chắn muốn đánh dấu toàn bộ dữ liệu để re-embed lại vào fresh Vector DB?")) return;
    setActionLoading("reset-vector");
    setMessage(null);
    try {
      const res = await systemService.resetVector();
      setMessage({ type: "success", text: res || "Yêu cầu xây dựng lại Vector thành công!" });
      fetchLogs(); // refresh audit logs
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data || "Đặt lại Vector DB thất bại." });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter logs logic
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAction = filterAction === "all" || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  // Extract unique actions for filtering dropdown
  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));

  const getStatusBadge = (status: string) => {
    const isUp = status.startsWith("UP") || status === "PONG" || status === "ACTIVE";
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        isUp ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
      }`}>
        <span className={`w-2 h-2 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-gray-900 text-2xl font-black flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-600" />
            Quản trị Hệ thống (IT Admin)
          </h2>
          <p className="text-sm text-gray-500">Giám sát sức khỏe dịch vụ, xóa cache và kiểm tra nhật ký hoạt động (Audit Logs).</p>
        </div>
        <button
          onClick={() => { fetchHealth(); fetchLogs(); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới hệ thống
        </button>
      </div>

      {/* Message alert */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Health Checks & Maintenance Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Checks */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Activity className="w-5 h-5 text-green-500" /> Trạng thái các dịch vụ (Service Health)
          </h3>
          
          {isLoadingHealth ? (
            <div className="py-12 text-center text-gray-500 text-sm">Đang kiểm tra kết nối...</div>
          ) : health ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Relational Database</h4>
                    <p className="text-xs text-gray-400">PostgreSQL / MySQL</p>
                  </div>
                </div>
                {getStatusBadge(health.database)}
              </div>

              <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Redis Server</h4>
                    <p className="text-xs text-gray-400">Cache & Session store</p>
                  </div>
                </div>
                {getStatusBadge(health.redis)}
              </div>

              <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Elasticsearch</h4>
                    <p className="text-xs text-gray-400">Fuzzy search engine</p>
                  </div>
                </div>
                {getStatusBadge(health.elasticsearch)}
              </div>

              <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Chroma Vector DB</h4>
                    <p className="text-xs text-gray-400">AI search embeddings</p>
                  </div>
                </div>
                {getStatusBadge(health.chroma)}
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">Không thể tải thông tin sức khỏe hệ thống.</div>
          )}
        </div>

        {/* Maintenance Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Trash2 className="w-5 h-5 text-red-500" /> Thao tác bảo trì
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-700">Bộ nhớ đệm (Redis Cache)</h4>
              <p className="text-xs text-gray-400">Giải phóng dung lượng RAM, xóa toàn bộ cache cũ để nạp dữ liệu mới.</p>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={handleClearCache}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === "clear-cache" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Xóa toàn bộ Cache"}
              </button>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-700">Đồng bộ cơ sở dữ liệu AI</h4>
              <p className="text-xs text-gray-400">Đánh dấu tất cả sản phẩm, tin tức để nhúng lại vào Chroma Vector Database.</p>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={handleResetVector}
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === "reset-vector" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Đồng bộ lại Vector DB"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Nhật ký hoạt động hệ thống (Audit Logs)
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            {filteredLogs.length} logs
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo email, thao tác, chi tiết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-gray-500" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-sm text-gray-700"
            >
              <option value="all">Tất cả hoạt động</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          {isLoadingLogs ? (
            <div className="py-20 text-center text-gray-500 text-sm">Đang tải nhật ký hệ thống...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">Không tìm thấy bản ghi nhật ký hoạt động nào.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Dịch vụ</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("vi-VN") : "---"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{log.actorEmail}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">{log.targetType || "SYSTEM"}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono">{log.ipAddress || "N/A"}</td>
                    <td className="px-4 py-3.5 text-xs max-w-xs truncate" title={log.detail}>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
