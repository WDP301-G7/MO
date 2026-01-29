# CẬP NHẬT LOGIC ĐẶT HÀNG - MO EYEWEAR STORE

## Tổng quan thay đổi

Cập nhật toàn bộ flow đặt hàng theo yêu cầu mới với các tính năng:

- Shop chủ động hẹn lịch (không phải khách chọn)
- Hiển thị thời gian tối thiểu để có tròng
- Phân biệt khi nào thanh toán full, khi nào thanh toán cọc
- Xử lý sản phẩm không có sẵn (cần lấy từ nhà cung cấp)
- Bảo hành có hạn, chỉ nhận tại cửa hàng

## 📦 Files đã cập nhật

### 1. src/constants/data.js

**Thêm các thuộc tính mới cho sản phẩm:**

```javascript
{
  inStock: true/false,              // Có sẵn tại cửa hàng không
  availableInStore: true/false,     // Có thể lấy tại cửa hàng
  minimumWaitTime: "3-5 ngày",      // Thời gian tối thiểu để có tròng
  requiresThirdParty: true/false,   // Phải lấy từ bên thứ 3
  requiresFullPayment: true/false,  // Bắt buộc thanh toán toàn bộ
  requiresShipping: true/false,     // Bắt buộc ship (phụ kiện, kính áp tròng)
  estimatedArrival: "7-10 ngày",    // Thời gian dự kiến về hàng
  warranty: "6-12 tháng",           // Thời hạn bảo hành
  warrantyType: "in-store",         // Loại bảo hành (in-store = phải lên cửa hàng)
}
```

### 2. src/screens/prescription/PrescriptionOrderScreen.js

**Các thay đổi chính:**

#### A. Cập nhật data structure cho tròng và gọng

- ✅ Thêm `minimumWaitTime` cho mỗi loại tròng
- ✅ Thêm `inStock` status
- ✅ Thêm `requiresFullPayment` flag
- ✅ Thêm `requiresThirdParty` flag
- ✅ Thêm `warranty` info

#### B. Logic thanh toán mới

```javascript
// Hàm kiểm tra bắt buộc thanh toán toàn bộ
isFullPaymentRequired() {
  // Nếu tròng hoặc gọng phải lấy từ bên thứ 3
  // → Bắt buộc thanh toán full
  if (selectedLens?.requiresFullPayment || selectedFrame?.requiresFullPayment) {
    return true;
  }
  return false;
}
```

#### C. Hiển thị thông tin thời gian chờ

```javascript
getWaitTimeInfo() {
  // Lấy thời gian tối thiểu để có tròng
  // Lấy thời gian dự kiến về hàng (nếu gọng không có sẵn)
  // Hiển thị cho khách biết cần đợi bao lâu
}
```

#### D. Kiểm tra sản phẩm không có sẵn

```javascript
hasUnavailableProducts() {
  // Kiểm tra xem có sản phẩm nào không có sẵn không
  // → Hiển thị warning và tùy chọn đổi/đợi
}
```

#### E. Bước 3: Không còn chọn lịch hẹn

**TRƯỚC:**

- Khách chọn ngày và giờ hẹn từ danh sách slots có sẵn
- Bắt buộc phải chọn lịch mới sang bước tiếp theo

**SAU:**

- Shop chủ động hẹn lịch khi sản phẩm sẵn sàng
- Hiển thị thông tin liên hệ của khách
- Hiển thị thông báo: "Shop sẽ gọi điện để hẹn lịch"
- Hiển thị thời gian dự kiến (nếu có)

#### F. Bước 4: Thanh toán thông minh

**Logic mới:**

1. Nếu sản phẩm không có sẵn (phải lấy từ bên thứ 3)
   - → Bắt buộc thanh toán toàn bộ
   - → Không cho chọn option cọc
   - → Hiển thị badge "Bắt buộc"

2. Nếu sản phẩm có sẵn
   - → Cho phép chọn cọc 50% hoặc thanh toán toàn bộ
   - → Option cọc được đánh dấu "Phổ biến"

## 🎨 UI Updates

### Hiển thị status sản phẩm

**Có sẵn:**

```
✅ Có sẵn tại cửa hàng
⏱ Thời gian làm: 3-5 ngày làm việc
🛡️ 12 tháng - Nhận bảo hành tại cửa hàng
```

**Không có sẵn:**

```
⚠️ Cần đặt trước - 7-10 ngày làm việc
❌ Bắt buộc thanh toán toàn bộ
🛡️ 12 tháng - Nhận bảo hành tại cửa hàng
```

### Warning boxes

#### Sản phẩm cần đợi

```
⚠️ Sản phẩm cần đặt trước:
Một hoặc nhiều sản phẩm không có sẵn tại cửa hàng
và cần đợi shop lấy từ nhà cung cấp.
Sau khi đặt hàng, bạn có thể:
• Đợi shop lấy hàng về
• Hoặc đổi sang sản phẩm có sẵn khác
```

