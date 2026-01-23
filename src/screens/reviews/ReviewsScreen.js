import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewsScreen({ navigation, route }) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [rating, setRating] = useState(5);

  const product = {
    name: "Gọng kính Rayban RB5154",
    avgRating: 4.5,
    totalReviews: 234,
    ratingDistribution: {
      5: 150,
      4: 50,
      3: 20,
      2: 10,
      1: 4,
    },
  };

  const reviews = [
    {
      id: 1,
      userName: "Nguyễn Văn A",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      rating: 5,
      date: "2024-01-15",
      content:
        "Sản phẩm rất tốt, chất lượng cao. Đeo rất thoải mái và phong cách. Nhân viên tư vấn nhiệt tình.",
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop",
      ],
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      userName: "Trần Thị B",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      rating: 4,
      date: "2024-01-10",
      content:
        "Gọng đẹp, chất liệu tốt nhưng hơi nặng một chút. Nhìn chung vẫn hài lòng.",
      images: [],
      helpful: 12,
      verified: true,
    },
    {
      id: 3,
      userName: "Lê Minh C",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      rating: 5,
      date: "2024-01-05",
      content:
        "Rất đáng tiền! Thiết kế sang trọng, đeo vừa vặn. Giao hàng nhanh, đóng gói cẩn thận.",
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      ],
      helpful: 18,
      verified: false,
    },
  ];

  const filterButtons = [
    { key: "all", label: "Tất cả", count: 234 },
    { key: "5", label: "5 ⭐", count: 150 },
    { key: "4", label: "4 ⭐", count: 50 },
    { key: "3", label: "3 ⭐", count: 20 },
    { key: "with-images", label: "Có hình ảnh", count: 89 },
  ];

  const renderRatingBar = (star, count) => {
    const percentage = (count / product.totalReviews) * 100;
    return (
      <TouchableOpacity
        key={star}
        className="flex-row items-center mb-2"
        onPress={() => setSelectedFilter(star.toString())}
      >
        <Text className="text-sm text-text w-8">{star} ⭐</Text>
        <View className="flex-1 h-2 bg-background rounded-full mx-2 overflow-hidden">
          <View
            className="h-full bg-accent rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className="text-sm text-textGray w-8 text-right">{count}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Đánh giá sản phẩm
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowWriteReview(true)}>
            <Ionicons name="create-outline" size={24} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-base font-bold text-text mb-3">
            {product.name}
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="items-center">
              <Text className="text-3xl font-bold text-text">
                {product.avgRating}
              </Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={
                      star <= Math.floor(product.avgRating)
                        ? "star"
                        : "star-outline"
                    }
                    size={16}
                    color="#F18F01"
                  />
                ))}
              </View>
              <Text className="text-xs text-textGray mt-1">
                {product.totalReviews} đánh giá
              </Text>
            </View>
            <View className="flex-1">
              {[5, 4, 3, 2, 1].map((star) =>
                renderRatingBar(star, product.ratingDistribution[star]),
              )}
            </View>
          </View>
        </View>

        {/* Filters */}
        <View className="bg-white px-5 py-4 mb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5"
          >
            {filterButtons.map((btn) => (
              <TouchableOpacity
                key={btn.key}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedFilter === btn.key ? "bg-primary" : "bg-background"
                }`}
                onPress={() => setSelectedFilter(btn.key)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedFilter === btn.key ? "text-white" : "text-text"
                  }`}
                >
                  {btn.label} ({btn.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View className="flex-row items-center justify-between bg-white px-5 py-3 mb-2">
          <Text className="text-sm text-textGray">Sắp xếp theo:</Text>
          <View className="flex-row gap-2">
            {["newest", "helpful", "highest", "lowest"].map((sort) => (
              <TouchableOpacity
                key={sort}
                className={`px-3 py-1 rounded-full ${
                  sortBy === sort ? "bg-primary/10" : ""
                }`}
                onPress={() => setSortBy(sort)}
              >
                <Text
                  className={`text-xs ${
                    sortBy === sort
                      ? "text-primary font-semibold"
                      : "text-textGray"
                  }`}
                >
                  {sort === "newest" && "Mới nhất"}
                  {sort === "helpful" && "Hữu ích"}
                  {sort === "highest" && "Cao nhất"}
                  {sort === "lowest" && "Thấp nhất"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reviews List */}
        <View className="bg-white">
          {reviews.map((review, index) => (
            <View
              key={review.id}
              className={`px-5 py-4 ${
                index < reviews.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <View className="flex-row items-start mb-3">
                <Image
                  source={{ uri: review.avatar }}
                  className="w-10 h-10 rounded-full"
                />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-bold text-text">
                      {review.userName}
                    </Text>
                    {review.verified && (
                      <View className="bg-green-500 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-xs text-white">Đã mua hàng</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center mt-1">
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={14}
                          color="#F18F01"
                        />
                      ))}
                    </View>
                    <Text className="text-xs text-textGray ml-2">
                      {review.date}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-sm text-text leading-5 mb-3">
                {review.content}
              </Text>

              {review.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  {review.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      className="w-20 h-20 rounded-lg mr-2"
                    />
                  ))}
                </ScrollView>
              )}

              <View className="flex-row items-center gap-4">
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons
                    name="thumbs-up-outline"
                    size={16}
                    color="#999999"
                  />
                  <Text className="text-xs text-textGray ml-1">
                    Hữu ích ({review.helpful})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-xs text-primary">Trả lời</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Write Review Button */}
        <TouchableOpacity
          className="bg-primary mx-5 my-6 rounded-xl py-4 items-center"
          onPress={() => setShowWriteReview(true)}
        >
          <Text className="text-white font-bold text-base">Viết đánh giá</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
