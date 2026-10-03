import { useState } from "react";
import { Link } from "react-router";

// ─── DATA ────────────────────────────────────────────────────────────────────

const trainers = [
  {
    id: 1,
    name: "Trần Minh Khoa",
    cert: "ACE CPT · NASM CNC",
    specialty: "Gym & Powerlifting",
    mode: "offline",
    gender: "male",
    exp: "7 năm",
    rating: 4.9,
    reviews: 134,
    price: "350.000₫/buổi",
    tag: "Top Rated",
    img: "photo-1571019613454-1cb2f99b2d8b",
    bio: "Chuyên gia sức mạnh, vô địch powerlifting quốc gia 2022.",
  },
  {
    id: 2,
    name: "Nguyễn Thị Lan",
    cert: "ACSM · Yoga Alliance 500H",
    specialty: "Pilates & Phục hồi",
    mode: "online",
    gender: "female",
    exp: "5 năm",
    rating: 4.8,
    reviews: 98,
    price: "280.000₫/buổi",
    tag: "Bán chạy",
    img: "photo-1594736797933-d0501ba2fe65",
    bio: "Chuyên phục hồi chấn thương, tư thế và linh hoạt vận động.",
  },
  {
    id: 3,
    name: "Lê Quốc Dũng",
    cert: "NSCA CSCS · Boxing Coach",
    specialty: "Boxing & HIIT",
    mode: "offline",
    gender: "male",
    exp: "9 năm",
    rating: 4.7,
    reviews: 211,
    price: "400.000₫/buổi",
    tag: "Nhiều kinh nghiệm",
    img: "photo-1517836357463-d25dfeac3438",
    bio: "Cựu vận động viên Boxing, chuyên đốt mỡ tốc độ cao.",
  },
  {
    id: 4,
    name: "Phạm Thu Hương",
    cert: "NASM CPT · Precision Nutrition",
    specialty: "Gym & Dinh dưỡng",
    mode: "online",
    gender: "female",
    exp: "4 năm",
    rating: 4.9,
    reviews: 76,
    price: "320.000₫/buổi",
    tag: "Mới nổi",
    img: "photo-1609899537878-48b5d4564fca",
    bio: "Kết hợp tập luyện và lên thực đơn cá nhân hóa theo mục tiêu.",
  },
];

const digitalProducts = [
  {
    id: 1,
    title: "Giáo án Tăng Cơ 12 Tuần",
    type: "PDF + Video",
    level: "Intermediate",
    duration: "12 tuần · 5 ngày/tuần",
    rating: 4.8,
    reviews: 312,
    price: "299.000₫",
    oldPrice: "450.000₫",
    img: "photo-1581009146145-b5ef050c2e1e",
    tag: "Bán chạy #1",
    preview: true,
  },
  {
    id: 2,
    title: "Ebook Dinh Dưỡng Khoa Học",
    type: "Ebook PDF",
    level: "Beginner",
    duration: "180 trang · tự đọc",
    rating: 4.7,
    reviews: 189,
    price: "149.000₫",
    oldPrice: "220.000₫",
    img: "photo-1490645935967-10de6ba17061",
    tag: "Mới nhất",
    preview: true,
  },
  {
    id: 3,
    title: "Khoá Video Giảm Mỡ HIIT",
    type: "Video Course",
    level: "Beginner",
    duration: "8 tuần · 30 phút/ngày",
    rating: 4.9,
    reviews: 427,
    price: "499.000₫",
    oldPrice: "799.000₫",
    img: "photo-1571019614242-c5c5dee9f50b",
    tag: "Hot nhất",
    preview: true,
  },
  {
    id: 4,
    title: "App Membership 3 Tháng",
    type: "App Access",
    level: "All Levels",
    duration: "90 ngày · không giới hạn",
    rating: 4.6,
    reviews: 543,
    price: "399.000₫",
    oldPrice: "600.000₫",
    img: "photo-1607962837359-5e7e89f86776",
    tag: "Toàn diện nhất",
    preview: false,
  },
];

const gymPlans = [
  {
    id: 1,
    name: "Gói Tháng",
    price: "490.000₫",
    period: "/tháng",
    popular: false,
    perks: [
      "Tập không giới hạn 1 chi nhánh",
      "Tủ đồ cá nhân",
      "Nước uống miễn phí",
      "Wifi tốc độ cao",
    ],
    missing: ["Xông hơi", "Đa chi nhánh", "Ưu tiên đặt lịch"],
  },
  {
    id: 2,
    name: "Gói Quý",
    price: "1.290.000₫",
    period: "/3 tháng",
    popular: false,
    perks: [
      "Tập không giới hạn 1 chi nhánh",
      "Tủ đồ cá nhân",
      "Xông hơi 2x/tuần",
      "Nước uống miễn phí",
      "Wifi tốc độ cao",
    ],
    missing: ["Đa chi nhánh", "Ưu tiên đặt lịch"],
  },
  {
    id: 3,
    name: "Gói Năm",
    price: "3.990.000₫",
    period: "/năm",
    popular: true,
    perks: [
      "Tập không giới hạn tất cả chi nhánh",
      "Tủ đồ cá nhân khoá số",
      "Xông hơi không giới hạn",
      "Nước uống & khăn miễn phí",
      "Ưu tiên đặt lịch máy",
      "1 buổi đánh giá thể trạng/quý",
    ],
    missing: [],
  },
  {
    id: 4,
    name: "Thẻ VIP",
    price: "7.900.000₫",
    period: "/năm",
    popular: false,
    perks: [
      "Tất cả quyền lợi Gói Năm",
      "4 buổi PT miễn phí/tháng",
      "Phòng tập riêng theo giờ",
      "Dinh dưỡng tư vấn 1-1",
      "Hỗ trợ 24/7 qua app",
      "Ưu đãi đối tác độc quyền",
    ],
    missing: [],
  },
];

