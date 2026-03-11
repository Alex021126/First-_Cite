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
    document.querySelectorAll('article h1, article h2, article h3, article p, article li, article figcaption')
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

let randomNumber = Math.floor(Math.random() * 100) + 1;

const guesses = document.querySelector('.guesses');
const lastResult = document.querySelector('.lastResult');
const lowOrHi = document.querySelector('.lowOrHi');
const guessSubmit = document.querySelector('.guessSubmit');
const guessField = document.querySelector('.guessField');

let guessCount = 1;
let resetButton;

function checkGuess() {
  const userGuess = Number(guessField.value);
  if (!Number.isInteger(userGuess) || userGuess < 1 || userGuess > 100) {
    lastResult.textContent = '请输入 1 到 100 之间的整数。';
    lastResult.style.display = 'block';
    lastResult.style.backgroundColor = '#b54708';
    lowOrHi.textContent = '';
    guessField.focus();
    return;
  }

  if (guessCount === 1) {
    guesses.textContent = 'Previous guesses: ';
  }
  guesses.textContent += `${userGuess} `;

  if (userGuess === randomNumber) {
    lastResult.textContent = 'Congratulations! You got it right!';
    lastResult.style.display = 'block';
    lastResult.style.backgroundColor = 'green';
    lowOrHi.textContent = '';
    setGameOver();
  } else if (guessCount === 10) {
    lastResult.textContent = '!!!GAME OVER!!!';
    lowOrHi.textContent = '';
    lastResult.style.display = 'block';
    lastResult.style.backgroundColor = '#9f1239';
    setGameOver();
  } else {
    lastResult.textContent = 'Wrong!';
    lastResult.style.display = 'block';
    lastResult.style.backgroundColor = 'red';
    lowOrHi.textContent = userGuess < randomNumber ? 'Last guess was too low!' : 'Last guess was too high!';
  }

  guessCount++;
  guessField.value = '';
  guessField.focus();
}

function setGameOver() {
  guessField.disabled = true;
  guessSubmit.disabled = true;
  resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'game-reset';
  resetButton.textContent = 'Start new game';
  document.getElementById('guessing-number').append(resetButton);
  resetButton.addEventListener('click', resetGame);
}

function resetGame() {
  guessCount = 1;

  const resetParas = document.querySelectorAll('.resultParas p');
  for (const resetPara of resetParas) {
    resetPara.textContent = '';
  }

  resetButton.remove();
  guessField.disabled = false;
  guessSubmit.disabled = false;
  guessField.value = '';
  guessField.focus();
  lastResult.style.display = 'none';
  randomNumber = Math.floor(Math.random() * 100) + 1;
}

guessSubmit?.addEventListener('click', checkGuess);
guessField?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    checkGuess();
  }
});
guessField?.focus();

const btn = document.querySelector('.display');

function displayMessage(msgText, msgType) {
  const article = document.querySelector('article');
  const existing = article.querySelector('.msgBox');
  if (existing) {
    existing.remove();
  }

  const panel = document.createElement('div');
  panel.setAttribute('class', 'msgBox');
  article.appendChild(panel);

  const msg = document.createElement('p');
  msg.textContent = msgText;
  panel.appendChild(msg);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'x';
  panel.appendChild(closeBtn);

  closeBtn.onclick = function () {
    panel.remove();
  };

  if (msgType === 'warning') {
    msg.style.backgroundImage = 'url(icons/warning.png)';
    panel.style.backgroundColor = 'red';
  } else if (msgType === 'chat') {
    msg.style.backgroundImage = 'url(icons/chat.png)';
    panel.style.backgroundColor = 'aqua';
  } else {
    msg.style.paddingLeft = '20px';
  }
}

btn?.addEventListener('click', () => {
  displayMessage('Woo, this is a different message!', 'chat');
});

const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');
const btnDark = document.querySelector('.full-img button');
const overlay = document.querySelector('.overlay');

const images = ['pic1.jpg', 'pic2.jpg', 'pic3.jpg', 'pic4.jpg', 'pic5.jpg'];
const alts = {
  'pic1.jpg': 'ginkgo',
  'pic2.jpg': 'Rock that looks like a wave',
  'pic3.jpg': 'Purple and white pansies',
  'pic4.jpg': "Section of wall from a pharoah's tomb",
  'pic5.jpg': 'Large moth on a leaf'
};

for (const image of images) {
  const newImage = document.createElement('img');
  newImage.setAttribute('src', `image/${image}`);
  newImage.setAttribute('alt', alts[image]);
  thumbBar.appendChild(newImage);
  newImage.addEventListener('click', (event) => {
    displayedImage.src = event.target.src;
    displayedImage.alt = event.target.alt;
  });
}

btnDark?.addEventListener('click', () => {
  const btnDarkClass = btnDark.getAttribute('class');
  if (btnDarkClass === 'dark') {
    btnDark.setAttribute('class', 'light');
    btnDark.textContent = 'Lighten';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  } else {
    btnDark.setAttribute('class', 'dark');
    btnDark.textContent = 'Darken';
    overlay.style.backgroundColor = 'rgba(0,0,0,0)';
  }
});

const header = document.querySelector('.header');
const section = document.querySelector('section');

fetch('https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  })
  .then((superHeroes) => {
    populateHeader(superHeroes);
    showHeroes(superHeroes);
  })
  .catch(() => {
    header.innerHTML = '<h1>Superhero Squad</h1><p>网络数据暂时不可用，已跳过远程内容加载。</p>';
  });

function populateHeader(jsonObj) {
  const myH1 = document.createElement('h1');
  myH1.textContent = jsonObj.squadName;
  header.appendChild(myH1);

  const myPara = document.createElement('p');
  myPara.textContent = `Hometown: ${jsonObj.homeTown} // Formed: ${jsonObj.formed}`;
  header.appendChild(myPara);
}

function showHeroes(jsonObj) {
  const heroes = jsonObj.members;

  for (const hero of heroes) {
    const myArticle = document.createElement('article');
    const myH2 = document.createElement('h2');
    const myPara1 = document.createElement('p');
    const myPara2 = document.createElement('p');
    const myPara3 = document.createElement('p');
    const myList = document.createElement('ul');

    myH2.textContent = hero.name;
    myPara1.textContent = `Secret identity: ${hero.secretIdentity}`;
    myPara2.textContent = `Age: ${hero.age}`;
    myPara3.textContent = 'Superpowers:';

    for (const power of hero.powers) {
      const listItem = document.createElement('li');
      listItem.textContent = power;
      myList.appendChild(listItem);
    }

    myArticle.append(myH2, myPara1, myPara2, myPara3, myList);
    section.appendChild(myArticle);
  }
}