#### Lưu ý quan trọng

```
⚠️ Lưu ý quan trọng:
• Shop sẽ chủ động liên hệ để hẹn lịch nhận hàng
• Bạn BẮT BUỘC phải lên cửa hàng để nhận hàng và kiểm tra
• Cần test kính và điều chỉnh gọng cho phù hợp
• Bảo hành chỉ được nhận tại cửa hàng (không nhận online)
```

## 📋 Flow đặt hàng mới

### 1. Chọn loại đơn hàng

- Đặt theo toa (gọng + tròng)
- Đặt theo toa (chỉ tròng)

### 2. Chọn sản phẩm

- Chọn gọng kính (nếu cần)
  - Hiển thị trạng thái: có sẵn / cần đặt trước
  - Hiển thị thời gian chờ (nếu cần đặt)
  - Hiển thị bắt buộc thanh toán full (nếu cần)
- Chọn tròng kính
  - Hiển thị thời gian làm tối thiểu
  - Hiển thị trạng thái: có sẵn / cần đặt trước
  - Hiển thị thông tin bảo hành

### 3. Thông tin nhận hàng

- ❌ KHÔNG còn cho khách chọn lịch
- ✅ Shop sẽ chủ động liên hệ để hẹn lịch
- Hiển thị thông tin liên hệ của khách
- Hiển thị cửa hàng nhận hàng
- Hiển thị thời gian dự kiến (nếu có)
- Hiển thị warning nếu sản phẩm không có sẵn

### 4. Thanh toán

- **Nếu sản phẩm có sẵn:**
  - Option 1: Đặt cọc 50% (phổ biến)
  - Option 2: Thanh toán toàn bộ

- **Nếu sản phẩm KHÔNG có sẵn:**
  - Chỉ có: Thanh toán toàn bộ (bắt buộc)
  - Hiển thị lý do: "Sản phẩm cần đặt từ nhà cung cấp"

## 🔄 Quy trình xử lý đơn hàng

### Case 1: Sản phẩm có sẵn

```
Đặt hàng → Thanh toán (cọc/full) → Làm tròng (3-5 ngày)
→ Shop gọi hẹn lịch → Khách lên nhận → Test & nhận hàng
→ Thanh toán phần còn lại (nếu cọc)
```

### Case 2: Sản phẩm không có sẵn

```
Đặt hàng → Thanh toán toàn bộ (bắt buộc)
→ Shop đặt hàng từ nhà cung cấp (7-10 ngày)
→ Hàng về → Làm tròng (nếu cần)
→ Shop gọi hẹn lịch → Khách lên nhận → Test & nhận hàng
```

### Case 3: Khách muốn đổi sản phẩm

```
Nếu sản phẩm không có sẵn:
→ Khách có thể yêu cầu đổi sang sản phẩm có sẵn khác
→ Hoặc đợi shop lấy hàng về
```

## 🛡️ Chính sách bảo hành

### Thời hạn

- Gọng kính: **6 tháng**
- Tròng kính: **12 tháng**
- Phụ kiện: **Không bảo hành**

### Điều kiện

- ⚠️ **BẮT BUỘC** lên cửa hàng để nhận bảo hành
- ❌ **KHÔNG** nhận bảo hành online
- ✅ Cần mang theo hóa đơn gốc
- ✅ Sản phẩm còn trong thời hạn bảo hành

## 📱 Các rules mới

### 1. Về lịch hẹn

- ❌ Khách KHÔNG tự chọn lịch
- ✅ Shop chủ động gọi điện hẹn lịch khi sản phẩm sẵn sàng
- ✅ Khách BẮT BUỘC lên cửa hàng nhận hàng

### 2. Về thanh toán

- Có sẵn → Cho phép cọc 50% hoặc full
- Không có sẵn (phải lấy từ bên thứ 3) → BẮT BUỘC thanh toán full

### 3. Về shipping

- Gọng kính: **KHÔNG** bắt buộc ship (lấy tại cửa hàng)
- Tròng kính: **KHÔNG** ship (phải test tại cửa hàng)
- Phụ kiện: **BẮT BUỘC** ship
- Kính áp tròng: **BẮT BUỘC** ship

### 4. Về bảo hành

- Tất cả bảo hành đều phải nhận tại cửa hàng
- Không hỗ trợ bảo hành online/từ xa

## 🎯 Next Steps

Cần update thêm các screen sau để đồng bộ logic:

1. **LensOrderScreen.js** - Flow mua combo tròng + gọng không theo toa
2. **CheckoutScreen.js** - Hiển thị info về bảo hành và shipping
3. **OrderDetailScreen.js** - Hiển thị trạng thái đơn hàng với option đổi/đợi
4. **ProductDetailScreen.js** - Hiển thị thông tin mới về sản phẩm

---

**Lưu ý:** Tất cả các thay đổi đã được test và không có lỗi syntax.
