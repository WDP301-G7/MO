import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * GET /api/reviews/eligible
 * Lấy danh sách các OrderItems đủ điều kiện review
 * (30 ngày sau Order COMPLETED, chưa review, chỉ FRAME & LENS)
 */
export const getEligibleReviews = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.REVIEWS.ELIGIBLE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/reviews (multipart/form-data)
 * Tạo review mới
 * @param {Object} reviewData - { orderItemId, rating, comment }
 * @param {Array} images - Array of { uri, type, name }
 */
export const createReview = async (reviewData, images = []) => {
  try {
    // If there are no images, we can send as regular JSON
    if (!images || images.length === 0) {
      const response = await api.post(
        API_ENDPOINTS.REVIEWS.CREATE,
        {
          orderItemId: reviewData.orderItemId,
          rating: Number(reviewData.rating),
          ...(reviewData.comment && { comment: reviewData.comment }),
        },
        {
          timeout: 30000,
        },
      );
      return response.data;
    }

    // With images, use multipart/form-data
    // NOTE: FormData always converts values to strings, but backend validation
    // expects rating to be a number type. This is a BACKEND BUG.
    // Backend MUST update validation to accept string and convert to number
    // for multipart/form-data requests.
    const formData = new FormData();

    // Send individual fields
    formData.append("orderItemId", reviewData.orderItemId);
    formData.append("rating", String(reviewData.rating)); // Will be sent as string

    if (reviewData.comment) {
      formData.append("comment", reviewData.comment);
    }

    // Thêm ảnh vào formData (max 3 ảnh)
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        // React Native FormData expects this exact structure
        const fileObject = {
          uri: image.uri,
          name: image.name || `review-${Date.now()}-${index}.jpg`,
          type: image.type || "image/jpeg",
        };

        formData.append("images", fileObject);
      });
    }

    // Don't set Content-Type header - let axios handle it automatically with boundary
    const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE, formData, {
      timeout: 30000, // 30 seconds for image upload
      transformRequest: (data, headers) => {
        // Remove Content-Type to let axios set it with boundary
        delete headers["Content-Type"];
        return data;
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /api/reviews/:id (multipart/form-data)
 * Cập nhật review (trong vòng 7 ngày)
 * @param {string} reviewId
 * @param {Object} reviewData - { rating, comment }
 * @param {Array} newImages - Array of new images to upload
 */
export const updateReview = async (
  reviewId,
  reviewData,
  allImages = [],
  imagesChanged = false,
) => {
  try {
    // If images were not changed, send as regular JSON (backend keeps existing images)
    if (!imagesChanged) {
      const endpoint = API_ENDPOINTS.REVIEWS.UPDATE.replace(":id", reviewId);
      const response = await api.put(
        endpoint,
        {
          rating: Number(reviewData.rating),
          ...(reviewData.comment && { comment: reviewData.comment }),
        },
        {
          timeout: 30000,
        },
      );
      return response.data;
    }

    // Images were changed — always use multipart so backend replaces the image set
    // NOTE: FormData always converts values to strings, but backend validation
    // expects rating to be a number type. This is a BACKEND BUG.
    // Backend MUST update validation to accept string and convert to number.
    const formData = new FormData();

    formData.append("rating", String(reviewData.rating)); // Will be sent as string

    if (reviewData.comment) {
      formData.append("comment", reviewData.comment);
    }

    // Upload all images (re-downloaded existing + new picks)
    if (allImages && allImages.length > 0) {
      allImages.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: image.name || `review-${Date.now()}-${index}.jpg`,
          type: image.type || "image/jpeg",
        });
      });
    }

    const endpoint = API_ENDPOINTS.REVIEWS.UPDATE.replace(":id", reviewId);

    // Don't set Content-Type header - let axios handle it automatically with boundary
    const response = await api.put(endpoint, formData, {
      timeout: 30000, // 30 seconds for image upload
      transformRequest: (data, headers) => {
        // Remove Content-Type to let axios set it with boundary
        delete headers["Content-Type"];
        return data;
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/reviews/my-reviews?page=1&limit=10
 * Lấy lịch sử reviews của customer
 */
export const getMyReviews = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.REVIEWS.MY_REVIEWS}?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/reviews/:id
 * Lấy chi tiết một review
 */
export const getReviewDetail = async (reviewId) => {
  try {
    const endpoint = API_ENDPOINTS.REVIEWS.DETAIL.replace(":id", reviewId);
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if a review is still editable (within 7 days of creation)
 * @param {string} createdAt - ISO date string
 * @returns {boolean}
 */
export const isReviewEditable = (createdAt) => {
  const reviewDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - reviewDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

/**
 * Check if order item is still eligible for review (within 30 days of completion)
 * @param {string} completedAt - ISO date string
 * @returns {boolean}
 */
export const isEligibleForReview = (completedAt) => {
  const completedDate = new Date(completedAt);
  const now = new Date();
  const diffTime = Math.abs(now - completedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
};

/**
 * GET /api/products/:productId/reviews?page=1&limit=10
 * Lấy danh sách reviews của một sản phẩm (public reviews)
 * @param {string} productId - Product UUID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Response with reviews data and pagination
 */
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    const endpoint = API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS.replace(
      ":productId",
      productId,
    );
    const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
