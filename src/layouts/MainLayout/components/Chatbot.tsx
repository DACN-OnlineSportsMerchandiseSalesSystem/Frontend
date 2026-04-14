import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Minimize2, Sparkles } from "lucide-react";
import { products, formatPrice } from "@/constants/productsData";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
  quickReplies?: string[];
}

const QUICK_REPLIES_DEFAULT = [
  "Sản phẩm nào bán chạy nhất?",
  "Chính sách đổi trả?",
  "Hỗ trợ thanh toán nào?",
  "Giao hàng bao lâu?",
];

const BOT_RESPONSES: Record<string, string> = {
  "bán chạy": "🔥 Các sản phẩm bán chạy nhất tại SportZone hiện nay:\n• Giày Chạy Bộ ProRun X5 (Nike) - 1.850.000đ\n• Thảm Yoga TPE Cao Cấp (LifeFit) - 420.000đ\n• Bóng Đá Thi Đấu (Adidas) - 650.000đ\n\nBạn quan tâm sản phẩm nào? 😊",
  "đổi trả": "🔄 Chính sách đổi trả SportZone:\n• Đổi trả miễn phí trong 30 ngày\n• Sản phẩm còn nguyên tem, chưa qua sử dụng\n• Liên hệ hotline 1800-1234 để được hỗ trợ\n• Hoàn tiền 100% nếu sản phẩm lỗi",
  "thanh toán": "💳 SportZone hỗ trợ các hình thức thanh toán:\n• COD - Thanh toán khi nhận hàng\n• MoMo - Ví điện tử\n• VNPay - Cổng thanh toán\n• Thẻ tín dụng/ghi nợ (Visa, Mastercard)\n• Chuyển khoản ngân hàng",
  "giao hàng": "🚚 Thông tin giao hàng:\n• Nội thành HCM/HN: 1-2 ngày\n• Tỉnh thành khác: 3-5 ngày\n• Giao hàng toàn quốc\n• Miễn phí giao hàng đơn từ 500.000đ\n• Theo dõi đơn hàng trên website",
  "giảm giá": "🎁 Ưu đãi hiện có:\n• Giảm đến 30% nhiều sản phẩm hot\n• Flash Sale hàng tuần vào thứ 6\n• Thành viên VIP giảm thêm 5%\n• Đăng ký nhận newsletter để nhận mã giảm giá",
  "size": "📏 Bảng size tham khảo:\n• Giày: EU 39-44 (tương đương VN)\n• Quần áo: S/M/L/XL/2XL\n• Chọn size lớn hơn nếu chân rộng\n• Xem bảng size chi tiết trên trang sản phẩm",
  "chính sách": "📋 Chính sách của SportZone:\n• Hàng chính hãng 100%\n• Bảo hành theo hãng\n• Đổi trả trong 30 ngày\n• Bảo mật thông tin khách hàng\n• Hỗ trợ 7/7 từ 8h-22h",
  "liên hệ": "📞 Liên hệ SportZone:\n• Hotline: 1800-1234 (miễn phí)\n• Email: support@sportzone.vn\n• Facebook: /SportZoneVN\n• Giờ làm việc: 8h-22h, 7 ngày/tuần",
};

function getTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function getBotResponse(text: string, productContext?: typeof products[0] | null): { text: string; quickReplies?: string[] } {
  const lower = text.toLowerCase();

  // Product specific
  if (productContext) {
    if (lower.includes("giá") || lower.includes("bao nhiêu")) {
      return {
        text: `💰 Giá sản phẩm **${productContext.name}** là **${formatPrice(productContext.price)}**${productContext.originalPrice > productContext.price ? ` (giảm từ ${formatPrice(productContext.originalPrice)})` : ""}.\n\nBạn có muốn thêm vào giỏ hàng không?`,
        quickReplies: ["Còn hàng không?", "Có size nào?", "Chính sách đổi trả?"],
      };
    }
    if (lower.includes("size") || lower.includes("cỡ") || lower.includes("kích thước")) {
      return {
        text: `📏 ${productContext.name} có các size: **${productContext.sizes.join(", ")}**.\n\nNếu bạn chưa biết chọn size nào, hãy đo và tham khảo bảng size trên trang sản phẩm nhé!`,
        quickReplies: ["Màu sắc có gì?", "Giá bao nhiêu?", "Cách đặt hàng?"],
      };
    }
    if (lower.includes("màu") || lower.includes("color")) {
      return {
        text: `🎨 ${productContext.name} có các màu: **${productContext.colors.map((c) => c.name).join(", ")}**.\n\nMàu nào hợp với bạn nhất? 😊`,
        quickReplies: ["Có size nào?", "Giá bao nhiêu?", "Thanh toán thế nào?"],
      };
    }
    if (lower.includes("còn hàng") || lower.includes("hàng tồn")) {
      return {
        text: productContext.inStock
          ? `✅ Sản phẩm **${productContext.name}** hiện vẫn còn hàng! Đặt ngay kẻo hết bạn nhé.`
          : `❌ Rất tiếc, sản phẩm **${productContext.name}** tạm thời hết hàng. Vui lòng để lại SĐT để được thông báo khi có hàng.`,
        quickReplies: ["Sản phẩm tương tự?", "Giá bao nhiêu?", "Thanh toán thế nào?"],
      };
    }
  }

  // General responses
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) {
      return { text: response, quickReplies: QUICK_REPLIES_DEFAULT };
    }
  }

  // Greetings
  if (lower.includes("xin chào") || lower.includes("hello") || lower.includes("hi") || lower.includes("chào")) {
    return {
      text: "👋 Xin chào! Tôi là SportBot - trợ lý ảo của SportZone!\n\nTôi có thể giúp bạn:\n• Tư vấn sản phẩm phù hợp\n• Thông tin size, màu sắc\n• Chính sách đổi trả, vận chuyển\n• Các ưu đãi đang có\n\nBạn cần hỗ trợ gì? 😊",
      quickReplies: QUICK_REPLIES_DEFAULT,
    };
  }

  if (lower.includes("cảm ơn") || lower.includes("thanks")) {
    return {
      text: "😊 Không có gì bạn ơi! Nếu cần hỗ trợ thêm, đừng ngần ngại hỏi tôi nhé. Chúc bạn mua sắm vui vẻ tại SportZone! 🎽",
      quickReplies: ["Xem sản phẩm mới", "Ưu đãi hiện có", "Liên hệ hỗ trợ"],
    };
  }

  if (lower.includes("order") || lower.includes("đặt hàng") || lower.includes("mua")) {
    return {
      text: "🛒 Để đặt hàng tại SportZone:\n1. Chọn sản phẩm và size/màu\n2. Thêm vào giỏ hàng\n3. Điền thông tin giao hàng\n4. Chọn phương thức thanh toán\n5. Xác nhận đơn hàng\n\nRất đơn giản phải không? Bắt đầu mua sắm ngay nhé! 😊",
      quickReplies: ["Thanh toán thế nào?", "Giao hàng bao lâu?", "Đổi trả thế nào?"],
    };
  }

  return {
    text: "🤔 Tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi tôi về:\n• Thông tin sản phẩm\n• Chính sách đổi trả\n• Phương thức thanh toán\n• Vận chuyển & giao hàng\n\nHoặc gọi hotline **1800-1234** để được hỗ trợ trực tiếp nhé!",
    quickReplies: QUICK_REPLIES_DEFAULT,
  };
}

