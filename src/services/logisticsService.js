/**
 * Logistics service - địa chỉ tỉnh/huyện/xã + tính phí ship GHN
 *
 * Dùng GHN Master Data API để lấy đúng ProvinceID / DistrictID / WardCode
 * mà backend cần khi tạo đơn HOME_DELIVERY.
 */

const GHN_BASE = "https://online-gateway.ghn.vn/shiip/public-api";
const GHN_API = `${GHN_BASE}/master-data`;
const GHN_TOKEN = process.env.EXPO_PUBLIC_GHN_TOKEN;
const GHN_SHOP_ID = 6357420;

const getHeaders = (includeShopId = false) => ({
  "Content-Type": "application/json",
  Token: GHN_TOKEN,
  ...(includeShopId ? { ShopId: String(GHN_SHOP_ID) } : {}),
});

/**
 * Get list of provinces/cities from GHN
 * Returns items with shape: { ProvinceID, ProvinceName, ... }
 */
export const getProvinces = async () => {
  try {
    const response = await fetch(`${GHN_API}/province`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return { success: true, data: json.data || [] };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Không thể tải danh sách tỉnh/thành",
      data: [],
    };
  }
};

/**
 * Get list of districts by GHN ProvinceID
 * @param {number} provinceId - GHN ProvinceID
 * Returns items with shape: { DistrictID, DistrictName, ... }
 */
export const getDistricts = async (provinceId) => {
  try {
    const response = await fetch(
      `${GHN_API}/district?province_id=${provinceId}`,
      { headers: getHeaders() },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return { success: true, data: json.data || [] };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Không thể tải danh sách quận/huyện",
      data: [],
    };
  }
};

/**
 * Get list of wards by GHN DistrictID
 * @param {number} districtId - GHN DistrictID
 * Returns items with shape: { WardCode, WardName, ... }
 */
export const getWards = async (districtId) => {
  try {
    const response = await fetch(`${GHN_API}/ward?district_id=${districtId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return { success: true, data: json.data || [] };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Không thể tải danh sách phường/xã",
      data: [],
    };
  }
};

/**
 * Calculate GHN shipping fee for a given destination
 * @param {number} toDistrictId  - GHN DistrictID of destination
 * @param {string} toWardCode    - GHN WardCode of destination
 * @param {number} [weight=500]  - package weight in grams
 * @returns {Promise<{ success: boolean, fee?: number, message?: string }>}
 */
export const calculateShippingFee = async (
  toDistrictId,
  toWardCode,
  weight = 500,
) => {
  try {
    const response = await fetch(`${GHN_BASE}/v2/shipping-order/fee`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        service_type_id: 2, // standard service
        to_district_id: Number(toDistrictId),
        to_ward_code: String(toWardCode),
        weight,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (json.code !== 200) throw new Error(json.message || "GHN error");
    return { success: true, fee: json.data?.total ?? 0 };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Không thể tính phí vận chuyển",
    };
  }
};
