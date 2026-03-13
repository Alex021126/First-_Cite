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

  if (!viewerImage || !viewerTitle || thumbs.length === 0) {
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
    if (viewerDescription) {
      viewerDescription.textContent = thumb.dataset.description || '';
    }

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

function setupStockWidgets() {
  const stockCatalog = [
    { symbol: 'NYSE:TSM', ticker: 'TSM', name: 'Taiwan Semiconductor' },
    { symbol: 'NASDAQ:NVDA', ticker: 'NVDA', name: 'NVIDIA' },
    { symbol: 'NASDAQ:AMD', ticker: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'NASDAQ:AAPL', ticker: 'AAPL', name: 'Apple' },
    { symbol: 'NASDAQ:MSFT', ticker: 'MSFT', name: 'Microsoft' },
    { symbol: 'NASDAQ:AMZN', ticker: 'AMZN', name: 'Amazon' },
    { symbol: 'NASDAQ:GOOGL', ticker: 'GOOGL', name: 'Alphabet' },
    { symbol: 'NASDAQ:META', ticker: 'META', name: 'Meta Platforms' },
    { symbol: 'NASDAQ:TSLA', ticker: 'TSLA', name: 'Tesla' },
    { symbol: 'NASDAQ:AVGO', ticker: 'AVGO', name: 'Broadcom' },
    { symbol: 'NASDAQ:QCOM', ticker: 'QCOM', name: 'Qualcomm' },
    { symbol: 'NASDAQ:MU', ticker: 'MU', name: 'Micron Technology' },
  ];
  const defaultSymbols = [
    'NYSE:TSM',
    'NASDAQ:AAPL',
    'NASDAQ:MSFT',
    'NASDAQ:NVDA',
    'NASDAQ:AMZN',
    'NASDAQ:GOOGL',
    'NASDAQ:META',
    'NASDAQ:TSLA',
  ];
  const form = document.querySelector('#stockSearchForm');
  const input = document.querySelector('#stockSearchInput');
  const status = document.querySelector('#stockSearchStatus');
  const tickerStrip = document.querySelector('#stockTickerStrip');
  const selectorStrip = document.querySelector('#stockSelectorStrip');
  const datalist = document.querySelector('#stockSuggestions');
  const chartShell = document.querySelector('#stockChartShell');
  const chartTitle = document.querySelector('#stockChartTitle');
  const chartSubtitle = document.querySelector('#stockChartSubtitle');
  const activeSymbols = new Set();
  let selectedSymbol = defaultSymbols[0];

  if (!form || !input || !status || !tickerStrip || !selectorStrip || !datalist || !chartShell || !chartTitle || !chartSubtitle) {
    return;
  }

  stockCatalog.forEach((stock) => {
    const option = document.createElement('option');
    option.value = stock.ticker;
    option.label = `${stock.name} (${stock.symbol})`;
    datalist.appendChild(option);
  });

  function findStock(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    return stockCatalog.find((stock) => {
      return (
        stock.ticker.toLowerCase() === normalized ||
        stock.symbol.toLowerCase() === normalized ||
        stock.name.toLowerCase().includes(normalized)
      );
    }) || null;
  }

  function mountTradingViewChart(stock) {
    chartShell.replaceChildren();
    chartTitle.textContent = stock.ticker;
    chartSubtitle.textContent = stock.name;

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    container.appendChild(widget);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.text = JSON.stringify({
      symbol: stock.symbol,
      width: '100%',
      height: '100%',
      locale: 'zh_CN',
      colorTheme: 'light',
      autosize: true,
      interval: 'D',
      timezone: 'Asia/Singapore',
      style: '1',
      allow_symbol_change: false,
      calendar: false,
      details: true,
      hotlist: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      save_image: false,
      support_host: 'https://www.tradingview.com',
      fontFamily: '"SF Pro Text", "PingFang SC", sans-serif',
      isTransparent: true,
    });

    container.appendChild(script);
    chartShell.appendChild(container);
  }

  function renderTickerTape() {
    tickerStrip.replaceChildren();

    const activeStocks = stockCatalog.filter((stock) => activeSymbols.has(stock.symbol));
    if (activeStocks.length === 0) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    container.appendChild(widget);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.text = JSON.stringify({
      symbols: activeStocks.map((stock) => ({
        proName: stock.symbol,
        title: stock.ticker,
      })),
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'light',
      locale: 'zh_CN',
    });
    container.appendChild(script);
    tickerStrip.appendChild(container);
  }

  function syncActiveSelectorState() {
    Array.from(selectorStrip.querySelectorAll('.stock-selector-button')).forEach((button) => {
      button.classList.toggle('is-active', button.dataset.stockSymbol === selectedSymbol);
    });
  }

  function selectStock(stock) {
    selectedSymbol = stock.symbol;
    syncActiveSelectorState();
    mountTradingViewChart(stock);
    status.textContent = '';
  }

  function addStockButton(stock, options = {}) {
    if (!stock) {
      status.textContent = 'Only stocks from the built-in list can be added right now.';
      return;
    }

    if (activeSymbols.has(stock.symbol)) {
      status.textContent = `${stock.ticker} is already on the page.`;
      return;
    }

    const button = document.createElement('div');
    button.className = 'stock-selector-button';
    button.dataset.stockSymbol = stock.symbol;
    button.tabIndex = 0;
    button.innerHTML = `
      <span>${stock.ticker}</span>
      <button type="button" class="stock-selector-remove" aria-label="Remove ${stock.ticker} from strip">×</button>
    `;

    button.addEventListener('click', () => {
      selectStock(stock);
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectStock(stock);
      }
    });

    button.querySelector('.stock-selector-remove')?.addEventListener('click', (event) => {
      event.stopPropagation();
      activeSymbols.delete(stock.symbol);
      button.remove();
      renderTickerTape();

      if (selectedSymbol === stock.symbol) {
        const fallbackButton = selectorStrip.querySelector('.stock-selector-button');
        const fallbackStock = fallbackButton
          ? stockCatalog.find((item) => item.symbol === fallbackButton.dataset.stockSymbol)
          : null;

        if (fallbackStock) {
          selectStock(fallbackStock);
        } else {
          chartShell.replaceChildren();
          chartTitle.textContent = 'No stock selected';
          chartSubtitle.textContent = '';
          status.textContent = '';
        }
      } else {
        status.textContent = '';
      }
    });

    selectorStrip.appendChild(button);
    activeSymbols.add(stock.symbol);
    renderTickerTape();
    syncActiveSelectorState();

    if (!options.silent) {
      status.textContent = '';
    }

    if (options.selectOnAdd !== false) {
      selectStock(stock);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const stock = findStock(input.value);
    addStockButton(stock);
    if (stock) {
      input.value = '';
    }
  });

  defaultSymbols
    .map((symbol) => stockCatalog.find((stock) => stock.symbol === symbol))
    .forEach((stock, index) => addStockButton(stock, { silent: true, selectOnAdd: index === 0 }));

  status.textContent = '';
}

setupStockWidgets();
