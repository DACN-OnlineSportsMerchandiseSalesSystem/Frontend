# Báo cáo: Tích hợp API vào Frontend

Dưới đây là danh sách các công việc đã thực hiện để tích hợp danh sách API vào hệ thống Frontend của dự án:

## 1. Thiết lập Cấu hình API Cơ bản (`src/services/api.ts`)
- Cấu hình Axios instance với `baseURL` trỏ tới backend server.
- Thêm `Request Interceptor` để tự động gắn `Authorization: Bearer <token>` vào header của mỗi request nếu người dùng đã đăng nhập.
- Thêm `Response Interceptor` để xử lý lỗi toàn cục (ví dụ: tự động xóa token và chuyển hướng về trang đăng nhập khi token hết hạn - lỗi 401).

## 2. Xây dựng các Service Files gọi API
- **`src/services/authService.ts`**: Chứa các hàm gọi API cho chức năng Đăng nhập (`/api/auth/login`) và Đăng ký (`/api/auth/register`), quản lý lưu trữ token trong `localStorage`.
- **`src/services/userService.ts`**: Cung cấp các API liên quan đến người dùng như: lấy thông tin cá nhân, cập nhật hồ sơ, đổi mật khẩu, và các API dành riêng cho Admin (lấy danh sách toàn bộ người dùng, xóa người dùng, tạo tài khoản mới).
- **`src/services/addressService.ts`**: Xử lý toàn bộ logic liên quan đến địa chỉ của khách hàng (thêm mới, sửa, xóa, đặt làm mặc định).

## 3. Cập nhật Quản lý Trạng thái Toàn cục (`src/app/context/AppContext.tsx`)
- Tích hợp thực tế các hàm từ Service thay vì sử dụng dữ liệu giả (mock data).
- Thêm các state quản lý trạng thái tải (`isLoading`) và lỗi (`apiError`).
- Viết lại luồng Đăng nhập, Đăng ký: tự động gọi API lấy thông tin Profile và danh sách địa chỉ ngay sau khi xác thực thành công.
- Tích hợp luồng lưu trữ và khôi phục phiên đăng nhập (session) khi người dùng tải lại trang web.

## 4. Cải thiện Giao diện & Chức năng phía Khách hàng
- **Trang Đăng nhập / Đăng ký (`src/app/pages/Login.tsx`)**: 
  - Chuyển đổi từ xử lý đồng bộ sang bất đồng bộ (`async/await`) để gọi API thực tế.
  - Cập nhật form đăng ký để tách biệt trường `firstName` và `lastName` theo đúng cấu trúc của backend.
  - Hiển thị trạng thái tải (loading spinner) và các thông báo lỗi trả về trực tiếp từ API.
- **Trang Tài khoản (`src/app/pages/Account.tsx`)**:
  - Tích hợp API Cập nhật thông tin cá nhân.
  - Tích hợp API Đổi mật khẩu với kiểm tra tính hợp lệ.
  - Liên kết danh sách địa chỉ với API: cho phép thêm mới, xóa và đặt địa chỉ làm mặc định với hiệu ứng phản hồi rõ ràng (success/error).

## 5. Cải thiện Giao diện Quản trị (`src/app/pages/admin/CustomersManagement.tsx`)
- Loại bỏ toàn bộ dữ liệu mẫu (mock data).
- Gọi API `getAllUsersAPI()` để lấy và hiển thị danh sách người dùng thực từ cơ sở dữ liệu.
- Cập nhật bảng hiển thị thông tin để phù hợp với thuộc tính trả về từ backend (`firstName`, `lastName`, `roleName`, `status`).
- Tích hợp tính năng xóa người dùng.
- Cập nhật số liệu thống kê tổng quan (Tổng người dùng, quản trị viên, người dùng đang hoạt động/bị khóa) dựa trên dữ liệu thật.

> Mọi chức năng hiện đã được kết nối với backend để đảm bảo hệ thống vận hành trơn tru theo thiết kế thực tế.
