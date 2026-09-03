// ==========================================================================
// NEWSPAPER BROADSHEET PAGINATION: PURE TYPOGRAPHY (GEIST MONO)
// Manages Multi-Edition Page Switching without Bulky Button Boxes
// ==========================================================================

import { soundFx } from './hardware.js';

export function initNewspaperPagination() {
  const pages = document.querySelectorAll('.broadsheet-page');
  const pageLinks = document.querySelectorAll('.page-text-num[data-page]');
  const newspaperSection = document.getElementById('newspaper');

  if (!pages.length) return;

  let currentPage = 1;
  const totalPages = pages.length;

  function setPage(pageIndex, shouldScroll = false) {
    if (pageIndex < 1 || pageIndex > totalPages) return;

    currentPage = pageIndex;
    soundFx.playClick('button');

    // Update broadsheet pages
    pages.forEach((page) => {
      const pNum = parseInt(page.getAttribute('data-page-index'), 10);
      if (pNum === currentPage) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    // Update all typographic page numbers (both top dateline and bottom)
    pageLinks.forEach((link) => {
      const pNum = parseInt(link.getAttribute('data-page'), 10);
      if (pNum === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    if (shouldScroll && newspaperSection) {
      newspaperSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Bind click on all typographic page numbers
  pageLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetPage = parseInt(link.getAttribute('data-page'), 10);
      const isFromBottom = link.closest('.newspaper-bottom-pagination');
      setPage(targetPage, Boolean(isFromBottom));
    });
  });

  // Initialize page 1
  setPage(1, false);
}
