import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, BookOpen, AlertCircle, Calendar, Sparkles, ChevronRight, CheckCircle2, RotateCcw, FileText, ShoppingBag, Dumbbell, UserCheck, ArrowRight, ExternalLink } from "lucide-react";
import aiPlannerService, {
  AiPlannerResponse,
  AiPlanSnapshotEntity,
  CalculatedMetrics,
  ValidationReport,
  WorkoutPlanData,
  MealPlanData,
  ScientificReference
} from "../../services/aiPlannerService";

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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  metrics?: CalculatedMetrics;
  validationReport?: ValidationReport;
  workoutPlan?: WorkoutPlanData;
  mealPlan?: MealPlanData;
  scientificReferences?: ScientificReference[];
  legalDisclaimer?: string;
  fullPlanData?: AiPlannerResponse;
}

// ─── QUICK PROMPTS ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "⚡ Tạo lịch tập tăng cơ 4 buổi/tuần",
  "🥗 Thực đơn giảm mỡ chuẩn món Việt",
  "🔄 Đổi ức gà bữa trưa sang thịt bò",
  "🛡️ Kiểm tra cân bằng nhiệt động học 4P+4C+9F",
  "📚 Xem các nghiên cứu y khoa tham chiếu (ACSM, ISSN)",
  "📅 Xuất lịch tập .ics cho điện thoại",
];

// ─── ONBOARDING MODAL ─────────────────────────────────────────────────────────

