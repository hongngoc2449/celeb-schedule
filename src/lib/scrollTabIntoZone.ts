/**
 * Đưa tab đang chọn vào giữa dải tab cuộn ngang.
 * Chỉ đổi scrollLeft của thanh tab, không kéo cả trang.
 * @param {HTMLElement | null} nav Thanh tab có overflow-x.
 * @param {HTMLElement | null} tab Nút tab cần hiện.
 * @returns {void}
 */
export function scrollTabIntoZone(nav: HTMLElement | null, tab: HTMLElement | null): void {
  if (!nav || !tab) return;

  const maxScroll = nav.scrollWidth - nav.clientWidth;
  if (maxScroll <= 1) return;

  const navRect = nav.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const tabCenter = tabRect.left + tabRect.width / 2;
  const navCenter = navRect.left + navRect.width / 2;
  const nextLeft = nav.scrollLeft + (tabCenter - navCenter);

  nav.scrollTo({
    left: Math.min(maxScroll, Math.max(0, nextLeft)),
    behavior: 'smooth',
  });
}
