import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Search,
  TrendingUp,
  Sparkles,
  User,
  Tag,
  Image as ImageIcon,
  Send,
  Check,
  Bookmark,
  Flame,
  Award,
  ShieldCheck,
  Clock,
  Filter,
  Users,
  Dumbbell,
  HelpCircle,
  X,
  ExternalLink,
  UploadCloud,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import uploadService from "../../services/uploadService";
import { useApp } from "../context/AppContext";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ForumComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  createdAt: string;
  content: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  categoryLabel: string;
  sportIcon: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  authorRole?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  imageUrl?: string;
  tags: string[];
  comments: ForumComment[];
  pinned?: boolean;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const INITIAL_POSTS: ForumPost[] = [
  {
    id: "post-1",
    title: "Kinh nghiệm Squat chạm đùi song song không đau lưng dưới sau 6 tháng áp dụng lịch tập AI",
    content: "Chào anh em cộng đồng SportZone! Trước đây mình hay bị đau nhói thắt lưng L4-L5 mỗi khi gánh đùi quá 80kg. Sau khi dùng Trợ lý AI phân tích và đổi sang stance rộng hơn 1.2 lần vai, kết hợp đeo đai bẩy SportZone Pro Lever Belt để gồng core (Bracing), form của mình đã cải thiện rõ rệt. Hiện tại mình đã rep được 110kg x 5 reps hoàn toàn êm ái. Ai đang gặp vấn đề tương tự thì nên chú ý góc gập cổ chân và độ linh hoạt khớp háng nhé!",
    category: "gym",
    categoryLabel: "Gym & Thể Hình",
    sportIcon: "💪",
    authorName: "Hoàng Nam",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorBadge: "Thành viên Vàng",
    authorRole: "Powerlifting 3 năm",
    createdAt: "30 phút trước",
    likesCount: 42,
    commentsCount: 6,
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    tags: ["squatform", "gym", "aiplanner", "powerlifting"],
    pinned: true,
    comments: [
      {
        id: "c-1-1",
        authorName: "HLV Trần Minh Khoa",
        authorAvatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&auto=format&fit=crop&q=80",
        authorBadge: "Chuyên Gia / HLV 1-1",
        createdAt: "20 phút trước",
        content: "Chuẩn xác bạn ơi! Động tác gồng ổ bụng (Valsalva Maneuver) kết hợp đai cứng tạo áp lực nội khoang bụng (IAP) giảm đến 40% tải trọng nén lên đĩa đệm. Rất hoan nghênh chia sẻ chuẩn khoa học!",
        likes: 12,
      },
      {
        id: "c-1-2",
        authorName: "Đức Thịnh",
        createdAt: "15 phút trước",
        content: "Bạn dùng giày đế phẳng gì vậy ạ? Mình đang phân vân giữa Nike Metcon và Converse.",
        likes: 3,
      },
    ],
  },
  {
    id: "post-2",
    title: "Review hành trình hoàn thành 21km VnExpress Marathon Quy Nhơn 2024 (Sub 2h) cho người mới",
    content: "Sau 16 tuần tích lũy kilomet với giáo án chạy cự ly dài từ Blog SportZone, cuối tuần rồi mình đã chính thức cán đích Half Marathon với thành tích 1h58m24s! Điều quan trọng nhất mình rút ra là: (1) Đừng xuất phát quá nhanh theo dòng người, giữ Pace 5:40 đều đặn; (2) Uống gel năng lượng đúng phút thứ 45 và 75; (3) Đi một đôi giày có đệm êm giảm chấn để bảo vệ đầu gối khi qua dốc cầu.",
    category: "running",
    categoryLabel: "Chạy Bộ & Marathon",
    sportIcon: "🏃",
    authorName: "Mai Phương",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    authorBadge: "Runner Hà Nội",
    authorRole: "Sub 2 Half Marathon",
    createdAt: "2 giờ trước",
    likesCount: 68,
    commentsCount: 9,
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80",
    tags: ["marathon", "chaybo", "sub2", "quynhon2024"],
    comments: [
      {
        id: "c-2-1",
        authorName: "Lê Quốc Dũng",
        authorBadge: "HLV Boxing & Chạy bộ",
        createdAt: "1 giờ trước",
        content: "Chúc mừng Mai Phương! Chiến thuật dinh dưỡng nạp gel chia theo mốc thời gian của bạn rất chuẩn chỉnh theo hướng dẫn y học thể thao.",
        likes: 8,
      },
      {
        id: "c-2-2",
        authorName: "Thanh Tùng",
        createdAt: "45 phút trước",
        content: "Ngưỡng mộ quá chị ơi! Cho em hỏi chị tập mấy buổi/tuần để đạt Sub 2 thế ạ?",
        likes: 2,
      },
    ],
  },
  {
    id: "post-3",
    title: "Thực đơn mẫu 2.100 kcal chuẩn Macro món Việt cho dân văn phòng bận rộn (Meal Prep cả tuần)",
    content: "Nhiều anh chị em than phiền rằng thực đơn trên mạng toàn đồ Tây (ức gà áp chảo, yến mạch, bơ) khó ăn lâu dài. Mình tổng hợp thực đơn thuần Việt: Sáng phở bò nạc ít bánh + trứng chần; Trưa cơm gạo lứt, cá nục kho thơm, canh rau mồng tơi cua; Tối thịt thăn nướng nồi chiên không dầu + rau củ luộc kho quẹt. Vừa đủ 140g Protein, vừa ngon miệng mà chi phí chưa tới 90k/ngày!",
    category: "nutrition",
    categoryLabel: "Dinh Dưỡng & Macro",
    sportIcon: "🥗",
    authorName: "HLV Thu Hương",
    authorAvatar: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=150&auto=format&fit=crop&q=80",
    authorBadge: "Precision Nutrition Coach",
    authorRole: "Chuyên Gia Dinh Dưỡng",
    createdAt: "4 giờ trước",
    likesCount: 89,
    commentsCount: 14,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
    tags: ["mealprep", "dinhduong", "giammo", "monviet"],
    comments: [
      {
        id: "c-3-1",
        authorName: "Nguyễn Hải Yến",
        createdAt: "3 giờ trước",
        content: "Bài viết tâm huyết quá chị ơi, lưu lại ngay để chủ nhật này đi chợ làm Meal prep!",
        likes: 5,
      },
    ],
  },
  {
    id: "post-4",
    title: "Tìm bạn chạy bộ quanh công viên Gia Định (TP.HCM) khung giờ 5h30 sáng các ngày 3-5-7",
    content: "Mình đang luyện giải chạy cự ly 10km, duy trì Pace 6:00 - 6:30 mỗi buổi từ 5 - 7km. Cần tìm 2-3 bạn chạy cùng để kéo pace và tạo động lực thức dậy sớm. Nhóm hiện có 2 người, rất hòa đồng vui vẻ, chạy xong có tiết mục cà phê giao lưu thể thao. Bạn nào ở khu vực Phú Nhuận / Gò Vấp quan tâm thì comment mình add nhóm Zalo nhé!",
    category: "group",
    categoryLabel: "Tìm Bạn Tập Cùng",
    sportIcon: "👥",
    authorName: "Tuấn Anh",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    authorBadge: "Thành viên Bạc",
    authorRole: "Runner Gò Vấp",
    createdAt: "6 giờ trước",
    likesCount: 31,
    commentsCount: 8,
    tags: ["timfantap", "giadinh", "pace6", "chaybosang"],
    comments: [
      {
        id: "c-4-1",
        authorName: "Trần Bảo Long",
        createdAt: "5 giờ trước",
        content: "Mình nhà ngay đường Hoàng Minh Giám này bạn ơi! Cho mình tham gia nhóm với nhé, số Zalo mình ib bạn.",
        likes: 2,
      },
    ],
  },
  {
    id: "post-5",
    title: "Viêm gân bánh chè (Jumper's Knee) nhẹ sau khi tập gánh đùi, nên phục hồi và tập lại thế nào?",
    content: "Đợt trước mình có tập Squat tạ hơi nặng và tiếp đất khi nhảy dây bị dằn. Khớp gối dưới bánh chè bị ê ẩm khi leo cầu thang. Mình đã nghỉ ngơi chườm lạnh 1 tuần thấy đỡ hơn. Nhờ các anh chị có chuyên môn tư vấn giúp mình các bài tập đẳng trường (Isometric) để phục hồi gân trước khi gánh tạ lại với ạ!",
    category: "recovery",
    categoryLabel: "Chấn Thương & Phục Hồi",
    sportIcon: "🛡️",
    authorName: "Minh Đức",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    authorBadge: "Người Mới Bắt Đầu",
    authorRole: "Hội Viên Gym 6 tháng",
    createdAt: "8 giờ trước",
    likesCount: 35,
    commentsCount: 11,
    tags: ["chanthuong", "jumpersknee", "phuchoi", "isometric"],
    comments: [
      {
        id: "c-5-1",
        authorName: "Nguyễn Thị Lan",
        authorBadge: "ACSM CPT · Phục Hồi Chấn Thương",
        createdAt: "7 giờ trước",
        content: "Chào bạn Đức! Viêm gân bánh chè bạn nên ưu tiên bài Wall Sit (ngồi dựa tường) giữ tĩnh 45 giây x 4 hiệp, góc gối khoảng 60 độ. Tránh tuyệt đối bài Leg Extension tạ nặng. Khi tập lại nên đeo băng bảo vệ gân bánh chè (Patella Strap) nhé.",
        likes: 14,
      },
    ],
  },
  {
    id: "post-6",
    title: "Đánh giá chi tiết: Giày Nike Metcon 9 sau 3 tháng cày Squat, Deadlift và bài tập Functional",
    content: "Được tư vấn từ Trợ lý AI của SportZone, mình đã sắm đôi Nike Metcon 9 bản phối màu trắng đen. Điểm cộng lớn nhất là bản đế sau Hyperlift siêu cứng cáp, gót không hề bị xẹp lún dù mình gánh 140kg. Phần bọc cao su hỗ trợ leo dây thừng rất chắc chắn. Nhược điểm duy nhất là đế hơi cứng nên nếu dùng để chạy máy Treadmill trên 2km sẽ hơi tức gan bàn chân. Khuyên anh em tập tạ nặng nên sở hữu 1 đôi!",
    category: "review",
    categoryLabel: "Review Đồ Tập",
    sportIcon: "👟",
    authorName: "Quang Huy",
    authorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    authorBadge: "Gear Reviewer",
    authorRole: "CrossFit Enthusiast",
    createdAt: "1 ngày trước",
    likesCount: 57,
    commentsCount: 16,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    tags: ["nikemetcon9", "review", "giaytapgym", "crossfit"],
    comments: [
      {
        id: "c-6-1",
        authorName: "Phan Văn Nam",
        createdAt: "22 giờ trước",
        content: "Chuẩn bạn ơi, Metcon sinh ra là để bám sàn cử tạ chứ không phải chạy cự ly. Mình cũng dùng bản 9 này thấy khóa gót êm hơn hẳn bản 8.",
        likes: 4,
      },
    ],
  },
];

