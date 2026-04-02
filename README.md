# MO — Eye-wear Mobile App

Ứng dụng di động cho nền tảng mua kính mắt **Eye-wear**, xây dựng bằng React Native & Expo.

---

## 📱 Tech Stack

| Thư viện             | Phiên bản     | Mục đích                      |
| -------------------- | ------------- | ----------------------------- |
| React Native         | 0.81.5        | Framework di động đa nền tảng |
| Expo SDK             | ~54.0.33      | Nền tảng phát triển & build   |
| React                | 19.1.0        | UI library                    |
| React Navigation     | 7.x           | Điều hướng màn hình           |
| NativeWind           | 2.x           | Tailwind CSS cho React Native |
| Axios                | 1.x           | HTTP client                   |
| Three.js             | 0.140 / 0.166 | Render 3D model & AR          |
| Socket.io-client     | 4.x           | Thông báo thời gian thực      |
| expo-camera          | ~17.0         | Camera AR thử kính            |
| expo-gl / expo-three | 16.x / 8.x    | OpenGL ES renderer            |

---

## ✨ Tính năng

- **Xác thực**: Đăng ký / Đăng nhập email, Đăng nhập Google OAuth
- **Danh mục & Sản phẩm**: Duyệt danh mục, tìm kiếm, xem chi tiết sản phẩm
- **Thử kính AR**: Camera trực tiếp với MediaPipe FaceMesh + Three.js (478 landmarks), hiển thị kính 3D lên khuôn mặt thật
- **Xem mô hình 3D**: Viewer 3D tương tác (xoay/zoom) với RoomEnvironment IBL, ACESFilmic tone-mapping
- **Đặt hàng**: Đặt kính gọng thường, combo gọng + tròng, đơn hàng theo toa
- **Thanh toán**: Thanh toán online qua VNPay, giao hàng tận nhà hoặc nhận tại cửa hàng
- **Quản lý đơn hàng**: Xem lịch sử, theo dõi trạng thái, hủy đơn, đổi trả
- **Hội viên**: Xem cấp độ thành viên và lịch sử ưu đãi
- **Điểm hẹn**: Đặt lịch hẹn đo toa kính
- **Đánh giá**: Viết và xem đánh giá sản phẩm
- **Thông báo**: Nhận thông báo thời gian thực qua Socket.io
- **Bảo mật**: Tự động logout khi tài khoản bị khóa (BANNED)

---

## 📁 Cấu trúc thư mục

```
MO/
├── App.js                        # Root component, navigation container
├── index.js                      # Entry point
├── app.json                      # Expo config
├── package.json
├── tailwind.config.js
├── src/
│   ├── components/               # Shared components
│   │   ├── notifications/
│   │   └── returns/
│   ├── constants/
│   │   ├── api.js                # API_URL & endpoints
│   │   └── colors.js
│   ├── contexts/                 # React Context providers
│   │   ├── NotificationContext.js
│   │   ├── OrdersContext.js
│   │   └── ReturnsContext.js
│   ├── navigation/
│   │   └── MainTabNavigator.js   # Tab + stack navigators
│   ├── screens/
│   │   ├── auth/                 # Login, Register, ForgotPassword
│   │   ├── home/                 # HomeScreen
│   │   ├── categories/           # CategoriesScreen
│   │   ├── products/             # ProductCatalog, ProductDetail, LensOrder
│   │   ├── checkout/             # CheckoutScreen, VNPayPaymentScreen
│   │   ├── orders/               # Orders, OrderDetail, OrderSuccess
│   │   ├── return/               # ReturnRequest, ReturnHistory
│   │   ├── reviews/              # Reviews, WriteReview, MyReviews
│   │   ├── profile/              # Profile, EditProfile, ChangePassword
│   │   ├── membership/           # MembershipScreen
│   │   ├── appointments/         # PrescriptionRequests
│   │   ├── prescription/         # PrescriptionOrderScreen
│   │   ├── notifications/        # NotificationListScreen
│   │   ├── search/               # SearchScreen
│   │   ├── support/              # SupportScreen
│   │   ├── settings/             # TermsAndPolicies
│   │   └── virtual-tryon/        # VirtualTryOnScreen, VirtualTryOnSelectScreen
│   ├── services/
│   │   ├── api.js                # Axios instance + interceptors
│   │   ├── authService.js        # Auth logic + forceLogout
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── paymentService.js
│   │   ├── prescriptionService.js
│   │   ├── notificationService.js
│   │   ├── socketService.js
│   │   └── ...
│   └── utils/
│       ├── navigationService.js  # Stable navigationRef (module-level)
│       ├── deepLinkHandler.js
│       ├── addressStore.js
│       └── validation.js
└── assets/                       # Icons, splash screen
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js ≥ 16
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go trên điện thoại, hoặc iOS Simulator / Android Emulator

### Cài đặt

```bash
npm install
```

### Biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
EXPO_PUBLIC_API_URL=https://wdp.up.railway.app/api
EXPO_PUBLIC_GHN_TOKEN=<GHN_token>
```

### Chạy development

```bash
# Expo Go (scan QR)
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

---

## 🔗 Backend API

Base URL: `https://wdp.up.railway.app/api`

Ứng dụng giao tiếp với backend qua REST API (Axios) và Socket.io cho thông báo realtime. Token được lưu trong AsyncStorage và tự động refresh khi hết hạn. Khi tài khoản bị khóa (status `BANNED`), mọi API call trả về `401` và app tự động logout người dùng.

---

## 📝 Ghi chú phát triển

- Dynamic `className` không hoạt động với NativeWind v2 — dùng `style` prop cho style điều kiện
- AR view sử dụng MediaPipe FaceMesh (478 landmarks với `refineLandmarks: true`) trong WebView do `getUserMedia` bị chặn trong expo-camera native
- 3D model viewer dùng Three.js với `RoomEnvironment` IBL + `ACESFilmicToneMapping` để render đúng màu vật liệu PBR kim loại/kính
