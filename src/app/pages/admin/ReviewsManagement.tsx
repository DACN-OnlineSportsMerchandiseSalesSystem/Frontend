import { useState, useEffect, useMemo } from "react";
import { MessageSquare, Star, Trash2, Search, Filter, X, Send, CornerDownRight, CheckCircle, Clock } from "lucide-react";
import reviewService, { Review } from "../../../services/reviewService";

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<"ALL" | "REPLIED" | "UNREPLIED">("ALL");
  const [filterRating, setFilterRating] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST">("NEWEST");

  // Modal Reply
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        const matchesSearch = 
          review.userFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.userLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = 
          filterStatus === "ALL" ? true :
          filterStatus === "REPLIED" ? !!review.adminReply :
          !review.adminReply;

        const matchesRating = filterRating === "ALL" ? true : review.rating === filterRating;

        return matchesSearch && matchesStatus && matchesRating;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === "NEWEST" ? timeB - timeA : timeA - timeB;
      });
  }, [reviews, searchQuery, filterStatus, filterRating, sortBy]);

  const handleDeleteReview = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.")) {
      try {
        await reviewService.deleteReview(id);
        setReviews(reviews.filter(r => r.id !== id));
        if (selectedReview?.id === id) setReplyModalOpen(false);
      } catch (error) {
        alert("Lỗi khi xóa đánh giá.");
      }
    }
  };

  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || "");
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const updatedReview = await reviewService.replyReview(selectedReview.id, replyText);
      setReviews(reviews.map(r => r.id === selectedReview.id ? updatedReview : r));
      setReplyModalOpen(false);
    } catch (error) {
      alert("Có lỗi xảy ra khi gửi phản hồi.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Stats
  const totalReviews = reviews.length;
  const unrepliedCount = reviews.filter(r => !r.adminReply).length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý Đánh giá</h2>
          <p className="text-gray-500 mt-1">Theo dõi và phản hồi đánh giá từ khách hàng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tổng Đánh giá</p>
            <p className="text-3xl font-black text-gray-900">{totalReviews}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Chưa phản hồi</p>
            <p className="text-3xl font-black text-orange-600">{unrepliedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center">
            <Star className="w-7 h-7 fill-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Đánh giá TB</p>
            <p className="text-3xl font-black text-gray-900">{avgRating}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, email, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent text-sm font-medium focus:outline-none text-gray-700"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="UNREPLIED">Chưa trả lời</option>
                <option value="REPLIED">Đã trả lời</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <Star className="w-4 h-4 text-gray-500" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                className="bg-transparent text-sm font-medium focus:outline-none text-gray-700"
              >
                <option value="ALL">Tất cả số sao</option>
                <option value={5}>5 Sao</option>
                <option value={4}>4 Sao</option>
                <option value={3}>3 Sao</option>
                <option value={2}>2 Sao</option>
                <option value={1}>1 Sao</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none text-gray-700"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="OLDEST">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
            <p className="text-lg font-bold">Không tìm thấy đánh giá nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Đánh giá</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Nội dung</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {review.userFirstName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{review.userFirstName} {review.userLastName}</p>
                          <p className="text-xs text-gray-500">{review.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400 mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-bold text-gray-900 text-sm truncate">{review.title}</p>
                        <p className="text-gray-600 text-sm line-clamp-2 mt-0.5">{review.comment}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.adminReply ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã phản hồi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" /> Chờ phản hồi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openReplyModal(review)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Chi tiết đánh giá</h3>
              <button onClick={() => setReplyModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info & Review */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                      {selectedReview.userFirstName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedReview.userFirstName} {selectedReview.userLastName}</p>
                      <p className="text-xs text-gray-500">{selectedReview.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex text-yellow-400 justify-end mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= selectedReview.rating ? "fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedReview.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-2">{selectedReview.title}</h4>
                <p className="text-gray-700 leading-relaxed">{selectedReview.comment}</p>
              </div>

              {/* Reply Section */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phản hồi của người bán
                </label>
                <div className="relative">
                  <CornerDownRight className="w-5 h-5 text-gray-300 absolute left-4 top-4" />
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi khách hàng..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 resize-none"
                  />
                </div>
                {selectedReview.repliedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Lần phản hồi gần nhất: {new Date(selectedReview.repliedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setReplyModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={isSubmittingReply || !replyText.trim() || replyText === selectedReview.adminReply}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingReply ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Lưu phản hồi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
