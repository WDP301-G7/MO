import React, { createContext, useState } from "react";

// Context để quản lý số lượng đơn hàng
export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [ordersCount, setOrdersCount] = useState(0);
  return (
    <OrdersContext.Provider value={{ ordersCount, setOrdersCount }}>
      {children}
    </OrdersContext.Provider>
  );
}
