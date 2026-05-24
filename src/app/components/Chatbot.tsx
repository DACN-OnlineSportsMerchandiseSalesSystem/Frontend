import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Minimize2, Sparkles, Volume2, VolumeX } from "lucide-react";
import { formatPrice } from "../data/products";
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

function getTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
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
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
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

    // 3. Làm sạch markdown và emoji trước khi gửi lên Backend TTS
    const cleanFullText = text
      .replace(/\[TEXT\]|\[VOICE\]/gi, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [Tên](link) → Tên
      .replace(/[*_#`~|\[\]()]/g, '')
      .replace(/\//g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanFullText) return;

    try {
      // 4. Gọi 1 lần Backend — Backend sẽ chia < 85 ký tự và trả về mảng URL theo thứ tự
      console.log(`>>> [TTS] Gửi toàn văn lên Backend để chia đoạn...`);
      const response = await api.get("/tts", { params: { text: cleanFullText } });
      const audioUrls: string[] = response.data.audioUrls ?? (response.data.audioUrl ? [response.data.audioUrl] : []);

      if (audioUrls.length === 0) return;

      console.log(`>>> [TTS] Nhận ${audioUrls.length} đoạn âm thanh từ Backend.`);

      // 5. Nạp tất cả URL vào audioBuffer và kích hoạt phát
      textChunksToProcess.current = audioUrls.map((_, i) => `chunk_${i}`);
      nextProcessIndex.current = audioUrls.length; // Đã nạp xong hết

      for (let i = 0; i < audioUrls.length; i++) {
        const url = audioUrls[i];
        const isReady = await waitAudioReady(url);
        audioBuffer.current.set(i, isReady ? url : "ERROR");
        // Kích hoạt phát ngay khi đoạn đầu tiên sẵn sàng
        if (i === 0) tryPlayNext();
      }
    } catch (err) {
      console.error("Lỗi gọi TTS API:", err);
    }
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
        // Backend trả về mảng audioUrls; lấy phần tử đầu tiên cho đoạn này (hỗ trợ cả audioUrl string)
        const urls: string[] = response.data.audioUrls ?? (response.data.audioUrl ? [response.data.audioUrl] : []);
        const url = urls[0] ?? null;

        if (url) {
          const isReady = await waitAudioReady(url);
          if (isReady) {
            audioBuffer.current.set(idx, url);
            isSuccess = true;
            break;
          }
        } else {
          // Backend từ chối (câu trống / chỉ emoji)
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
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (currentProductId) {
      productService.getProductById(parseInt(currentProductId))
        .then((data) => {
          setCurrentProduct(data);
        })
        .catch((err) => {
          console.error("Lỗi lấy chi tiết sản phẩm cho banner chatbot:", err);
          setCurrentProduct(null);
        });
    } else {
      setCurrentProduct(null);
    }
  }, [currentProductId]);

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
              
              Nhiệm vụ: Dựa vào thông tin trên, hãy chủ động giới thiệu nhanh những điểm nổi bật nhất của sản phẩm, ĐỒNG THỜI LIỆT KÊ CÁC SIZE/MÀU ĐANG CÓ SẴN (ví dụ: 'Hiện tại shop đang có sẵn size 41, 42 màu Trắng') và hỏi xem khách hàng cần tư vấn thêm không.
              QUY ĐỊNH: Không tự ý phiên âm tiếng Anh. Trả lời tự nhiên, thân thiện, súc tích.`;

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

  // Auto-close chat window after 30s inactivity only if there has been no user interaction
  useEffect(() => {
    let timeout: any;
    if (isOpen && !hasInteracted) {
      timeout = setTimeout(() => {
        setIsOpen(false);
        setIsMinimized(false);
      }, 30000);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, hasInteracted]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setHasInteracted(true);

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

          const dataLines = lines.filter(l => l.startsWith('data:'));
          if (dataLines.length === 0) continue;
          let data = dataLines.map(l => l.substring(5)).join('\n');

          if (currentEventName === 'token') {
            fullContent += data;
            sentenceBuffer += data;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: fullContent.trim() } : m))
            );
            // Rolling TTS: tách câu để đọc cuốn chiếu
            let match = sentenceBuffer.match(/([.!?]\s|\n)/);
            if (!match && sentenceBuffer.length > 90) {
              let splitIdx = -1;
              const commaMatches = [...sentenceBuffer.matchAll(/[,;]\s/g)];
              if (commaMatches.length > 0) {
                const lastComma = commaMatches[commaMatches.length - 1];
                if (lastComma.index !== undefined) {
                  splitIdx = lastComma.index + lastComma[0].length;
                }
              }
              if (splitIdx === -1) {
                splitIdx = sentenceBuffer.lastIndexOf(' ', 80);
              }
              if (splitIdx > 10) {
                const chunk = sentenceBuffer.substring(0, splitIdx).trim();
                sentenceBuffer = sentenceBuffer.substring(splitIdx);
                if (chunk.length > 2) {
                  speakChunk(chunk, sentenceIndex++);
                }
              }
            } else if (match && match.index !== undefined) {
              const splitIdx = match.index + match[0].length;
              const chunk = sentenceBuffer.substring(0, splitIdx).trim();
              sentenceBuffer = sentenceBuffer.substring(splitIdx);
              if (chunk.length > 2) {
                speakChunk(chunk, sentenceIndex++);
              }
            }
          } else if (currentEventName === 'cart_updated') {
            // Thông báo Frontend cập nhật giỏ hàng
            window.dispatchEvent(new Event('cart-updated'));
            console.log('>>> [CART] Giỏ hàng đã được cập nhật bởi AI!');
          } else if (currentEventName === 'product_cards') {
            try {
              const cards = JSON.parse(data);
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { 
                  ...m, 
                  productCards: cards,
                  quickReplies: ["Có size nào?", "Màu sắc thế nào?", "Sản phẩm nào rẻ hơn?", "Chính sách đổi trả?"]
                } : m))
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
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Xóa đường dẫn markdown link [Tên](URL) giữ lại Tên
      .replace(/\b(product|brand|category|detail)\b[a-zA-Z0-9_/]*/gi, '') // Xóa các từ khóa URL đường dẫn
      .replace(/\/[0-9]+/g, '') // Xóa các ID dạng /123
      .replace(/\s*\((https?:\/\/|www\.|\/)[^)]*\)/g, '') // Fallback: Xóa bất kỳ link URL nào trong ngoặc đơn
      .replace(/[*_#`~|\[\]()]/g, '') // Xóa các ký tự markdown định dạng khác bao gồm cả ngoặc đơn, ngoặc vuông
      .replace(/\//g, ' ') // Thay thế dấu gạch chéo bằng dấu cách để tránh đọc "xuyệt"
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
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
        // Backend trả về mảng audioUrls; đoạn stream đã nhỏ nên lấy phần tử đầu (hỗ trợ cả audioUrl string)
        const urls: string[] = response.data.audioUrls ?? (response.data.audioUrl ? [response.data.audioUrl] : []);
        const url = urls[0] ?? null;

        if (url) {
          const isReady = await waitAudioReady(url);
          if (isReady) {
            audioBuffer.current.set(index, url);
            isSuccess = true;
            break;
          }
        } else {
          break; // rỗng / emoji
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
      let isBullet = false;
      let isNumbered = false;
      let numPrefix = "";
      let cleanLine = line;

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("• ")) {
        isBullet = true;
        cleanLine = line.replace(/^\s*[-*•]\s+/, "");
      } else {
        const numMatch = line.trim().match(/^(\d+)\.\s+/);
        if (numMatch) {
          isNumbered = true;
          numPrefix = numMatch[1] + ". ";
          cleanLine = line.replace(/^\s*\d+\.\s+/, "");
        }
      }

      const formatted = cleanLine
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">$1</a>');

      if (isBullet) {
        return (
          <span key={i} className="block pl-5 relative before:content-['•'] before:absolute before:left-1.5 before:text-blue-500 before:font-bold">
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </span>
        );
      }

      if (isNumbered) {
        return (
          <span key={i} className="block pl-6 relative">
            <span className="absolute left-0 text-blue-600 font-semibold">{numPrefix}</span>
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </span>
        );
      }

      return (
        <span key={i} className="block">
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
          onClick={() => setHasInteracted(true)}
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
                aria-label="Thu nhỏ/Đóng" className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label="Thu nhỏ/Đóng" className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                {isMinimized ? <Sparkles className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Thu nhỏ/Đóng" className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
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
                    <img loading="lazy" decoding="async"
                      src={currentProduct.images?.find((img) => img.isThumbnail)?.imageUrl || currentProduct.images?.[0]?.imageUrl || ""}
                      alt={currentProduct.name}
                      className="w-full h-full object-cover"
                    />
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
                      <span className="text-xs text-gray-500 mt-1 px-1">{msg.time}</span>
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
                                <img loading="lazy" decoding="async" src={card.imageUrl} alt={card.name} className="w-full h-20 object-cover" />
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
                    onChange={(e) => {
                      setInputText(e.target.value);
                      setHasInteracted(true);
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-400 text-sm text-gray-700 placeholder-gray-400 transition-colors"
                  />
                  <button aria-label="Gửi tin nhắn"
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4 text-white disabled:text-gray-500" />
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
          setHasInteracted(true);
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
