import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import storePolicyService, { StorePolicyDTO } from "../../services/storePolicyService";
import { FileText, Shield, Truck, RotateCcw, AlertCircle } from "lucide-react";

export function PolicyPage() {
  const [policies, setPolicies] = useState<StorePolicyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePolicy, setActivePolicy] = useState<StorePolicyDTO | null>(null);

  const location = useLocation();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await storePolicyService.getAllPolicies();
        // Filter only active policies and sort by display order
        const activePolicies = data
          .filter(p => p.isActive)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        
        setPolicies(activePolicies);
        
        // Default select the first policy if available
        if (activePolicies.length > 0) {
          setActivePolicy(activePolicies[0]);
        }
      } catch (error) {
        console.error("Failed to load policies", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const getIconForCategory = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('shipping') || lower.includes('giao hàng')) return <Truck className="w-5 h-5" />;
    if (lower.includes('return') || lower.includes('đổi trả')) return <RotateCcw className="w-5 h-5" />;
    if (lower.includes('warranty') || lower.includes('bảo hành') || lower.includes('privacy')) return <Shield className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Chính sách <span className="text-blue-600">Cửa hàng</span></h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Tại SportZone, chúng tôi luôn minh bạch trong mọi chính sách mua bán, giao hàng và bảo hành để mang lại trải nghiệm mua sắm an tâm nhất cho bạn.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : policies.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border-2 border-gray-300 shadow-sm">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có chính sách nào được công bố</h2>
            <p className="text-gray-500">Xin lỗi, hiện tại chúng tôi đang cập nhật các chính sách. Vui lòng quay lại sau.</p>
            <Link to="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-1/4 flex-shrink-0">
              <div className="bg-white rounded-3xl border-2 border-gray-300 shadow-sm p-4 sticky top-24">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 px-4 pt-2">Danh mục</h3>
                <nav className="space-y-1">
                  {policies.map(policy => (
                    <button
                      key={policy.id}
                      onClick={() => setActivePolicy(policy)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left font-bold ${
                        activePolicy?.id === policy.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className={activePolicy?.id === policy.id ? "text-blue-600" : "text-gray-500"}>
                        {getIconForCategory(policy.category)}
                      </span>
                      {policy.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-3xl border-2 border-gray-300 shadow-sm p-8 md:p-12 min-h-[600px]">
              {activePolicy ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 border-b border-gray-200 pb-8">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                      {activePolicy.category}
                    </span>
                    <h2 className="text-3xl font-black text-gray-900">{activePolicy.title}</h2>
                  </div>
                  
                  <style>{`
                    .prose ul {
                      list-style-type: disc !important;
                      padding-left: 1.5rem !important;
                      margin-top: 0.75rem !important;
                      margin-bottom: 0.75rem !important;
                    }
                    .prose ol {
                      list-style-type: decimal !important;
                      padding-left: 1.5rem !important;
                      margin-top: 0.75rem !important;
                      margin-bottom: 0.75rem !important;
                    }
                    .prose li {
                      display: list-item !important;
                      list-style-type: inherit !important;
                      margin-top: 0.25rem !important;
                      margin-bottom: 0.25rem !important;
                    }
                    .prose .ql-indent-1 {
                      padding-left: 3rem !important;
                    }
                    .prose .ql-indent-2 {
                      padding-left: 4.5rem !important;
                    }
                  `}</style>
                  {/* Dangerously Set Inner HTML is used here because the policy content could be rich text/HTML */}
                  <div 
                    className="prose prose-blue max-w-none prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: activePolicy.content }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                  Vui lòng chọn một chính sách bên trái để xem
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
