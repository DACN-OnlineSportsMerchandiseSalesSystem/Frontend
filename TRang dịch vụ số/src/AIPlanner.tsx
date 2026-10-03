import { useState, useRef, useEffect } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface UserProfile {
  height: string;
  weight: string;
  age: string;
  gender: "male" | "female";
  activity: string;
  goal: string;
  location: string;
  injuries: string;
  diet: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  note?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface Meal {
  name: string;
  time: string;
  calories: number;
  items: string[];
  protein: number;
  carb: number;
  fat: number;
}

interface WorkoutPlan {
  title: string;
  days: WorkoutDay[];
  weeks: number;
  level: string;
}

interface MealPlan {
  title: string;
  totalCalories: number;
  protein: number;
  carb: number;
  fat: number;
  meals: Meal[];
}

interface SavedPlan {
  id: string;
  type: "workout" | "meal";
  title: string;
  savedAt: string;
  tag: "Active" | "Archived" | "Custom";
  workout?: WorkoutPlan;
  meal?: MealPlan;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_WORKOUT: WorkoutPlan = {
  title: "Push-Pull-Legs 4 Buổi/Tuần",
  weeks: 8,
  level: "Intermediate",
  days: [
    {
      day: "Thứ 2",
      focus: "PUSH — Ngực · Vai · Tam đầu",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8–10", rest: "90s", note: "Kiểm soát phase âm 2s" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "75s" },
        { name: "Cable Fly", sets: 3, reps: "12–15", rest: "60s" },
        { name: "Overhead Press", sets: 4, reps: "8–10", rest: "90s" },
        { name: "Lateral Raise", sets: 3, reps: "15–20", rest: "45s" },
        { name: "Tricep Pushdown", sets: 3, reps: "12–15", rest: "60s" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12–15", rest: "60s" },
      ],
    },
    {
      day: "Thứ 3",
      focus: "PULL — Lưng · Nhị đầu",
      exercises: [
        { name: "Deadlift", sets: 4, reps: "5–6", rest: "2 phút", note: "Ưu tiên kỹ thuật trước tải" },
        { name: "Pull-up / Lat Pulldown", sets: 4, reps: "8–10", rest: "90s" },
        { name: "Seated Cable Row", sets: 3, reps: "10–12", rest: "75s" },
        { name: "Face Pull", sets: 3, reps: "15–20", rest: "45s" },
        { name: "Barbell Curl", sets: 3, reps: "10–12", rest: "60s" },
        { name: "Hammer Curl", sets: 3, reps: "12–15", rest: "60s" },
      ],
    },
    {
      day: "Thứ 5",
      focus: "LEGS — Đùi · Mông · Bắp chân",
      exercises: [
        { name: "Back Squat", sets: 4, reps: "8–10", rest: "2 phút", note: "Depth: dưới song song" },
        { name: "Romanian Deadlift", sets: 3, reps: "10–12", rest: "90s" },
        { name: "Leg Press", sets: 3, reps: "12–15", rest: "75s" },
        { name: "Leg Curl", sets: 3, reps: "12–15", rest: "60s" },
        { name: "Walking Lunge", sets: 3, reps: "12 mỗi chân", rest: "60s" },
        { name: "Standing Calf Raise", sets: 4, reps: "15–20", rest: "45s" },
      ],
    },
    {
      day: "Thứ 6",
      focus: "UPPER — Phối hợp toàn thân trên",
      exercises: [
        { name: "Weighted Dip", sets: 4, reps: "8–10", rest: "90s" },
        { name: "One-Arm Dumbbell Row", sets: 4, reps: "10–12 mỗi bên", rest: "75s" },
        { name: "Arnold Press", sets: 3, reps: "10–12", rest: "75s" },
        { name: "Cable Row (Narrow Grip)", sets: 3, reps: "12–15", rest: "60s" },
        { name: "Cable Lateral Raise", sets: 3, reps: "15–20", rest: "45s" },
        { name: "EZ-Bar Curl + Skullcrusher superset", sets: 3, reps: "10 + 10", rest: "90s" },
      ],
    },
  ],
};

const MOCK_MEAL: MealPlan = {
  title: "Eat Clean 1800 kcal/ngày",
  totalCalories: 1800,
  protein: 150,
  carb: 180,
  fat: 55,
  meals: [
    {
      name: "Bữa sáng",
      time: "7:00",
      calories: 420,
      protein: 35,
      carb: 45,
      fat: 12,
      items: ["3 quả trứng gà luộc", "2 lát bánh mì nguyên cám", "200ml sữa ít béo", "1 quả chuối"],
    },
    {
      name: "Bữa phụ sáng",
      time: "10:00",
      calories: 200,
      protein: 20,
      carb: 20,
      fat: 5,
      items: ["1 hũ Greek yogurt không đường", "30g hạt óc chó", "1 nắm dâu tây"],
    },
    {
      name: "Bữa trưa",
      time: "12:30",
      calories: 520,
      protein: 45,
      carb: 60,
      fat: 15,
      items: ["150g ức gà áp chảo", "150g cơm gạo lứt", "200g rau xanh xào tỏi", "Canh rau củ"],
    },
    {
      name: "Bữa phụ chiều (Pre-workout)",
      time: "16:00",
      calories: 250,
      protein: 25,
      carb: 30,
      fat: 5,
      items: ["1 scoop Whey Protein", "1 quả táo", "5 bánh gạo lứt"],
    },
    {
      name: "Bữa tối",
      time: "19:30",
      calories: 410,
      protein: 40,
      carb: 35,
      fat: 13,
      items: ["150g cá hồi nướng", "100g khoai lang luộc", "300g salad rau trộn dầu olive", "1 quả trứng"],
    },
  ],
};

const WORKOUT_RESPONSE = `Dựa trên thông số của bạn, đây là lịch tập **Push-Pull-Legs 4 buổi/tuần** được thiết kế tối ưu:\n\n✅ Phù hợp với mục tiêu tăng cơ của bạn\n✅ Phân chia nhóm cơ khoa học, tránh chồng chéo\n✅ Thời gian phục hồi đủ giữa các buổi\n\nLịch tập chi tiết bên dưới:`;

const MEAL_RESPONSE = `Đây là thực đơn **Eat Clean 1800 kcal/ngày** được tính toán theo chỉ số TDEE của bạn:\n\n🥗 Tỷ lệ macro tối ưu cho giai đoạn giảm mỡ\n💪 Protein cao (150g) để bảo vệ khối cơ\n🔥 Tạo deficit ~300 kcal/ngày giúp giảm 0.3–0.5kg/tuần\n\nThực đơn chi tiết bên dưới:`;

const QUICK_PROMPTS = [
  "Lịch tập Push-Pull-Legs 4 buổi/tuần",
  "Thực đơn Eat Clean 1800 kcal/ngày",
  "Bài tập tăng cơ tại nhà không cần thiết bị",
  "Thực đơn Keto cho người tập gym",
  "Lịch tập Full Body 3 ngày/tuần cho người mới",
  "Thực đơn tăng cơ 2500 kcal/ngày",
];

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Ít vận động (văn phòng)",
  light: "Nhẹ (1–3 ngày/tuần)",
  moderate: "Vừa (3–5 ngày/tuần)",
  active: "Nhiều (6–7 ngày/tuần)",
  very_active: "Rất nhiều (2 lần/ngày)",
};

// ─── ONBOARDING MODAL ─────────────────────────────────────────────────────────

function OnboardingModal({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    height: "",
    weight: "",
    age: "",
    gender: "male",
    activity: "moderate",
    goal: "",
    location: "gym",
    injuries: "",
    diet: "",
  });

  const set = (key: keyof UserProfile, val: string) =>
    setProfile((p) => ({ ...p, [key]: val }));

  const goals = [
    { id: "bulk", label: "Tăng cơ", icon: "💪", desc: "Tăng khối lượng cơ bắp" },
    { id: "cut", label: "Giảm mỡ", icon: "🔥", desc: "Đốt mỡ, giữ cơ nạc" },
    { id: "maintain", label: "Duy trì", icon: "⚖️", desc: "Giữ vóc dáng hiện tại" },
    { id: "endurance", label: "Sức bền", icon: "🏃", desc: "Tăng thể lực & cardio" },
  ];

  const diets = [
    { id: "", label: "Không giới hạn" },
    { id: "eatclean", label: "Eat Clean" },
    { id: "keto", label: "Keto" },
    { id: "vegan", label: "Ăn chay" },
    { id: "allergy", label: "Dị ứng thực phẩm" },
  ];

  const canNext = [
    profile.height && profile.weight && profile.age,
    profile.goal,
    true,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      <div className="bg-[#111] border border-[#242424] w-full max-w-lg relative overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#242424] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-mono-data text-[#2244f5] text-[10px] tracking-widest uppercase">
              AI Planner · Khởi tạo
            </div>
            <h2 className="font-display font-black text-white text-2xl uppercase">
              {step === 0 ? "Chỉ số cơ thể" : step === 1 ? "Mục tiêu của bạn" : "Tuỳ chọn nâng cao"}
            </h2>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 transition-all ${i <= step ? "bg-[#2244f5]" : "bg-[#333]"}`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["height", "Chiều cao (cm)", "170"],
                  ["weight", "Cân nặng (kg)", "70"],
                  ["age", "Tuổi", "25"],
                ] as [keyof UserProfile, string, string][]).map(([key, label, ph]) => (
                  <div key={key} className={key === "age" ? "" : ""}>
                    <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-1.5">
                      {label}
                    </label>
                    <input
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                      placeholder={ph}
                      value={profile[key]}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  </div>
                ))}
                <div>
                  <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-1.5">
                    Giới tính
                  </label>
                  <div className="flex h-[46px]">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => set("gender", g)}
                        className={`flex-1 text-sm font-medium transition-all border ${profile.gender === g ? "bg-[#2244f5] text-white border-[#2244f5]" : "bg-[#1a1a1a] border-[#333] text-white/60 hover:border-[#555]"}`}
                      >
                        {g === "male" ? "Nam" : "Nữ"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-1.5">
                  Mức độ vận động hiện tại
                </label>
                <select
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2244f5] transition-colors"
                  value={profile.activity}
                  onChange={(e) => set("activity", e.target.value)}
                >
                  {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => set("goal", g.id)}
                  className={`p-4 text-left border transition-all ${profile.goal === g.id ? "border-[#2244f5] bg-[#2244f5]/10" : "border-[#333] bg-[#1a1a1a] hover:border-[#555]"}`}
                >
                  <div className="text-2xl mb-2">{g.icon}</div>
                  <div className="font-display font-bold text-white text-lg uppercase">{g.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                  Địa điểm tập
                </label>
                <div className="flex">
                  {[["gym", "🏋️ Tại phòng gym"], ["home", "🏠 Tại nhà"]].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => set("location", v)}
                      className={`flex-1 py-3 text-sm font-medium border transition-all ${profile.location === v ? "bg-[#2244f5] text-white border-[#2244f5]" : "bg-[#1a1a1a] border-[#333] text-white/60 hover:border-[#555]"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                  Chế độ ăn uống
                </label>
                <div className="flex flex-wrap gap-2">
                  {diets.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => set("diet", d.id)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-all ${profile.diet === d.id ? "bg-[#2244f5] text-white border-[#2244f5]" : "border-[#333] text-white/60 hover:border-[#2244f5] hover:text-white"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                  Chấn thương / hạn chế vận động (nếu có)
                </label>
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="Ví dụ: đau vai phải, chấn thương gối..."
                  value={profile.injuries}
                  onChange={(e) => set("injuries", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#242424] px-6 py-4 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-3 border border-[#333] text-white/60 hover:text-white hover:border-[#555] text-sm font-medium transition-colors"
            >
              ← Quay lại
            </button>
          )}
          <button
            onClick={() => step < 2 ? setStep((s) => s + 1) : onComplete(profile)}
            disabled={!canNext[step]}
            className="flex-1 bg-[#2244f5] text-white font-display font-bold uppercase tracking-wider py-3 hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step < 2 ? "Tiếp theo →" : "Bắt đầu trải nghiệm AI →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function MacroDonut({ protein, carb, fat }: { protein: number; carb: number; fat: number }) {
  const total = protein * 4 + carb * 4 + fat * 9;
  const proteinPct = (protein * 4) / total;
  const carbPct = (carb * 4) / total;
  const fatPct = (fat * 9) / total;

  const r = 42;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { pct: proteinPct, color: "#2244f5", label: "Protein", grams: protein },
    { pct: carbPct, color: "#60a5fa", label: "Carbs", grams: carb },
    { pct: fatPct, color: "#1e3a8a", label: "Fat", grams: fat },
  ];

  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="112" height="112" viewBox="0 0 112 112" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a1a" strokeWidth="16" />
        {segments.map((seg, i) => {
          const dash = seg.pct * circumference;
          const gap = circumference - dash;
          const rotation = -90 + offset * 360;
          offset += seg.pct;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="font-mono-data" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fill: "#fff", fontWeight: 700 }}>
          {Math.round(total / 4 * 4 / 4)} cal
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "8px", fill: "#666" }}>
          kcal
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-white/50 text-xs w-12">{seg.label}</span>
            <span className="font-mono-data text-white font-bold text-xs">{seg.grams}g</span>
            <span className="text-white/30 text-xs">({Math.round(seg.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WORKOUT PLAN CARD ────────────────────────────────────────────────────────

function WorkoutPlanCard({ plan, onSave }: { plan: WorkoutPlan; onSave: () => void }) {
  const [activeDay, setActiveDay] = useState(0);
  const day = plan.days[activeDay];

  return (
    <div className="bg-[#111] border border-[#2244f5]/30 overflow-hidden">
      {/* Card header */}
      <div className="bg-[#2244f5]/10 border-b border-[#2244f5]/20 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-mono-data text-[#2244f5] text-[9px] tracking-widest uppercase mb-0.5">
            Workout Plan · {plan.weeks} tuần · {plan.level}
          </div>
          <div className="font-display font-black text-white text-lg uppercase">{plan.title}</div>
        </div>
        <button
          onClick={onSave}
          className="text-xs border border-[#2244f5]/40 text-[#2244f5] px-3 py-1.5 hover:bg-[#2244f5]/10 transition-colors font-medium"
        >
          💾 Lưu
        </button>
      </div>
      {/* Day tabs */}
      <div className="flex border-b border-[#242424] overflow-x-auto">
        {plan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${activeDay === i ? "border-[#2244f5] text-[#2244f5] bg-[#2244f5]/5" : "border-transparent text-white/40 hover:text-white/70"}`}
          >
            {d.day}
          </button>
        ))}
      </div>
      {/* Day content */}
      <div className="p-4">
        <div className="font-mono-data text-[10px] text-[#2244f5] uppercase tracking-widest mb-3">{day.focus}</div>
        <div className="space-y-0 border border-[#242424]">
          {/* Table header */}
          <div className="grid grid-cols-12 bg-[#1a1a1a] px-3 py-2 text-[10px] font-mono-data text-white/30 uppercase tracking-widest">
            <span className="col-span-5">Bài tập</span>
            <span className="col-span-2 text-center">Sets</span>
            <span className="col-span-2 text-center">Reps</span>
            <span className="col-span-3 text-center">Nghỉ</span>
          </div>
          {day.exercises.map((ex, i) => (
            <div key={i} className={`grid grid-cols-12 px-3 py-2.5 text-sm border-t border-[#242424] ${i % 2 === 0 ? "bg-transparent" : "bg-[#0f0f0f]"} hover:bg-[#2244f5]/5 transition-colors`}>
              <div className="col-span-5">
                <div className="text-white/90 font-medium text-xs">{ex.name}</div>
                {ex.note && <div className="text-white/30 text-[10px] mt-0.5">{ex.note}</div>}
              </div>
              <div className="col-span-2 text-center font-mono-data text-[#2244f5] font-bold text-xs">{ex.sets}</div>
              <div className="col-span-2 text-center font-mono-data text-white/70 text-xs">{ex.reps}</div>
              <div className="col-span-3 text-center font-mono-data text-white/40 text-xs">{ex.rest}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MEAL PLAN CARD ───────────────────────────────────────────────────────────

function MealPlanCard({ plan, onSave }: { plan: MealPlan; onSave: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="bg-[#111] border border-[#2244f5]/30 overflow-hidden">
      {/* Header */}
      <div className="bg-[#2244f5]/10 border-b border-[#2244f5]/20 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-mono-data text-[#2244f5] text-[9px] tracking-widest uppercase mb-0.5">
            Meal Plan · {plan.totalCalories} kcal/ngày
          </div>
          <div className="font-display font-black text-white text-lg uppercase">{plan.title}</div>
        </div>
        <button
          onClick={onSave}
          className="text-xs border border-[#2244f5]/40 text-[#2244f5] px-3 py-1.5 hover:bg-[#2244f5]/10 transition-colors font-medium"
        >
          💾 Lưu
        </button>
      </div>
      {/* Macro overview */}
      <div className="px-4 py-4 border-b border-[#242424]">
        <div className="font-mono-data text-[10px] text-white/30 uppercase tracking-widest mb-3">Tỷ lệ Macro hàng ngày</div>
        <MacroDonut protein={plan.protein} carb={plan.carb} fat={plan.fat} />
      </div>
      {/* Meals */}
      <div className="divide-y divide-[#1a1a1a]">
        {plan.meals.map((meal, i) => (
          <div key={i}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-[10px] text-white/30 w-10">{meal.time}</span>
                <span className="text-sm font-medium text-white">{meal.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-[#2244f5] text-xs font-bold">{meal.calories} kcal</span>
                <span className={`text-white/30 text-xs transition-transform ${expanded === i ? "rotate-180" : ""}`}>▼</span>
              </div>
            </button>
            {expanded === i && (
              <div className="px-4 pb-4 bg-[#0f0f0f]">
                <div className="flex gap-4 mb-3 text-xs font-mono-data">
                  <span className="text-[#2244f5]">P: {meal.protein}g</span>
                  <span className="text-blue-400">C: {meal.carb}g</span>
                  <span className="text-blue-800 text-blue-300">F: {meal.fat}g</span>
                </div>
                <ul className="space-y-1">
                  {meal.items.map((item, j) => (
                    <li key={j} className="text-xs text-white/60 flex items-center gap-2">
                      <span className="text-[#2244f5] text-[8px]">●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SAVED PLANS DASHBOARD ────────────────────────────────────────────────────

function SavedDashboard({ plans, onLoad, onDelete }: {
  plans: SavedPlan[];
  onLoad: (p: SavedPlan) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "workout" | "meal">("all");
  const filtered = plans.filter((p) => filter === "all" || p.type === filter);

  const tagColors: Record<string, string> = {
    Active: "bg-emerald-900/50 text-emerald-300",
    Archived: "bg-[#333] text-white/40",
    Custom: "bg-[#2244f5]/20 text-[#2244f5]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-black text-white text-2xl uppercase">Kế hoạch đã lưu</h3>
        <div className="flex bg-[#111] border border-[#242424] text-xs">
          {(["all", "workout", "meal"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 uppercase tracking-wider font-medium transition-colors ${filter === f ? "bg-[#2244f5] text-white" : "text-white/40 hover:text-white"}`}
            >
              {f === "all" ? "Tất cả" : f === "workout" ? "Lịch tập" : "Thực đơn"}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          <div className="text-4xl mb-3">📂</div>
          <div className="font-display text-2xl uppercase">Chưa có kế hoạch nào</div>
          <div className="text-sm mt-1">Lưu lịch tập hoặc thực đơn từ chat để xem ở đây</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <div key={plan.id} className="bg-[#111] border border-[#242424] p-4 hover:border-[#2244f5]/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono-data text-[10px] text-white/30 uppercase tracking-widest mb-1">
                    {plan.type === "workout" ? "🏋️ Lịch tập" : "🥗 Thực đơn"}
                  </div>
                  <div className="font-display font-bold text-white text-base uppercase leading-tight">{plan.title}</div>
                </div>
                <span className={`font-mono-data text-[9px] px-2 py-1 uppercase tracking-widest ${tagColors[plan.tag]}`}>
                  {plan.tag}
                </span>
              </div>
              <div className="text-white/30 text-xs mb-4">{plan.savedAt}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => onLoad(plan)}
                  className="flex-1 text-xs border border-[#2244f5]/40 text-[#2244f5] py-2 hover:bg-[#2244f5]/10 transition-colors font-medium"
                >
                  Xem lại
                </button>
                <button className="text-xs border border-[#333] text-white/40 px-3 py-2 hover:border-[#555] hover:text-white/60 transition-colors">
                  PDF
                </button>
                <button
                  onClick={() => onDelete(plan.id)}
                  className="text-xs border border-[#333] text-white/30 px-3 py-2 hover:border-red-800 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CHAT MESSAGE ─────────────────────────────────────────────────────────────

function ChatBubble({
  msg,
  onSaveWorkout,
  onSaveMeal,
}: {
  msg: ChatMessage;
  onSaveWorkout: (p: WorkoutPlan) => void;
  onSaveMeal: (p: MealPlan) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-[#2244f5] text-white px-4 py-3 max-w-xs text-sm rounded-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 bg-[#2244f5] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
        AI
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white/80 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {msg.content}
          {msg.streaming && <span className="inline-block w-1 h-4 bg-[#2244f5] ml-0.5 animate-pulse align-middle" />}
        </div>
        {!msg.streaming && msg.workoutPlan && (
          <WorkoutPlanCard plan={msg.workoutPlan} onSave={() => onSaveWorkout(msg.workoutPlan!)} />
        )}
        {!msg.streaming && msg.mealPlan && (
          <MealPlanCard plan={msg.mealPlan} onSave={() => onSaveMeal(msg.mealPlan!)} />
        )}
      </div>
    </div>
  );
}

// ─── MAIN AI PLANNER ──────────────────────────────────────────────────────────

export default function AIPlanner({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [view, setView] = useState<"chat" | "saved">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    setShowOnboarding(false);
    const goalLabels: Record<string, string> = {
      bulk: "tăng cơ",
      cut: "giảm mỡ",
      maintain: "duy trì vóc dáng",
      endurance: "tăng sức bền",
    };
    const greeting: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: `Xin chào! Tôi đã ghi nhận thông số của bạn — ${p.height}cm · ${p.weight}kg · ${p.age} tuổi, mục tiêu **${goalLabels[p.goal] || p.goal}** tại ${p.location === "gym" ? "phòng gym" : "nhà"}.\n\nBạn có thể hỏi tôi về lịch tập hoặc thực đơn. Dưới đây là một số gợi ý nhanh:`,
    };
    setMessages([greeting]);
  };

  const streamText = (fullText: string, msgId: string, onDone: () => void) => {
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: fullText.slice(0, i), streaming: i < fullText.length } : m
        )
      );
      if (i >= fullText.length) {
        clearInterval(interval);
        onDone();
      }
    }, 18);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput("");
    setIsStreaming(true);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    const isWorkout = text.toLowerCase().includes("lịch tập") || text.toLowerCase().includes("push") || text.toLowerCase().includes("full body") || text.toLowerCase().includes("tăng cơ") || text.toLowerCase().includes("bài tập");
    const isMeal = text.toLowerCase().includes("thực đơn") || text.toLowerCase().includes("ăn") || text.toLowerCase().includes("meal") || text.toLowerCase().includes("kcal") || text.toLowerCase().includes("dinh dưỡng");

    const responseText = isWorkout ? WORKOUT_RESPONSE : isMeal ? MEAL_RESPONSE : "Tôi hiểu câu hỏi của bạn. Dựa trên thông số đã nhập, đây là gợi ý phù hợp nhất cho mục tiêu của bạn. Hãy thử hỏi cụ thể hơn về lịch tập hoặc thực đơn để tôi có thể tạo kế hoạch chi tiết!";

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      streaming: true,
      workoutPlan: isWorkout ? MOCK_WORKOUT : undefined,
      mealPlan: isMeal ? MOCK_MEAL : undefined,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);

    streamText(responseText, aiMsgId, () => {
      setIsStreaming(false);
    });
  };

  const savePlan = (type: "workout" | "meal", plan: WorkoutPlan | MealPlan) => {
    const now = new Date();
    const saved: SavedPlan = {
      id: Date.now().toString(),
      type,
      title: plan.title,
      savedAt: now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      tag: "Active",
      workout: type === "workout" ? (plan as WorkoutPlan) : undefined,
      meal: type === "meal" ? (plan as MealPlan) : undefined,
    };
    setSavedPlans((prev) => [saved, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Top bar */}
      <div className="border-b border-[#242424] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            ← Trang chủ
          </button>
          <div className="w-px h-4 bg-[#333]" />
          <div className="font-display font-black text-white text-xl uppercase">
            SPORT<span className="text-[#2244f5]">ZONE</span>
            <span className="text-white/30 text-base ml-2">AI Planner</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:flex items-center gap-2 text-xs text-white/30 font-mono-data border border-[#242424] px-3 py-1.5">
              <span className="text-[#2244f5]">●</span>
              {profile.weight}kg · {profile.height}cm · {profile.goal}
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-white/20 hover:text-white/50 ml-1"
              >
                ✎
              </button>
            </div>
          )}
          <div className="flex bg-[#111] border border-[#242424]">
            {(["chat", "saved"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${view === v ? "bg-[#2244f5] text-white" : "text-white/40 hover:text-white"}`}
              >
                {v === "chat" ? "💬 Chat" : `📂 Đã lưu ${savedPlans.length > 0 ? `(${savedPlans.length})` : ""}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "saved" ? (
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-5xl mx-auto w-full">
          <SavedDashboard
            plans={savedPlans}
            onLoad={(p) => {
              setView("chat");
              if (p.workout) {
                setMessages((prev) => [...prev, {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: `Đây là kế hoạch "${p.title}" bạn đã lưu:`,
                  workoutPlan: p.workout,
                }]);
              } else if (p.meal) {
                setMessages((prev) => [...prev, {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: `Đây là thực đơn "${p.title}" bạn đã lưu:`,
                  mealPlan: p.meal,
                }]);
              }
            }}
            onDelete={(id) => setSavedPlans((prev) => prev.filter((p) => p.id !== id))}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 && !showOnboarding && (
                <div className="text-center py-20 text-white/20">
                  <div className="text-5xl mb-4">🤖</div>
                  <div className="font-display text-3xl uppercase">AI của bạn sẵn sàng</div>
                  <div className="text-sm mt-2">Hãy đặt câu hỏi hoặc chọn gợi ý bên dưới</div>
                </div>
              )}
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  onSaveWorkout={(p) => savePlan("workout", p)}
                  onSaveMeal={(p) => savePlan("meal", p)}
                />
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick prompts + Input */}
          <div className="border-t border-[#242424] bg-[#080808] px-4 md:px-8 py-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              {/* Quick prompts */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isStreaming}
                    className="flex-shrink-0 text-xs border border-[#333] text-white/50 px-3 py-1.5 hover:border-[#2244f5] hover:text-[#2244f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              {/* Input */}
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#2244f5] transition-colors"
                  placeholder="Hỏi về lịch tập, thực đơn, dinh dưỡng..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  disabled={isStreaming}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  className="bg-[#2244f5] text-white px-5 py-3 font-display font-bold uppercase text-sm hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isStreaming ? (
                    <span className="flex gap-1 items-center">
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : "Gửi →"}
                </button>
              </div>
              <div className="text-white/20 text-[10px] font-mono-data mt-2">
                Powered by Gemini AI · Mô phỏng demo — kết nối API key để sử dụng thực tế
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
