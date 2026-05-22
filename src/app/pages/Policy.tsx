import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronRight, RotateCcw, Truck, Shield, Lock, HelpCircle, Phone, Loader2, FileText } from "lucide-react";
import { policyService, StorePolicy } from "../../services/policyService";

// Helper function to pick a suitable icon based on category or key
const getPolicyIcon = (key?: string) => {
  if (!key) return <FileText className="w-4 h-4" />;
  const lower = key.toLowerCase();
  if (lower.includes('return')) return <RotateCcw className="w-4 h-4" />;
  if (lower.includes('ship')) return <Truck className="w-4 h-4" />;
  if (lower.includes('warrant')) return <Shield className="w-4 h-4" />;
  if (lower.includes('priva') || lower.includes('secur')) return <Lock className="w-4 h-4" />;
  if (lower.includes('faq')) return <HelpCircle className="w-4 h-4" />;
  if (lower.includes('contact')) return <Phone className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

export function Policy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [policies, setPolicies] = useState<StorePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeTab = searchParams.get("tab");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await policyService.getAllPolicies();
        // Optionally sort them if displayOrder exists, otherwise leave as is
        setPolicies(data);
      } catch (err) {
        console.error("Failed to fetch policies", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  // Use the activeTab from URL, or default to the first policy if available
  const activePolicy = policies.find(p => (p.key || (p as any).policyKey) === activeTab) || (policies.length > 0 ? policies[0] : undefined);
  const currentTabKey = activePolicy?.key || (activePolicy as any)?.policyKey || "";

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
            {policies.map((policy) => {
              const pKey = policy.key || (policy as any).policyKey;
              return (
                <button
                  key={pKey}
                  onClick={() => setTab(pKey)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-b border-gray-50 last:border-0 ${
                    currentTabKey === pKey ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={currentTabKey === pKey ? "text-blue-600" : "text-gray-400"}>
                    {getPolicyIcon(pKey)}
                  </span>
                  {policy.title}
                </button>
              );
            })}
            {policies.length === 0 && (
              <div className="p-4 text-sm text-gray-400 text-center">Đang cập nhật...</div>
            )}
          </div>
        </aside>

        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
          {activePolicy ? (
            <div>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                {getPolicyIcon(activePolicy.key || (activePolicy as any).policyKey)}
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
