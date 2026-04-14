# E-Commerce Frontend - React Application

Đây là cấu trúc thư mục chuẩn dành cho ứng dụng Frontend (React + TypeScript) của hệ thống thương mại điện tử (E-commerce). Cấu trúc này được thiết kế để dễ dàng mở rộng, bảo trì và quản lý code theo các Best Practices hiện đại.

## 📂 Kiến trúc thư mục Frontend

Dưới đây là một cái nhìn tổng quan về kiến trúc thư mục nguồn (`src/`) và chức năng của từng thành phần:

```text
src/
├── assets/          # Chứa các file tĩnh không qua xử lý của webpack/vite (ảnh, icon, fonts, global styles)
│   ├── icons/       # Chứa các file SVG, icon set của dự án
│   ├── images/      # Chứa các file ảnh (PNG, JPG, WebP)
│   └── styles/      # Chứa các SCSS/CSS globals, variables, mixins
│
├── components/      # Chứa các components có thể tái sử dụng
│   ├── common/      # Các component chung dùng trên toàn hệ thống (Button, Input, Modal, Table...)
│   └── ui/          # Các component chuyên biệt về giao diện hoặc các UI library wrappers (Shadcn UI, AntD...)
│
├── config/          # Chứa cấu hình môi trường, thư viện bên thứ 3 (Axios config, Firebase, etc.)
│
├── constants/       # Chứa các hằng số fixed của dự án (API Endpoints, Route Paths, Action Types, Enums)
│
├── context/         # Chứa React Context API (AuthContext, ThemeContext, CartContext) để quản lý state nhỏ giọt
│
├── hooks/           # Chứa custom React hooks (useAuth, useCart, useDebounce, useFetch...)
│
├── layouts/         # Chứa các Layout component của hệ thống
│   ├── MainLayout/  # Layout chính cho trang cho khách hàng (Header, Footer, Main Content)
│   ├── AuthLayout/  # Layout nhỏ hơn dành cho form login/register
│   └── AdminLayout/ # Layout dành cho trang quản trị viên (có Sidebar)
│
├── pages/           # Chứa cấu trúc các trang (để ánh xạ với các route)
│   ├── Home/        # Trang chủ
│   ├── Product/     # Chi tiết sản phẩm, danh sách sản phẩm
│   ├── Cart/        # Giỏ hàng
│   ├── Checkout/    # Trang thanh toán
│   ├── Auth/        # Trang đăng nhập, đăng ký, quên mật khẩu
│   └── Profile/     # Cài đặt người dùng cá nhân
│
├── routes/          # Chứa cấu hình điều hướng (React Router, Protected Routes, Private/Public Routes)
│
├── services/        # Chứa logic giao tiếp với Backend
│   └── api/         # Các axios instances, API calls được chia theo resource (productApi, userApi, orderApi)
│
├── store/           # Quản lý Global State (Redux Toolkit, Zustand, Mobx...)
│
├── types/           # Nơi chứa các TypeScript Interfaces/Types để chuẩn hoá dữ liệu trả về và DTOs
│
└── utils/           # Chứa các helper functions dùng chung
    └── helpers/     # Các hàm tiện ích (formatCurrency, formatDate, validator, textTransform)
```

## 🛠 Nguyên tắc tổ chức mã nguồn (Best Practices)

1. **Feature-centric vs Type-centric**: 
   - Với các module lớn, chúng ta có thể nhóm theo tính năng thay vì kiểu (vd: `pages/Product/components`, `pages/Product/hooks`). Điều này làm giảm sự nhảy qua lại giữa các file ở root folder.
   
2. **Khai báo TypeScript Interface tại thư mục `types`**:
   - Tất cả các payload trả về từ Backend hoặc DTO gửi đi, hãy tạo interface tương ứng ở `types/` (ví dụ: `IProduct`, `IUser`, `IOrder`) để cả Service và Component đều có thể import chung.
   
3. **Thành phần chung phải tái sử dụng**:
   - Các Button, TextField và thiết kế UI chung đặt trong thư mục `components/common` (hoặc `components/ui`). Không nên viết CSS trùng lặp cho mỗi trang.

4. **Tách biệt Logic và UI**:
   - UI chỉ dùng để hiển thị và bắt sự kiện. Logic gọi API, xử lý nghiệp vụ sâu nằm tại React Hooks (`src/hooks`) hoặc trong action của Store.
   
5. **Đường dẫn tuyệt đối**:
   - Khuyến khích sử dụng Alias in imports thông qua cấu hình `vite.config.ts` hay `tsconfig.json` (Vd: import từ `@/components/common/Button` thay vì `../../../components/...`).

6. **Constants / Magic Strings**:
   - Tuyệt đối hạn chế việc sử dụng "chuỗi" hoặc "số" bí ẩn trong components. Hãy chuyển chúng ra các biến hằng ở `src/constants/` (Ví dụ: tên local storage key, định dạng format date-time, v.v..).
