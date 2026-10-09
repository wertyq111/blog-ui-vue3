/**
 * PDF 图片提取（纯浏览器本地解析，文件不上传）
 *
 * @description
 * 用 pdf.js 按需读取本地文件：只取解析要用到的字节段，几百 MB 的 PDF 也不会整个读进内存。
 * 逐页遍历绘制指令，取出页面实际画出来的图片对象（含嵌套表单里的），转成画布后交给调用方编码。
 * 拿到的是解码后的像素：被路径裁剪的图片会得到未裁剪的原图，带软遮罩的图片会带上透明通道。
 */
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** 每次向本地文件取数的块大小 */
const RANGE_CHUNK_SIZE = 1024 * 1024;
/** 缩略图最长边 */
const THUMBNAIL_MAX_SIDE = 360;
/** JPG 导出质量 */
const JPEG_EXPORT_QUALITY = 0.95;

const IMAGE_OPS = new Set<number>([
  pdfjs.OPS.paintImageXObject,
  pdfjs.OPS.paintImageXObjectRepeat,
  pdfjs.OPS.paintInlineImageXObject,
]);

/** pdf.js 交出来的图片对象：要么是位图，要么是按 kind 排布的原始像素 */
interface PdfImageSource {
  width: number;
  height: number;
  bitmap?: ImageBitmap;
  data?: Uint8Array | Uint8ClampedArray;
  kind?: number;
}

/** 从某一页取出的一张图片 */
export interface PdfPageImage {
  /** 尺寸 + 像素内容指纹，用于跨页去重 */
  fingerprint: string;
  width: number;
  height: number;
  /** 是否含透明像素 */
  hasAlpha: boolean;
  canvas: HTMLCanvasElement;
}

export type PdfDocument = PDFDocumentProxy;

/**
 * 文档 → 读文件失败信号。
 * pdf.js 拿不到数据时只会一直等（销毁任务也不会让等待中的调用结束），
 * 所以每一步等待都要和这个信号赛跑，文件读不出来时才能立刻报错。
 */
const readFailures = new WeakMap<PdfDocument, Promise<never>>();

/** 把本地 File 包成 pdf.js 的按需取数通道 */
class LocalFileRangeTransport extends pdfjs.PDFDataRangeTransport {
  private readonly file: File;
  private readonly onReadError: () => void;

  constructor(file: File, onReadError: () => void) {
    super(file.size, null);
    this.file = file;
    this.onReadError = onReadError;
  }

  requestDataRange(begin: number, end: number): void {
    this.file
      .slice(begin, end)
      .arrayBuffer()
      .then((buffer) => this.onDataRange(begin, new Uint8Array(buffer)))
      .catch(this.onReadError);
  }
}

/**
 * 打开本地 PDF（只读文件结构，不读全文件）
 *
 * @param file 用户选择的 PDF 文件
 */
export async function openLocalPdf(file: File): Promise<PdfDocument> {
  let reportReadFailure!: () => void;
  const readFailure = new Promise<never>((_, reject) => {
    reportReadFailure = () =>
      reject(new Error("PDF 文件读取失败，文件可能已被移动或修改，请重新选择"));
  });
  // 没有调用在等待时，失败信号不应变成未处理的 rejection
  readFailure.catch(() => {});

  const loadingTask = pdfjs.getDocument({
    range: new LocalFileRangeTransport(file, reportReadFailure),
    disableAutoFetch: true,
    disableStream: true,
    rangeChunkSize: RANGE_CHUNK_SIZE,
  });

  try {
    const doc = await Promise.race([loadingTask.promise, readFailure]);
    readFailures.set(doc, readFailure);
    return doc;
  } catch (error) {
    loadingTask.destroy();
    throw error;
  }
}

/**
 * 关闭 PDF 并释放 worker
 *
 * @param doc openLocalPdf 返回的文档
 */
export function closePdf(doc: PdfDocument): Promise<void> {
  return doc.loadingTask.destroy();
}

/**
 * 解析页码范围，如 "3,5-8"；留空表示全部页
 *
 * @param input 用户输入
 * @param total 文档总页数
 * @returns 升序去重后的页码
 */
export function parsePageRange(input: string, total: number): number[] {
  const raw = input.trim().replace(/\s*[-~]\s*/g, "-");
  if (!raw) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>();
  for (const part of raw.split(/[,，、\s]+/).filter(Boolean)) {
    const matched = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!matched) {
      throw new Error(`页码“${part}”格式不正确，示例：3,5-8`);
    }
    const start = Number(matched[1]);
    const end = Number(matched[2] ?? matched[1]);
    if (start > end) {
      throw new Error(`页码“${part}”的起始页不能大于结束页`);
    }
    if (start < 1 || end > total) {
      throw new Error(`页码“${part}”超出范围，文档共 ${total} 页`);
    }
    for (let page = start; page <= end; page++) pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
}

/**
 * 逐张取出某一页画出来的图片；同一页内重复使用的图片只取一次，解码失败的图片产出 null
 *
 * @param doc 已打开的文档
 * @param pageNumber 页码（从 1 开始）
 */
