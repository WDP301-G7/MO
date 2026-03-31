/**
 * Logistics service - địa chỉ tỉnh/huyện/xã
 *
 * Dùng GHN Master Data API để lấy đúng ProvinceID / DistrictID / WardCode
 * mà backend cần khi tạo đơn HOME_DELIVERY.
 */

const GHN_API = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = process.env.EXPO_PUBLIC_GHN_TOKEN;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Token: GHN_TOKEN,
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