export function Chatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect product page
  const productMatch = location.pathname.match(/^\/product\/(.+)$/);
  const currentProductId = productMatch ? productMatch[1] : null;
  const currentProduct = currentProductId ? products.find((p) => p.id === currentProductId) : null;

  // Auto open on product detail page
  useEffect(() => {
    if (currentProduct && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsMinimized(false);
        setHasAutoOpened(true);

        const discount = currentProduct.originalPrice > currentProduct.price
          ? Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100)
          : 0;

        const introMsg: Message = {
          id: `bot-intro-${Date.now()}`,
          role: "bot",
          text: `👋 Xin chào! Tôi thấy bạn đang xem **${currentProduct.name}** (${currentProduct.brand}).\n\n💰 Giá: **${formatPrice(currentProduct.price)}**${discount > 0 ? ` ⚡ Đang giảm ${discount}%!` : ""}\n⭐ Đánh giá: ${currentProduct.rating}/5 (${currentProduct.reviewCount} người đánh giá)\n${currentProduct.isBestSeller ? "🔥 Sản phẩm bán chạy nhất!\n" : ""}${currentProduct.isNew ? "✨ Hàng mới về!\n" : ""}\nBạn cần tôi tư vấn thêm thông tin gì không? 😊`,
          time: getTime(),
          quickReplies: ["Có size nào?", "Màu sắc có gì?", "Còn hàng không?", "Chính sách đổi trả?"],
        };
        setMessages([introMsg]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentProduct, hasAutoOpened]);

  // Reset when leaving product page
  useEffect(() => {
    if (!currentProduct) {
      setHasAutoOpened(false);
    }
  }, [currentProduct]);

  // Init default message when opening without product context
  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentProduct) {
      const welcomeMsg: Message = {
        id: "bot-welcome",
        role: "bot",
        text: "👋 Xin chào! Tôi là **SportBot** - trợ lý ảo của SportZone!\n\nTôi có thể giúp bạn tư vấn sản phẩm, chính sách mua hàng và nhiều hơn nữa. Hỏi tôi bất cứ điều gì nhé! 😊",
        time: getTime(),
        quickReplies: QUICK_REPLIES_DEFAULT,
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, messages.length, currentProduct]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(text, currentProduct);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response.text,
        time: getTime(),
        quickReplies: response.quickReplies,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const formatBotText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/^•\s/, "• ");
      return (
        <span key={i} className={line.startsWith("•") ? "block pl-1" : "block"}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split("\n").length - 1 && line === "" && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 md:right-6 z-50 w-[340px] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 ${
            isMinimized ? "h-14 overflow-hidden" : "h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">SportBot AI</p>
              <p className="text-blue-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Đang hoạt động
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                {isMinimized ? <Sparkles className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Product Context Banner */}
              {currentProduct && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={currentProduct.image} alt={currentProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-700 text-xs truncate">{currentProduct.name}</p>
                    <p className="text-blue-500 text-xs">{formatPrice(currentProduct.price)}</p>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[78%]`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-gray-100 text-gray-700 rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "bot" ? formatBotText(msg.text) : msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                      {/* Quick Replies */}
                      {msg.role === "bot" && msg.quickReplies && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.quickReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => sendMessage(reply)}
                              className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors whitespace-nowrap"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 px-3 py-3 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-400 text-sm text-gray-700 placeholder-gray-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4 text-white disabled:text-gray-400" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`fixed bottom-4 right-4 md:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-gray-700 hover:bg-gray-800 rotate-0" : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-label="Mở chat hỗ trợ"
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Notification dot */}
            {!isOpen && messages.length === 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
        )}
      </button>
    </>
  );
}
