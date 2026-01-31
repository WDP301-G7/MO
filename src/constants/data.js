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
