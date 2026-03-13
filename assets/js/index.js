function openNavleft() {
  document.body.classList.add('sidebar-open', 'left-open');
  document.body.classList.remove('right-open');
}

function openNavright() {
  document.body.classList.add('sidebar-open', 'right-open');
  document.body.classList.remove('left-open');
}

function closeAllSidebars() {
  document.body.classList.remove('sidebar-open', 'left-open', 'right-open');
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAllSidebars();
  }
});

function setupPageTransitions() {
  requestAnimationFrame(() => {
    document.body.classList.add('page-ready');
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    const target = link.getAttribute('target');
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isInternalPage = href && /^(index|personal)\.html$/.test(href);

    if (!isInternalPage || target === '_blank' || isModifiedClick) {
      return;
    }

    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = href;
    }, 220);
  });
}

setupPageTransitions();

document.addEventListener('click', (event) => {
  const isNavLink = event.target.closest('#leftside a, #rightside a');
  if (isNavLink) {
    closeAllSidebars();
  }
});

function setupPageSearch() {
  const form = document.querySelector('.site-search');
  const input = form?.querySelector('input[type="search"]');
  const status = document.querySelector('.search-status');
  const searchable = Array.from(
    document.querySelectorAll('main h1, main h2, main h3, main p, main li, main figcaption')
  );

  function clearHighlights() {
    searchable.forEach((node) => node.classList.remove('search-hit'));
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    clearHighlights();

    const query = input.value.trim().toLowerCase();
    if (!query) {
      status.textContent = 'Enter a keyword to search this page.';
      return;
    }

    const match = searchable.find((node) => node.textContent.toLowerCase().includes(query));
    if (!match) {
      status.textContent = `No results found for "${input.value.trim()}".`;
      return;
    }

    match.classList.add('search-hit');
    match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    status.textContent = `Jumped to "${input.value.trim()}".`;
  });
}

setupPageSearch();

function setupPhotoViewer() {
  const viewerImage = document.querySelector('#viewerImage');
  const viewerTitle = document.querySelector('#viewerTitle');
  const viewerDescription = document.querySelector('#viewerDescription');
  const thumbs = Array.from(document.querySelectorAll('.viewer-thumb'));
  const prevButton = document.querySelector('#viewerPrev');
  const nextButton = document.querySelector('#viewerNext');

  if (!viewerImage || !viewerTitle || !viewerDescription || thumbs.length === 0) {
    return;
  }

  let currentIndex = thumbs.findIndex((thumb) => thumb.classList.contains('is-active'));
  if (currentIndex < 0) {
    currentIndex = 0;
  }

  function renderSlide(index) {
    const thumb = thumbs[index];
    if (!thumb) {
      return;
    }

    viewerImage.src = thumb.dataset.image;
    viewerImage.alt = thumb.dataset.alt;
    viewerTitle.textContent = thumb.dataset.title;
    viewerDescription.textContent = thumb.dataset.description;

    thumbs.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === index);
    });

    currentIndex = index;
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      renderSlide(index);
    });
  });

  prevButton?.addEventListener('click', () => {
    renderSlide((currentIndex - 1 + thumbs.length) % thumbs.length);
  });

  nextButton?.addEventListener('click', () => {
    renderSlide((currentIndex + 1) % thumbs.length);
  });
}

setupPhotoViewer();
