import { useState, useEffect } from "react";
import { RotateCcw, Eye, CheckCircle, XCircle, Clock, Loader2, AlertCircle, X, Package, RefreshCw } from "lucide-react";
import returnService, { ReturnRequestDTO } from "../../../services/returnService";
import { formatPrice } from "../../data/products";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Chờ xử lý",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200",  icon: <Clock className="w-4 h-4 text-yellow-600" /> },
  APPROVED: { label: "Đã duyệt",   color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
  REJECTED: { label: "Từ chối",    color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: <XCircle className="w-4 h-4 text-red-600" /> },
};

export function ReturnsManagement() {
  const [returns, setReturns] = useState<ReturnRequestDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestDTO | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchReturns = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await returnService.getAllReturns();
      setReturns(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách yêu cầu hoàn trả");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReturns(); }, []);

  const handleProcess = async (id: number, action: 'APPROVE' | 'REJECT') => {
    setProcessing(id);
    try {
      await returnService.processReturn(id, action);
      await fetchReturns();
      if (selectedReturn?.id === id) setSelectedReturn(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Xử lý thất bại");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = returns.filter(r =>
    filterStatus === "ALL" || (r.status || "PENDING") === filterStatus
  );

  const counts = {
    ALL: returns.length,
    PENDING: returns.filter(r => (r.status || "PENDING") === "PENDING").length,
    APPROVED: returns.filter(r => r.status === "APPROVED").length,
    REJECTED: returns.filter(r => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý Hoàn trả</h2>
          <p className="text-sm text-gray-500 mt-1">Duyệt và xử lý yêu cầu đổi trả từ khách hàng</p>
        </div>
        <button
          onClick={fetchReturns}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "ALL",      label: "Tất cả" },
            { key: "PENDING",  label: "Chờ xử lý" },
            { key: "APPROVED", label: "Đã duyệt" },
            { key: "REJECTED", label: "Từ chối" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === tab.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({counts[tab.key as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách yêu cầu hoàn trả...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <RotateCcw className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-400">Không có yêu cầu hoàn trả nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lý do</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hoàn tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(ret => {
                  const st = statusConfig[ret.status || "PENDING"] || statusConfig.PENDING;
                  const isPending = (ret.status || "PENDING") === "PENDING";
                  return (
                    <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600">#{ret.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">#{ret.orderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate">{ret.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ret.returnItems?.length || 0} sp</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {ret.refundAmount ? formatPrice(ret.refundAmount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.bg} ${st.color}`}>
                          {st.icon}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReturn(ret)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleProcess(ret.id!, 'APPROVE')}
                                disabled={processing === ret.id}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Duyệt"
                              >
                                {processing === ret.id
                                  ? <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                                  : <CheckCircle className="w-4 h-4 text-green-600" />
                                }
                              </button>
                              <button
                                onClick={() => handleProcess(ret.id!, 'REJECT')}
                                disabled={processing === ret.id}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Từ chối"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
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

      {/* Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-lg font-black text-gray-900">Chi tiết Yêu cầu Hoàn trả #{selectedReturn.id}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Đơn hàng #{selectedReturn.orderId}</p>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Badge */}
              {(() => {
                const st = statusConfig[selectedReturn.status || "PENDING"] || statusConfig.PENDING;
                return (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${st.bg} ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {selectedReturn.createdAt ? new Date(selectedReturn.createdAt).toLocaleString("vi-VN") : ""}
                    </p>
                  </div>
                );
              })()}

              {/* Reason */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-1">Lý do hoàn trả</p>
                <p className="text-gray-800 text-sm">{selectedReturn.reason}</p>
              </div>

              {/* Return Items */}
              {selectedReturn.returnItems && selectedReturn.returnItems.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Sản phẩm yêu cầu hoàn ({selectedReturn.returnItems.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedReturn.returnItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        {item.imageProof ? (
                          <img src={item.imageProof} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.productName || `Sản phẩm #${item.orderItemId}`}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Số lượng hoàn: <span className="font-bold text-gray-800">{item.quantity}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refund */}
              {selectedReturn.refundAmount != null && selectedReturn.refundAmount > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                  <p className="text-sm font-bold text-green-700">Số tiền hoàn trả</p>
                  <p className="text-xl font-black text-green-700">{formatPrice(selectedReturn.refundAmount)}</p>
                </div>
              )}

              {/* Actions */}
              {(selectedReturn.status || "PENDING") === "PENDING" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleProcess(selectedReturn.id!, 'REJECT')}
                    disabled={processing === selectedReturn.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleProcess(selectedReturn.id!, 'APPROVE')}
                    disabled={processing === selectedReturn.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {processing === selectedReturn.id
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <CheckCircle className="w-5 h-5" />
                    }
                    Duyệt hoàn trả
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
