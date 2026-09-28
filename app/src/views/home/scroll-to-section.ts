/** 平滑滚到首页某个 section，并同步导航栏高亮 */
export const scrollToSection = (id: string): void => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    
    // 更新导航栏上的高亮激活状态
    const links = document.querySelectorAll(".nav-link");
    links.forEach(link => link.classList.remove("nav-link-active"));
    
    const activeLink = Array.from(links).find(link => 
      link.querySelector(".nav-link-text")?.textContent === (id === "hero" ? "概览" : id === "modules" ? "模块" : "关于")
    );
    if (activeLink) {
      activeLink.classList.add("nav-link-active");
    }
  }
};
