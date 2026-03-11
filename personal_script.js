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
    document.querySelectorAll('main h1, main h2, main p, main li, main caption, main th, main td, main label, main .job-title')
  );

  function clearHighlights() {
    searchable.forEach((node) => node.classList.remove('search-hit'));
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    clearHighlights();

    const query = input.value.trim().toLowerCase();
    if (!query) {
      status.textContent = '请输入关键词后再搜索。';
      return;
    }

    const match = searchable.find((node) => node.textContent.toLowerCase().includes(query));
    if (!match) {
      status.textContent = `没有找到“${input.value.trim()}”。`;
      return;
    }

    match.classList.add('search-hit');
    match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    status.textContent = `已定位到“${input.value.trim()}”。`;
  });
}

setupPageSearch();

const verseChoose = document.querySelector('#verse-choose');
const poemDisplay = document.querySelector('pre');
const verseFallbacks = {
  verse1: `Lo! 'tis a gala night
   Within the lonesome latter years!
An angel throng, bewinged, bedight
   In veils, and drowned in tears,
Sit in a theatre, to see
   A play of hopes and fears,
While the orchestra breathes fitfully
   The music of the spheres.
Mimes, in the form of God on high,
   Mutter and mumble low,
And hither and thither fly-
   Mere puppets they, who come and go
At bidding of vast formless things
   That shift the scenery to and fro,
Flapping from out their Condor wings
   Invisible Woe!`,
  verse2: `That motley drama- oh, be sure
   It shall not be forgot!
With its Phantom chased for evermore,
   By a crowd that seize it not,
Through a circle that ever returneth in
   To the self-same spot,
And much of Madness, and more of Sin,
   And Horror the soul of the plot.`,
  verse3: `But see, amid the mimic rout
   A crawling shape intrude!
A blood-red thing that writhes from out
   The scenic solitude!
It writhes!- it writhes!- with mortal pangs
   The mimes become its food,
And seraphs sob at vermin fangs
   In human gore imbued.`,
  verse4: `But see, amid the mimic rout
   A crawling shape intrude!
A blood-red thing that writhes from out
   The scenic solitude!
It writhes!- it writhes!- with mortal pangs
   The mimes become its food,
And seraphs sob at vermin fangs
   In human gore imbued.`
};

verseChoose?.addEventListener('change', () => {
  updateDisplay(verseChoose.value);
});

function updateDisplay(verse) {
  const normalized = verse.replace(/\s+/g, '').toLowerCase();
  const url = `text/${normalized}.txt`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP 错误：${response.status}`);
      }
      return response.text();
    })
    .then((text) => {
      poemDisplay.textContent = text;
    })
    .catch((error) => {
      poemDisplay.textContent = verseFallbacks[normalized] || `获取诗歌失败：${error.message}`;
    });
}

updateDisplay('Verse 1');
if (verseChoose) {
  verseChoose.value = 'Verse 1';
}
