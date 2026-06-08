export function usePomoNotify() {
  async function requestPermission(): Promise<NotificationPermission> {
    if (typeof Notification === "undefined") return "denied";
    if (Notification.permission === "default") {
      try {
        return await Notification.requestPermission();
      } catch {
        return "denied";
      }
    }
    return Notification.permission;
  }

  // 尽力发系统通知；无权限/不支持时返回 false，由调用方决定页内降级提示
  function notify(title: string, body?: string): boolean {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  return { requestPermission, notify };
}
