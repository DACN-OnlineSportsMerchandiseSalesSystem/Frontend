import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { User, Mail, Lock, Phone, ChevronRight, Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { sendOtpAPI } from "../../services/authService";

const TURNSTILE_SITE_KEY = "1x00000000000000000000AA"; // Dummy testing key

export function Login() {
  const { login, register, isLoading, apiError } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginRole, setLoginRole] = useState<"user" | "admin">("user");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginTurnstileToken, setLoginTurnstileToken] = useState("");

  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerTurnstileToken, setRegisterTurnstileToken] = useState("");
  
  // OTP logic
  const [registerOtp, setRegisterOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState("");

  const handleSendOtp = async () => {
    if (!registerData.email) {
      setRegisterError("Vui lòng nhập email trước khi nhận mã OTP");
      return;
    }
    setRegisterError("");
    setOtpSentMessage("");
    setIsSendingOtp(true);
    try {
      const msg = await sendOtpAPI(registerData.email);
      setOtpSentMessage(msg || "Mã OTP đã được gửi đến email của bạn.");
    } catch (err: any) {
      setRegisterError(err.response?.data || "Lỗi hệ thống khi gửi email OTP!");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail || !loginPassword) {
      setLoginError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!loginTurnstileToken) {
      setLoginError("Vui lòng xác thực bạn không phải là robot");
      return;
    }

    const success = await login(loginEmail, loginPassword, loginRole, loginTurnstileToken);
    if (success) {
      if (loginRole === "admin") {
        navigate("/admin");
      } else {
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from);
      }
    } else {
      setLoginError(apiError || "Email hoặc mật khẩu không đúng");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!registerData.firstName || !registerData.email || !registerData.phone || !registerData.password) {
      setRegisterError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!registerTurnstileToken) {
      setRegisterError("Vui lòng xác thực bạn không phải là robot");
      return;
    }

    const success = await register({
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      turnstileToken: registerTurnstileToken,
      otp: registerOtp,
    });

    if (success) {
      setRegisterSuccess(true);
      setTimeout(() => {
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from);
      }, 1000);
    } else {
      setRegisterError(apiError || "Đăng ký không thành công, vui lòng thử lại");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-blue-700 rounded-xl p-2">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <span className="text-blue-900 font-black text-3xl tracking-tight">
              Sport<span className="text-yellow-500">Zone</span>
            </span>
          </Link>
          <p className="text-gray-600 text-sm">Chuyên cung cấp đồ thể thao chất lượng cao</p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 justify-center">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800">{activeTab === "login" ? "Đăng nhập" : "Đăng ký"}</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-300 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab("login"); setLoginError(""); }}
              className={`flex-1 py-4 text-sm font-medium transition-all ${
                activeTab === "login"
                  ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setActiveTab("register"); setRegisterError(""); }}
              className={`flex-1 py-4 text-sm font-medium transition-all ${
                activeTab === "register"
                  ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <div className="p-6">
            {/* Login form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role selector */}
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setLoginRole("user"); setLoginError(""); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      loginRole === "user"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    👤 Khách hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginRole("admin"); setLoginError(""); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      loginRole === "admin"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    🛡️ Quản trị viên
                  </button>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                      placeholder={loginRole === "admin" ? "admin@sportzone.com" : "email@example.com"}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {loginRole === "admin" && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs">
                    <strong>Demo Admin:</strong> admin@sportzone.com / 123456
                  </div>
                )}

                <div className="flex justify-center">
                  <TurnstileWidget
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={(token) => setLoginTurnstileToken(token)}
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    loginRole === "admin" ? "Đăng nhập quản trị" : "Đăng nhập"
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </form>
            )}

            {/* Register form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={registerData.firstName}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, firstName: e.target.value });
                          setRegisterError("");
                        }}
                        placeholder="Nguyễn"
                        className="w-full pl-9 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Tên</label>
                    <input
                      type="text"
                      value={registerData.lastName}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, lastName: e.target.value });
                        setRegisterError("");
                      }}
                      placeholder="Văn A"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value });
                        setRegisterError("");
                      }}
                      placeholder="email@example.com"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, phone: e.target.value });
                        setRegisterError("");
                      }}
                      placeholder="0912345678"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        setRegisterError("");
                      }}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
                    >
                      {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, confirmPassword: e.target.value });
                        setRegisterError("");
                      }}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* OTP Section */}
                <div className="pt-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Mã xác thực (OTP) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={registerOtp}
                      onChange={(e) => {
                        setRegisterOtp(e.target.value);
                        setRegisterError("");
                      }}
                      placeholder="Nhập mã OTP (6 số)"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-center tracking-widest font-mono"
                      maxLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || !registerData.email}
                      className="px-4 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-500 font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        "Gửi mã"
                      )}
                    </button>
                  </div>
                  {otpSentMessage && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {otpSentMessage}
                    </p>
                  )}
                </div>

                {registerError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {registerError}
                  </div>
                )}

                <div className="flex justify-center">
                  <TurnstileWidget
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={(token) => setRegisterTurnstileToken(token)}
                  />
                </div>

                {registerSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                    ✓ Đăng ký thành công! Đang chuyển hướng...
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || registerSuccess}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Link to="/policy" className="text-blue-600 hover:text-blue-800">Điều khoản dịch vụ</Link>
          {" "}và{" "}
          <Link to="/policy" className="text-blue-600 hover:text-blue-800">Chính sách bảo mật</Link>
          {" "}của SportZone
        </p>
      </div>
    </div>
  );
}
