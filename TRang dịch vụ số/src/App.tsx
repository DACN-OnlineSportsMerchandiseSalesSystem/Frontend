import { useState } from "react";
import AIPlanner from "./AIPlanner";

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

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-[#2244f5]" : "text-[#333]"}`}
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
    Beginner: "bg-emerald-900/60 text-emerald-300",
    Intermediate: "bg-amber-900/60 text-amber-300",
    Advanced: "bg-red-900/60 text-red-300",
    "All Levels": "bg-[#2244f5]/10 text-[#2244f5]",
  };
  return (
    <span className={`font-mono-data text-[10px] px-2 py-0.5 rounded uppercase tracking-widest ${colors[level] ?? "bg-[#333] text-white"}`}>
      {level}
    </span>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function Hero({ onFilter, onOpenAI }: { onFilter: (target: string, style: string, location: string) => void; onOpenAI: () => void }) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);

  const steps = [
    {
      question: "Mục tiêu của bạn?",
      options: ["🔥 Đốt mỡ", "💪 Tăng cơ", "🧘 Phục hồi & Linh hoạt"],
    },
    {
      question: "Bạn muốn tập như thế nào?",
      options: ["🏋️ Tự tập theo giáo án", "👥 Cần PT hướng dẫn"],
    },
    {
      question: "Địa điểm tập luyện?",
      options: ["🏢 Tại phòng tập", "🌐 Online tại nhà"],
    },
  ];

  const handleSelect = (option: string) => {
    const next = [...selections, option];
    setSelections(next);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFilter(next[0], next[1], next[2]);
    }
  };

  const reset = () => { setStep(0); setSelections([]); };
  const isDone = selections.length === steps.length;

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop&auto=format"
          alt="Gym training"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/50 to-transparent" />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2244f5]" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 lg:px-16 py-5">
        <div className="font-display text-white text-2xl font-black tracking-widest uppercase">
          SPORT<span className="text-[#2244f5]">ZONE</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#gym" className="hover:text-[#2244f5] transition-colors">Gói Gym</a>
          <a href="#pt" className="hover:text-[#2244f5] transition-colors">Thuê PT</a>
          <a href="#digital" className="hover:text-[#2244f5] transition-colors">Khoá học số</a>
          <a href="#bmi" className="hover:text-[#2244f5] transition-colors">Tính BMI</a>
          <button onClick={onOpenAI} className="text-[#2244f5] hover:text-blue-400 transition-colors font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#2244f5] rounded-full animate-pulse" />
            AI Planner
          </button>
        </div>
        <a href="#pt" className="hidden md:flex bg-[#2244f5] text-black font-display font-bold text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-white transition-colors">
          Tập thử miễn phí →
        </a>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-6 lg:px-16 pb-16 lg:pb-24 pt-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-end">
          {/* Left headline */}
          <div>
            <div className="font-mono-data text-[#2244f5] text-xs tracking-[0.3em] uppercase mb-4">
              Hệ thống Huấn Luyện Toàn Diện
            </div>
            <h1 className="font-display text-white font-black uppercase leading-none mb-6">
              <span className="block text-6xl lg:text-8xl">BIẾN ĐỔI</span>
              <span className="block text-6xl lg:text-8xl text-[#2244f5]">NGOẠI HÌNH</span>
              <span className="block text-4xl lg:text-5xl text-white/80">của bạn trong 12 tuần</span>
            </h1>
            <p className="text-white/60 max-w-md leading-relaxed mb-8">
              Hơn 2.400 học viên đã đạt kết quả thực sự. Giáo án khoa học, PT chuyên nghiệp, hệ thống theo dõi thông minh.
            </p>
            <div className="flex gap-6 text-sm">
              {[["2.400+", "Học viên"], ["38", "HLV chuyên nghiệp"], ["4.8★", "Đánh giá TB"]].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display font-black text-[#2244f5] text-2xl">{val}</div>
                  <div className="text-white/50 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right filter */}
          <div className="bg-[#111]/90 backdrop-blur border border-[#242424] p-6">
            <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.25em] uppercase mb-4">
              Tìm gói phù hợp với bạn
            </div>
            {/* Progress */}
            <div className="flex gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 transition-all duration-300 ${i < (isDone ? 3 : step) ? "bg-[#2244f5]" : i === step && !isDone ? "bg-[#2244f5]/50" : "bg-[#333]"}`}
                />
              ))}
            </div>

            {isDone ? (
              <div>
                <div className="text-[#2244f5] font-display font-bold text-xl uppercase mb-4">
                  Lộ trình của bạn đã sẵn sàng!
                </div>
                <div className="space-y-2 mb-6">
                  {selections.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <span className="text-[#2244f5]">✓</span> {s}
                    </div>
                  ))}
                </div>
                <a href={selections[1]?.includes("PT") ? "#pt" : selections[2]?.includes("Online") ? "#digital" : "#gym"}
                  className="block w-full bg-[#2244f5] text-black font-display font-bold uppercase text-sm tracking-wider text-center py-3 hover:bg-white transition-colors mb-3"
                >
                  Xem gói phù hợp →
                </a>
                <button onClick={reset} className="block w-full text-white/40 text-xs hover:text-white/70 transition-colors py-2">
                  Chọn lại từ đầu
                </button>
              </div>
            ) : (
              <div>
                <div className="text-white font-medium mb-4">
                  Bước {step + 1}/{steps.length}: {steps[step].question}
                </div>
                <div className="space-y-2.5">
                  {steps[step].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className="w-full text-left px-4 py-3 border border-[#333] hover:border-[#2244f5] hover:bg-[#2244f5]/5 text-white/80 hover:text-white text-sm transition-all flex items-center justify-between group"
                    >
                      <span>{opt}</span>
                      <span className="text-[#2244f5] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GymPlans() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", plan: "" });

  return (
    <section id="gym" className="py-24 px-6 lg:px-16 border-t border-[#242424]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-4">
          <div>
            <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.3em] uppercase mb-3">Gói Tập Gym</div>
            <h2 className="font-display font-black text-white uppercase text-5xl lg:text-6xl leading-none">
              CHỌN GÓI<br /><span className="text-[#2244f5]">PHÙ HỢP</span>
            </h2>
          </div>
          <p className="text-white/50 max-w-xs lg:text-right text-sm leading-relaxed">
            Truy cập hệ thống 5 chi nhánh tại Hà Nội và TP.HCM. Trang thiết bị nhập khẩu, không gian 800m².
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#242424]">
          {gymPlans.map((plan, i) => (
            <div
              key={plan.id}
              className={`relative p-6 border-r border-[#242424] last:border-r-0 flex flex-col transition-all duration-200 ${
                plan.popular ? "bg-[#2244f5]/5" : "bg-[#111]"
              } hover:bg-[#1a1a1a] cursor-pointer ${selected === plan.id ? "ring-1 ring-[#2244f5]" : ""}`}
              onClick={() => setSelected(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2244f5] text-black font-mono-data text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                  Phổ biến nhất
                </div>
              )}
              <div className="font-mono-data text-[#2244f5] text-[9px] tracking-widest uppercase mb-2">{`0${i + 1}`}</div>
              <div className="font-display font-black text-white text-2xl uppercase mb-1">{plan.name}</div>
              <div className="mb-4">
                <span className="font-display font-black text-[#2244f5] text-3xl">{plan.price}</span>
                <span className="text-white/40 text-xs ml-1">{plan.period}</span>
              </div>
              <div className="flex-1 space-y-2 mb-6">
                {plan.perks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-[#2244f5] mt-0.5 flex-shrink-0">✓</span>
                    <span>{perk}</span>
                  </div>
                ))}
                {plan.missing.map((miss) => (
                  <div key={miss} className="flex items-start gap-2 text-sm text-white/30 line-through">
                    <span className="flex-shrink-0 mt-0.5">✗</span>
                    <span>{miss}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setForm((f) => ({ ...f, plan: plan.name }));
                  setShowForm(true);
                }}
                className={`w-full py-3 font-display font-bold uppercase text-sm tracking-wider transition-all ${
                  plan.popular
                    ? "bg-[#2244f5] text-black hover:bg-white"
                    : "border border-[#333] text-white hover:border-[#2244f5] hover:text-[#2244f5]"
                }`}
              >
                {plan.popular ? "Đăng ký ngay" : "Giữ giá ưu đãi"}
              </button>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-[#111] border border-[#333] p-8 w-full max-w-md relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">✕</button>
              <div className="font-mono-data text-[#2244f5] text-[10px] tracking-widest uppercase mb-2">Đăng ký tư vấn</div>
              <h3 className="font-display font-black text-white text-3xl uppercase mb-6">{form.plan}</h3>
              <div className="space-y-4">
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="Họ và tên"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <button className="w-full bg-[#2244f5] text-black font-display font-bold uppercase tracking-wider py-4 hover:bg-white transition-colors">
                  Yêu cầu tư vấn ngay →
                </button>
                <p className="text-white/30 text-xs text-center">Chúng tôi sẽ liên hệ trong vòng 30 phút</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PTFinder() {
  const [filters, setFilters] = useState({ gender: "all", specialty: "all", mode: "all" });
  const [booking, setBooking] = useState<number | null>(null);
  const [bookForm, setBookForm] = useState({ name: "", phone: "", date: "" });

  const specialties = ["all", "Gym", "Boxing", "Pilates", "Phục hồi"];
  const filtered = trainers.filter((t) => {
    if (filters.gender !== "all" && t.gender !== filters.gender) return false;
    if (filters.specialty !== "all" && !t.specialty.includes(filters.specialty)) return false;
    if (filters.mode !== "all" && t.mode !== filters.mode) return false;
    return true;
  });

  return (
    <section id="pt" className="py-24 px-6 lg:px-16 border-t border-[#242424] bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.3em] uppercase mb-3">Huấn Luyện Viên Cá Nhân</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display font-black text-white uppercase text-5xl lg:text-6xl leading-none">
              TÌM PT<br /><span className="text-[#2244f5]">CỦA BẠN</span>
            </h2>
            <a
              href="#bmi"
              className="inline-flex items-center gap-3 bg-[#2244f5]/10 border border-[#2244f5]/30 text-[#2244f5] px-5 py-3 text-sm hover:bg-[#2244f5]/20 transition-colors"
            >
              <span className="text-lg">📋</span>
              <span className="font-medium">Đặt lịch đánh giá thể trạng 1-1 miễn phí</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex bg-[#111] border border-[#242424] text-xs">
            {["all", "male", "female"].map((g) => (
              <button
                key={g}
                onClick={() => setFilters((f) => ({ ...f, gender: g }))}
                className={`px-4 py-2 transition-colors font-medium uppercase tracking-wider ${filters.gender === g ? "bg-[#2244f5] text-black" : "text-white/50 hover:text-white"}`}
              >
                {g === "all" ? "Tất cả" : g === "male" ? "Nam" : "Nữ"}
              </button>
            ))}
          </div>
          <div className="flex bg-[#111] border border-[#242424] text-xs flex-wrap">
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, specialty: s }))}
                className={`px-4 py-2 transition-colors font-medium uppercase tracking-wider ${filters.specialty === s ? "bg-[#2244f5] text-black" : "text-white/50 hover:text-white"}`}
              >
                {s === "all" ? "Tất cả" : s}
              </button>
            ))}
          </div>
          <div className="flex bg-[#111] border border-[#242424] text-xs">
            {["all", "offline", "online"].map((m) => (
              <button
                key={m}
                onClick={() => setFilters((f) => ({ ...f, mode: m }))}
                className={`px-4 py-2 transition-colors font-medium uppercase tracking-wider ${filters.mode === m ? "bg-[#2244f5] text-black" : "text-white/50 hover:text-white"}`}
              >
                {m === "all" ? "Tất cả" : m === "offline" ? "Tại phòng" : "Online"}
              </button>
            ))}
          </div>
        </div>

        {/* Trainer grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((trainer) => (
            <div key={trainer.id} className="bg-[#111] border border-[#242424] overflow-hidden group hover:border-[#2244f5]/40 transition-all duration-300">
              <div className="relative h-56 overflow-hidden bg-[#1a1a1a]">
                <img
                  src={`https://images.unsplash.com/${trainer.img}?w=400&h=300&fit=crop&auto=format`}
                  alt={trainer.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`font-mono-data text-[9px] px-2 py-1 uppercase tracking-widest ${trainer.mode === "online" ? "bg-blue-900/80 text-blue-300" : "bg-[#2244f5]/20 text-[#2244f5]"}`}>
                    {trainer.mode === "online" ? "Online" : "Tại phòng"}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="font-mono-data text-[9px] bg-black/70 text-white/60 px-2 py-1 uppercase tracking-widest">
                    {trainer.exp}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-mono-data text-[#2244f5] text-[9px] tracking-widest uppercase mb-1">{trainer.specialty}</div>
                <h3 className="font-display font-bold text-white text-xl uppercase mb-1">{trainer.name}</h3>
                <div className="text-white/40 text-xs mb-3">{trainer.cert}</div>
                <p className="text-white/60 text-xs leading-relaxed mb-3">{trainer.bio}</p>
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={trainer.rating} />
                  <span className="font-mono-data text-[#2244f5] text-xs font-bold">{trainer.rating}</span>
                  <span className="text-white/30 text-xs">({trainer.reviews})</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-white text-lg">{trainer.price}</span>
                  <span className="font-mono-data text-[9px] bg-[#2244f5]/10 text-[#2244f5] px-2 py-1 uppercase tracking-widest">{trainer.tag}</span>
                </div>
                <button
                  onClick={() => setBooking(trainer.id)}
                  className="w-full border border-[#333] text-white/70 font-display font-bold uppercase text-xs tracking-wider py-2.5 hover:border-[#2244f5] hover:text-[#2244f5] transition-all"
                >
                  Đặt lịch tập thử
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 py-16 text-center text-white/30 font-display text-2xl uppercase">
              Không có HLV phù hợp với bộ lọc này
            </div>
          )}
        </div>

        {/* Booking modal */}
        {booking !== null && (() => {
          const t = trainers.find((tr) => tr.id === booking)!;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
              <div className="bg-[#111] border border-[#333] p-8 w-full max-w-md relative">
                <button onClick={() => setBooking(null)} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">✕</button>
                <div className="font-mono-data text-[#2244f5] text-[10px] tracking-widest uppercase mb-1">Đặt lịch tập thử</div>
                <h3 className="font-display font-black text-white text-3xl uppercase mb-1">{t.name}</h3>
                <p className="text-white/40 text-sm mb-6">{t.specialty} · {t.price}</p>
                <div className="space-y-4">
                  <input
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-[#2244f5] transition-colors"
                    placeholder="Họ và tên"
                    value={bookForm.name}
                    onChange={(e) => setBookForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-[#2244f5] transition-colors"
                    placeholder="Số điện thoại"
                    value={bookForm.phone}
                    onChange={(e) => setBookForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <div>
                    <div className="text-white/40 text-xs mb-2">Chọn khung giờ trống</div>
                    <div className="grid grid-cols-3 gap-2">
                      {["T2 · 8:00", "T3 · 10:00", "T4 · 14:00", "T5 · 7:00", "T6 · 18:00", "T7 · 9:00"].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setBookForm((f) => ({ ...f, date: slot }))}
                          className={`py-2 text-xs font-medium transition-all border ${bookForm.date === slot ? "bg-[#2244f5] text-black border-[#2244f5]" : "border-[#333] text-white/60 hover:border-[#2244f5] hover:text-white"}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-[#2244f5] text-black font-display font-bold uppercase tracking-wider py-4 hover:bg-white transition-colors">
                    Xác nhận đặt lịch →
                  </button>
                  <p className="text-white/30 text-xs text-center">Buổi đầu tiên miễn phí hoàn toàn</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}

function DigitalProducts() {
  const [preview, setPreview] = useState<number | null>(null);

  return (
    <section id="digital" className="py-24 px-6 lg:px-16 border-t border-[#242424]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.3em] uppercase mb-3">Kho Tài Nguyên Số</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display font-black text-white uppercase text-5xl lg:text-6xl leading-none">
              TẬP LUYỆN<br /><span className="text-[#2244f5]">TỰ CHỦ</span>
            </h2>
            <p className="text-white/50 max-w-xs lg:text-right text-sm leading-relaxed">
              Tải về & kích hoạt ngay sau thanh toán. Không cần chờ đợi, không cần hẹn lịch.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {digitalProducts.map((product) => (
            <div key={product.id} className="bg-[#111] border border-[#242424] overflow-hidden group hover:border-[#2244f5]/30 transition-all duration-300 flex flex-col">
              <div className="relative h-44 overflow-hidden bg-[#1a1a1a]">
                <img
                  src={`https://images.unsplash.com/${product.img}?w=400&h=250&fit=crop&auto=format`}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="font-mono-data text-[9px] bg-black/80 text-white/70 px-2 py-1 uppercase tracking-widest">
                    {product.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="font-mono-data text-[9px] bg-[#2244f5] text-black px-2 py-1 uppercase tracking-widest font-bold">
                    {product.tag}
                  </span>
                </div>
                {product.preview && (
                  <button
                    onClick={() => setPreview(product.id)}
                    className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    <span>▶</span> Xem thử
                  </button>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LevelBadge level={product.level} />
                  <span className="text-white/30 text-xs">{product.duration}</span>
                </div>
                <h3 className="font-display font-bold text-white text-lg uppercase leading-tight mb-2">{product.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.rating} />
                  <span className="font-mono-data text-[#2244f5] text-xs font-bold">{product.rating}</span>
                  <span className="text-white/30 text-xs">({product.reviews})</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-display font-black text-[#2244f5] text-2xl">{product.price}</span>
                    <span className="text-white/30 text-sm line-through">{product.oldPrice}</span>
                  </div>
                  <button className="w-full bg-[#2244f5] text-black font-display font-bold uppercase text-xs tracking-wider py-3 hover:bg-white transition-colors">
                    Mua ngay & Tải về →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview modal */}
        {preview !== null && (() => {
          const p = digitalProducts.find((d) => d.id === preview)!;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
              <div className="bg-[#111] border border-[#333] p-8 w-full max-w-lg relative">
                <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">✕</button>
                <div className="font-mono-data text-[#2244f5] text-[10px] tracking-widest uppercase mb-2">Xem trước miễn phí</div>
                <h3 className="font-display font-black text-white text-2xl uppercase mb-4">{p.title}</h3>
                <div className="bg-[#1a1a1a] border border-[#333] p-4 mb-6 text-sm text-white/60 leading-relaxed">
                  <p className="mb-2 font-medium text-white/80">Nội dung bài mẫu — Ngày 1: Khởi động và đánh giá nền tảng</p>
                  <p>Bài tập 1: Squat cơ bản — 4 sets × 10 reps @ 60% 1RM</p>
                  <p>Bài tập 2: Bench Press — 4 sets × 8 reps @ 65% 1RM</p>
                  <p>Bài tập 3: Deadlift — 3 sets × 6 reps @ 70% 1RM</p>
                  <p className="mt-3 text-[#2244f5]/70">+ 84 ngày giáo án chi tiết còn lại sau khi mua...</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#2244f5] text-black font-display font-bold uppercase py-3 hover:bg-white transition-colors">
                    Mua ngay {p.price}
                  </button>
                  <button onClick={() => setPreview(null)} className="px-4 border border-[#333] text-white/50 hover:text-white hover:border-[#666] transition-colors">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-24 px-6 lg:px-16 border-t border-[#242424] bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.3em] uppercase mb-3">Kết Quả Thực Tế</div>
          <h2 className="font-display font-black text-white uppercase text-5xl lg:text-6xl leading-none">
            CHỨNG MINH<br /><span className="text-[#2244f5]">BẰNG SỐ ĐO</span>
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {transformations.map((t, i) => (
            <div key={i} className="bg-[#111] border border-[#242424] overflow-hidden hover:border-[#2244f5]/20 transition-all">
              <div className="grid grid-cols-2 h-60">
                <div className="relative overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={`https://images.unsplash.com/${t.imgBefore}?w=300&h=300&fit=crop&auto=format`}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <span className="absolute bottom-3 left-3 font-mono-data text-[10px] bg-black/80 text-white/70 px-2 py-1 uppercase tracking-widest">
                    Trước
                  </span>
                </div>
                <div className="relative overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={`https://images.unsplash.com/${t.imgAfter}?w=300&h=300&fit=crop&auto=format`}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 right-3 font-mono-data text-[10px] bg-[#2244f5]/90 text-black px-2 py-1 uppercase tracking-widest font-bold">
                    Sau
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-display font-bold text-white text-xl uppercase">{t.name}</div>
                    <div className="font-mono-data text-white/40 text-xs">{t.age} tuổi · {t.duration}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-data text-xs text-white/40 line-through mb-0.5">{t.before}</div>
                    <div className="font-mono-data text-xs text-[#2244f5] font-bold">{t.after}</div>
                  </div>
                </div>
                <p className="text-white/60 text-sm italic leading-relaxed">"{t.quote}"</p>
              </div>
            </div>
          ))}
        </div>
        {/* Certifications bar */}
        <div className="mt-12 border border-[#242424] p-6">
          <div className="font-mono-data text-white/30 text-[9px] tracking-widest uppercase mb-4">Chứng chỉ & Đối tác chuyên môn</div>
          <div className="flex flex-wrap gap-4">
            {["NASM", "ACE", "ACSM", "NSCA", "Precision Nutrition", "Yoga Alliance", "FMS Certified"].map((cert) => (
              <span key={cert} className="font-mono-data text-xs text-white/50 border border-[#333] px-3 py-1.5 uppercase tracking-wider hover:border-[#2244f5]/40 hover:text-white/70 transition-colors">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BMICalculator() {
  const [form, setForm] = useState({ weight: "", height: "", age: "", gender: "male", activity: "moderate" });
  const [result, setResult] = useState<{ bmi: number; tdee: number; category: string } | null>(null);
  const [leadForm, setLeadForm] = useState({ email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const activityLevels: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const activityLabels: Record<string, string> = {
    sedentary: "Ít vận động",
    light: "Nhẹ (1-3 ngày/tuần)",
    moderate: "Vừa (3-5 ngày/tuần)",
    active: "Nhiều (6-7 ngày/tuần)",
    very_active: "Rất nhiều (2x/ngày)",
  };

  const calculate = () => {
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height) / 100;
    const a = parseInt(form.age);
    if (!w || !h || !a) return;
    const bmi = w / (h * h);
    const bmr = form.gender === "male"
      ? 88.362 + 13.397 * w + 4.799 * (h * 100) - 5.677 * a
      : 447.593 + 9.247 * w + 3.098 * (h * 100) - 4.33 * a;
    const tdee = bmr * activityLevels[form.activity];
    const category = bmi < 18.5 ? "Thiếu cân" : bmi < 25 ? "Bình thường" : bmi < 30 ? "Thừa cân" : "Béo phì";
    setResult({ bmi, tdee, category });
  };

  return (
    <section id="bmi" className="py-24 px-6 lg:px-16 border-t border-[#242424]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.3em] uppercase mb-3">Công cụ miễn phí</div>
          <h2 className="font-display font-black text-white uppercase text-5xl lg:text-6xl leading-none">
            TÍNH BMI<br /><span className="text-[#2244f5]">& TDEE</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-[#111] border border-[#242424] p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">Cân nặng (kg)</label>
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="75"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">Chiều cao (cm)</label>
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="170"
                  value={form.height}
                  onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">Tuổi</label>
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">Giới tính</label>
                <div className="flex h-[46px]">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      className={`flex-1 text-sm font-medium transition-all border ${form.gender === g ? "bg-[#2244f5] text-black border-[#2244f5]" : "bg-[#1a1a1a] border-[#333] text-white/60 hover:border-[#555]"}`}
                    >
                      {g === "male" ? "Nam" : "Nữ"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">Mức độ vận động</label>
              <select
                className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2244f5] transition-colors"
                value={form.activity}
                onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))}
              >
                {Object.entries(activityLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={calculate}
              className="w-full bg-[#2244f5] text-black font-display font-bold uppercase tracking-wider py-4 hover:bg-white transition-colors"
            >
              Tính ngay →
            </button>
          </div>

          {/* Result */}
          <div className="bg-[#111] border border-[#242424] p-6 flex flex-col">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1a1a1a] border border-[#242424] p-4">
                    <div className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest mb-2">Chỉ số BMI</div>
                    <div className="font-display font-black text-[#2244f5] text-5xl">{result.bmi.toFixed(1)}</div>
                    <div className={`font-mono-data text-xs mt-1 ${result.category === "Bình thường" ? "text-emerald-400" : "text-amber-400"}`}>
                      {result.category}
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#242424] p-4">
                    <div className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest mb-2">TDEE / ngày</div>
                    <div className="font-display font-black text-[#2244f5] text-5xl">{Math.round(result.tdee)}</div>
                    <div className="font-mono-data text-xs text-white/40 mt-1">kcal / ngày</div>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2244f5]/20 p-4 mb-6">
                  <div className="font-mono-data text-[10px] text-[#2244f5] uppercase tracking-widest mb-2">Khuyến nghị lộ trình</div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {result.category === "Thiếu cân"
                      ? `Để tăng cân lành mạnh, bạn cần nạp khoảng ${Math.round(result.tdee + 300) - 500} kcal/ngày và tập giáo án tăng cơ 4 ngày/tuần.`
                      : result.category === "Bình thường"
                      ? `Chỉ số lý tưởng! Để duy trì và cải thiện thể hình, hãy bắt đầu với giáo án Tăng Cơ 12 Tuần của chúng tôi.`
                      : `Để giảm mỡ hiệu quả, ăn deficit ${Math.round(result.tdee - 400)} kcal/ngày kết hợp giáo án HIIT 5 ngày/tuần.`}
                  </p>
                </div>

                {!submitted ? (
                  <div>
                    <div className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest mb-3">
                      Nhận giáo án cá nhân hóa + voucher 15% qua:
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        className="flex-1 bg-[#1a1a1a] border border-[#333] text-white px-3 py-2.5 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                        placeholder="Email hoặc SĐT"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                      />
                      <button
                        onClick={() => setSubmitted(true)}
                        className="bg-[#2244f5] text-black font-display font-bold uppercase text-xs tracking-wider px-4 hover:bg-white transition-colors"
                      >
                        Nhận →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#2244f5]/10 border border-[#2244f5]/30 p-4 text-center">
                    <div className="text-[#2244f5] font-display font-bold text-lg uppercase">Đã gửi!</div>
                    <p className="text-white/60 text-sm">Kiểm tra email/SĐT để nhận lộ trình cá nhân hóa và voucher 15%.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <div className="text-6xl mb-4">📊</div>
                <div className="font-display font-black text-white/20 text-3xl uppercase">Nhập chỉ số</div>
                <div className="text-white/30 text-sm mt-2">và nhận gợi ý lộ trình ngay lập tức</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AIBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="py-20 px-6 lg:px-16 border-t border-[#242424] bg-gradient-to-r from-[#0a0f2e] via-[#0d1540] to-[#080808]">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <div className="font-mono-data text-[#2244f5] text-[10px] tracking-[0.3em] uppercase mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2244f5] rounded-full animate-pulse" />
            Tính năng mới — AI Planner
          </div>
          <h2 className="font-display font-black text-white uppercase text-4xl lg:text-5xl leading-none mb-3">
            LỊCh TẬP & THỰC ĐƠN<br />
            <span className="text-[#2244f5]">TỰ ĐỘNG HOÁ BẰNG AI</span>
          </h2>
          <p className="text-white/50 max-w-lg text-sm leading-relaxed">
            Nhập chỉ số — AI tạo lịch tập theo ngày, tính toán macro, lên thực đơn cá nhân hoá theo mục tiêu của bạn. Lưu kế hoạch, xuất PDF, chỉnh sửa linh hoạt.
          </p>
          <div className="flex gap-6 mt-4 text-xs font-mono-data text-white/40">
            {["Streaming realtime", "Workout Plan Card", "Meal Plan + Macro", "Lưu & Quản lý"].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <span className="text-[#2244f5]">✓</span> {f}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onOpen}
          className="flex-shrink-0 bg-[#2244f5] text-white font-display font-black uppercase text-lg tracking-wider px-10 py-5 hover:bg-blue-500 transition-colors flex items-center gap-3"
        >
          <span>Thử AI ngay</span>
          <span className="text-2xl">→</span>
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#242424] py-12 px-6 lg:px-16 bg-[#080808]">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
        <div>
          <div className="font-display text-white text-2xl font-black tracking-widest uppercase mb-3">
            SPORT<span className="text-[#2244f5]">ZONE</span>
          </div>
          <p className="text-white/30 text-sm max-w-xs">Hệ thống huấn luyện toàn diện — số hóa và tại phòng tập. Kết quả thực sự, phương pháp khoa học.</p>
        </div>
        <div className="flex flex-wrap gap-12 text-sm">
          {[
            { title: "Dịch vụ", links: ["Gói Gym", "Thuê PT", "Khoá học số", "App Membership"] },
            { title: "Công ty", links: ["Về chúng tôi", "HLV của chúng tôi", "Chi nhánh", "Blog"] },
            { title: "Hỗ trợ", links: ["FAQ", "Liên hệ", "Hoàn tiền", "Điều khoản"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div className="font-mono-data text-[#2244f5] text-[10px] uppercase tracking-widest mb-3">{title}</div>
              <div className="space-y-2">
                {links.map((l) => (
                  <div key={l} className="text-white/40 hover:text-white/70 cursor-pointer transition-colors">{l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#1a1a1a] flex flex-col lg:flex-row items-center justify-between gap-2 text-white/20 text-xs">
        <span className="font-mono-data">© 2026 SportZone. All rights reserved.</span>
        <span className="font-mono-data">Hotline: 1800 6868 · contact@sportzone.vn</span>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [, setFilterResult] = useState<{ target: string; style: string; location: string } | null>(null);
  const [page, setPage] = useState<"home" | "ai">("home");

  if (page === "ai") return <AIPlanner onBack={() => setPage("home")} />;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Hero onFilter={(target, style, location) => setFilterResult({ target, style, location })} onOpenAI={() => setPage("ai")} />
      <GymPlans />
      <PTFinder />
      <DigitalProducts />
      <SocialProof />
      <BMICalculator />
      <AIBanner onOpen={() => setPage("ai")} />
      <Footer />
    </div>
  );
}
