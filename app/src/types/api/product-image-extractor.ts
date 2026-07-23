/** 商品图片提取平台 */
export interface ProductImagePlatform {
  /** 平台唯一标识，由后端适配器注册 */
  code: string;
  /** 平台展示名称 */
  name: string;
  /** 平台支持的商品域名，仅用于界面提示 */
  domains: string[];
}

/** 商品图片提取请求 */
export interface ProductImageExtractRequest {
  platform: string;
  url: string;
}

/** 提取到的单张商品图片 */
export interface ProductImageItem {
  /** 一次提取结果内稳定且唯一的图片标识 */
  id: string;
  /** 当前 SKU/颜色轮播中的一基序号 */
  index: number;
  /** 图片在平台轮播中的用途 */
  role: "poster" | "cover" | "gallery" | string;
  thumbnailUrl: string;
  /** 服务端确认可访问的最高分辨率图片地址 */
  url: string;
  width?: number;
  height?: number;
  mimeType?: string;
  bytes?: number | null;
  fileName?: string;
}

/** 商品 SKU/颜色分组 */
export interface ProductImageVariant {
  id: string;
  skuId?: string;
  skuCode?: string;
  name: string;
  /** 平台无关的规格属性，例如颜色、容量、版本 */
  attributes: Record<string, string>;
  images: ProductImageItem[];
}

/** 商品基础信息 */
export interface ProductImageProduct {
  id?: string;
  title: string;
  sourceUrl: string;
}

/** 标准化商品图片解析结果 */
export interface ProductImageExtraction {
  platform: Pick<ProductImagePlatform, "code" | "name">;
  product: ProductImageProduct;
  variants: ProductImageVariant[];
}

/** 批量下载请求 */
export interface ProductImageDownloadRequest {
  platform: string;
  url: string;
  imageIds: string[];
}
