import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function SupportScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const faqs = [
    {
      id: 1,
      category: "Đơn hàng",
      question: "Làm thế nào để theo dõi đơn hàng?",
      answer:
        "Bạn có thể theo dõi đơn hàng trong mục 'Đơn hàng của tôi'. Mã vận đơn sẽ được cập nhật khi đơn hàng được giao cho đơn vị vận chuyển.",
    },
    {
      id: 2,
      category: "Đơn hàng",
      question: "Thời gian giao hàng là bao lâu?",
      answer:
        "Thời gian giao hàng từ 2-3 ngày đối với nội thành và 3-5 ngày đối với ngoại thành. Đơn hàng đặt trước có thể mất thêm 5-7 ngày.",
    },
    {
      id: 3,
      category: "Thanh toán",
      question: "Có những phương thức thanh toán nào?",
      answer:
        "Chúng tôi hỗ trợ thanh toán COD, MoMo, ZaloPay, và thẻ tín dụng/ghi nợ. Tất cả các phương thức đều an toàn và bảo mật.",
    },
    {
      id: 4,
      category: "Sản phẩm",
      question: "Sản phẩm có được bảo hành không?",
      answer:
        "Tất cả sản phẩm đều được bảo hành 12 tháng. Bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm bị lỗi.",
    },
    {
      id: 5,
      category: "Sản phẩm",
      question: "Làm sao để đặt kính theo đơn thuốc?",
      answer:
        "Chọn 'Đặt kính theo đơn thuốc' trên trang chủ, tải lên ảnh đơn thuốc hoặc nhập số đo trực tiếp, sau đó chọn gọng và tròng kính.",
    },
    {
      id: 6,
      category: "Tài khoản",
      question: "Làm thế nào để đổi mật khẩu?",
      answer:
        "Vào Tài khoản > Đổi mật khẩu, nhập mật khẩu cũ và mật khẩu mới. Hoặc dùng chức năng 'Quên mật khẩu' khi đăng nhập.",
    },
  ];

  const contacts = [
    {
      id: 1,
      type: "Hotline",
      value: "1900-xxxx",
      icon: "call-outline",
      color: "#10B981",
      action: "call",
    },
    {
      id: 2,
      type: "Email",
      value: "support@eyewear.vn",
      icon: "mail-outline",
      color: "#2E86AB",
      action: "email",
    },
    {
      id: 3,
      type: "Facebook",
      value: "@EyewearVN",
      icon: "logo-facebook",
      color: "#1877F2",
      action: "facebook",
    },
    {
      id: 4,
      type: "Zalo",
      value: "0123456789",
      icon: "chatbubble-ellipses-outline",
      color: "#0068FF",
      action: "zalo",
    },
  ];

  const tabs = [
    { id: "faq", label: "Câu hỏi thường gặp", icon: "help-circle-outline" },
    { id: "chat", label: "Chat trực tuyến", icon: "chatbubbles-outline" },
    { id: "contact", label: "Liên hệ", icon: "call-outline" },
  ];

  const filterFaqs = () => {
    if (!searchQuery) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const renderFaqItem = ({ item }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-start mb-2">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Ionicons name="help-outline" size={18} color="#2E86AB" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-primary font-semibold mb-1">
            {item.category}
          </Text>
          <Text className="text-sm font-bold text-text mb-2">
            {item.question}
          </Text>
          <Text className="text-sm text-textGray leading-5">{item.answer}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Hỗ trợ khách hàng
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`mr-4 pb-3 px-2 flex-row items-center ${
                selectedTab === tab.id ? "border-b-2 border-primary" : ""
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={selectedTab === tab.id ? "#2E86AB" : "#999999"}
              />
              <Text
                className={`text-sm font-semibold ml-1.5 ${
                  selectedTab === tab.id ? "text-primary" : "text-textGray"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {selectedTab === "faq" && (
        <View className="flex-1">
          {/* Search */}
          <View className="px-5 pt-4">
            <View className="bg-white rounded-xl px-4 py-3 flex-row items-center shadow-sm">
              <Ionicons name="search" size={20} color="#999999" />
              <TextInput
                className="flex-1 ml-2 text-sm text-text"
                placeholder="Tìm kiếm câu hỏi..."
                placeholderTextColor="#999999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* FAQ List */}
          <FlatList
            data={filterFaqs()}
            renderItem={renderFaqItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {selectedTab === "chat" && (
        <View className="flex-1 px-5 py-4">
          {/* Chat Header */}
          <View className="bg-primary/10 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                <Ionicons name="headset-outline" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text">
                  Chat với tư vấn viên
                </Text>
                <Text className="text-sm text-textGray">
                  Thời gian phản hồi: 2-5 phút
                </Text>
              </View>
              <View className="w-3 h-3 rounded-full bg-green-500" />
            </View>
          </View>

          {/* Chat Messages */}
          <ScrollView
            className="flex-1 mb-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-start mb-3">
              <View className="bg-white rounded-2xl rounded-tl-none p-3 max-w-[80%] shadow-sm">
                <Text className="text-sm text-text">
                  Xin chào! Tôi có thể giúp gì cho bạn?
                </Text>
                <Text className="text-xs text-textGray mt-1">14:30</Text>
              </View>
            </View>
          </ScrollView>

          {/* Input */}
          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-white rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                className="flex-1 text-sm text-text"
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#999999"
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity>
                <Ionicons name="happy-outline" size={24} color="#999999" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="w-12 h-12 bg-primary rounded-xl items-center justify-center">
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedTab === "contact" && (
        <ScrollView
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Cards */}
          {contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
              onPress={() => alert(`Liên hệ qua ${contact.type}`)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: contact.color + "20" }}
              >
                <Ionicons name={contact.icon} size={24} color={contact.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text">
                  {contact.type}
                </Text>
                <Text className="text-sm text-textGray mt-0.5">
                  {contact.value}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          ))}

          {/* Office Info */}
          <View className="bg-white rounded-2xl p-4 mt-2 shadow-sm">
            <Text className="text-base font-bold text-text mb-3">
              Địa chỉ văn phòng
            </Text>
            <View className="flex-row items-start mb-3">
              <Ionicons name="location-outline" size={20} color="#2E86AB" />
              <Text className="flex-1 text-sm text-textGray ml-2">
                123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="time-outline" size={20} color="#2E86AB" />
              <Text className="flex-1 text-sm text-textGray ml-2">
                Thứ 2 - Thứ 7: 8:00 - 20:00{"\n"}Chủ nhật: 9:00 - 18:00
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