const recommendedSportsProducts = [
  {
    id: 101,
    name: "Giày Tập Training Nike Metcon 9",
    category: "shoes",
    categoryLabel: "Giày & Phục Trang",
    tag: "Khuyên dùng cho Gym/PT",
    price: "3.290.000₫",
    oldPrice: "3.750.000₫",
    rating: 4.9,
    reviews: 184,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "Đế bằng vững chãi, khóa gót gia cố chống lún khi Squat/Deadlift nặng.",
    badgeColor: "bg-blue-600 text-white"
  },
  {
    id: 102,
    name: "Bộ Tạ Tay Điều Chỉnh Đa Năng Bowflex 24kg",
    category: "gear",
    categoryLabel: "Tạ & Kháng Lực",
    tag: "Tập Luyện Tại Nhà",
    price: "2.850.000₫",
    oldPrice: "3.500.000₫",
    rating: 4.8,
    reviews: 92,
    img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
    description: "Thay thế 15 cặp tạ đơn với núm xoay điều chỉnh từ 2kg đến 24kg linh hoạt.",
    badgeColor: "bg-emerald-600 text-white"
  },
  {
    id: 103,
    name: "Đai Lưng Tập Tạ Da Bò SportZone Pro Lever Belt",
    category: "protection",
    categoryLabel: "Phụ Kiện Bảo Hộ",
    tag: "An Toàn Chấn Thương",
    price: "650.000₫",
    oldPrice: "850.000₫",
    rating: 4.9,
    reviews: 215,
    img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    description: "Khóa bẩy kim loại thép tôi cao cấp, nâng đỡ áp lực ổ bụng và bảo vệ cột sống thắt lưng.",
    badgeColor: "bg-amber-600 text-white"
  },
  {
    id: 104,
    name: "Bình Lắc Thông Minh SportZone Shaker 750ml (3 Ngăn)",
    category: "nutrition",
    categoryLabel: "Dụng Cụ Dinh Dưỡng",
    tag: "Phụ Kiện Thiết Yếu",
    price: "185.000₫",
    oldPrice: "250.000₫",
    rating: 4.7,
    reviews: 430,
    img: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&auto=format&fit=crop&q=80",
    description: "Nhựa Tritan an toàn không chứa BPA, có ngăn phụ đựng bột Whey và viên vitamin.",
    badgeColor: "bg-purple-600 text-white"
  },
  {
    id: 105,
    name: "Thảm Tập Yoga & Phục Hồi Định Tuyến TPE 8mm",
    category: "protection",
    categoryLabel: "Yoga & Phục Hồi",
    tag: "Khuyên Dùng Cho Pilates",
    price: "390.000₫",
    oldPrice: "520.000₫",
    rating: 4.9,
    reviews: 128,
    img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80",
    description: "Chống trượt 2 mặt, vạch kẻ định tuyến laser giúp giữ chuẩn tư thế bài tập giãn cơ.",
    badgeColor: "bg-rose-600 text-white"
  },
  {
    id: 106,
    name: "Whey Protein Isolate 5Lbs (Chính Hãng)",
    category: "nutrition",
    categoryLabel: "Dinh Dưỡng Thể Thao",
    tag: "Phục Hồi Cơ Bắp",
    price: "1.690.000₫",
    oldPrice: "1.950.000₫",
    rating: 5.0,
    reviews: 310,
    img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80",
    description: "Cung cấp 27g protein siêu tinh khiết, 6g BCAA giúp phục hồi và phát triển cơ bắp.",
    badgeColor: "bg-blue-700 text-white"
  }
];