export async function* extractPageImages(
  doc: PdfDocument,
  pageNumber: number
): AsyncGenerator<PdfPageImage | null> {
  const readFailure = readFailures.get(doc)!;
  const guard = <T>(pending: Promise<T>) => Promise.race([pending, readFailure]);

  const page = await guard(doc.getPage(pageNumber));
  try {
    const { fnArray, argsArray } = await guard(page.getOperatorList());
    const visited = new Set<string>();

    for (let i = 0; i < fnArray.length; i++) {
      if (!IMAGE_OPS.has(fnArray[i])) continue;

      const arg = argsArray[i][0];
      let source: PdfImageSource | null;
      if (typeof arg === "string") {
        if (visited.has(arg)) continue;
        visited.add(arg);
        // g_ 前缀是跨页共享的对象，存放在 commonObjs
        const store = arg.startsWith("g_") ? page.commonObjs : page.objs;
        source = await guard(
          new Promise<PdfImageSource | null>((resolve) => store.get(arg, resolve))
        );
      } else {
        source = arg;
      }

      // pdf.js 解不出来的图片对象是 null；转画布失败（如尺寸超出画布上限）同样记为失败，不中断整页
      let image: PdfPageImage | null = null;
      if (source) {
        try {
          image = toPageImage(source);
        } catch (error) {
          console.warn(`第 ${pageNumber} 页有图片无法转换:`, error);
        }
      }
      yield image;
    }
  } finally {
    page.cleanup();
  }
}

/**
 * 画布编码为图片文件
 *
 * @param canvas 画布
 * @param type 输出类型
 * @param quality JPG 质量（0-1）
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("图片编码失败"))),
      type,
      quality
    );
  });
}

/**
 * 生成缩略图；原图本身不超过缩略图尺寸时返回 null，直接用原图即可
 *
 * @param image 页面图片
 */
export async function createThumbnail(image: PdfPageImage): Promise<Blob | null> {
  const scale = THUMBNAIL_MAX_SIDE / Math.max(image.width, image.height);
  if (scale >= 1) return null;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d")!;
  context.imageSmoothingQuality = "high";
  context.drawImage(image.canvas, 0, 0, canvas.width, canvas.height);
  return image.hasAlpha
    ? canvasToBlob(canvas, "image/png")
    : canvasToBlob(canvas, "image/jpeg", 0.85);
}

/**
 * 把无透明通道的 PNG 转成高质量 JPG
 *
 * @param png PNG 文件
 */
export async function convertPngToJpeg(png: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(png);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    return await canvasToBlob(canvas, "image/jpeg", JPEG_EXPORT_QUALITY);
  } finally {
    bitmap.close();
  }
}

function toPageImage(source: PdfImageSource): PdfPageImage {
  const { width, height } = source;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;

  let pixels: Uint8ClampedArray;
  if (source.bitmap) {
    context.drawImage(source.bitmap, 0, 0);
    pixels = context.getImageData(0, 0, width, height).data;
  } else {
    const imageData = context.createImageData(width, height);
    writeRgba(source, imageData.data);
    context.putImageData(imageData, 0, 0);
    pixels = imageData.data;
  }

  const { hash, hasAlpha } = scanPixels(pixels);
  return { fingerprint: `${width}x${height}:${hash}`, width, height, hasAlpha, canvas };
}

/** 把 pdf.js 的原始像素（1 位灰度 / RGB / RGBA）铺成 RGBA */
function writeRgba(source: PdfImageSource, target: Uint8ClampedArray): void {
  const { width, height, kind } = source;
  const data = source.data!;

  if (kind === pdfjs.ImageKind.RGBA_32BPP) {
    target.set(data);
    return;
  }

  if (kind === pdfjs.ImageKind.RGB_24BPP) {
    for (let from = 0, to = 0; to < target.length; from += 3, to += 4) {
      target[to] = data[from];
      target[to + 1] = data[from + 1];
      target[to + 2] = data[from + 2];
      target[to + 3] = 255;
    }
    return;
  }

  if (kind === pdfjs.ImageKind.GRAYSCALE_1BPP) {
    // 每行按字节对齐，位为 1 表示白
    const rowBytes = (width + 7) >> 3;
    for (let y = 0, to = 0; y < height; y++) {
      for (let x = 0; x < width; x++, to += 4) {
        const value = data[y * rowBytes + (x >> 3)] & (0x80 >> (x & 7)) ? 255 : 0;
        target[to] = target[to + 1] = target[to + 2] = value;
        target[to + 3] = 255;
      }
    }
    return;
  }

  throw new Error(`不支持的图片像素格式：${kind}`);
}

/**
 * 一趟扫描同时算出像素指纹和是否含透明像素。
 * 页面跑在 http 下拿不到 crypto.subtle，所以用两路 32 位滚动哈希拼成 64 位指纹。
 */
function scanPixels(pixels: Uint8ClampedArray): { hash: string; hasAlpha: boolean } {
  const words = new Uint32Array(pixels.buffer, pixels.byteOffset, pixels.byteLength >>> 2);
  let hashA = 0x811c9dc5;
  let hashB = 0x9e3779b9;
  // 小端序下每个 32 位字的最高字节就是 alpha
  let alphaAnd = 0xff000000;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    hashA = Math.imul(hashA ^ word, 0x01000193);
    hashB = Math.imul((hashB ^ word) + i, 0xcc9e2d51);
    hashB = (hashB << 13) | (hashB >>> 19);
    alphaAnd &= word;
  }

  const toHex = (value: number) => (value >>> 0).toString(16).padStart(8, "0");
  return { hash: toHex(hashA) + toHex(hashB), hasAlpha: alphaAnd >>> 24 !== 0xff };
}
