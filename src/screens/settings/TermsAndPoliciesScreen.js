import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// ─── Reusable section heading ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <Text className="text-base font-bold text-text mb-2">{children}</Text>;
}

// ─── Coloured info box ────────────────────────────────────────────────────────
function InfoBox({ color = "#2E86AB", icon, children }) {
  return (
    <View
      className="rounded-xl p-4 mb-4 flex-row items-start"
      style={{ backgroundColor: color + "18" }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={color}
          style={{ marginTop: 1, marginRight: 8 }}
        />
      )}
      <View className="flex-1">{children}</View>
    </View>
  );
}

// ─── Bullet list item ─────────────────────────────────────────────────────────
function Bullet({ children }) {
  return (
    <View className="flex-row items-start mb-1">
      <Text className="text-textGray text-sm mr-2 mt-0.5">•</Text>
      <Text className="text-sm text-textGray leading-6 flex-1">{children}</Text>
    </View>
  );
}

// ─── Numbered step ────────────────────────────────────────────────────────────
function Step({ n, children }) {
  return (
    <View className="flex-row items-start mb-3">
      <View
        className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
        style={{ backgroundColor: "#2E86AB" }}
      >
        <Text className="text-white text-xs font-bold">{n}</Text>
      </View>
      <Text className="text-sm text-textGray leading-6 flex-1">{children}</Text>
    </View>
  );
}

// ─── Tier badge row ───────────────────────────────────────────────────────────
const TIER_DATA = [
  {
    name: "Thành viên",
    color: "#2E86AB",
    icon: "person-circle-outline",
    minSpend: "Miễn phí",
    discount: "0%",
    returnDays: "7 ngày",
    exchangeDays: "15 ngày",
    warrantyMonths: "15 ngày",
  },
  {
    name: "Bronze",
    color: "#92400E",
    icon: "star",
    minSpend: "Tích lũy chi tiêu",
    discount: "Theo tier",
    returnDays: "Theo tier",
    exchangeDays: "Theo tier",
    warrantyMonths: "Theo tier",
  },
  {
    name: "Silver",
    color: "#6B7280",
    icon: "medal-outline",
    minSpend: "Tích lũy chi tiêu",
    discount: "Theo tier",
    returnDays: "Theo tier",
    exchangeDays: "Theo tier",
    warrantyMonths: "Theo tier",
  },
  {
    name: "Gold",
    color: "#F59E0B",
    icon: "medal",
    minSpend: "Tích lũy chi tiêu",
    discount: "Cao nhất",
    returnDays: "Dài nhất",
    exchangeDays: "Dài nhất",
    warrantyMonths: "Dài nhất",
  },
];

