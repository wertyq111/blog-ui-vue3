import request from "@/utils/request";
import type {
  ProductImageDownloadRequest,
  ProductImageExtraction,
  ProductImageExtractRequest,
  ProductImagePlatform,
} from "@/types/api/product-image-extractor";

const BASE_URL = "/design/product-image-extractor";

const ProductImageExtractorAPI = {
  /** 获取后端已注册的平台适配器 */
  getPlatforms() {
    return request<any, ProductImagePlatform[]>({
      url: `${BASE_URL}/platforms`,
      method: "get",
    });
  },

  /** 解析商品页并返回平台无关的图片分组 */
  extract(data: ProductImageExtractRequest) {
    return request<any, ProductImageExtraction>({
      url: `${BASE_URL}/extract`,
      method: "post",
      data,
    });
  },

  /** 把选中的原图打包为 ZIP */
  download(data: ProductImageDownloadRequest) {
    return request({
      url: `${BASE_URL}/download`,
      method: "post",
      data,
      responseType: "blob",
    });
  },
};

export default ProductImageExtractorAPI;
