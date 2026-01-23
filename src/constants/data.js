export const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Gọng kính Rayban Classic",
    brand: "Ray-Ban",
    price: 2500000,
    originalPrice: 3000000,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
    category: "Gọng kính",
    stock: "Còn hàng",
    rating: 4.5,
    reviews: 120,
    discount: 17,
  },
  {
    id: "2",
    name: "Tròng kính chống ánh sáng xanh",
    brand: "Essilor",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop",
    category: "Tròng kính",
    stock: "Còn hàng",
    rating: 4.8,
    reviews: 89,
    discount: 0,
  },
  {
    id: "3",
    name: "Kính mát Polarized",
    brand: "Oakley",
    price: 3500000,
    originalPrice: 4200000,
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=300&fit=crop",
    category: "Kính mát",
    stock: "Còn hàng",
    rating: 4.7,
    reviews: 156,
    discount: 17,
  },
  {
    id: "4",
    name: "Gọng kính Titanium siêu nhẹ",
    brand: "Lindberg",
    price: 5500000,
    image:
      "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=400&h=300&fit=crop",
    category: "Gọng kính",
    stock: "Đặt trước",
    rating: 4.9,
    reviews: 45,
    discount: 0,
  },
  {
    id: "5",
    name: "Dung dịch rửa kính 200ml",
    brand: "Zeiss",
    price: 150000,
    image:
      "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=300&fit=crop",
    category: "Phụ kiện",
    stock: "Còn hàng",
    rating: 4.3,
    reviews: 234,
    discount: 0,
  },
  {
    id: "6",
    name: "Kính áp tròng hàng ngày",
    brand: "Acuvue",
    price: 350000,
    image:
      "https://images.unsplash.com/photo-1606206873765-2ac6ffb4e6d7?w=400&h=300&fit=crop",
    category: "Kính áp tròng",
    stock: "Còn hàng",
    rating: 4.6,
    reviews: 178,
    discount: 0,
  },
];

export const CATEGORIES = [
  { id: "1", name: "Gọng kính", icon: "glasses" },
  { id: "2", name: "Tròng kính", icon: "ellipse-outline" },
  { id: "3", name: "Kính mát", icon: "sunny" },
  { id: "4", name: "Kính áp tròng", icon: "eye" },
  { id: "5", name: "Phụ kiện", icon: "gift" },
  { id: "6", name: "Dịch vụ", icon: "construct" },
];

export const SAMPLE_ORDERS = [
  {
    id: "ORD001",
    date: "2026-01-15",
    status: "Đang giao",
    total: 2650000,
    items: [
      {
        id: "1",
        name: "Gọng kính Rayban Classic",
        price: 2500000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=80&h=80&fit=crop",
      },
    ],
    trackingNumber: "VN123456789",
  },
  {
    id: "ORD002",
    date: "2026-01-10",
    status: "Đã giao",
    total: 1350000,
    items: [
      {
        id: "2",
        name: "Tròng kính chống ánh sáng xanh",
        price: 1200000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=80&h=80&fit=crop",
      },
    ],
  },
  {
    id: "ORD003",
    date: "2026-01-05",
    status: "Đã hủy",
    total: 3500000,
    items: [
      {
        id: "3",
        name: "Kính mát Polarized",
        price: 3500000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=80&h=80&fit=crop",
      },
    ],
  },
];

export const ADDRESSES = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    isDefault: true,
  },
  {
    id: "2",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    isDefault: false,
  },
];