function OnboardingModal({
  onComplete,
  onClose,
}: {
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    height: "172",
    weight: "68",
    age: "24",
    gender: "male",
    activity: "moderate",
    goal: "bulk",
    location: "gym",
    injuries: "",
    diet: "",
  });

  const canNext = [
    Boolean(profile.height && profile.weight && profile.age && profile.gender),
    Boolean(profile.activity && profile.goal && profile.location),
    true,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-lg overflow-hidden shadow-2xl relative rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted z-10 w-8 h-8 flex items-center justify-center font-bold text-sm"
            title="Đóng / Quay lại"
          >
            ✕
          </button>
        )}

        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-mono text-blue-600 dark:text-blue-400 text-xs tracking-wider uppercase font-bold mb-1">
              Khởi tạo hồ sơ sinh học · Module 1 Deterministic
            </div>
            <div className="font-sans font-black text-foreground text-xl uppercase">
              {step === 0 && "1. Chỉ số cơ thể"}
              {step === 1 && "2. Mục tiêu & Môi trường"}
              {step === 2 && "3. Ràng buộc an toàn"}
            </div>
          </div>
          <div className="font-mono text-muted-foreground text-xs mr-8 font-semibold">{step + 1} / 3</div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-foreground text-xs font-semibold block mb-1.5 uppercase tracking-wider">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    placeholder="172"
                  />
                </div>
                <div>
                  <label className="text-foreground text-xs font-semibold block mb-1.5 uppercase tracking-wider">Cân nặng (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    placeholder="68"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-foreground text-xs font-semibold block mb-1.5 uppercase tracking-wider">Tuổi</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="text-foreground text-xs font-semibold block mb-1.5 uppercase tracking-wider">Giới tính</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setProfile({ ...profile, gender: g })}
                        className={`py-2.5 text-xs font-bold uppercase transition-all rounded-xl border ${profile.gender === g ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                      >
                        {g === "male" ? "Nam" : "Nữ"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-foreground text-xs font-semibold block mb-2 uppercase tracking-wider">Mục tiêu thể hình</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "bulk", label: "Tăng cơ (Surplus +350 kcal)" },
                    { val: "cut", label: "Giảm mỡ (Deficit -400 kcal)" },
                    { val: "maintain", label: "Duy trì vóc dáng" },
                    { val: "endurance", label: "Tăng sức bền thể thao" },
                  ].map((g) => (
                    <button
                      key={g.val}
                      onClick={() => setProfile({ ...profile, goal: g.val })}
                      className={`p-3 text-left transition-all rounded-xl border ${profile.goal === g.val ? "bg-blue-50 border-blue-600 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold shadow-sm" : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      <div className="text-xs font-semibold">{g.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-foreground text-xs font-semibold block mb-2 uppercase tracking-wider">Mức độ vận động (PAL theo WHO)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "sedentary", label: "Ít vận động (1.2)" },
                    { val: "moderate", label: "Vừa phải (1.55)" },
                    { val: "active", label: "Năng động (1.72)" },
                  ].map((a) => (
                    <button
                      key={a.val}
                      onClick={() => setProfile({ ...profile, activity: a.val })}
                      className={`p-2.5 text-center transition-all rounded-xl border ${profile.activity === a.val ? "bg-blue-600 border-blue-600 text-white font-bold" : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      <div className="text-xs font-semibold">{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-foreground text-xs font-semibold block mb-2 uppercase tracking-wider">Địa điểm tập luyện</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "gym", label: "🏢 Phòng Gym (Tạ đòn, máy khối)" },
                    { val: "home", label: "🏠 Tại nhà (Tạ đơn, Calisthenics)" },
                  ].map((l) => (
                    <button
                      key={l.val}
                      onClick={() => setProfile({ ...profile, location: l.val })}
                      className={`p-2.5 text-left transition-all rounded-xl border ${profile.location === l.val ? "bg-blue-50 border-blue-600 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold shadow-sm" : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      <div className="text-xs font-semibold">{l.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-foreground text-xs font-semibold block mb-1.5 uppercase tracking-wider">
                  Tiền sử chấn thương / Khớp yếu (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={profile.injuries}
                  onChange={(e) => setProfile({ ...profile, injuries: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-2.5 text-foreground text-xs rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  placeholder="Ví dụ: Đau khớp gối nhẹ, đau lưng dưới, cổ tay yếu..."
                />
              </div>
              <div>
                <label className="text-foreground text-xs font-semibold block mb-1.5 uppercase tracking-wider">
                  Ưu tiên ẩm thực / Dị ứng (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={profile.diet}
                  onChange={(e) => setProfile({ ...profile, diet: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-2.5 text-foreground text-xs rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  placeholder="Ví dụ: Món Việt dễ nấu, không uống được sữa lactose, ăn chay..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex gap-3 bg-muted/40">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 border border-border text-foreground hover:bg-muted text-sm font-semibold transition-colors rounded-xl"
            >
              ← Quay lại
            </button>
          )}
          <button
            onClick={() => (step < 2 ? setStep((s) => s + 1) : onComplete(profile))}
            disabled={!canNext[step]}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold uppercase tracking-wider py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md"
          >
            {step < 2 ? "Tiếp theo →" : "Tạo kế hoạch 6 Module với AI →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function MacroDonut({ protein, carb, fat }: { protein: number; carb: number; fat: number }) {
  const total = protein * 4 + carb * 4 + fat * 9;
  const proteinPct = total > 0 ? (protein * 4) / total : 0.3;
  const carbPct = total > 0 ? (carb * 4) / total : 0.45;
  const fatPct = total > 0 ? (fat * 9) / total : 0.25;

  const r = 38;
  const cx = 48;
  const cy = 48;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { pct: proteinPct, color: "#2563eb", label: "Protein", grams: protein },
    { pct: carbPct, color: "#0284c7", label: "Carbs", grams: carb },
    { pct: fatPct, color: "#f59e0b", label: "Fat", grams: fat },
  ];

  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width="96" height="96" viewBox="0 0 96 96" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" className="text-muted" strokeWidth="14" />
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
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          );
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" className="font-mono font-bold text-xs fill-foreground">
          {Math.round(total)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="font-mono text-[9px] fill-muted-foreground">
          kcal
        </text>
      </svg>
      <div className="space-y-1.5 text-xs">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground w-12 font-medium">{seg.label}</span>
            <span className="font-mono text-foreground font-bold">{Math.round(seg.grams)}g</span>
            <span className="text-muted-foreground">({Math.round(seg.pct * 100)}%)</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── SCIENTIFIC REFERENCES CARD (HẠNG MỤC 1) ──────────────────────────────────

function ScientificReferencesCard({ references }: { references?: ScientificReference[] }) {
  const [isOpen, setIsOpen] = useState(true);
  if (!references || references.length === 0) return null;

  return (
    <div className="bg-card text-card-foreground border border-blue-200 dark:border-blue-900/60 rounded-2xl overflow-hidden my-3 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-50/70 dark:bg-blue-950/30 px-4 py-3 border-b border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between text-left transition-colors hover:bg-blue-100/50"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold">
              Cơ sở Y khoa & Khoa học Thể thao
            </div>
            <div className="font-sans font-bold text-foreground text-sm">
              Tham Chiếu Nguyên Lý Khoa Học (ACSM · ISSN · WHO · AJCN)
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
          {isOpen ? "Thu gọn ▲" : "Mở rộng ▼"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {references.map((ref, idx) => (
              <div
                key={idx}
                className="bg-muted/40 border border-border p-3.5 rounded-xl flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      {ref.domain}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                      {ref.year}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-foreground mb-1 leading-snug">
                    {ref.principle}
                  </h5>
                  <p className="text-[11px] text-muted-foreground italic mb-2">
                    {ref.citation}
                  </p>
                </div>
                <div className="pt-2 border-t border-border text-xs text-foreground/90 bg-background/50 p-2 rounded-lg">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Ứng dụng kế hoạch: </span>
                  {ref.applicationInPlan || ref.application_in_plan || "Ứng dụng theo tiêu chuẩn tối ưu hóa của các tổ chức y học thể thao."}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── LEGAL DISCLAIMER BANNER (HẠNG MỤC 1) ─────────────────────────────────────

function LegalDisclaimerBanner({ text }: { text?: string }) {
  const disclaimerText = text || "Kế hoạch mang tính chất tham khảo, không thay thế chẩn đoán/điều trị y tế. Người dùng có bệnh lý nền cần tham vấn bác sĩ trước khi áp dụng.";

  return (
    <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 p-3.5 rounded-xl my-3 flex items-start gap-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 shadow-sm">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-bold uppercase tracking-wide text-[11px] block text-amber-700 dark:text-amber-400 mb-0.5">
          Khuyến cáo Miễn trừ Trách nhiệm Pháp lý (Legal Disclaimer)
        </span>
        <p className="text-amber-950/90 dark:text-amber-100 font-medium">
          {disclaimerText}
        </p>
      </div>

    </div>
  );
}

// ─── WORKOUT PLAN CARD ────────────────────────────────────────────────────────

function WorkoutPlanCard({
  plan,
  onSave,
  onExportIcs,
}: {
  plan: WorkoutPlanData;
  onSave: () => void;
  onExportIcs?: () => void;
}) {
  const [activeDay, setActiveDay] = useState(0);
  const schedule = plan?.schedule || [];
  const currentDay = schedule[activeDay] || schedule[0];

  if (!currentDay) return null;

  return (
    <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-2xl my-3 shadow-sm">
      {/* Header */}
      <div className="bg-blue-50/70 dark:bg-blue-950/20 border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-blue-600 dark:text-blue-400 text-[10px] tracking-widest uppercase mb-0.5 font-bold">
            Module 3 Workout Split · {plan.split_name || "Push - Pull - Legs"} ({plan.days_per_week || 4} buổi/tuần)
          </div>
          <div className="font-sans font-black text-foreground text-base uppercase">Lịch Tập Thể Hình Cá Nhân Hóa</div>
        </div>
        <div className="flex items-center gap-2">
          {onExportIcs && (
            <button
              onClick={onExportIcs}
              className="text-xs border border-blue-400 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 px-3 py-1.5 transition-colors font-bold rounded-lg flex items-center gap-1.5"
              title="Tải tệp lịch nhắc việc iCalendar (.ics)"
            >
              <Calendar className="w-3.5 h-3.5" /> Xuất .ics
            </button>
          )}
          <button
            onClick={onSave}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 transition-colors font-bold rounded-lg shadow-sm"
          >
            💾 Lưu Snapshot
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex border-b border-border overflow-x-auto bg-muted/30">
        {schedule.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeDay === i
                ? "border-blue-600 text-blue-600 bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.day}
          </button>
        ))}
      </div>

      {/* Day content */}
      <div className="p-4">
        <div className="font-mono text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> {currentDay.focus}
        </div>
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/60 px-3 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
            <span className="col-span-5">Bài tập</span>
            <span className="col-span-2 text-center">Nhóm cơ</span>
            <span className="col-span-2 text-center">Sets × Reps</span>
            <span className="col-span-3 text-center">RPE / Nghỉ</span>
          </div>
          {(currentDay.exercises || []).map((ex, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 px-3 py-2.5 text-xs border-t border-border items-center ${
                i % 2 === 0 ? "bg-card" : "bg-muted/20"
              }`}
            >
              <div className="col-span-5 font-bold text-foreground">{ex.name}</div>
              <div className="col-span-2 text-center text-muted-foreground text-[11px] font-medium">{ex.target_muscle || "-"}</div>
              <div className="col-span-2 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">
                {ex.sets} × {ex.reps}
              </div>
              <div className="col-span-3 text-center font-mono text-muted-foreground text-[11px]">
                RPE {ex.rpe || 8} · {ex.rest_sec || 60}s
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── MEAL PLAN CARD ───────────────────────────────────────────────────────────

function MealPlanCard({ plan, onSave }: { plan: MealPlanData; onSave: () => void }) {
  const summary = plan?.daily_summary || { total_calories: 2200, protein_g: 140, carbs_g: 240, fat_g: 60 };
  const meals = plan?.meals || [];

  return (
    <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-2xl my-3 shadow-sm">
      {/* Header */}
      <div className="bg-blue-50/70 dark:bg-blue-950/20 border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-blue-600 dark:text-blue-400 text-[10px] tracking-widest uppercase mb-0.5 font-bold">
            Module 3 Nutrition Plan · Thực Đơn Dinh Dưỡng Chuẩn Macro
          </div>
          <div className="font-sans font-black text-foreground text-base uppercase">Thực Đơn Cá Nhân Hóa Theo Ngày</div>
        </div>
        <button
          onClick={onSave}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 transition-colors font-bold rounded-lg shadow-sm"
        >
          💾 Lưu Thực Đơn
        </button>
      </div>

      {/* Macro chart */}
      <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-4">
        <MacroDonut protein={summary.protein_g} carb={summary.carbs_g} fat={summary.fat_g} />
        <div className="text-right font-mono">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Năng lượng mục tiêu</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{Math.round(summary.total_calories)} kcal</div>
        </div>
      </div>

      {/* Meals list */}
      <div className="p-4 space-y-3">
        {meals.map((m, i) => (
          <div key={i} className="bg-muted/30 border border-border p-3.5 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                {m.meal_type}
              </span>
              <span className="font-mono text-xs text-foreground font-bold">{m.calories} kcal</span>
            </div>
            <div className="font-bold text-foreground text-sm mb-2">{m.name}</div>
            {m.items && m.items.length > 0 && (
              <div className="space-y-1 border-t border-border pt-2">
                {m.items.map((item, j) => (
                  <div key={j} className="flex justify-between text-xs text-muted-foreground">
                    <span>• {item.name} ({item.amount})</span>
                    <span className="font-mono text-foreground font-medium">{item.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── VALIDATION BADGE (MODULE 4) ──────────────────────────────────────────────

function ValidationBadge({ report }: { report?: ValidationReport }) {
  if (!report) return null;

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 p-3.5 rounded-xl my-2 text-xs shadow-sm">
      <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[11px] tracking-wider mb-1">
        <CheckCircle2 className="w-4 h-4" />
        <span>Module 4: Kiểm Định Nhiệt Động Học & Khối Lượng Tập Chuẩn ACSM</span>
      </div>
      <div className="text-emerald-950 dark:text-emerald-200 space-y-0.5 font-medium">
        <div>
          • Sai số nhiệt động học: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-300">{report.thermodynamicDiffPercent}%</span> (Đạt ngưỡng an toàn y khoa ≤ 5%).
        </div>
        {report.safetyNotes?.map((note, i) => (
          <div key={i} className="text-muted-foreground">• {note}</div>
        ))}
      </div>

    </div>
  );
}

// ─── AI RECOMMENDED GEAR CARD (CROSS-SELLING PRODUCTS) ────────────────────────

interface RecommendedProduct {
  id: number;
  name: string;
  category: string;
  reason: string;
  price: string;
  oldPrice: string;
  rating: number;
  img: string;
  badge: string;
}

const AI_GEAR_CATALOG: RecommendedProduct[] = [
  {
    id: 101,
    name: "Giày Training Chuyên Dụng Nike Metcon 9",
    category: "Giày Thể Thao",
    reason: "Đế bằng gia cố khóa gót, tối ưu hóa điểm tựa lực khi Squat/Deadlift nặng.",
    price: "3.290.000₫",
    oldPrice: "3.750.000₫",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    badge: "Chuẩn Lịch Tập",
  },
  {
    id: 103,
    name: "Đai Lưng Cột Sống SportZone Pro Lever Belt",
    category: "Phụ Kiện Bảo Hộ",
    reason: "Khóa bẩy thép chịu lực, tăng áp lực ổ bụng và bảo vệ thắt lưng an toàn tối đa.",
    price: "650.000₫",
    oldPrice: "850.000₫",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    badge: "An Toàn Chấn Thương",
  },
  {
    id: 106,
    name: "Whey Protein Isolate 5Lbs (Chính Hãng)",
    category: "Dinh Dưỡng Thể Thao",
    reason: "Cung cấp 27g protein siêu tinh khiết, hỗ trợ đạt mốc Macro chuẩn ISSN đề xuất.",
    price: "1.690.000₫",
    oldPrice: "1.950.000₫",
    rating: 5.0,
    img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80",
    badge: "Đạt Macro AI",
  },
  {
    id: 104,
    name: "Bình Lắc Thông Minh SportZone Shaker 750ml",
    category: "Dụng Cụ Bổ Trợ",
    reason: "Tích hợp 3 tầng đựng Whey & vitamin, bi lắc thép không gỉ đánh tan mịn.",
    price: "185.000₫",
    oldPrice: "250.000₫",
    rating: 4.7,
    img: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&auto=format&fit=crop&q=80",
    badge: "Tiện Lợi Hàng Ngày",
  },
  {
    id: 102,
    name: "Bộ Tạ Tay Đa Năng Bowflex 24kg Điều Chỉnh",
    category: "Thiết Bị Home Gym",
    reason: "Thay thế 15 cặp tạ với cơ chế xoay số 2-24kg, tối ưu không gian tại nhà.",
    price: "2.850.000₫",
    oldPrice: "3.500.000₫",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
    badge: "Tập Tại Nhà",
  },
  {
    id: 105,
    name: "Thảm Định Tuyến TPE 8mm Chống Trượt Cao Cấp",
    category: "Yoga & Phục Hồi",
    reason: "Vạch định tuyến laser chuẩn xác, bảo vệ đầu gối và cổ tay khi Mobility & Core.",
    price: "390.000₫",
    oldPrice: "520.000₫",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80",
    badge: "Giãn Cơ & Core",
  },
];

function AIRecommendedGearCard({
  goal,
  location,
  onAddToCart,
}: {
  goal?: string;
  location?: string;
  onAddToCart: (name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const displayProducts = AI_GEAR_CATALOG.slice(0, 4);

  return (
    <div className="bg-card text-card-foreground border border-blue-200 dark:border-blue-900/60 rounded-2xl overflow-hidden my-3 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 px-4 py-3 border-b border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between text-left transition-colors hover:opacity-95"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span>Hệ Sinh Thái SportZone</span>
              <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">AI MATCHED</span>
            </div>
            <div className="font-sans font-black text-foreground text-sm">
              Sản Phẩm & Phụ Kiện Thể Thao Đề Xuất Cho Kế Hoạch Này
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
          {isOpen ? "Thu gọn ▲" : "Xem 4 đề xuất ▼"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 bg-card space-y-3">
          <p className="text-xs text-muted-foreground">
            Dựa trên phân tích lịch tập và chỉ số Macro của bạn, AI đã chọn lọc 4 trang bị thể thao và thực phẩm bổ sung tương thích tốt nhất để đảm bảo an toàn tập luyện và tối ưu thời gian hồi phục:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayProducts.map((item) => (
              <div
                key={item.id}
                className="bg-muted/30 border border-border rounded-xl p-3 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-700 transition-all group"
              >
                <div>
                  <div className="flex gap-3 mb-2.5">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-amber-500 font-bold">★ {item.rating}</span>
                      </div>
                      <h5 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h5>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                          {item.price}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground line-through">
                          {item.oldPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground bg-background/60 p-2 rounded-lg border border-border/60 leading-relaxed mb-3">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Lý do gợi ý: </span>
                    {item.reason}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => onAddToCart(item.name)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm active:scale-95 text-center"
                  >
                    + Thêm vào giỏ
                  </button>
                  <Link
                    to="/shop"
                    className="px-2.5 py-2 border border-border hover:border-blue-500 text-foreground hover:text-blue-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                    title="Xem chi tiết tại SportZone Store"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Xem toàn bộ danh mục sản phẩm tại SportZone Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── AI RECOMMENDED SERVICES CARD (DIGITAL SERVICES & COACHING) ───────────────

interface RecommendedService {
  id: string;
  name: string;
  role: string;
  highlight: string;
  price: string;
  rating: number;
  reviews: number;
  tab: string;
  img: string;
  badge: string;
}

const AI_SERVICES_CATALOG: RecommendedService[] = [
  {
    id: "pt-1",
    name: "HLV Trần Minh Khoa",
    role: "ACE CPT · NASM CNC (7 năm kinh nghiệm)",
    highlight: "Kèm cặp sửa form trực tiếp các bài Squat/Bench/Deadlift trong lịch tập AI.",
    price: "350.000₫/buổi",
    rating: 4.9,
    reviews: 134,
    tab: "pt",
    img: "photo-1571019613454-1cb2f99b2d8b",
    badge: "Phù Hợp Tăng Cơ / Gym",
  },
  {
    id: "pt-4",
    name: "HLV Phạm Thu Hương",
    role: "NASM CPT · Precision Nutrition (4 năm kinh nghiệm)",
    highlight: "Giám sát nhật ký dinh dưỡng và tinh chỉnh thực đơn Macro hàng tuần theo thể trạng.",
    price: "320.000₫/buổi",
    rating: 4.9,
    reviews: 76,
    tab: "pt",
    img: "photo-1609899537878-48b5d4564fca",
    badge: "Tối Ưu Thực Đơn",
  },
  {
    id: "gym-pass",
    name: "Gói Hội Viên Gym Đa Chi Nhánh SportZone",
    role: "Truy cập không giới hạn dàn máy tập chuẩn thi đấu",
    highlight: "Đầy đủ dàn máy tạ, rack squat, xông hơi phục hồi sau các buổi tập cường độ cao.",
    price: "Từ 490.000₫/tháng",
    rating: 4.9,
    reviews: 820,
    tab: "gym",
    img: "photo-1534438327276-14e5300c3a48",
    badge: "Phòng Tập Chuẩn",
  },
  {
    id: "course-12w",
    name: "Giáo Án Số & Video Masterclass 12 Tuần",
    role: "Video HD quay chậm chuẩn hóa từng chuyển động khớp",
    highlight: "Video hướng dẫn chi tiết cách kích hoạt cơ mục tiêu và tránh chấn thương khớp gối/cột sống.",
    price: "299.000₫ (Trọn đời)",
    rating: 4.8,
    reviews: 312,
    tab: "digital",
    img: "photo-1581009146145-b5ef050c2e1e",
    badge: "Giáo Trình Số",
  },
];

function AIRecommendedServicesCard({
  goal,
  onNavigate,
}: {
  goal?: string;
  onNavigate: (tab: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-card text-card-foreground border border-indigo-200 dark:border-indigo-900/60 rounded-2xl overflow-hidden my-3 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 px-4 py-3 border-b border-indigo-200/80 dark:border-indigo-900/40 flex items-center justify-between text-left transition-colors hover:opacity-95"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span>Đồng Hành Thực Chiến</span>
              <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">DIGITAL SERVICES</span>
            </div>
            <div className="font-sans font-black text-foreground text-sm">
              Dịch Vụ Số & Huấn Luyện Viên Đề Xuất Cùng Kế Hoạch
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
          {isOpen ? "Thu gọn ▲" : "Xem đề xuất ▼"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 bg-card space-y-3">
          <p className="text-xs text-muted-foreground">
            Để đạt hiệu quả tối đa với kế hoạch AI mà không lo sai tư thế bài tập hay chán nản, bạn có thể kết nối với Huấn luyện viên chuyên môn hoặc kích hoạt thẻ phòng tập:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_SERVICES_CATALOG.map((svc) => (
              <div
                key={svc.id}
                className="bg-muted/30 border border-border rounded-xl p-3 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-700 transition-all group"
              >
                <div>
                  <div className="flex gap-3 mb-2.5">
                    <img
                      src={`https://images.unsplash.com/${svc.img}?w=200&auto=format&fit=crop&q=80`}
                      alt={svc.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                          {svc.badge}
                        </span>
                        <span className="text-[10px] text-amber-500 font-bold">★ {svc.rating}</span>
                      </div>
                      <h5 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {svc.name}
                      </h5>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{svc.role}</p>
                      <div className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {svc.price}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground bg-background/60 p-2 rounded-lg border border-border/60 leading-relaxed mb-3">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Hỗ trợ: </span>
                    {svc.highlight}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(svc.tab)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Xem Chi Tiết Dịch Vụ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── SAVED PLANS DASHBOARD ────────────────────────────────────────────────────

function SavedDashboard({
  plans,
  onLoad,
  onDelete,
  onExportIcs,
}: {
  plans: AiPlanSnapshotEntity[];
  onLoad: (p: AiPlanSnapshotEntity) => void;
  onDelete: (id: number) => void;
  onExportIcs: (id: number) => void;
}) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground font-mono">
        <div className="text-4xl mb-3">📂</div>
        <div className="text-base font-bold text-foreground">Chưa có kế hoạch nào được lưu trên Cloud.</div>
        <div className="text-xs mt-1 text-muted-foreground">Hãy tạo kế hoạch với AI và bấm "Lưu Snapshot"!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plans.map((p) => (
        <div key={p.id} className="bg-card text-card-foreground border border-border p-5 rounded-2xl hover:border-blue-500 transition-all flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 uppercase font-bold">
                {p.planType} · V{p.version}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <h4 className="font-sans font-black text-foreground text-base uppercase mb-2">{p.title}</h4>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-muted/40 p-2.5 rounded-xl text-center text-foreground mb-4">
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">BMR</div>
                <div className="font-bold">{Math.round(p.bmr || 0)}</div>
              </div>
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">TDEE</div>
                <div className="font-bold">{Math.round(p.tdee || 0)}</div>
              </div>
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">Mục tiêu</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">{Math.round(p.targetCalories || 0)} cal</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <button
              onClick={() => onLoad(p)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition-colors uppercase shadow-sm"
            >
              Mở kế hoạch
            </button>
            <button
              onClick={() => onExportIcs(p.id)}
              className="px-3 py-2 border border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl transition-colors"
              title="Xuất tệp lịch .ics"
            >
              📅
            </button>
            <button
              onClick={() => onDelete(p.id)}
              className="px-3 py-2 border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs rounded-xl transition-colors"
              title="Xóa"
            >
              🗑
            </button>
          </div>
        </div>
      ))}

    </div>
  );
}

// ─── MAIN AI PLANNER ──────────────────────────────────────────────────────────

export function AIPlanner({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate("/digital-services"));

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSnapshots, setSavedSnapshots] = useState<AiPlanSnapshotEntity[]>([]);
  const [currentPlanResponse, setCurrentPlanResponse] = useState<AiPlannerResponse | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [view, setView] = useState<"chat" | "saved">("chat");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load saved plans on mount
  useEffect(() => {
    aiPlannerService.getSavedPlans()
      .then((data) => setSavedSnapshots(data))
      .catch((err) => console.warn("Lỗi tải saved plans:", err));
  }, []);

  const handleOnboardingComplete = async (p: UserProfile) => {
    setProfile(p);
    setShowOnboarding(false);
    setIsGenerating(true);

    const goalLabels: Record<string, string> = {
      bulk: "Tăng cơ (Surplus)",
      cut: "Giảm mỡ (Deficit)",
      maintain: "Duy trì vóc dáng",
      endurance: "Tăng sức bền thể thao",
    };

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `Yêu cầu tạo kế hoạch 6 Module chuẩn khoa học cho thể trạng: ${p.height}cm · ${p.weight}kg · ${p.age} tuổi (${p.gender === "male" ? "Nam" : "Nữ"}), mục tiêu ${goalLabels[p.goal] || p.goal} tại ${p.location === "gym" ? "phòng gym" : "nhà"}.`,
    };

    const loadingMsgId = (Date.now() + 1).toString();
    const loadingMsg: ChatMessage = {
      id: loadingMsgId,
      role: "assistant",
      content: "⏳ Đang xử lý Module 1 (Tính toán BMR, TDEE Mifflin-St Jeor), viện dẫn nguyên lý ACSM/ISSN/WHO và thực hiện Structured Gemini Inference...",
      streaming: true,
    };

    setMessages([userMsg, loadingMsg]);

    try {
      const response = await aiPlannerService.generatePlan({
        height: parseFloat(p.height),
        weight: parseFloat(p.weight),
        age: parseInt(p.age),
        gender: p.gender,
        activityLevel: p.activity,
        goal: p.goal,
        location: p.location,
        injuries: p.injuries,
        dietaryPreferences: p.diet,
        daysPerWeek: 4,
      });

      setCurrentPlanResponse(response);

      const successMsg: ChatMessage = {
        id: loadingMsgId,
        role: "assistant",
        content: `🎉 **Đã hoàn thành kế hoạch 6 Module chuẩn Khoa học Thể thao & Dinh dưỡng!**\n\n• **BMR (Mifflin-St Jeor):** ${response.metrics.bmr} kcal | **TDEE (WHO PAL):** ${response.metrics.tdee} kcal\n• **Năng lượng mục tiêu:** **${response.metrics.targetCalories} kcal/ngày** (${response.metrics.calorieAdjustment >= 0 ? "+" : ""}${response.metrics.calorieAdjustment} kcal)\n• **Phân bổ Macro (ISSN):** Protein ${response.metrics.targetProteinGrams}g (${response.metrics.proteinRatioPercent}%) · Carbs ${response.metrics.targetCarbsGrams}g (${response.metrics.carbsRatioPercent}%) · Fat ${response.metrics.targetFatGrams}g (${response.metrics.fatRatioPercent}%)\n\nDưới đây là chi tiết Lịch tập, Thực đơn và Cơ sở khoa học viện dẫn:`,
        metrics: response.metrics,
        validationReport: response.validationReport,
        workoutPlan: response.workoutPlan,
        mealPlan: response.mealPlan,
        scientificReferences: response.scientificReferences,
        legalDisclaimer: response.legalDisclaimer,
        fullPlanData: response,
        streaming: false,
      };

      setMessages([userMsg, successMsg]);
    } catch (error) {
      console.error("Lỗi tạo plan:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId
            ? { ...m, content: "Có lỗi khi kết nối máy chủ AI. Vui lòng thử lại sau!", streaming: false }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;
    setInput("");
    setIsGenerating(true);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: "assistant",
      content: "🔄 Đang thực hiện tinh chỉnh vi sai (Module 5 Delta Update) dựa trên cơ sở khoa học thể thao...",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    try {
      if (currentPlanResponse) {
        // Module 5: Delta refine
        const refined = await aiPlannerService.refinePlan(text, currentPlanResponse);
        setCurrentPlanResponse(refined);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  ...m,
                  content: `✅ **Đã cập nhật theo yêu cầu:** "${text}". Năng lượng tổng thể vẫn được cân bằng ở mức **${refined.metrics.targetCalories} kcal** chuẩn y khoa.`,
                  metrics: refined.metrics,
                  validationReport: refined.validationReport,
                  workoutPlan: refined.workoutPlan,
                  mealPlan: refined.mealPlan,
                  scientificReferences: refined.scientificReferences,
                  legalDisclaimer: refined.legalDisclaimer,
                  fullPlanData: refined,
                  streaming: false,
                }
              : m
          )
        );
      } else {
        const res = await aiPlannerService.generatePlan({
          customNotes: text,
        });
        setCurrentPlanResponse(res);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  ...m,
                  content: `Dưới đây là kế hoạch gợi ý phù hợp:`,
                  workoutPlan: res.workoutPlan,
                  mealPlan: res.mealPlan,
                  scientificReferences: res.scientificReferences,
                  legalDisclaimer: res.legalDisclaimer,
                  streaming: false,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Lỗi refine:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, content: "Không thể hoàn thành tinh chỉnh. Vui lòng thử lại!", streaming: false }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCloud = async (type: string, planData?: AiPlannerResponse) => {
    const dataToSave = planData || currentPlanResponse;
    if (!dataToSave) return;

    try {
      const saved = await aiPlannerService.savePlan(
        dataToSave.planTitle || "Kế hoạch Thể hình AI",
        type,
        dataToSave
      );
      setSavedSnapshots((prev) => [saved, ...prev]);
      alert("✅ Đã lưu snapshot kế hoạch thành công vào hệ thống Cloud Database!");
    } catch (err) {
      console.error("Lỗi lưu plan:", err);
      alert("Không thể lưu kế hoạch. Vui lòng kiểm tra kết nối mạng!");
    }
  };

  const handleExportIcs = (id?: number) => {
    if (!id) return;
    const url = aiPlannerService.exportIcsUrl(id);
    window.open(url, "_blank");
  };

  const handleDeleteSnapshot = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bản lưu này không?")) return;
    try {
      await aiPlannerService.deletePlan(id);
      setSavedSnapshots((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Lỗi xóa snapshot:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background text-foreground flex flex-col font-sans transition-colors">
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onClose={profile ? () => setShowOnboarding(false) : handleBack}
        />
      )}

      {/* Top bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0 bg-card shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 font-bold"
          >
            ← Quay lại
          </button>
          <div className="w-px h-4 bg-border" />
          <div className="font-sans font-black text-foreground text-xl uppercase tracking-tight">
            Sport<span className="text-blue-600">Zone</span>
            <span className="text-blue-600 dark:text-blue-400 text-xs ml-2 font-mono uppercase tracking-widest bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 font-bold">
              AI 6-Module Trainer
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono border border-border px-3 py-1.5 rounded-xl bg-muted/40">
              <span className="text-blue-600">●</span>
              {profile.weight}kg · {profile.height}cm · {profile.goal}
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-muted-foreground hover:text-foreground ml-2 text-xs"
                title="Sửa thông số"
              >
                ✎
              </button>
            </div>
          )}
          <div className="flex bg-muted border border-border rounded-xl overflow-hidden p-0.5">
            {(["chat", "saved"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                  view === v
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "chat" ? "💬 Kế hoạch AI" : `📂 Đã lưu ${savedSnapshots.length > 0 ? `(${savedSnapshots.length})` : ""}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "saved" ? (
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-5xl mx-auto w-full">
          <SavedDashboard
            plans={savedSnapshots}
            onLoad={(p) => {
              try {
                const parsed = JSON.parse(p.planJson);
                setCurrentPlanResponse(parsed);
                setView("chat");
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `Đã nạp lại kế hoạch Snapshot "${p.title}" (V${p.version}):`,
                    workoutPlan: parsed.workout_plan,
                    mealPlan: parsed.meal_plan,
                    metrics: parsed.metrics,
                    validationReport: parsed.validationReport,
                    scientificReferences: parsed.scientific_references,
                    legalDisclaimer: parsed.legal_disclaimer,
                  },
                ]);
              } catch (e) {
                console.error("Parse error:", e);
              }
            }}
            onDelete={handleDeleteSnapshot}
            onExportIcs={handleExportIcs}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 && !showOnboarding && (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="text-5xl mb-4">🤖</div>
                  <div className="font-sans text-3xl uppercase font-black text-foreground">AI Trainer 6 Module Sẵn Sàng</div>
                  <div className="text-sm mt-2">Bấm nút Khởi tạo hồ sơ hoặc chọn gợi ý bên dưới để bắt đầu</div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm flex-shrink-0 shadow-sm font-bold">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                        : "bg-card border border-border text-card-foreground rounded-bl-none shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Hạng mục 1: Legal Disclaimer */}
                    {msg.legalDisclaimer && <LegalDisclaimerBanner text={msg.legalDisclaimer} />}

                    {/* Hạng mục 1: Scientific References */}
                    {msg.scientificReferences && <ScientificReferencesCard references={msg.scientificReferences} />}

                    {msg.validationReport && <ValidationBadge report={msg.validationReport} />}

                    {msg.workoutPlan && (
                      <WorkoutPlanCard
                        plan={msg.workoutPlan}
                        onSave={() => handleSaveToCloud("WORKOUT", msg.fullPlanData)}
                        onExportIcs={currentPlanResponse?.savedPlanId ? () => handleExportIcs(currentPlanResponse.savedPlanId) : undefined}
                      />
                    )}

                    {msg.mealPlan && (
                      <MealPlanCard
                        plan={msg.mealPlan}
                        onSave={() => handleSaveToCloud("MEAL", msg.fullPlanData)}
                      />
                    )}

                    {/* Hạng mục Đề xuất Sản phẩm Thể thao & Dịch vụ Số Đồng bộ */}
                    {(msg.workoutPlan || msg.mealPlan) && (
                      <>
                        <AIRecommendedGearCard
                          goal={profile?.goal}
                          location={profile?.location}
                          onAddToCart={(pName) => triggerToast(`Đã thêm "${pName}" vào giỏ hàng thành công!`)}
                        />
                        <AIRecommendedServicesCard
                          goal={profile?.goal}
                          onNavigate={(tab) => navigate(`/digital-services#${tab}`)}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input & Quick Prompts */}
          <div className="border-t border-border bg-card px-4 md:px-8 py-4 flex-shrink-0 shadow-sm">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  {showPrompts ? "💡 Tinh chỉnh vi sai & Khoa học thể thao (Module 5)" : "💡 Gợi ý"}
                </span>
                <button
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-bold transition-colors uppercase cursor-pointer"
                >
                  {showPrompts ? "Ẩn ✕" : "Hiện ⚡"}
                </button>
              </div>

              {showPrompts && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-thin">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isGenerating}
                      className="flex-shrink-0 text-xs border border-border text-foreground px-3 py-1.5 rounded-xl hover:border-blue-600 hover:text-blue-600 bg-background transition-colors disabled:opacity-40 font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  className="flex-1 bg-background border border-border rounded-xl text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  placeholder="Yêu cầu tinh chỉnh (VD: Đổi ức gà sang thịt bò, dời thứ 4 sang thứ 5)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
                  disabled={isGenerating}
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-sans font-bold uppercase text-xs tracking-wider rounded-xl transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm cursor-pointer"
                >
                  {isGenerating ? "Đang xử lý..." : "Gửi →"}
                </button>
              </div>
              <div className="text-muted-foreground text-[10px] mt-2 flex items-center justify-between">
                <span>Tuân thủ ACSM & ISSN · Cân bằng nhiệt động học 4P+4C+9F · Differential Delta Update</span>
                <span className="font-mono">SportZone AI v2.5</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in text-xs font-bold backdrop-blur-md">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
