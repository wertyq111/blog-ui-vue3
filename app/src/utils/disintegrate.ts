interface DisintegrateOptions {
  /** 加在每块碎片上的类名，用来关掉原元素自带的动画、毛玻璃等 */
  shardClass: string;
  cols?: number;
  rows?: number;
  /** 碎片飘散的水平方向：1 向右，-1 向左 */
  direction?: 1 | -1;
}

/**
 * 把元素切成网格碎片并让碎片飘散消失。
 *
 * 碎片是原元素带 clip-path 的克隆，所以文字和图标会跟着一起碎开。
 * 调用后原元素可以立即移除；碎片挂在 host 里，全部飘散后自动清理。
 */
export function disintegrate(
  source: HTMLElement,
  host: HTMLElement,
  { shardClass, cols = 12, rows = 5, direction = 1 }: DisintegrateOptions
): Promise<void> {
  const sourceRect = source.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();

  const layer = document.createElement("div");
  Object.assign(layer.style, {
    position: "absolute",
    left: `${sourceRect.left - hostRect.left}px`,
    top: `${sourceRect.top - hostRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    pointerEvents: "none",
  });

  const animations: Animation[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const shard = source.cloneNode(true) as HTMLElement;
      shard.classList.add(shardClass);
      shard.setAttribute("aria-hidden", "true");
      Object.assign(shard.style, {
        position: "absolute",
        left: "0",
        top: "0",
        right: "auto",
        bottom: "auto",
        margin: "0",
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        boxSizing: "border-box",
        clipPath: `inset(${(row / rows) * 100}% ${100 - ((col + 1) / cols) * 100}% ${
          100 - ((row + 1) / rows) * 100
        }% ${(col / cols) * 100}%)`,
        // 以碎片自身为轴旋转，否则整块克隆会带着碎片画大弧
        transformOrigin: `${((col + 0.5) / cols) * 100}% ${((row + 0.5) / rows) * 100}%`,
      });
      layer.appendChild(shard);

      // 朝飘散方向的一侧先碎，形成被风吹散的先后次序
      const order = col / (cols - 1);
      const lead = direction > 0 ? 1 - order : order;
      const driftX = direction * (40 + Math.random() * 70);
      const driftY = -(20 + Math.random() * 60);
      const rotate = (Math.random() - 0.5) * 90;
      animations.push(
        shard.animate(
          [
            { transform: "none", opacity: 1 },
            { opacity: 1, offset: 0.3 },
            {
              transform: `translate(${driftX}px, ${driftY}px) rotate(${rotate}deg) scale(0.4)`,
              opacity: 0,
            },
          ],
          {
            duration: 560 + Math.random() * 260,
            delay: lead * 320 + Math.random() * 140,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "forwards",
          }
        )
      );
    }
  }

  host.appendChild(layer);
  return Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    layer.remove();
  });
}