// ─── CATEGORY FILTERS ─────────────────────────────────────────────────────────

const FORUM_CATEGORIES = [
  { id: "all", label: "Tất cả bài viết", icon: "🌐" },
  { id: "hot", label: "🔥 Sôi nổi nhất", icon: "🔥" },
  { id: "gym", label: "🏋️ Gym & Thể Hình", icon: "🏋️" },
  { id: "running", label: "🏃 Chạy Bộ & Marathon", icon: "🏃" },
  { id: "nutrition", label: "🥗 Dinh Dưỡng & Giảm Mỡ", icon: "🥗" },
  { id: "group", label: "👥 Tìm Bạn Tập", icon: "👥" },
  { id: "recovery", label: "🛡️ Chấn Thương & Phục Hồi", icon: "🛡️" },
  { id: "review", label: "👟 Review Đồ Tập", icon: "👟" },
];

export function Forum() {
  const { user, isLoggedIn } = useApp();

  // State
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    try {
      const saved = localStorage.getItem("sportzone_forum_posts");
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "comments">("newest");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>(() => {
    try {
      const savedLikes = localStorage.getItem("sportzone_forum_likes");
      return savedLikes ? JSON.parse(savedLikes) : {};
    } catch {
      return {};
    }
  });

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Enhanced Modal & Image Upload State
  const [modalMode, setModalMode] = useState<"edit" | "preview">("edit");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageUploadSource, setImageUploadSource] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageUpload(file);
  };

  const processImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, WebP, GIF)!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Dung lượng file ảnh tối đa là 10MB!");
      return;
    }

    try {
      setIsUploadingImage(true);
      const res = await uploadService.uploadForumImage(file);
      if (res && res.url) {
        setNewImageUrl(res.url);
        triggerToast("☁️ Đã lưu trữ ảnh bài viết lên hệ thống Cloudinary thành công!");
      }
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      triggerToast("⚠️ Không thể upload ảnh lên Cloudinary, vui lòng thử lại!");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageUpload(file);
    }
  };

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("gym");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [authorNameCustom, setAuthorNameCustom] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("sportzone_forum_posts", JSON.stringify(posts));
    } catch (e) {
      console.warn("Lưu LocalStorage thất bại:", e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem("sportzone_forum_likes", JSON.stringify(likedPosts));
    } catch (e) {
      console.warn("Lưu LocalStorage likes thất bại:", e);
    }
  }, [likedPosts]);

  // Handle Like Post
  const handleToggleLike = (postId: string) => {
    const isCurrentlyLiked = !!likedPosts[postId];
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !isCurrentlyLiked,
    }));

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: isCurrentlyLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
          };
        }
        return post;
      })
    );

    triggerToast(
      isCurrentlyLiked ? "Đã bỏ thả tim bài viết" : "❤️ Đã thả tim bài viết thành công!"
    );
  };

  // Toggle Comment Tray
  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Handle Submit Comment
  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    const currentAuthor =
      user?.fullName || authorNameCustom.trim() || (isLoggedIn ? "Hội viên SportZone" : "Người dùng Thể thao");

    const newComment: ForumComment = {
      id: "c-" + Date.now(),
      authorName: currentAuthor,
      authorAvatar: user?.avatar || undefined,
      authorBadge: user?.rank ? `Thành viên ${user.rank}` : "Thành viên Cộng đồng",
      createdAt: "Vừa xong",
      content: text,
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = [newComment, ...(p.comments || [])];
          return {
            ...p,
            comments: updatedComments,
            commentsCount: updatedComments.length,
          };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    triggerToast("💬 Đã gửi bình luận của bạn thành công!");
  };

  // Handle Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Vui lòng điền đầy đủ Tiêu đề và Nội dung bài viết!");
      return;
    }

    const catObj = FORUM_CATEGORIES.find((c) => c.id === newCategory) || FORUM_CATEGORIES[2];
    const author =
      user?.fullName || authorNameCustom.trim() || (isLoggedIn ? "Hội viên SportZone" : "Vận động viên SportZone");

    const tagsArray = newTags
      .split(/[,\s#]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const createdPost: ForumPost = {
      id: "post-" + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      categoryLabel: catObj.label.replace(/^[^\w\s]*\s*/, ""),
      sportIcon: catObj.icon,
      authorName: author,
      authorAvatar: user?.avatar || undefined,
      authorBadge: user?.rank ? `Thành viên ${user.rank}` : "Cộng Đồng Thể Thao",
      authorRole: "Thành viên SportZone",
      createdAt: "Vừa xong",
      likesCount: 1, // Author automatically likes their post
      commentsCount: 0,
      imageUrl: newImageUrl.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ["thethao", newCategory],
      comments: [],
    };

    setPosts([createdPost, ...posts]);
    setLikedPosts((prev) => ({ ...prev, [createdPost.id]: true }));

    // Reset Form
    setNewTitle("");
    setNewContent("");
    setNewImageUrl("");
    setNewTags("");
    setModalMode("edit");
    setShowCreateModal(false);
    triggerToast("🎉 Chúc mừng! Bài viết của bạn đã được đăng lên Diễn đàn!");
  };

  // Filter & Sort Logic
  const filteredPosts = posts
    .filter((post) => {
      // Category filter
      if (activeCategory === "hot") {
        if (post.likesCount < 30 && post.commentsCount < 8) return false;
      } else if (activeCategory !== "all" && post.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = post.title.toLowerCase().includes(q);
        const inContent = post.content.toLowerCase().includes(q);
        const inAuthor = post.authorName.toLowerCase().includes(q);
        const inTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inAuthor && !inTags) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "likes") return b.likesCount - a.likesCount;
      if (sortBy === "comments") return b.commentsCount - a.commentsCount;
      return 0; // Default order (newest first)
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ─── HERO HEADER ──────────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white p-8 md:p-12 mb-8 shadow-2xl border border-blue-800/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-500/10 transform skew-x-12 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-300 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5" />
              SportZone Fitness Community Hub
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 leading-tight">
              DIỄN ĐÀN THỂ THAO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                GIAO LƯU & CHIA SẺ KINH NGHIỆM
              </span>
            </h1>
            <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed mb-6">
              Không gian mở để học viên, runners, gymer và chuyên gia thể thao cùng trao đổi kỹ thuật, sửa form bài tập, chia sẻ thực đơn dinh dưỡng và tìm bạn đồng hành rèn luyện.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>+ Đăng Bài Viết Mới</span>
              </button>
              <Link
                to="/ai-planner"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Tạo Kế Hoạch AI & Chia Sẻ</span>
              </Link>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-white/10 text-center sm:text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                  {posts.length + 2480}+
                </div>
                <div className="text-xs text-blue-200/70">Bài viết trao đổi</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                  {posts.reduce((acc, p) => acc + p.likesCount, 0) + 14200}+
                </div>
                <div className="text-xs text-blue-200/70">Lượt thả tim</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                  {posts.reduce((acc, p) => acc + p.commentsCount, 0) + 8500}+
                </div>
                <div className="text-xs text-blue-200/70">Bình luận giải đáp</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CONTROLS: CATEGORIES, SEARCH & SORT ──────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {FORUM_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search bar & Sort selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết, kỹ thuật Squat, chạy bộ, dinh dưỡng..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Sắp xếp:
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {[
                  { id: "newest", label: "Mới nhất" },
                  { id: "likes", label: "Nhiều tim ❤️" },
                  { id: "comments", label: "Sôi nổi 💬" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sortBy === s.id
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN LAYOUT: POSTS FEED + SIDEBAR ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Posts Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center text-gray-500">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Không tìm thấy bài viết phù hợp
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Hãy thử tìm kiếm với từ khóa khác hoặc là người đầu tiên tạo bài viết về chủ đề này!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  + Đăng bài viết ngay
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = !!likedPosts[post.id];
                const showComments = !!expandedComments[post.id];

                return (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Post Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.authorAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=0284c7&color=fff`
                            }
                            alt={post.authorName}
                            className="w-11 h-11 rounded-2xl object-cover border border-gray-200 dark:border-slate-700 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                {post.authorName}
                              </h4>
                              {post.authorBadge && (
                                <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                                  {post.authorBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span>{post.authorRole || "Thành viên"}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {post.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {post.pinned && (
                          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                            📌 Ghim nổi bật
                          </span>
                        )}
                      </div>

                      {/* Category Pill */}
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                          <span>{post.sportIcon}</span>
                          <span>{post.categoryLabel}</span>
                        </span>
                      </div>

                      {/* Title & Body */}
                      <h3 className="text-gray-900 dark:text-gray-100 font-black text-lg sm:text-xl leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-4">
                        {post.content}
                      </p>

                      {/* Attached Image (if any) */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 max-h-96">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Hashtags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => setSearchQuery(tag)}
                              className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 px-2 py-0.5 rounded-md cursor-pointer transition-colors font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Bar (Thả tim, Bình luận, Chia sẻ) */}
                    <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Heart / Like Button */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-90 ${
                            isLiked
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 transition-transform ${
                              isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
                            }`}
                          />
                          <span>{post.likesCount} Thả tim</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span>{post.commentsCount} Bình luận</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Share Button */}
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(window.location.href);
                            }
                            triggerToast("🔗 Đã sao chép liên kết bài viết vào bộ nhớ đệm!");
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Chia sẻ bài viết"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chia sẻ</span>
                        </button>
                      </div>
                    </div>

                    {/* ─── COMMENTS SECTION (TRAY) ─────────────────────────────────── */}
                    {showComments && (
                      <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-slate-800 space-y-4 animate-fade-in">
                        {/* New Comment Input */}
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user?.fullName || "You"
                              )}&background=2563eb&color=fff`
                            }
                            alt="Avatar"
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                              placeholder="Viết bình luận, chia sẻ góc nhìn hoặc hỏi đáp kỹ thuật..."
                              className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!(commentInputs[post.id] || "").trim()}
                              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Gửi</span>
                            </button>
                          </div>
                        </div>

                        {/* List of comments */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3 pt-2">
                            {post.comments.map((cmt) => (
                              <div
                                key={cmt.id}
                                className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3 shadow-xs"
                              >
                                <img
                                  src={
                                    cmt.authorAvatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      cmt.authorName
                                    )}&background=0284c7&color=fff`
                                  }
                                  alt={cmt.authorName}
                                  className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-gray-900 dark:text-gray-100">
                                        {cmt.authorName}
                                      </span>
                                      {cmt.authorBadge && (
                                        <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                                          {cmt.authorBadge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {cmt.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {cmt.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-xs text-gray-400 py-3 italic">
                            Chưa có bình luận nào. Hãy là người đầu tiên thảo luận về bài viết này!
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Create Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block">
                Cộng Đồng Thể Thao
              </span>
              <h3 className="text-xl font-black uppercase mb-2">Bạn có thắc mắc thể hình hay chạy bộ?</h3>
              <p className="text-blue-100 text-xs leading-relaxed mb-5">
                Chia sẻ câu hỏi, nhật ký tập luyện hoặc hành trình thay đổi vóc dáng của bạn để nhận góp ý từ HLV và cộng đồng.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-white hover:bg-blue-50 text-blue-800 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
              >
                + Bắt đầu viết bài mới
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Chủ Đề Thảo Luận Hot</span>
              </div>
              <div className="space-y-3">
                {[
                  { tag: "squatform", title: "Sửa form Squat tránh chấn thương", count: "184 bài" },
                  { tag: "marathon", title: "Chiến thuật cự ly 21km & 42km", count: "142 bài" },
                  { tag: "mealprep", title: "Thực đơn dinh dưỡng chuẩn Macro", count: "98 bài" },
                  { tag: "nikemetcon", title: "Review giày tập cử tạ & crossfit", count: "76 bài" },
                  { tag: "aiplanner", title: "Hỏi đáp lịch tập cá nhân hóa AI", count: "65 bài" },
                ].map((item) => (
                  <div
                    key={item.tag}
                    onClick={() => setSearchQuery(item.tag)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                        #{item.tag}
                      </div>
                      <div className="text-[11px] text-gray-500">{item.title}</div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors Leaderboard */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Thành Viên Tích Cực</span>
              </div>
              <div className="space-y-3.5">
                {[
                  { name: "HLV Trần Minh Khoa", role: "HLV 1-1 Chuyên nghiệp", pts: "1.840 pts", rank: "Top 1" },
                  { name: "Mai Phương", role: "Sub 2 Half Marathon", pts: "1.420 pts", rank: "Top 2" },
                  { name: "HLV Thu Hương", role: "Precision Nutrition Coach", pts: "1.150 pts", rank: "Top 3" },
                  { name: "Hoàng Nam", role: "Powerlifting 3 năm", pts: "980 pts", rank: "Top 4" },
                ].map((member, i) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                        #{i + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{member.name}</div>
                        <div className="text-[10px] text-gray-500">{member.role}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {member.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Standards Card */}
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 text-xs text-gray-600 dark:text-gray-400 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Quy Chuẩn Diễn Đàn SportZone</span>
              </div>
              <p>• Tôn trọng, văn minh và hỗ trợ tận tâm người mới bắt đầu tập luyện.</p>
              <p>• Khuyến khích chia sẻ các kiến thức dựa trên cơ sở khoa học y học thể thao.</p>
              <p>• Nghiêm cấm quảng cáo sản phẩm không rõ nguồn gốc hoặc spam nội dung.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ENHANCED CREATE POST MODAL (CLOUDINARY & LIVE DEMO PREVIEW) ────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-fade-in flex flex-col justify-between">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setModalMode("edit");
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header & Tabs */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-blue-600 tracking-widest block mb-1">
                  SportZone Fitness Community
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 uppercase">
                  {modalMode === "edit" ? "TẠO BÀI VIẾT MỚI" : "XEM TRƯỚC DEMO BÀI ĐĂNG"}
                </h3>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setModalMode("edit")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalMode === "edit"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>✏️ Chỉnh sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode("preview")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalMode === "preview"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>👁️ Xem trước Demo</span>
                  {newTitle.trim() && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: EDIT MODE */}
            {modalMode === "edit" ? (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Tiêu đề bài viết *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Kinh nghiệm khắc phục đau khớp gối khi Squat, review giày Nike Metcon..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Chuyên mục diễn đàn *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="gym">🏋️ Gym & Thể Hình</option>
                      <option value="running">🏃 Chạy Bộ & Marathon</option>
                      <option value="nutrition">🥗 Dinh Dưỡng & Giảm Mỡ</option>
                      <option value="group">👥 Tìm Bạn Tập Cùng</option>
                      <option value="recovery">🛡️ Chấn Thương & Phục Hồi</option>
                      <option value="review">👟 Review Đồ Tập & Giày</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Tên hiển thị người đăng
                    </label>
                    <input
                      type="text"
                      value={authorNameCustom}
                      onChange={(e) => setAuthorNameCustom(e.target.value)}
                      placeholder={user?.fullName || "Tên hoặc biệt danh của bạn..."}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nội dung chi tiết *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Mô tả kỹ hành trình, thông số tập luyện, câu hỏi cần giải đáp hoặc kinh nghiệm thực chiến của bạn..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
                  />
                </div>

                {/* ─── ENHANCED CLOUDINARY IMAGE UPLOAD SECTION ───────────────── */}
                <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>Hình ảnh bài viết (Lưu trữ Cloudinary)</span>
                    </label>

                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageUploadSource("upload")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          imageUploadSource === "upload"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        📤 Tải ảnh lên
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadSource("url")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          imageUploadSource === "url"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        🔗 URL / Mẫu
                      </button>
                    </div>
                  </div>

                  {imageUploadSource === "upload" ? (
                    <div>
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />

                      {newImageUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 group">
                          <img
                            src={newImageUrl}
                            alt="Uploaded preview"
                            className="w-full max-h-60 object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>☁️ Cloudinary CDN Storage</span>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-black/75 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Đổi ảnh
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewImageUrl("")}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold p-1.5 rounded-xl transition-all cursor-pointer"
                              title="Xóa ảnh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                          }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                            dragOver
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                              : "border-gray-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {isUploadingImage ? (
                            <div className="py-4 space-y-2">
                              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                Đang tải và tối ưu ảnh lên Cloudinary CDN...
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                                <UploadCloud className="w-6 h-6" />
                              </div>
                              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                Kéo & thả file ảnh vào đây, hoặc <span className="text-blue-600 dark:text-blue-400 underline">bấm để chọn ảnh từ máy tính</span>
                              </div>
                              <div className="text-[11px] text-gray-400">
                                Hỗ trợ: JPG, PNG, WebP (Tối đa 10MB) · Lưu trữ an toàn trên Cloudinary
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Dán link ảnh trực tiếp (https://...)"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] text-gray-400">Ảnh mẫu gợi ý:</span>
                        {[
                          { label: "🏋️ Gym Squat", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800" },
                          { label: "🏃 Chạy Marathon", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800" },
                          { label: "🥗 Meal Prep", url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800" },
                          { label: "👟 Giày Nike Metcon", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setNewImageUrl(preset.url)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Hashtags (Phân tách bằng dấu cách hoặc phẩy)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="gym, squatform, chaybo, mealprep..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newTitle.trim() || !newContent.trim()) {
                        alert("Vui lòng nhập ít nhất Tiêu đề và Nội dung để xem trước Demo!");
                        return;
                      }
                      setModalMode("preview");
                    }}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem Trước Demo</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Đăng Bài Viết Lên Diễn Đàn →</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: LIVE DEMO PREVIEW MODE */
              <div className="space-y-5 animate-fade-in">
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-2xl flex items-center gap-3 text-xs text-blue-800 dark:text-blue-300">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Giao diện thực tế của bài viết (Live Preview Demo)</span>
                    <span>Đây là hình ảnh bài đăng của bạn sẽ hiển thị với tất cả thành viên trên Diễn đàn SportZone sau khi xuất bản.</span>
                  </div>
                </div>

                {/* Post Preview Article Card */}
                <article className="bg-white dark:bg-slate-900 border-2 border-blue-400/60 dark:border-blue-700/60 rounded-3xl overflow-hidden shadow-lg">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={
                          user?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            authorNameCustom.trim() || user?.fullName || "You"
                          )}&background=2563eb&color=fff`
                        }
                        alt="Author"
                        className="w-11 h-11 rounded-2xl object-cover border border-gray-200 dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                            {authorNameCustom.trim() || user?.fullName || (isLoggedIn ? "Hội viên SportZone" : "Bạn")}
                          </h4>
                          <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                            {user?.rank ? `Thành viên ${user.rank}` : "Thành viên Mới"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>Vừa xong</span>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-emerald-500 font-bold">● Bản xem trước</span>
                        </div>
                      </div>
                    </div>

                    {/* Category Pill */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                        <span>{FORUM_CATEGORIES.find((c) => c.id === newCategory)?.icon || "🏋️"}</span>
                        <span>{FORUM_CATEGORIES.find((c) => c.id === newCategory)?.label || "Gym & Thể Hình"}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-gray-900 dark:text-gray-100 font-black text-xl leading-snug mb-3">
                      {newTitle || "Chưa có tiêu đề bài viết"}
                    </h3>

                    {/* Content */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-4">
                      {newContent || "Chưa có nội dung mô tả..."}
                    </p>

                    {/* Attached Image Preview */}
                    {newImageUrl && (
                      <div className="rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 max-h-96">
                        <img
                          src={newImageUrl}
                          alt="Demo attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Hashtags */}
                    {newTags.trim() && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {newTags
                          .split(/[,\s#]+/)
                          .filter((t) => t.trim().length > 0)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 px-2 py-0.5 rounded-md font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Mock Action Bar */}
                  <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-rose-500">
                        <Heart className="w-4 h-4 fill-rose-500" />
                        <span>1 Thả tim (Tự động)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>0 Bình luận</span>
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                    </span>
                  </div>
                </article>

                {/* Preview Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setModalMode("edit")}
                    className="px-5 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>← Quay lại chỉnh sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreatePost}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác Nhận & Đăng Bài Lên Diễn Đàn Ngay →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

            {/* ─── TOAST NOTIFICATION ─────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in text-xs font-bold backdrop-blur-md">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
            ✓
          </span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
