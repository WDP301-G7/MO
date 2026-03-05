import React, { createContext, useState, useContext, useCallback } from "react";
import {
  getMyReturns,
  getReturnDetail,
  createReturnRequest,
  cancelReturnRequest,
  uploadReturnImages,
  deleteReturnImage,
} from "../services/returnService";

// Create Returns Context
export const ReturnsContext = createContext();

// Custom hook to use Returns Context
export const useReturns = () => {
  const context = useContext(ReturnsContext);
  if (!context) {
    throw new Error("useReturns must be used within ReturnsProvider");
  }
  return context;
};

// Returns Provider Component
export function ReturnsProvider({ children }) {
  const [returns, setReturns] = useState([]);
  const [currentReturn, setCurrentReturn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch customer's returns
  const fetchMyReturns = useCallback(
    async (
      page = 1,
      limit = 10,
      status = null,
      type = null,
      refresh = false,
    ) => {
      try {
        setLoading(true);
        setError(null);

        const result = await getMyReturns(page, limit, status, type);

        if (result.success) {
          if (refresh || page === 1) {
            setReturns(result.data);
          } else {
            // Append for pagination/load more
            setReturns((prev) => [...prev, ...result.data]);
          }

          if (result.pagination) {
            setPagination({
              page: result.pagination.page || page,
              limit: result.pagination.limit || limit,
              total: result.pagination.total || result.data.length,
              totalPages: result.pagination.totalPages || 1,
            });
          }

          return { success: true, data: result.data };
        } else {
          setError(result.message);
          return { success: false, message: result.message };
        }
      } catch (err) {
        const errorMessage = err.message || "Không thể tải danh sách đổi/trả";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch return detail by ID
  const fetchReturnDetail = useCallback(async (returnId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getReturnDetail(returnId);

      if (result.success) {
        setCurrentReturn(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || "Không thể tải thông tin đổi/trả";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new return request
  const createReturn = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createReturnRequest(params);

      if (result.success) {
        // Add new return to the list
        setReturns((prev) => [result.data, ...prev]);
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || "Không thể tạo yêu cầu đổi/trả";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel return request
  const cancelReturn = useCallback(
    async (returnId) => {
      try {
        setLoading(true);
        setError(null);

        const result = await cancelReturnRequest(returnId);

        if (result.success) {
          // Update return status in the list
          setReturns((prev) =>
            prev.map((item) =>
              item.id === returnId ? { ...item, status: "CANCELLED" } : item,
            ),
          );

          // Update current return if it's the same one
          if (currentReturn?.id === returnId) {
            setCurrentReturn((prev) => ({ ...prev, status: "CANCELLED" }));
          }

          return { success: true, data: result.data, message: result.message };
        } else {
          setError(result.message);
          return { success: false, message: result.message };
        }
      } catch (err) {
        const errorMessage = err.message || "Không thể hủy yêu cầu";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentReturn],
  );

  // Upload additional images
  const uploadImages = useCallback(
    async (returnId, images) => {
      try {
        setLoading(true);
        setError(null);

        const result = await uploadReturnImages(returnId, images);

        if (result.success) {
          // Refresh return detail to get updated images
          await fetchReturnDetail(returnId);
          return { success: true, data: result.data, message: result.message };
        } else {
          setError(result.message);
          return { success: false, message: result.message };
        }
      } catch (err) {
        const errorMessage = err.message || "Không thể upload ảnh";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [fetchReturnDetail],
  );

  // Delete image
  const deleteImage = useCallback(
    async (returnId, imageId) => {
      try {
        setLoading(true);
        setError(null);

        const result = await deleteReturnImage(returnId, imageId);

        if (result.success) {
          // Update current return images
          if (currentReturn?.id === returnId) {
            setCurrentReturn((prev) => ({
              ...prev,
              images: prev.images.filter((img) => img.id !== imageId),
            }));
          }

          return { success: true, message: result.message };
        } else {
          setError(result.message);
          return { success: false, message: result.message };
        }
      } catch (err) {
        const errorMessage = err.message || "Không thể xóa ảnh";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentReturn],
  );

  // Refresh returns list
  const refreshReturns = useCallback(async () => {
    return await fetchMyReturns(1, pagination.limit, null, null, true);
  }, [fetchMyReturns, pagination.limit]);

  // Load more returns (pagination)
  const loadMoreReturns = useCallback(async () => {
    if (pagination.page < pagination.totalPages && !loading) {
      return await fetchMyReturns(pagination.page + 1, pagination.limit);
    }
    return { success: false, message: "Không còn dữ liệu" };
  }, [fetchMyReturns, pagination, loading]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear current return
  const clearCurrentReturn = useCallback(() => {
    setCurrentReturn(null);
  }, []);

  // Get return by ID from local state
  const getReturnById = useCallback(
    (returnId) => {
      return returns.find((item) => item.id === returnId) || null;
    },
    [returns],
  );

  // Get returns count by status
  const getReturnsCountByStatus = useCallback(
    (status) => {
      return returns.filter((item) => item.status === status).length;
    },
    [returns],
  );

  const value = {
    // State
    returns,
    currentReturn,
    loading,
    error,
    pagination,

    // Actions
    fetchMyReturns,
    fetchReturnDetail,
    createReturn,
    cancelReturn,
    uploadImages,
    deleteImage,
    refreshReturns,
    loadMoreReturns,
    clearError,
    clearCurrentReturn,

    // Helpers
    getReturnById,
    getReturnsCountByStatus,
  };

  return (
    <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>
  );
}
