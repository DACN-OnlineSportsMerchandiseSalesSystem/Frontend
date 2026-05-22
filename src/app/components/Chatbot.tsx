import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Minimize2, Sparkles, Volume2, VolumeX } from "lucide-react";
import { products, formatPrice } from "../data/products";
import { chatService } from "../../services/chatService";
import productService, { Product } from "../../services/productService";
import api from "../../services/api";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
  quickReplies?: string[];
  productCards?: Array<{ id: number; name: string; slug: string; brandName: string; price: number; imageUrl: string | null }>;
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
  const [hasAutoOpenedHome, setHasAutoOpenedHome] = useState(false);
  const [hasAutoOpenedProduct, setHasAutoOpenedProduct] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Session ID cho Redis Memory — sinh 1 lần duy nhất khi Chatbot mount
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Hệ thống hàng đợi âm thanh thông minh (Chống chồng chéo)
  const audioBuffer = useRef<Map<number, string>>(new Map());
  const retryCounts = useRef<Map<number, number>>(new Map());
  const nextIndexToPlay = useRef(0);
  const isCurrentlyPlaying = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Pipeline Gối đầu
  const textChunksToProcess = useRef<string[]>([]);
  const nextProcessIndex = useRef(0);

  const speak = async (text: string) => {
    if (isMuted) return;

    // 1. DỪNG NGAY LẬP TỨC các đoạn đang phát dở
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    
    // 2. Reset trạng thái
    audioBuffer.current.clear();
    retryCounts.current.clear();
    nextIndexToPlay.current = 0;
    isCurrentlyPlaying.current = false;

    // 3. LOGIC MỚI: Gộp toàn bộ và chỉ chia làm đôi nếu quá dài
    const cleanFullText = text
      .replace(/\[TEXT\]|\[VOICE\]/gi, '') // Xóa nhãn [TEXT] và [VOICE]
      .replace(/[*_#`~|\[\]]/g, '') // Xóa các ký tự đặc biệt và ngoặc vuông
      .replace(/\s+/g, ' ')
      .trim();

    // 3. LOGIC MỚI: Tách thành từng câu hoàn chỉnh (Bắt buộc có khoảng trắng sau dấu câu để không chém đôi giá tiền 2.990.000đ)
    const rawChunks = cleanFullText.split(/([.!?]\s|\n)/);
    let chunks: string[] = [];
    
    // Hàm phụ để cắt nhỏ chuỗi theo độ dài nếu không có dấu câu
    const splitByLength = (text: string, maxLength: number) => {
      const parts: string[] = [];
      let current = text;
      while (current.length > maxLength) {
        let splitIdx = current.lastIndexOf(' ', maxLength);
        if (splitIdx === -1) splitIdx = maxLength;
        parts.push(current.substring(0, splitIdx).trim());
        current = current.substring(splitIdx).trim();
      }
      if (current) parts.push(current);
      return parts;
    };

    for (let i = 0; i < rawChunks.length; i += 2) {
      let sentence = (rawChunks[i] + (rawChunks[i+1] || "")).trim();
      
      if (sentence.length > 85) {
        // Cắt theo dấu phẩy trước (Bắt buộc có khoảng trắng để tránh chém nhầm 1,000,000)
        const subParts = sentence.split(/([,;]\s)/);
        for (let j = 0; j < subParts.length; j += 2) {
          const subSentence = (subParts[j] + (subParts[j+1] || "")).trim();
          if (subSentence.length > 85) {
            // Nếu vẫn quá dài thì cắt theo độ dài (khoảng trắng)
            chunks.push(...splitByLength(subSentence, 85));
          } else if (subSentence.length > 2) {
            chunks.push(subSentence);
          }
        }
      } else if (sentence.length > 2) {
        chunks.push(sentence);
      }
    }

    if (chunks.length === 0 && cleanFullText) chunks = [cleanFullText];
    if (chunks.length === 0) return;
    
    console.log(`>>> Phát cuốn chiếu: ${chunks.length} câu.`);
    chunks.forEach((c, idx) => console.log(`[Đoạn ${idx + 1}]: ${c}`));

    // Kỹ thuật Gối đầu (Pre-fetching & Pipeline)
    textChunksToProcess.current = chunks;
    nextProcessIndex.current = 0;

    // Kích hoạt nạp trước 2 câu đầu tiên vào đường ống (Pipeline)
    processNextChunk(); 
    if (chunks.length > 1) processNextChunk();
  };

  // Hàm ping URL để đảm bảo file thực sự tồn tại trên server FPT (UX tối đa)
  const waitAudioReady = (url: string): Promise<boolean> => {
    console.log(`>>> [PING] Đang kiểm tra URL từ FPT.AI: ${url}`);
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (attempts > 10) { // Giảm xuống 10s để nếu lỗi thì gọi tạo lại nhanh hơn
          console.error(`❌ [PING THẤT BẠI] URL này vẫn bị 404 sau 10 giây: ${url}`);
          return resolve(false); 
        }
        
        const tempAudio = new Audio(url);
        tempAudio.onloadedmetadata = () => resolve(true); // 200 OK
        tempAudio.onerror = () => {
          setTimeout(check, 1000); // 404, đợi 1s
        };
      };
      check();
    });
  };

  const processNextChunk = async () => {
    const idx = nextProcessIndex.current;
    if (idx >= textChunksToProcess.current.length) return;
    
    nextProcessIndex.current++; 
    const text = textChunksToProcess.current[idx];
    
    let isSuccess = false;
    let maxRetries = 2; // Thử yêu cầu tạo lại tối đa 2 lần
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.warn(`⚠️ [RETRY API] FPT.AI tạo file lỗi, yêu cầu tạo lại đoạn ${idx + 1} (lần ${attempt})...`);
        }
        
        const response = await api.get("/tts", { params: { text } });
        const url = response.data.audioUrl;
        
        if (url) {
          const isReady = await waitAudioReady(url);
          if (isReady) {
            audioBuffer.current.set(idx, url);
            isSuccess = true;
            break; // Đã tạo và load thành công, thoát vòng lặp
          }
        } else {
          // Backend từ chối vì câu chỉ có Emoji, không cần thử lại
          break;
        }
      } catch (err) {
        console.error(`Lỗi API khi nạp đoạn ${idx + 1}:`, err);
      }
    }
    
    if (!isSuccess) {
      audioBuffer.current.set(idx, "ERROR");
    }
    
    tryPlayNext();
  };



  const tryPlayNext = () => {
    if (isCurrentlyPlaying.current || !audioBuffer.current.has(nextIndexToPlay.current)) return;

    const url = audioBuffer.current.get(nextIndexToPlay.current);
    
    if (!url || url === "ERROR" || !url.startsWith('http')) {
      skipToNext();
      return;
    }

    isCurrentlyPlaying.current = true;
    const audio = new Audio(url);
    currentAudioRef.current = audio;

    console.log(`>>> Đang phát đoạn ${nextIndexToPlay.current + 1}...`);

    let isFinishedTriggered = false;
    const onFinished = () => {
      if (isFinishedTriggered) return;
      isFinishedTriggered = true;

      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
        isCurrentlyPlaying.current = false;
        nextIndexToPlay.current++;
        
        // Khi vừa dứt câu, kích hoạt nạp câu tiếp theo gối đầu
        processNextChunk();
        tryPlayNext();
      }
    };

    audio.onended = onFinished;
    
    // Kỹ thuật Gối đầu mượt (Crossfade): Phát sớm 0.2s nếu đoạn trước bị cắt ngang (không có dấu câu)
    const currentText = textChunksToProcess.current[nextIndexToPlay.current] || "";
    const hasPunctuation = /[.!?;\n]$/.test(currentText.trim());
    const overlapTime = hasPunctuation ? 0 : 0.2; 

    if (overlapTime > 0) {
      audio.ontimeupdate = () => {
        if (audio.duration && audio.duration - audio.currentTime <= overlapTime) {
          onFinished();
        }
      };
    }
    
    // Khả năng lỗi ở đây là cực thấp vì waitAudioReady đã ping trước đó
    audio.onerror = () => {
      console.warn(`❌ Lỗi phát đoạn ${nextIndexToPlay.current + 1}, bỏ qua.`);
      onFinished();
    };
    
    audio.play().catch(e => {
      if (e.name === "NotAllowedError") {
        document.addEventListener("click", () => audio.play(), { once: true });
      } else {
        onFinished();
      }
    });
  };

  const skipToNext = () => {
    isCurrentlyPlaying.current = false;
    nextIndexToPlay.current++;
    processNextChunk();
    tryPlayNext();
  };

  // Nhận diện ID sản phẩm từ URL linh hoạt hơn
  const currentProductId = location.pathname.split("/").find((segment, index, array) => array[index - 1] === "product");
  const currentProduct = currentProductId ? products.find((p) => p.id === currentProductId) : null;

  // 1. Tự động chào tại Trang chủ
  useEffect(() => {
    if (location.pathname === "/" && !hasAutoOpenedHome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsMinimized(false);
        setHasAutoOpenedHome(true);
        
        const welcomeMsg: Message = {
          id: "bot-welcome-home",
          role: "bot",
          text: "👋 Chào mừng bạn đến với **SportZone**! Mình là SportBot, rất vui được hỗ trợ bạn tìm kiếm trang thiết bị thể thao phù hợp nhất. Hôm nay bạn cần tìm gì cho buổi tập của mình không? 😊",
          time: getTime(),
          quickReplies: QUICK_REPLIES_DEFAULT,
        };
        setMessages([welcomeMsg]);
        speak("chào mừng bạn đến với sờ pót dôn ! mình là sờ pót bót , rất vui được hỗ trợ bạn tìm kiếm trang thiết bị thể thao phù hợp nhất. hôm nay bạn cần tìm gì cho buổi tập của mình không ?");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, hasAutoOpenedHome]);

  // 2. Tự động tư vấn thông minh khi vào Trang sản phẩm
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const pIndex = pathParts.indexOf("product");
    const idFromUrl = pIndex !== -1 ? pathParts[pIndex + 1] : null;

    if (idFromUrl && hasAutoOpenedProduct !== idFromUrl) {
      const timer = setTimeout(async () => {
        setIsOpen(true);
        setIsMinimized(false);
        setHasAutoOpenedProduct(idFromUrl);
        setIsTyping(true);

        try {
          // Gọi API lấy thông tin sản phẩm thật từ Backend
          const realProduct = await productService.getProductById(parseInt(idFromUrl));
          
          if (realProduct) {
            // Chuẩn bị dữ liệu chi tiết để AI có "nguyên liệu" tư vấn
            const variantInfo = realProduct.variants?.map((v: any) => `- Size ${v.size}, màu ${v.color} (Giá: ${formatPrice(v.price)})`).join("\n") || "Liên hệ để biết thêm";
            
            const detailedPrompt = `
              Bối cảnh: Khách hàng đang xem sản phẩm ${realProduct.name} - Thương hiệu: ${realProduct.brandName}.
              Chi tiết: Mã ${realProduct.productCode}, Giá: ${formatPrice(realProduct.price)}.
              Mô tả sản phẩm: ${realProduct.description || "Không có thông tin mô tả."}
              Tình trạng kho (Kích cỡ và màu sắc):
              ${variantInfo}
              
              Nhiệm vụ: Dựa vào thông tin trên, hãy chủ động giới thiệu nhanh những điểm nổi bật nhất của sản phẩm và hỏi xem khách hàng cần tư vấn thêm về size hay màu sắc nào không.
              QUY ĐỊNH: Không tự ý phiên âm tiếng Anh. Trả lời tự nhiên, thân thiện. Không cần lặp lại toàn bộ thông tin.`;

            const botResponse = await chatService.chat(detailedPrompt);
            
            const introMsg: Message = {
              id: `bot-intro-${Date.now()}`,
              role: "bot",
              text: typeof botResponse === 'string' ? botResponse : (botResponse.response || botResponse.text || "Xin lỗi, mình chưa thể tải thông tin sản phẩm lúc này."),
              time: getTime(),
              quickReplies: ["Có size nào?", "Màu sắc có gì?", "Còn hàng không?", "Chính sách đổi trả?"],
            };
            setMessages([introMsg]);
            speak(botResponse.voiceText || botResponse.response);
          }
        } catch (error) {
          console.error("AI API Intro Error:", error);
          const fallbackMsg: Message = {
            id: `bot-intro-fallback-${Date.now()}`,
            role: "bot",
            text: `👋 Chào bạn! Bạn đang xem một sản phẩm tuyệt vời tại SportZone. Bạn cần mình tư vấn thêm về size hay tính năng của sản phẩm này không? 😊`,
            time: getTime(),
            quickReplies: ["Có size nào?", "Giá bao nhiêu?", "Còn hàng không?"],
          };
          setMessages([fallbackMsg]);
          speak(fallbackMsg.text);
        } finally {
          setIsTyping(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, hasAutoOpenedProduct]);

  // Hàm lấy email từ JWT token đã lưu trong localStorage
  const getEmailFromToken = (): string | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub || payload.email || null;
    } catch { return null; }
  };

  // Reset when leaving pages (optional logic to re-trigger if needed)
  useEffect(() => {
    if (!currentProduct) {
      // Có thể reset state ở đây nếu muốn bot chào lại mỗi khi vào lại trang sp
    }
  }, [currentProduct]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-close after 30s of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      timeout = setTimeout(() => {
        setIsOpen(false);
        setIsMinimized(false);
      }, 30000);
    } else if (!hasInteracted && !currentProduct) {
      // Nếu mới vào web, chưa tương tác, không ở trang chi tiết -> ẩn hoàn toàn icon sau 30s
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 30000);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, messages, inputText, hasInteracted, currentProduct]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Dừng mọi âm thanh cũ ngay khi gửi tin mới
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    audioBuffer.current.clear();
    retryCounts.current.clear();
    nextIndexToPlay.current = 0;
    isCurrentlyPlaying.current = false;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const botMsgId = `bot-${Date.now()}`;
    const botMsg: Message = {
      id: botMsgId,
      role: "bot",
      text: "",
      time: getTime(),
      quickReplies: currentProductId ? ["Còn size nào?", "Thêm vào giỏ", "Chính sách đổi trả?"] : QUICK_REPLIES_DEFAULT,
    };
    // Tắt isTyping ngay khi thêm bong bóng bot — tránh hiện 2 "thinking" cùng lúc
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);

    try {
      const token = localStorage.getItem('accessToken');
      const userEmail = getEmailFromToken();

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      console.log(`>>> [CHAT] msg="${text}" | productId=${currentProductId ?? 'null'} | session=${sessionIdRef.current} | user=${userEmail ?? 'guest'}`);

      const response = await fetch('http://localhost:8080/api/chatbot/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text.trim(),
          productId: currentProductId ? parseInt(currentProductId) : null,
          sessionId: sessionIdRef.current,
          userEmail: userEmail,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("403 Forbidden!");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let sentenceBuffer = "";
      let sentenceIndex = 0;
      let sseBuffer = "";
      // Named SSE event tracking
      let currentEventName = "token";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });

        let splitIndex;
        while ((splitIndex = sseBuffer.indexOf('\n\n')) >= 0) {
          const rawEvent = sseBuffer.substring(0, splitIndex);
          sseBuffer = sseBuffer.substring(splitIndex + 2);

          const lines = rawEvent.split('\n');
          // Lấy event name nếu có
          const eventLine = lines.find(l => l.startsWith('event:'));
          if (eventLine) currentEventName = eventLine.substring(6).trim();
          else currentEventName = 'token';

          const dataLine = lines.find(l => l.startsWith('data:'));
          if (!dataLine) continue;
          const data = dataLine.substring(5);

          if (currentEventName === 'token') {
            fullContent += data;
            sentenceBuffer += data;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: fullContent.trim() } : m))
            );
            // Rolling TTS: tách câu để đọc cuốn chiếu
            const sentenceEnders = /([.!?]\s|\n)/;
            const isTooLong = sentenceBuffer.length > 80 && sentenceBuffer.includes(",");
            const isExtremelyLong = sentenceBuffer.length > 95;
            if (sentenceEnders.test(sentenceBuffer) || isTooLong || isExtremelyLong) {
              let splitRegex = /([.!?]\s|\n)/;
              if (isTooLong) splitRegex = /([.!?,]\s|\n)/;
              if (isExtremelyLong && !sentenceBuffer.includes(",")) splitRegex = /(\s)/;
              const parts = sentenceBuffer.split(splitRegex);
              for (let i = 0; i < parts.length - 1; i += 2) {
                const sentence = (parts[i] + (parts[i+1] || "")).trim();
                if (sentence && sentence.length > 5) speakChunk(sentence, sentenceIndex++);
              }
              sentenceBuffer = parts[parts.length - 1];
            }
          } else if (currentEventName === 'cart_updated') {
            // Thông báo Frontend cập nhật giỏ hàng
            window.dispatchEvent(new Event('cart-updated'));
            console.log('>>> [CART] Giỏ hàng đã được cập nhật bởi AI!');
          } else if (currentEventName === 'product_cards') {
            try {
              const cards = JSON.parse(data);
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, productCards: cards } : m))
              );
              console.log(`>>> [UI] Nhận ${cards.length} product cards.`);
            } catch (e) { console.error('Parse product_cards error:', e); }
          }
        }
      }

      // Phát câu cuối còn sót lại trong buffer
      if (sentenceBuffer.trim().length > 2) {
        speakChunk(sentenceBuffer.trim(), sentenceIndex);
      }

    } catch (error) {
      console.error("Stream Error:", error);
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!" } : m))
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Hàm speakChunk hỗ trợ Rolling TTS
  const speakChunk = async (sentence: string, index: number) => {
    if (isMuted) return;

    const cleanSentence = sentence
      .replace(/[*_#`~|\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSentence || cleanSentence.length < 2) return;

    let isSuccess = false;
    let maxRetries = 2; // Thử gọi lại API tối đa 2 lần

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.warn(`⚠️ [RETRY STREAM] FPT.AI tạo file lỗi, yêu cầu tạo lại đoạn ${index + 1} (lần ${attempt})...`);
        }
        
        const response = await api.get("/tts", { params: { text: cleanSentence } });
        const url = response.data.audioUrl;
        
        if (url) {
          const isReady = await waitAudioReady(url);
          if (isReady) {
            audioBuffer.current.set(index, url);
            isSuccess = true;
            break;
          }
        } else {
          break; // rỗng
        }
      } catch (err) {
        console.error(`Lỗi tải đoạn stream ${index}:`, err);
      }
    }

    if (!isSuccess) {
      audioBuffer.current.set(index, "ERROR");
    }
    
    tryPlayNext();
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

  if (!isVisible) return null;

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
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (newMuted) {
                    // Stop current audio immediately if muting
                    if (currentAudioRef.current) {
                      currentAudioRef.current.pause();
                      currentAudioRef.current = null;
                    }
                    isCurrentlyPlaying.current = false;
                    window.speechSynthesis?.cancel();
                  }
                }}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
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
                      {/* Generative UI: Product Cards */}
                      {msg.role === "bot" && msg.productCards && msg.productCards.length > 0 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 max-w-[260px]">
                          {msg.productCards.map((card) => (
                            <a
                              key={card.id}
                              href={`/product/${card.id}`}
                              className="flex-shrink-0 w-32 bg-white border border-blue-100 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow transition-all"
                            >
                              {card.imageUrl && (
                                <img src={card.imageUrl} alt={card.name} className="w-full h-20 object-cover" />
                              )}
                              <div className="p-1.5">
                                <p className="text-[10px] text-blue-600">{card.brandName}</p>
                                <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-tight">{card.name}</p>
                                <p className="text-[10px] text-blue-700 font-bold mt-0.5">
                                  {new Intl.NumberFormat("vi-VN").format(card.price)}đ
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
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
          setHasInteracted(true);
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