export default function TermsAndPoliciesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("return");

  const tabs = [
    { key: "return", label: "Đổi/Trả/BH", icon: "shield-checkmark-outline" },
    { key: "terms", label: "Điều khoản", icon: "document-text-outline" },
    { key: "privacy", label: "Bảo mật", icon: "lock-closed-outline" },
    { key: "membership", label: "Thành viên", icon: "medal-outline" },
  ];

  const renderReturn = () => (
    <View className="px-5 py-5">
      <Text className="text-xl font-bold text-text mb-1">
        Chính sách Đổi / Trả / Bảo hành
      </Text>
      <Text className="text-xs text-textGray mb-5">
        Áp dụng cho tất cả đơn hàng đã hoàn thành
      </Text>

      {/* 3 loại yêu cầu */}
      <SectionTitle>1. Ba loại yêu cầu</SectionTitle>
      <View className="mb-5 gap-3">
        <InfoBox color="#EF4444" icon="return-down-back-outline">
          <Text className="text-sm font-bold text-red-700 mb-1">
            Trả hàng (RETURN)
          </Text>
          <Text className="text-xs text-textGray leading-5">
            Trả lại sản phẩm và nhận hoàn tiền. Áp dụng khi sản phẩm bị lỗi,
            giao sai hoặc không đúng mô tả.
          </Text>
        </InfoBox>
        <InfoBox color="#F59E0B" icon="swap-horizontal-outline">
          <Text className="text-sm font-bold text-amber-700 mb-1">
            Đổi hàng (EXCHANGE)
          </Text>
          <Text className="text-xs text-textGray leading-5">
            Đổi sang sản phẩm khác. Chỉ áp dụng cho đơn hàng gọng kính (không áp
            dụng cho đơn Gọng + Tròng hoặc đơn thuốc).
          </Text>
        </InfoBox>
        <InfoBox color="#2E86AB" icon="construct-outline">
          <Text className="text-sm font-bold text-blue-700 mb-1">
            Bảo hành (WARRANTY)
          </Text>
          <Text className="text-xs text-textGray leading-5">
            Sửa chữa hoặc thay thế miễn phí khi sản phẩm có lỗi kỹ thuật trong
            thời hạn bảo hành. Áp dụng cho tất cả loại đơn hàng.
          </Text>
        </InfoBox>
      </View>

      {/* Quy định theo loại đơn */}
      <SectionTitle>2. Quy định theo loại đơn hàng</SectionTitle>
      <View className="mb-5">
        <View className="bg-white rounded-xl overflow-hidden border border-border mb-3">
          {/* Header */}
          <View
            className="flex-row px-4 py-2"
            style={{ backgroundColor: "#2E86AB" }}
          >
            <Text className="text-white text-xs font-bold flex-1">
              Loại đơn hàng
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 48 }}
            >
              Trả
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 48 }}
            >
              Đổi
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 48 }}
            >
              BH
            </Text>
          </View>
          {/* Rows */}
          {[
            {
              label: "Gọng kính (IN_STOCK / PRE_ORDER)",
              ret: true,
              exc: true,
              war: true,
            },
            {
              label: "Gọng + Tròng (lắp tại cửa hàng)",
              ret: true,
              exc: false,
              war: true,
            },
            {
              label: "Đơn thuốc (PRESCRIPTION)",
              ret: false,
              exc: false,
              war: true,
            },
          ].map((row, i) => (
            <View
              key={i}
              className="flex-row items-center px-4 py-3 border-t border-border"
            >
              <Text className="text-xs text-text flex-1">{row.label}</Text>
              {[row.ret, row.exc, row.war].map((ok, j) => (
                <View
                  key={j}
                  className="items-center justify-center"
                  style={{ width: 48 }}
                >
                  <Ionicons
                    name={ok ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={ok ? "#22C55E" : "#EF4444"}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
        <InfoBox color="#F59E0B" icon="information-circle-outline">
          <Text className="text-xs text-amber-800 leading-5">
            Đơn Gọng + Tròng không được phép đổi hàng vì tròng kính đã được cắt
            riêng theo gọng và không thể tái sử dụng.
          </Text>
        </InfoBox>
      </View>

      {/* Thời hạn */}
      <SectionTitle>3. Thời hạn (tính từ khi đơn HOÀN THÀNH)</SectionTitle>
      <View className="mb-5">
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
            <Ionicons
              name="return-down-back-outline"
              size={20}
              color="#EF4444"
            />
            <Text className="text-xs font-bold text-red-700 mt-1">
              Trả hàng
            </Text>
            <Text className="text-lg font-bold text-red-600">7 ngày</Text>
            <Text className="text-xs text-textGray text-center">
              (mặc định)
            </Text>
          </View>
          <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
            <Ionicons
              name="swap-horizontal-outline"
              size={20}
              color="#F59E0B"
            />
            <Text className="text-xs font-bold text-amber-700 mt-1">
              Đổi hàng
            </Text>
            <Text className="text-lg font-bold text-amber-600">15 ngày</Text>
            <Text className="text-xs text-textGray text-center">
              (mặc định)
            </Text>
          </View>
          <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
            <Ionicons name="construct-outline" size={20} color="#2E86AB" />
            <Text className="text-xs font-bold text-blue-700 mt-1">
              Bảo hành
            </Text>
            <Text className="text-lg font-bold text-blue-600">15 ngày</Text>
            <Text className="text-xs text-textGray text-center">
              (mặc định)
            </Text>
          </View>
        </View>
        <InfoBox color="#2E86AB" icon="medal-outline">
          <Text className="text-xs text-blue-800 leading-5">
            Thành viên hạng Bronze / Silver / Gold được hưởng thời hạn trả hàng,
            đổi hàng và bảo hành dài hơn theo hạng thành viên. Xem chi tiết tại
            tab <Text className="font-bold">Thành viên</Text>.
          </Text>
        </InfoBox>
      </View>

      {/* Điều kiện */}
      <SectionTitle>4. Điều kiện chung</SectionTitle>
      <View className="mb-5">
        <Bullet>Đơn hàng phải ở trạng thái Hoàn thành (COMPLETED)</Bullet>
        <Bullet>Sản phẩm còn nguyên vẹn, đủ phụ kiện đi kèm</Bullet>
        <Bullet>
          Không có yêu cầu đổi/trả/bảo hành nào đang xử lý cho đơn
        </Bullet>
        <Bullet>Cung cấp hình ảnh minh chứng khi tạo yêu cầu</Bullet>
      </View>

      {/* Lý do được chấp nhận */}
      <SectionTitle>5. Lý do được chấp nhận</SectionTitle>
      <View className="mb-5">
        <View className="bg-white rounded-xl border border-border overflow-hidden">
          {[
            {
              icon: "alert-circle-outline",
              label: "Sản phẩm bị lỗi / hư hỏng",
              types: "Trả, Bảo hành",
            },
            {
              icon: "swap-horizontal-outline",
              label: "Giao sai sản phẩm",
              types: "Trả, Đổi",
            },
            {
              icon: "image-outline",
              label: "Không đúng mô tả / hình ảnh",
              types: "Trả, Đổi",
            },
            {
              icon: "shuffle-outline",
              label: "Muốn đổi mẫu khác",
              types: "Đổi",
            },
            {
              icon: "ellipsis-horizontal-outline",
              label: "Lý do khác",
              types: "Trả, Đổi, BH",
            },
          ].map((item, i) => (
            <View
              key={i}
              className="flex-row items-center px-4 py-3 border-t border-border"
              style={i === 0 ? { borderTopWidth: 0 } : {}}
            >
              <Ionicons name={item.icon} size={18} color="#2E86AB" />
              <Text className="text-sm text-text flex-1 ml-3">
                {item.label}
              </Text>
              <Text className="text-xs text-textGray">{item.types}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quy trình */}
      <SectionTitle>6. Quy trình xử lý</SectionTitle>
      <View className="mb-5">
        <Step n="1">
          Vào <Text className="font-semibold">Đơn hàng → Chi tiết đơn</Text> và
          nhấn nút Đổi / Trả / Bảo hành.
        </Step>
        <Step n="2">
          Chọn loại yêu cầu, lý do và sản phẩm cần xử lý. Đính kèm hình ảnh minh
          chứng rõ ràng.
        </Step>
        <Step n="3">
          Nhân viên xem xét yêu cầu trong vòng{" "}
          <Text className="font-semibold">1–3 ngày làm việc</Text>.
        </Step>
        <Step n="4">
          Nếu được duyệt, nhân viên sẽ liên hệ sắp xếp thu hồi sản phẩm hoặc
          hướng dẫn gửi về cửa hàng.
        </Step>
        <Step n="5">
          Hoàn tiền (nếu có) về phương thức thanh toán gốc trong{" "}
          <Text className="font-semibold">5–7 ngày làm việc</Text> sau khi xác
          nhận nhận lại hàng.
        </Step>
      </View>

      {/* Phí */}
      <SectionTitle>7. Chi phí vận chuyển hoàn trả</SectionTitle>
      <View className="mb-5">
        <Bullet>
          <Text className="font-semibold">Miễn phí</Text> khi sản phẩm bị lỗi từ
          nhà sản xuất hoặc giao sai.
        </Bullet>
        <Bullet>
          <Text className="font-semibold">Miễn phí</Text> cho yêu cầu bảo hành
          trong thời hạn.
        </Bullet>
        <Bullet>
          Khách chịu phí vận chuyển trong trường hợp đổi mẫu theo sở thích.
        </Bullet>
      </View>
    </View>
  );

  const renderTerms = () => (
    <View className="px-5 py-5">
      <Text className="text-xl font-bold text-text mb-1">
        Điều khoản sử dụng
      </Text>
      <Text className="text-xs text-textGray mb-5">
        Vui lòng đọc kỹ trước khi sử dụng ứng dụng
      </Text>

      <SectionTitle>1. Chấp nhận điều khoản</SectionTitle>
      <Text className="text-sm text-textGray leading-6 mb-5">
        Khi sử dụng ứng dụng MO Eyewear, bạn đồng ý tuân thủ các điều khoản được
        nêu dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng ứng dụng.
      </Text>

      <SectionTitle>2. Tài khoản người dùng</SectionTitle>
      <View className="mb-5">
        <Bullet>Cung cấp thông tin chính xác khi đăng ký</Bullet>
        <Bullet>Tự chịu trách nhiệm bảo mật mật khẩu tài khoản</Bullet>
        <Bullet>Mỗi người chỉ được sở hữu một tài khoản</Bullet>
        <Bullet>
          Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép
        </Bullet>
        <Bullet>
          Tài khoản vi phạm chính sách có thể bị khóa hoặc xóa vĩnh viễn mà
          không cần thông báo trước
        </Bullet>
      </View>

      <SectionTitle>3. Đặt hàng và thanh toán</SectionTitle>
      <View className="mb-5">
        <Bullet>
          Đơn hàng chưa thanh toán sẽ tự động hủy sau khi hết thời hạn chờ
        </Bullet>
        <Bullet>Thanh toán qua cổng VNPay được mã hóa bảo mật SSL</Bullet>
        <Bullet>
          Chúng tôi có quyền từ chối đơn hàng nếu phát hiện hoạt động gian lận
        </Bullet>
        <Bullet>
          Đơn hàng loại Đặt trước (PRE_ORDER) có thể có thời gian chờ sản xuất
          dài hơn theo sản phẩm
        </Bullet>
      </View>

      <SectionTitle>4. Giao hàng</SectionTitle>
      <View className="mb-5">
        <Bullet>
          Giao tận nơi qua đối tác GHN (Giao Hàng Nhanh) hoặc nhận tại cửa hàng
          theo lịch hẹn
        </Bullet>
        <Bullet>
          Đơn Gọng + Tròng (lắp kính) bắt buộc nhận tại cửa hàng để điều chỉnh
        </Bullet>
        <Bullet>Mã vận đơn GHN được cập nhật trong chi tiết đơn hàng</Bullet>
        <Bullet>
          Vui lòng mang CMND/CCCD khi đến nhận đơn hàng tại cửa hàng
        </Bullet>
      </View>

      <SectionTitle>5. Sở hữu trí tuệ</SectionTitle>
      <Text className="text-sm text-textGray leading-6 mb-5">
        Toàn bộ nội dung, hình ảnh, thương hiệu và tài sản trí tuệ trên ứng dụng
        thuộc quyền sở hữu của MO Eyewear và được bảo vệ theo pháp luật.
      </Text>

      <SectionTitle>6. Thay đổi điều khoản</SectionTitle>
      <Text className="text-sm text-textGray leading-6 mb-5">
        Chúng tôi có quyền cập nhật điều khoản bất cứ lúc nào. Thay đổi sẽ có
        hiệu lực ngay sau khi đăng tải trên ứng dụng.
      </Text>
    </View>
  );

  const renderPrivacy = () => (
    <View className="px-5 py-5">
      <Text className="text-xl font-bold text-text mb-1">
        Chính sách bảo mật
      </Text>
      <Text className="text-xs text-textGray mb-5">
        Chúng tôi cam kết bảo vệ quyền riêng tư của bạn
      </Text>

      <SectionTitle>1. Thông tin chúng tôi thu thập</SectionTitle>
      <View className="mb-5">
        <Bullet>
          <Text className="font-semibold">Thông tin cá nhân:</Text> Họ tên,
          email, số điện thoại, địa chỉ giao hàng
        </Bullet>
        <Bullet>
          <Text className="font-semibold">Thông tin đơn hàng:</Text> Lịch sử mua
          hàng, đổi/trả, bảo hành
        </Bullet>
        <Bullet>
          <Text className="font-semibold">Thông tin y tế:</Text> Dữ liệu toa
          kính (SPH, CYL, AXIS, PD) chỉ khi đặt đơn thuốc
        </Bullet>
        <Bullet>
          <Text className="font-semibold">Thông tin thanh toán:</Text> Lịch sử
          giao dịch (không lưu số thẻ hay mật khẩu VNPay)
        </Bullet>
        <Bullet>
          <Text className="font-semibold">Thông tin thiết bị:</Text> Loại thiết
          bị, hệ điều hành, token thông báo đẩy
        </Bullet>
      </View>

      <SectionTitle>2. Mục đích sử dụng</SectionTitle>
      <View className="mb-5">
        <Bullet>Xử lý đơn hàng và sắp xếp giao hàng</Bullet>
        <Bullet>Gửi thông báo đẩy về trạng thái đơn hàng và khuyến mãi</Bullet>
        <Bullet>Tính toán hạng thành viên và quyền lợi tích lũy</Bullet>
        <Bullet>Lưu trữ toa kính cho các lần đặt hàng tiếp theo</Bullet>
        <Bullet>Phân tích và cải thiện trải nghiệm người dùng</Bullet>
      </View>

      <SectionTitle>3. Chia sẻ thông tin với bên thứ ba</SectionTitle>
      <View className="mb-5">
        <InfoBox color="#F59E0B" icon="warning-outline">
          <Text className="text-xs text-amber-800 leading-5">
            Chúng tôi <Text className="font-bold">không bán</Text> thông tin cá
            nhân của bạn. Thông tin chỉ được chia sẻ với:
          </Text>
        </InfoBox>
        <Bullet>
          <Text className="font-semibold">GHN (Giao Hàng Nhanh):</Text> Họ tên,
          số điện thoại, địa chỉ giao hàng để thực hiện vận chuyển
        </Bullet>
        <Bullet>
          <Text className="font-semibold">VNPay:</Text> Thông tin giao dịch để
          xử lý thanh toán và hoàn tiền
        </Bullet>
        <Bullet>
          Cơ quan pháp luật khi có yêu cầu hợp lệ theo quy định pháp luật Việt
          Nam
        </Bullet>
      </View>

      <SectionTitle>4. Bảo vệ dữ liệu</SectionTitle>
      <View className="mb-5">
        <Bullet>Dữ liệu truyền tải được mã hóa HTTPS/SSL</Bullet>
        <Bullet>Mật khẩu được hash an toàn, không lưu dạng plaintext</Bullet>
        <Bullet>
          Dữ liệu toa kính được lưu riêng biệt và bảo vệ nghiêm ngặt
        </Bullet>
        <Bullet>Giới hạn quyền truy cập nội bộ theo vai trò</Bullet>
      </View>

      <SectionTitle>5. Quyền của bạn</SectionTitle>
      <View className="mb-5">
        <Bullet>Chỉnh sửa thông tin cá nhân trong phần Hồ sơ</Bullet>
        <Bullet>Tắt thông báo đẩy trong phần Cài đặt → Thông báo</Bullet>
        <Bullet>
          Yêu cầu xóa tài khoản và dữ liệu liên quan bằng cách liên hệ trực tiếp
          với chúng tôi
        </Bullet>
      </View>
    </View>
  );

  const renderMembership = () => (
    <View className="px-5 py-5">
      <Text className="text-xl font-bold text-text mb-1">
        Chương trình thành viên
      </Text>
      <Text className="text-xs text-textGray mb-5">
        Tích lũy chi tiêu để nâng hạng và nhận nhiều ưu đãi hơn
      </Text>

      {/* Tiers */}
      <SectionTitle>1. Các hạng thành viên</SectionTitle>
      <View className="mb-5 gap-3">
        {[
          {
            name: "Thành viên",
            color: "#2E86AB",
            icon: "person-circle-outline",
            desc: "Mặc định khi tạo tài khoản. Không yêu cầu chi tiêu tối thiểu.",
          },
          {
            name: "Bronze",
            color: "#92400E",
            icon: "star",
            desc: "Dành cho khách hàng bắt đầu tích lũy chi tiêu. Hưởng thêm ưu đãi so với mặc định.",
          },
          {
            name: "Silver",
            color: "#6B7280",
            icon: "medal-outline",
            desc: "Hạng trung. Thời hạn đổi/trả dài hơn, chiết khấu cao hơn Bronze.",
          },
          {
            name: "Gold",
            color: "#F59E0B",
            icon: "medal",
            desc: "Hạng cao nhất. Thời hạn bảo hành dài nhất, chiết khấu tốt nhất.",
          },
        ].map((tier) => (
          <View
            key={tier.name}
            className="rounded-xl p-4 flex-row items-start border"
            style={{
              backgroundColor: tier.color + "12",
              borderColor: tier.color + "40",
            }}
          >
            <Ionicons name={tier.icon} size={22} color={tier.color} />
            <View className="flex-1 ml-3">
              <Text
                className="text-sm font-bold mb-1"
                style={{ color: tier.color }}
              >
                Hạng {tier.name}
              </Text>
              <Text className="text-xs text-textGray leading-5">
                {tier.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quyền lợi */}
      <SectionTitle>2. Quyền lợi theo hạng</SectionTitle>
      <View className="mb-5">
        <View className="bg-white rounded-xl overflow-hidden border border-border">
          <View
            className="flex-row px-4 py-2"
            style={{ backgroundColor: "#2E86AB" }}
          >
            <Text className="text-white text-xs font-bold flex-1">
              Quyền lợi
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 44 }}
            >
              Thành viên
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 44 }}
            >
              Bronze
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 44 }}
            >
              Silver
            </Text>
            <Text
              className="text-white text-xs font-bold text-center"
              style={{ width: 44 }}
            >
              Gold
            </Text>
          </View>
          {[
            { label: "Chiết khấu đơn hàng", values: ["0%", "↑", "↑↑", "↑↑↑"] },
            { label: "Hạn trả hàng", values: ["7 ngày", "↑", "↑↑", "↑↑↑"] },
            { label: "Hạn đổi hàng", values: ["15 ngày", "↑", "↑↑", "↑↑↑"] },
            { label: "Hạn bảo hành", values: ["15 ngày", "↑", "↑↑", "↑↑↑"] },
          ].map((row, i) => (
            <View
              key={i}
              className="flex-row items-center px-4 py-3 border-t border-border"
            >
              <Text className="text-xs text-text flex-1">{row.label}</Text>
              {row.values.map((v, j) => (
                <Text
                  key={j}
                  className="text-xs text-textGray text-center"
                  style={{ width: 44 }}
                >
                  {v}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text className="text-xs text-textGray mt-2 text-center">
          ↑ = Tốt hơn hạng trước. Giá trị cụ thể hiển thị trong màn hình Hội
          viên.
        </Text>
      </View>

      {/* Nâng hạng */}
      <SectionTitle>3. Cách tính hạng</SectionTitle>
      <View className="mb-5">
        <Bullet>
          Hạng được đánh giá lại định kỳ mỗi kỳ theo tổng giá trị đơn hàng hoàn
          thành
        </Bullet>
        <Bullet>
          Chỉ đơn hàng ở trạng thái{" "}
          <Text className="font-semibold">Hoàn thành</Text> mới được tính vào
          tổng chi tiêu
        </Bullet>
        <Bullet>
          Đơn hàng bị hủy hoặc hoàn trả sẽ bị trừ khỏi tổng chi tiêu
        </Bullet>
        <Bullet>
          Nếu chi tiêu giảm xuống dưới ngưỡng, hạng có thể bị giảm vào kỳ sau
        </Bullet>
      </View>

      {/* Xem chi tiết */}
      <InfoBox color="#2E86AB" icon="medal-outline">
        <Text className="text-xs text-blue-800 leading-5">
          Xem hạng hiện tại, tiến trình và quyền lợi cụ thể tại{" "}
          <Text className="font-bold">Hồ sơ → Hội viên</Text>.
        </Text>
      </InfoBox>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "return":
        return renderReturn();
      case "terms":
        return renderTerms();
      case "privacy":
        return renderPrivacy();
      case "membership":
        return renderMembership();
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">
            Điều khoản & Chính sách
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white flex-row border-b border-border">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === tab.key ? "border-primary" : "border-transparent"
            }`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? "#2E86AB" : "#999999"}
            />
            <Text
              className={`text-xs font-semibold mt-1 ${
                activeTab === tab.key ? "text-primary" : "text-textGray"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* Last Updated */}
      <View className="bg-background px-5 py-3 border-t border-border">
        <Text className="text-xs text-textGray text-center">
          Cập nhật lần cuối: 02/04/2026
        </Text>
      </View>
    </View>
  );
}