const transformations = [
  {
    name: "Nguyễn Văn A",
    age: 28,
    duration: "16 tuần",
    before: "78kg · 24% BF",
    after: "72kg · 14% BF",
    imgBefore: "photo-1567013127542-490d757e51fc",
    imgAfter: "photo-1534438327276-14e5300c3a48",
    quote: "Tôi đã thử nhiều nơi nhưng đây là lần đầu tôi thực sự thấy kết quả rõ ràng.",
  },
  {
    name: "Trần Thị B",
    age: 32,
    duration: "12 tuần",
    before: "65kg · 30% BF",
    after: "58kg · 21% BF",
    imgBefore: "photo-1570691079236-4bca6c45d910",
    imgAfter: "photo-1518611012118-696072aa579a",
    quote: "Cô ấy không chỉ dạy tôi tập, cô ấy thay đổi hoàn toàn lối sống của tôi.",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-blue-500 fill-blue-500" : "text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: "bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold",
    Intermediate: "bg-amber-50 text-amber-800 border border-amber-300 font-semibold",
    Advanced: "bg-rose-50 text-rose-700 border border-rose-300 font-semibold",
    "All Levels": "bg-blue-50 text-blue-700 border border-blue-300 font-semibold",
  };
  return (
    <span className={`font-mono text-[9px] px-2 py-0.5 rounded uppercase tracking-widest ${colors[level] ?? "bg-gray-100 text-gray-800 border border-gray-300 font-semibold"}`}>
      {level}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function DigitalServices() {
  // Main state
  const [, setFilterResult] = useState<{ target: string; style: string; location: string } | null>(null);

  // Hero interactive state
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("gym");

  // Gym plan registration modal
  const [selectedGymPlan, setSelectedGymPlan] = useState<string | null>(null);
  const [gymForm, setGymForm] = useState({ name: "", phone: "" });

  // PT booking modal
  const [selectedPtId, setSelectedPtId] = useState<number | null>(null);
  const [ptForm, setPtForm] = useState({ name: "", phone: "", slot: "" });

  // Digital product preview modal
  const [previewProductId, setPreviewProductId] = useState<number | null>(null);

  // PT Filters
  const [productFilter, setProductFilter] = useState("all");
  const [ptFilters, setPtFilters] = useState({ gender: "all", specialty: "all", mode: "all" });

  // BMI Form State
  const [bmiForm, setBmiForm] = useState({ weight: "", height: "", age: "", gender: "male", activity: "moderate" });
  const [bmiResult, setBmiResult] = useState<{ bmi: number; tdee: number; category: string } | null>(null);
  const [leadForm, setLeadForm] = useState({ email: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Success Popups
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const steps = [
    {
      question: "Mục tiêu tập luyện chính của bạn?",
      options: ["🔥 Đốt mỡ & Giảm cân", "💪 Tăng cơ & Sức mạnh", "🧘 Phục hồi & Linh hoạt"],
    },
    {
      question: "Phương pháp tập luyện bạn mong muốn?",
      options: ["🏋️ Tự tập theo giáo án số", "👥 Cần HLV cá nhân (PT) đồng hành"],
    },
    {
      question: "Bạn muốn tập ở đâu?",
      options: ["🏢 Phòng tập SportZone", "🌐 Online tại nhà"],
    },
  ];

  const handleQuizSelect = (option: string) => {
    const next = [...selections, option];
    setSelections(next);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setFilterResult({ target: next[0], style: next[1], location: next[2] });
      // Direct user to correct tab section
      if (next[1].includes("HLV") || next[1].includes("PT")) {
        setActiveTab("pt");
        document.getElementById("pt")?.scrollIntoView({ behavior: "smooth" });
      } else if (next[2].includes("Online")) {
        setActiveTab("digital");
        document.getElementById("digital")?.scrollIntoView({ behavior: "smooth" });
      } else {
        setActiveTab("gym");
        document.getElementById("gym")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setSelections([]);
  };

  const handleRegisterGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymForm.name || !gymForm.phone) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    triggerToast(`Đăng ký thành công ${selectedGymPlan}! Tư vấn viên SportZone sẽ liên hệ qua SĐT ${gymForm.phone} trong 15 phút.`);
    setSelectedGymPlan(null);
    setGymForm({ name: "", phone: "" });
  };

  const handleBookPt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptForm.name || !ptForm.phone || !ptForm.slot) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const trainerName = trainers.find(t => t.id === selectedPtId)?.name || "HLV";
    triggerToast(`Đặt lịch tập thử thành công với ${trainerName} vào ${ptForm.slot}! Vui lòng chờ cuộc gọi xác nhận.`);
    setSelectedPtId(null);
    setPtForm({ name: "", phone: "", slot: "" });
  };

  const calculateBmi = () => {
    const w = parseFloat(bmiForm.weight);
    const h = parseFloat(bmiForm.height) / 100;
    const a = parseInt(bmiForm.age);
    if (!w || !h || !a) {
      alert("Vui lòng điền đầy đủ cân nặng, chiều cao và tuổi!");
      return;
    }
    const bmi = w / (h * h);
    const bmr = bmiForm.gender === "male"
      ? 88.362 + 13.397 * w + 4.799 * (h * 100) - 5.677 * a
      : 447.593 + 9.247 * w + 3.098 * (h * 100) - 4.33 * a;

    const activityLevels: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * activityLevels[bmiForm.activity];
    const category = bmi < 18.5 ? "Thiếu cân" : bmi < 25 ? "Bình thường" : bmi < 30 ? "Thừa cân" : "Béo phì";
    setBmiResult({ bmi, tdee, category });
  };

  const filteredTrainers = trainers.filter((t) => {
    if (ptFilters.gender !== "all" && t.gender !== ptFilters.gender) return false;
    if (ptFilters.specialty !== "all" && !t.specialty.includes(ptFilters.specialty)) return false;
    if (ptFilters.mode !== "all" && t.mode !== ptFilters.mode) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      
      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[500px] flex flex-col justify-end overflow-hidden border-b border-slate-800 bg-slate-950">
        {/* Background Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop&auto=format"
            alt="Gym training"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-950/70" />
        </div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600" />

        {/* Content */}
        <div className="relative z-10 px-6 lg:px-16 pb-16 pt-24 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7">
              <span className="font-mono text-blue-400 text-xs tracking-[0.35em] uppercase mb-4 block font-bold">
                SportZone Digital Hub
              </span>
              <h1 className="text-white font-black uppercase leading-none mb-6 text-4xl sm:text-6xl lg:text-7xl">
                DỊCH VỤ SỐ<br />
                <span className="text-blue-500">THÔNG MINH</span>
              </h1>
              <p className="text-slate-300 max-w-lg leading-relaxed text-sm sm:text-base mb-8">
                Tích hợp lộ trình số hóa toàn diện: Gói hội viên phòng gym cao cấp, đội ngũ Huấn Luyện Viên 1-1 chuyên nghiệp, Ebook giáo án số hóa & công cụ phân tích thể trạng thông minh.
              </p>
              <div className="flex flex-wrap gap-8 text-sm border-t border-slate-800 pt-6 w-fit">
                {[["2.400+", "Học viên"], ["38+", "PT Chuyên nghiệp"], ["4.9★", "Đánh giá TB"]].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-black text-blue-400 text-2xl">{val}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Quiz Panel */}
            <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
              <span className="font-mono text-blue-400 text-[10px] tracking-[0.25em] uppercase mb-3 block font-bold">
                🎯 LỰA CHỌN LỘ TRÌNH PHÙ HỢP
              </span>
              
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < (selections.length) ? "bg-blue-500" : i === step && selections.length < steps.length ? "bg-blue-500/50" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {selections.length === steps.length ? (
                <div className="animate-fade-in">
                  <h3 className="text-blue-400 font-bold text-lg uppercase mb-3 flex items-center gap-1.5">
                    ✨ Đã tìm thấy lộ trình!
                  </h3>
                  <div className="space-y-2 mb-6">
                    {selections.map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                        <span className="text-blue-400 font-bold">✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (selections[1].includes("HLV") || selections[1].includes("PT")) {
                        document.getElementById("pt")?.scrollIntoView({ behavior: "smooth" });
                      } else if (selections[2].includes("Online")) {
                        document.getElementById("digital")?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        document.getElementById("gym")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs tracking-wider py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 mb-3"
                  >
                    Xem ngay gói của bạn
                  </button>
                  <button onClick={resetQuiz} className="w-full text-slate-400 hover:text-white text-xs transition-colors py-1 block text-center">
                    Làm lại khảo sát
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-white text-sm font-semibold mb-4">
                    Bước {step + 1}/{steps.length}: {steps[step].question}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {steps[step].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleQuizSelect(opt)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-blue-500 hover:bg-blue-600/20 text-slate-200 hover:text-white text-xs transition-all flex items-center justify-between group"
                      >
                        <span>{opt}</span>
                        <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white/95 backdrop-blur-md sticky top-[60px] z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 justify-center py-2.5 overflow-x-auto whitespace-nowrap">
          {[
            { id: "gym", label: "🏋️ Hội Viên Phòng Gym", anchor: "gym" },
            { id: "pt", label: "👥 Huấn Luyện Viên 1-1", anchor: "pt" },
            { id: "digital", label: "📚 Khoá Học & Giáo Án Số", anchor: "digital" },
            { id: "gear", label: "🛍️ Đồ Tập & Phụ Kiện Đề Xuất", anchor: "gear" },
            { id: "bmi", label: "📊 Tính BMI & TDEE", anchor: "bmi" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                document.getElementById(tab.anchor)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <Link
            to="/ai-planner"
            className="px-4 py-2 rounded-xl text-xs font-black bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
          >
            🤖 Trợ Lý AI Trainer →
          </Link>
        </div>
      </div>

      {/* ─── SECTION 1: GYM PLANS ─────────────────────────────────────────── */}
      <section id="gym" className="py-20 px-4 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center mb-12">
          <span className="font-mono text-blue-600 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">Membership Plans</span>
          <h2 className="text-gray-900 font-black text-3xl sm:text-4xl uppercase">THẺ HỘI VIÊN PHÒNG TẬP</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mt-2">Phòng gym SportZone đóng gói cơ sở vật chất chuẩn quốc tế. Chọn thẻ và tập luyện không giới hạn.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gymPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                plan.popular 
                  ? "border-2 border-blue-600 bg-white shadow-xl shadow-blue-500/10 ring-1 ring-blue-600/20" 
                  : "border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-400"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Khuyên dùng nhiều nhất
                </span>
              )}
              
              <div>
                <h3 className="text-gray-900 font-black text-xl uppercase mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6 border-b border-gray-100 pb-4">
                  <span className="text-2xl font-black text-blue-600">{plan.price}</span>
                  <span className="text-gray-500 text-xs">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                  {plan.missing.map((miss) => (
                    <li key={miss} className="flex items-start gap-2 text-xs text-gray-400 line-through">
                      <span>✗</span>
                      <span>{miss}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedGymPlan(plan.name)}
                className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    : "border border-gray-300 text-gray-800 hover:bg-blue-600 hover:border-blue-600 hover:text-white"
                }`}
              >
                Đăng ký hội viên
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 2: PERSONAL TRAINER ──────────────────────────────────── */}
      <section id="pt" className="py-20 bg-slate-100/70 border-y border-gray-200 px-4 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-4">
            <div>
              <span className="font-mono text-blue-600 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">Expert Coaching</span>
              <h2 className="text-gray-900 font-black text-3xl sm:text-4xl uppercase">HLV CÁ NHÂN CHUYÊN NGHIỆP</h2>
            </div>
            <p className="text-gray-600 text-sm max-w-xs lg:text-right leading-relaxed">
              Cam kết đạt kết quả thể chất mong muốn nhờ lộ trình thiết lập 1-1 chặt chẽ với huấn luyện viên đạt chứng chỉ quốc tế.
            </p>
          </div>

          {/* PT Filter bar */}
          <div className="flex flex-wrap gap-4 mb-8 bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-fit">
            {/* Gender filter */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {["all", "male", "female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setPtFilters({ ...ptFilters, gender: g })}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                    ptFilters.gender === g ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {g === "all" ? "Tất cả giới tính" : g === "male" ? "Nam" : "Nữ"}
                </button>
              ))}
            </div>

            {/* Specialty filter */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {["all", "Gym", "Boxing", "Pilates", "Phục hồi"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPtFilters({ ...ptFilters, specialty: s })}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                    ptFilters.specialty === s ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {s === "all" ? "Tất cả chuyên môn" : s}
                </button>
              ))}
            </div>

            {/* Mode filter */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {["all", "offline", "online"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPtFilters({ ...ptFilters, mode: m })}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                    ptFilters.mode === m ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {m === "all" ? "Tất cả hình thức" : m === "offline" ? "Tại phòng" : "Online"}
                </button>
              ))}
            </div>
          </div>

          {/* Trainer Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="relative h-52 bg-gray-900 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/${trainer.img}?w=400&h=300&fit=crop&auto=format`}
                      alt={trainer.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {trainer.mode === "online" ? "Online" : "Tại phòng"}
                    </span>
                    <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shadow-sm">
                      {trainer.exp} kinh nghiệm
                    </span>
                  </div>

                  <div className="p-5">
                    <span className="text-[10px] text-blue-600 font-mono font-bold tracking-widest uppercase block mb-1">
                      {trainer.specialty}
                    </span>
                    <h3 className="text-gray-900 font-black text-xl mb-1">{trainer.name}</h3>
                    <p className="text-blue-600 text-xs mb-3 font-semibold">{trainer.cert}</p>
                    <p className="text-gray-600 text-xs leading-relaxed mb-4">{trainer.bio}</p>

                    <div className="flex items-center gap-2 mb-3 border-t border-gray-100 pt-3">
                      <StarRating rating={trainer.rating} />
                      <span className="text-gray-900 font-bold text-xs">{trainer.rating}</span>
                      <span className="text-gray-500 text-xs">({trainer.reviews} đánh giá)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between mb-4 border-t border-gray-50 pt-3">
                    <span className="text-gray-500 text-xs">Giá trị buổi tập:</span>
                    <span className="text-gray-900 font-black text-sm">{trainer.price}</span>
                  </div>
                  <button
                    onClick={() => setSelectedPtId(trainer.id)}
                    className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-800 font-bold uppercase text-xs tracking-wider hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Đặt lịch tập thử miễn phí
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: DIGITAL PRODUCTS ──────────────────────────────────── */}
      <section id="digital" className="py-20 px-4 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center mb-12">
          <span className="font-mono text-blue-600 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">E-Learning & Ebooks</span>
          <h2 className="text-gray-900 font-black text-3xl sm:text-4xl uppercase">KHO KHÓA HỌC & GIÁO ÁN SỐ</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mt-2">Tải về giáo trình hoặc kích hoạt khóa học video trực tuyến ngay sau khi thanh toán thành công.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {digitalProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="relative h-44 bg-gray-900 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/${product.img}?w=400&h=250&fit=crop&auto=format`}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white font-mono text-[9px] px-2 py-0.5 rounded font-semibold uppercase">
                    {product.type}
                  </span>
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-sm">
                    {product.tag}
                  </span>
                  {product.preview && (
                    <button
                      onClick={() => setPreviewProductId(product.id)}
                      className="absolute bottom-3 right-3 bg-black/75 hover:bg-black/90 backdrop-blur-sm border border-gray-700 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <span>▶</span> Xem thử bản nháp
                    </button>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <LevelBadge level={product.level} />
                    <span className="text-gray-500 text-xs">{product.duration}</span>
                  </div>
                  <h3 className="text-gray-900 font-black text-lg mb-2 uppercase leading-snug line-clamp-1">{product.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={product.rating} />
                    <span className="text-gray-900 font-bold text-xs">{product.rating}</span>
                    <span className="text-gray-500 text-xs">({product.reviews})</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-blue-600 text-2xl font-black">{product.price}</span>
                  <span className="text-gray-400 text-xs line-through">{product.oldPrice}</span>
                </div>
                <button
                  onClick={() => triggerToast(`Thêm khóa học "${product.title}" vào giỏ hàng thành công!`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs py-3 rounded-xl transition-colors shadow-md shadow-blue-500/10"
                >
                  Mua ngay & Tải về
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 4: BEFORE / AFTER ────────────────────────────────────── */}
      <section className="py-20 bg-slate-100/70 border-t border-gray-200 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-mono text-blue-600 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">Transformations</span>
            <h2 className="text-gray-900 font-black text-3xl sm:text-4xl uppercase">HIỆU QUẢ CHỨNG MINH THỰC TẾ</h2>
            <p className="text-gray-600 text-sm max-w-md mx-auto mt-2">Dưới đây là hình ảnh thực tế từ các học viên đã hoàn thành xuất sắc lộ trình 12 tuần tập luyện.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {transformations.map((t, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all shadow-sm">
                <div className="grid grid-cols-2 h-56 bg-slate-900">
                  <div className="relative">
                    <img
                      src={`https://images.unsplash.com/${t.imgBefore}?w=300&h=300&fit=crop&auto=format`}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 left-3 bg-black/80 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      Trước
                    </span>
                  </div>
                  <div className="relative border-l border-gray-800">
                    <img
                      src={`https://images.unsplash.com/${t.imgAfter}?w=300&h=300&fit=crop&auto=format`}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 right-3 bg-blue-600 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-wider shadow-sm">
                      Sau (12 tuần)
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="text-gray-900 font-black text-lg">{t.name}</h4>
                      <span className="text-gray-500 text-xs font-mono">{t.age} tuổi · Thời lượng: {t.duration}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs line-through font-mono">{t.before}</div>
                      <div className="text-blue-600 text-sm font-bold font-mono">{t.after}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs italic leading-relaxed">"{t.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* ─── SECTION 4: RECOMMENDED SPORTS PRODUCTS & GEAR ─── */}
      <section id="gear" className="py-20 px-4 max-w-6xl mx-auto scroll-mt-24 border-t border-gray-100">
        <div className="text-center mb-10">
          <span className="font-mono text-blue-600 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">
            Essential Training Gear & Nutrition
          </span>
          <h2 className="text-gray-900 font-black text-3xl sm:text-4xl uppercase">
            TRANG THIẾT BỊ & SẢN PHẨM THỂ THAO ĐỀ XUẤT
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
            SportZone chọn lọc các sản phẩm chính hãng bổ trợ đắc lực cho hành trình tập luyện. Trang bị đúng phụ kiện bảo hộ khớp và dinh dưỡng chuẩn giúp bạn nâng cao 40% hiệu suất cùng Huấn luyện viên.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "all", label: "Tất cả sản phẩm" },
            { id: "gear", label: "🏋️ Tạ & Kháng lực" },
            { id: "shoes", label: "👟 Giày & Phục trang" },
            { id: "protection", label: "🛡️ Phụ kiện bảo hộ" },
            { id: "nutrition", label: "🥤 Dinh dưỡng & Bình lắc" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setProductFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                productFilter === cat.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-slate-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recommendedSportsProducts
            .filter((p) => productFilter === "all" || p.category === productFilter)
            .map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${item.badgeColor}`}
                    >
                      {item.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      ⭐ {item.rating} ({item.reviews})
                    </span>
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-gray-900 font-black text-base line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100">
                      <span className="text-blue-600 font-black text-lg font-mono">{item.price}</span>
                      <span className="text-gray-400 text-xs line-through font-mono">{item.oldPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0 flex gap-2">
                  <button
                    onClick={() => triggerToast(`Đã thêm "${item.name}" vào giỏ hàng thành công!`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    + Thêm vào giỏ
                  </button>
                  <Link
                    to="/shop"
                    className="px-4 py-3 border border-gray-200 hover:border-blue-600 text-gray-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                    title="Xem chi tiết tại cửa hàng"
                  >
                    Xem shop →
                  </Link>
                </div>
              </div>
            ))}
        </div>

        {/* Ecosystem Highlight Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 transform skew-x-12 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Ưu Đãi Hệ Sinh Thái Đồng Bộ
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase">
                Đặt Dịch Vụ Số - Nhận Voucher Mua Trang Bị 15%
              </h3>
              <p className="text-blue-100/80 text-xs max-w-xl leading-relaxed">
                Khi đăng ký bất kỳ Gói Hội Viên Gym hoặc Thuê Huấn Luyện Viên cá nhân, bạn sẽ được tặng ngay Voucher giảm 15% áp dụng cho toàn bộ danh mục Giày, Đai lưng, Tạ và Thực phẩm bổ sung tại SportZone Store.
              </p>
            </div>
            <Link
              to="/shop"
              className="flex-shrink-0 bg-white hover:bg-blue-50 text-blue-900 font-black text-xs uppercase tracking-wider px-6 py-4 rounded-2xl transition-all shadow-lg hover:scale-105"
            >
              Khám Phá Toàn Bộ Shop →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: BMI & TDEE CALCULATOR ─────────────────────────────── */}
      <section id="bmi" className="py-20 px-4 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center mb-12">
          <span className="font-mono text-blue-600 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">Body Metrics</span>
          <h2 className="text-gray-900 font-black text-3xl sm:text-4xl uppercase">CÔNG CỤ TÍNH BMI & TDEE MIỄN PHÍ</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mt-2">Nhập chỉ số thể trạng để nhận ngay khuyến nghị mức calo nạp hàng ngày theo mục tiêu của bạn.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-7 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Cân nặng (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={bmiForm.weight}
                  onChange={(e) => setBmiForm({ ...bmiForm, weight: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Chiều cao (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  value={bmiForm.height}
                  onChange={(e) => setBmiForm({ ...bmiForm, height: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Tuổi</label>
                <input
                  type="number"
                  placeholder="24"
                  value={bmiForm.age}
                  onChange={(e) => setBmiForm({ ...bmiForm, age: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Giới tính</label>
                <div className="flex gap-2">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setBmiForm({ ...bmiForm, gender: g })}
                      className={`flex-1 py-3 border rounded-xl text-xs font-bold transition-all ${
                        bmiForm.gender === g ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "border-gray-300 bg-slate-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {g === "male" ? "Nam" : "Nữ"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Mức độ hoạt động thể chất</label>
              <select
                value={bmiForm.activity}
                onChange={(e) => setBmiForm({ ...bmiForm, activity: e.target.value })}
                className="w-full bg-slate-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              >
                <option value="sedentary">Ít vận động (Chỉ làm việc văn phòng)</option>
                <option value="light">Nhẹ nhàng (Tập luyện nhẹ 1-3 ngày/tuần)</option>
                <option value="moderate">Vừa phải (Tập luyện đều đặn 3-5 ngày/tuần)</option>
                <option value="active">Năng động (Chơi thể thao nặng 6-7 ngày/tuần)</option>
                <option value="very_active">Cực độ (VĐV chuyên nghiệp tập 2 buổi/ngày)</option>
              </select>
            </div>

            <button
              onClick={calculateBmi}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-wider py-4 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Tính chỉ số ngay
            </button>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-5 bg-white border border-gray-200 p-6 rounded-2xl flex flex-col justify-center min-h-[300px] shadow-sm">
            {bmiResult ? (
              <div className="animate-fade-in">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl">
                    <span className="text-[10px] text-gray-500 font-mono uppercase block mb-1 font-semibold">Chỉ số BMI</span>
                    <span className="text-4xl font-black text-blue-600">{bmiResult.bmi.toFixed(1)}</span>
                    <span className="block text-xs mt-1.5 text-blue-700 font-bold">{bmiResult.category}</span>
                  </div>
                  <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl">
                    <span className="text-[10px] text-gray-500 font-mono uppercase block mb-1 font-semibold">Chỉ số TDEE</span>
                    <span className="text-4xl font-black text-blue-600">{Math.round(bmiResult.tdee)}</span>
                    <span className="block text-xs mt-1.5 text-gray-500 font-semibold">kcal/ngày</span>
                  </div>
                </div>

                <div className="bg-blue-50/80 border-l-4 border-blue-600 p-4 rounded-r-xl mb-6">
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block mb-1">Lộ trình được đề xuất</span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {bmiResult.category === "Thiếu cân"
                      ? `Để tăng cân an toàn, bạn cần ăn dư thừa năng lượng ở mức ${Math.round(bmiResult.tdee + 350)} kcal/ngày, ưu tiên tập cơ với tạ 4 ngày/tuần.`
                      : bmiResult.category === "Bình thường"
                      ? `Thể trạng tuyệt vời! Hãy duy trì bằng cách nạp đúng ${Math.round(bmiResult.tdee)} kcal/ngày kết hợp tập luyện duy trì sức mạnh.`
                      : `Để giảm mỡ cơ thể hiệu quả, hãy thâm hụt calo nạp ở mức ${Math.round(bmiResult.tdee - 450)} kcal/ngày kết hợp đi bộ nhanh/HIIT.`}
                  </p>
                </div>

                {!leadSubmitted ? (
                  <div className="border-t border-gray-100 pt-4">
                    <span className="text-[10px] text-gray-600 font-bold block mb-2 uppercase">Gửi lộ trình chi tiết + Voucher giảm 15%:</span>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Email của bạn..."
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ email: e.target.value })}
                        className="flex-1 bg-slate-50 border border-gray-300 text-gray-900 px-3 py-2.5 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                      <button
                        onClick={() => setLeadSubmitted(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-lg shadow-sm"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                    <span className="text-blue-700 text-xs font-black uppercase">Đã đăng ký nhận lộ trình!</span>
                    <p className="text-[10px] text-gray-600 mt-1">Hệ thống đã gửi tài liệu kèm voucher vào hòm thư của bạn.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center py-8">
                <span className="text-5xl mb-4">📊</span>
                <h4 className="text-gray-400 font-black text-2xl uppercase">Nhập thông tin chỉ số</h4>
                <p className="text-gray-500 text-xs max-w-[200px] mt-2 leading-relaxed">
                  Tính toán chỉ số khối cơ thể và lượng tiêu hao calo TDEE nhanh chóng.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── MODALS ───────────────────────────────────────────────────────────── */}
      
      {/* Gym Plan Modal */}
      {selectedGymPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-gray-200 p-8 w-full max-w-md relative rounded-3xl shadow-2xl">
            <button
              onClick={() => setSelectedGymPlan(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors text-lg"
            >
              ✕
            </button>
            <span className="font-mono text-blue-600 text-[10px] tracking-widest uppercase block mb-1 font-bold">Đăng ký tham gia</span>
            <h3 className="text-gray-900 font-black text-2xl uppercase mb-6">{selectedGymPlan}</h3>
            
            <form onSubmit={handleRegisterGym} className="space-y-4">
              <input
                className="w-full bg-slate-50 border border-gray-300 rounded-xl text-gray-900 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                placeholder="Họ tên của bạn"
                required
                value={gymForm.name}
                onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
              />
              <input
                className="w-full bg-slate-50 border border-gray-300 rounded-xl text-gray-900 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                placeholder="Số điện thoại liên hệ"
                type="tel"
                required
                value={gymForm.phone}
                onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-wider py-4 rounded-xl transition-all shadow-md shadow-blue-500/20">
                Xác nhận giữ chỗ tập thử
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PT Booking Modal */}
      {selectedPtId !== null && (() => {
        const pt = trainers.find((t) => t.id === selectedPtId)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white border border-gray-200 p-8 w-full max-w-md relative rounded-3xl shadow-2xl">
              <button
                onClick={() => setSelectedPtId(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors text-lg"
              >
                ✕
              </button>
              <span className="font-mono text-blue-600 text-[10px] tracking-widest uppercase block mb-1 font-bold">Đăng ký tập thử 1-1 miễn phí</span>
              <h3 className="text-gray-900 font-black text-2xl uppercase mb-1">{pt.name}</h3>
              <p className="text-blue-600 text-xs mb-6 font-semibold">{pt.specialty} · {pt.price}</p>

              <form onSubmit={handleBookPt} className="space-y-4">
                <input
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl text-gray-900 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  placeholder="Họ tên của bạn"
                  required
                  value={ptForm.name}
                  onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })}
                />
                <input
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl text-gray-900 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  placeholder="Số điện thoại liên hệ"
                  type="tel"
                  required
                  value={ptForm.phone}
                  onChange={(e) => setPtForm({ ...ptForm, phone: e.target.value })}
                />
                <div>
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 block">Chọn khung giờ rảnh</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["T2: 08:00", "T3: 10:00", "T4: 14:00", "T5: 16:00", "T6: 18:00", "T7: 09:00"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPtForm({ ...ptForm, slot })}
                        className={`py-2 text-[10px] font-bold transition-all border rounded-lg ${
                          ptForm.slot === slot
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "border-gray-200 bg-slate-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-wider py-4 rounded-xl transition-all shadow-md shadow-blue-500/20">
                  Xác nhận đặt lịch hẹn HLV
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Digital Product Preview Modal */}
      {previewProductId !== null && (() => {
        const product = digitalProducts.find((p) => p.id === previewProductId)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white border border-gray-200 p-8 w-full max-w-lg relative rounded-3xl shadow-2xl">
              <button
                onClick={() => setPreviewProductId(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors text-lg"
              >
                ✕
              </button>
              <span className="font-mono text-blue-600 text-[10px] tracking-widest uppercase block mb-1 font-bold">Xem trước tài liệu mẫu</span>
              <h3 className="text-gray-900 font-black text-2xl uppercase mb-4">{product.title}</h3>
              
              <div className="bg-slate-50 border border-gray-200 p-4 rounded-2xl text-xs text-gray-800 space-y-3 leading-relaxed mb-6 font-mono">
                <p className="font-bold text-blue-700">📅 Ngày 1: Đánh giá tư thế & Kích hoạt chuỗi cơ sau (Posterior Chain)</p>
                <p>1. Hip Thrust (Kích hoạt mông đùi): 3 hiệp x 12 lần (Nghỉ 60s)</p>
                <p>2. Romanian Deadlift (Giãn cơ đùi sau): 4 hiệp x 8 lần @ 60% 1RM</p>
                <p>3. Kettlebell Swing (Độ nổ hông): 3 hiệp x 15 lần (Nghỉ 90s)</p>
                <p className="text-blue-600 font-bold pt-2 border-t border-gray-200">+ Hơn 84 ngày giáo án chi tiết và video hướng dẫn sửa tư thế khi mua gói...</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPreviewProductId(null);
                    triggerToast(`Thêm khóa học "${product.title}" vào giỏ hàng thành công!`);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  Mua ngay {product.price}
                </button>
                <button
                  onClick={() => setPreviewProductId(null)}
                  className="px-5 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl text-xs transition-colors"
                >
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-blue-600 border border-blue-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-scale-up">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
