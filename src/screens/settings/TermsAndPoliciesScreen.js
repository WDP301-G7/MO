import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function TermsAndPoliciesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("terms"); // terms, privacy, return

  const tabs = [
    { key: "terms", label: "Điều khoản", icon: "document-text-outline" },
    { key: "privacy", label: "Bảo mật", icon: "shield-checkmark-outline" },
    { key: "return", label: "Đổi trả", icon: "swap-horizontal-outline" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "terms":
        return (
          <View className="px-5 py-5">
            <Text className="text-xl font-bold text-text mb-4">
              Điều khoản sử dụng
            </Text>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                1. Chấp nhận điều khoản
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Khi sử dụng dịch vụ của EyewearStore, bạn đồng ý tuân thủ các
                điều khoản và điều kiện được nêu dưới đây. Nếu bạn không đồng ý
                với bất kỳ phần nào của các điều khoản này, vui lòng không sử
                dụng dịch vụ của chúng tôi.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                2. Tài khoản người dùng
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`• Bạn chịu trách nhiệm bảo mật thông tin tài khoản
• Cung cấp thông tin chính xác khi đăng ký
• Thông báo ngay nếu phát hiện truy cập trái phép
• Không được chia sẻ tài khoản cho người khác`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                3. Đặt hàng và thanh toán
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Khi đặt hàng, bạn đồng ý thanh toán đầy đủ giá trị đơn hàng theo
                phương thức đã chọn. Chúng tôi có quyền từ chối hoặc hủy đơn
                hàng nếu phát hiện gian lận hoặc hoạt động đáng ngờ.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                4. Sở hữu trí tuệ
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Tất cả nội dung, thương hiệu, logo và tài sản trí tuệ trên nền
                tảng này thuộc sở hữu của EyewearStore và được bảo vệ bởi luật
                sở hữu trí tuệ.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                5. Thay đổi điều khoản
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào.
                Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên ứng
                dụng.
              </Text>
            </View>
          </View>
        );

      case "privacy":
        return (
          <View className="px-5 py-5">
            <Text className="text-xl font-bold text-text mb-4">
              Chính sách bảo mật
            </Text>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                1. Thu thập thông tin
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`Chúng tôi thu thập các thông tin sau:
• Thông tin cá nhân: Họ tên, email, số điện thoại
• Thông tin giao dịch: Lịch sử đơn hàng, thanh toán
• Thông tin thiết bị: IP, loại thiết bị, hệ điều hành
• Cookies và dữ liệu sử dụng`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                2. Sử dụng thông tin
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`Thông tin của bạn được sử dụng để:
• Xử lý và giao hàng đơn hàng
• Cải thiện trải nghiệm người dùng
• Gửi thông báo về đơn hàng và khuyến mãi
• Phân tích và thống kê`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                3. Bảo vệ thông tin
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để
                bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, mất
                mát hoặc tiết lộ.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                4. Chia sẻ thông tin
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn.
                Thông tin chỉ được chia sẻ với đối tác vận chuyển và thanh toán
                để hoàn tất đơn hàng.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                5. Quyền của bạn
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`Bạn có quyền:
• Truy cập và cập nhật thông tin cá nhân
• Yêu cầu xóa tài khoản
• Từ chối nhận email marketing
• Khiếu nại về việc xử lý dữ liệu`}
              </Text>
            </View>
          </View>
        );

      case "return":
        return (
          <View className="px-5 py-5">
            <Text className="text-xl font-bold text-text mb-4">
              Chính sách đổi trả
            </Text>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                1. Điều kiện đổi trả
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`• Sản phẩm còn nguyên tem, nhãn mác, bao bì
• Trong thời gian 7 ngày kể từ ngày nhận hàng
• Có hóa đơn mua hàng hoặc mã đơn hàng
• Sản phẩm không bị hư hỏng do người dùng`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                2. Sản phẩm không áp dụng đổi trả
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`• Sản phẩm khuyến mãi, giảm giá từ 50% trở lên
• Kính áp tròng đã mở hộp
• Sản phẩm đặt theo yêu cầu riêng
• Phụ kiện đã qua sử dụng`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                3. Quy trình đổi trả
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`Bước 1: Tạo yêu cầu đổi trả trong ứng dụng
Bước 2: Chọn lý do và cung cấp hình ảnh
Bước 3: Đóng gói sản phẩm và chờ nhân viên đến lấy
Bước 4: Kiểm tra và hoàn tiền trong 5-7 ngày`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                4. Phí đổi trả
              </Text>
              <Text className="text-sm text-textGray leading-6">
                {`• Miễn phí với sản phẩm lỗi do nhà sản xuất
• Miễn phí nếu giao sai sản phẩm
• Khách hàng chịu phí vận chuyển nếu đổi ý
• Phí vận chuyển: 30.000đ - 50.000đ tùy địa điểm`}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-base font-bold text-text mb-2">
                5. Hoàn tiền
              </Text>
              <Text className="text-sm text-textGray leading-6">
                Tiền sẽ được hoàn về phương thức thanh toán ban đầu trong vòng
                5-7 ngày làm việc sau khi xác nhận đổi trả thành công.
              </Text>
            </View>
          </View>
        );

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
              size={22}
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

        {/* Contact Support */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            className="bg-primary rounded-2xl p-4 flex-row items-center justify-center"
            onPress={() => navigation.navigate("Support")}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2">Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Last Updated */}
      <View className="bg-background px-5 py-3 border-t border-border">
        <Text className="text-xs text-textGray text-center">
          Cập nhật lần cuối: 18/01/2026
        </Text>
      </View>
    </View>
  );
}
