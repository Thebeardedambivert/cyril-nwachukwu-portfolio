// ==========================================================================
// NEWSPAPER BROADSHEET PAGINATION & TACTILE PAGE FLIPPING
// Manages Multi-Edition Newspaper Pagination ("The Daily Telemetry")
// ==========================================================================

import { soundFx } from './hardware.js';

export function initNewspaperPagination() {
  const pages = document.querySelectorAll('.broadsheet-page');
  const tabs = document.querySelectorAll('.newspaper-page-tab');
  const bottomBtns = document.querySelectorAll('.page-num-btn[data-page]');
  const prevBtn = document.getElementById('btn-newspaper-prev');
  const nextBtn = document.getElementById('btn-newspaper-next');
  const bottomPrevBtn = document.getElementById('bottom-btn-prev');
  const bottomNextBtn = document.getElementById('bottom-btn-next');
  const pageNumDisplay = document.getElementById('newspaper-current-page-num');
  const newspaperSection = document.getElementById('newspaper');

  if (!pages.length) return;

  let currentPage = 1;
  const totalPages = pages.length;

  function setPage(pageIndex, shouldScroll = false) {
    if (pageIndex < 1 || pageIndex > totalPages || pageIndex === currentPage && !shouldScroll) {
      if (pageIndex < 1 || pageIndex > totalPages) return;
    }

    currentPage = pageIndex;
    soundFx.playClick('button');

    // Update pages
    pages.forEach((page) => {
      const pNum = parseInt(page.getAttribute('data-page-index'), 10);
      if (pNum === currentPage) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    // Update top tabs
    tabs.forEach((tab) => {
      const pNum = parseInt(tab.getAttribute('data-page'), 10);
      if (pNum === currentPage) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Update bottom numeric buttons
    bottomBtns.forEach((btn) => {
      const pNum = parseInt(btn.getAttribute('data-page'), 10);
      if (pNum === currentPage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update header dateline counter
    if (pageNumDisplay) {
      pageNumDisplay.textContent = `0${currentPage}`;
    }

    // Update Prev / Next disabled states
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    if (prevBtn) prevBtn.disabled = isFirst;
    if (nextBtn) nextBtn.disabled = isLast;
    if (bottomPrevBtn) bottomPrevBtn.disabled = isFirst;
    if (bottomNextBtn) bottomNextBtn.disabled = isLast;

    if (shouldScroll && newspaperSection) {
      newspaperSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Top Tabs click
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const p = parseInt(tab.getAttribute('data-page'), 10);
      setPage(p, false);
    });
  });

  // Bottom numeric buttons click
  bottomBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.getAttribute('data-page'), 10);
      setPage(p, true);
    });
  });

  // Prev / Next controls
  const handlePrev = (scroll) => {
    if (currentPage > 1) setPage(currentPage - 1, scroll);
  };
  const handleNext = (scroll) => {
    if (currentPage < totalPages) setPage(currentPage + 1, scroll);
  };

  if (prevBtn) prevBtn.addEventListener('click', () => handlePrev(false));
  if (nextBtn) nextBtn.addEventListener('click', () => handleNext(false));
  if (bottomPrevBtn) bottomPrevBtn.addEventListener('click', () => handlePrev(true));
  if (bottomNextBtn) bottomNextBtn.addEventListener('click', () => handleNext(true));

  // Initialize first page state
  setPage(1, false);
}
