import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronRight, RotateCcw, Truck, Shield, Lock, HelpCircle, Phone, Loader2 } from "lucide-react";
import { policyService, StorePolicy } from "../../services/policyService";

const tabs = [
  { key: "return", label: "Đổi trả", icon: <RotateCcw className="w-4 h-4" />, apiId: "return-policy" },
  { key: "shipping", label: "Vận chuyển", icon: <Truck className="w-4 h-4" />, apiId: "shipping-policy" },
  { key: "warranty", label: "Bảo hành", icon: <Shield className="w-4 h-4" />, apiId: "warranty-policy" },
  { key: "privacy", label: "Bảo mật", icon: <Lock className="w-4 h-4" />, apiId: "privacy-policy" },
  { key: "faq", label: "Câu hỏi thường gặp", icon: <HelpCircle className="w-4 h-4" />, apiId: "faq" },
  { key: "contact", label: "Liên hệ", icon: <Phone className="w-4 h-4" />, apiId: "contact" },
];

export function Policy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [policies, setPolicies] = useState<StorePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeTab = searchParams.get("tab") || "return";

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await policyService.getAllPolicies();
        setPolicies(data);
      } catch (err) {
        console.error("Failed to fetch policies", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const activePolicy = policies.find(p => p.key === tabs.find(t => t.key === activeTab)?.apiId);

  const setTab = (t: string) => {
    const p = new URLSearchParams(); p.set("tab", t);
    setSearchParams(p);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Đang tải chính sách...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Chính sách</span>
      </div>

      <h1 className="text-gray-900 mb-6">Chính sách & Hỗ trợ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-b border-gray-50 last:border-0 ${
                  activeTab === tab.key ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={activeTab === tab.key ? "text-blue-600" : "text-gray-400"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
          {activePolicy ? (
            <div>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                {tabs.find(t => t.key === activeTab)?.icon}
                {activePolicy.title}
              </h2>
              <div 
                className="prose prose-sm max-w-none text-gray-600 policy-content"
                dangerouslySetInnerHTML={{ __html: activePolicy.content }}
              />
              {activePolicy.lastUpdated && (
                <p className="text-[10px] text-gray-400 mt-8 border-t pt-4">
                  Cập nhật lần cuối: {new Date(activePolicy.lastUpdated).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          ) : (
             <div className="text-center py-10">
                <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">Nội dung này đang được cập nhật...</p>
                <p className="text-xs text-gray-400 mt-1">Vui lòng quay lại sau hoặc liên hệ hỗ trợ</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
