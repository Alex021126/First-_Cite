const list = document.createElement('ul');
const info = document.createElement('p');
const html = document.querySelector('html');

info.textContent = 'Below is a dynamic list. Click here to add a new list item. Click an existing list item to change its text to something else.';

document.body.appendChild(info);
document.body.appendChild(list);

info.onclick = function () {
  const listItem = document.createElement('li');
  const listContent = prompt('What content do you want the list item to have?');
  listItem.textContent = listContent;
  list.appendChild(listItem);

  listItem.onclick = function (e) {
    e.stopPropagation();
    const listContent = prompt('Enter new content for your list item');
    this.textContent = listContent;
  }
}
/*以250px显示左边栏*/
function openNavleft() {
  document.getElementById("leftside").style.display = "block";
  document.getElementById("leftside").style.width = "15rem";
}
/*隐藏左边栏*/
function closeNavleft() {
  document.getElementById("leftside").style.display = "none";
}
/*以250px显示右边栏*/
function openNavright() {
  document.getElementById("rightside").style.display = "block";
  document.getElementById("rightside").style.width = "12rem";
}
/*隐藏右边栏*/
function closeNavright() {
  document.getElementById("rightside").style.display = "none";
}


/*guessing number */
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
    setGameOver();
  } else {
    lastResult.textContent = 'Wrong!';
    lastResult.style.display = 'block';
    lastResult.style.backgroundColor = 'red';
    if (userGuess < randomNumber) {
      lowOrHi.textContent = 'Last guess was too low!';
    } else if (userGuess > randomNumber) {
      lowOrHi.textContent = 'Last guess was too high!';
    }
  }

  guessCount++;
  guessField.value = '';
  guessField.focus();
}
function setGameOver() {
  guessField.disabled = true;
  guessSubmit.disabled = true;
  resetButton = document.createElement('button');
  resetButton.textContent = 'Start new game';
  var element = document.getElementById("guessing-number");
  element.append(resetButton);
  resetButton.addEventListener('click', resetGame);
}
function resetGame() {
  guessCount = 1;

  const resetParas = document.querySelectorAll('.resultParas p');
  for (const resetPara of resetParas) {
    resetPara.textContent = '';
  }

  resetButton.parentNode.removeChild(resetButton);

  guessField.disabled = false;
  guessSubmit.disabled = false;
  guessField.value = '';
  guessField.focus();

  lastResult.style.display = 'none';

  randomNumber = Math.floor(Math.random() * 100) + 1;
}
guessSubmit.addEventListener('click', checkGuess);
guessField.focus();

/*Message box*/
const btn = document.querySelector(".display");

function displayMessage(msgText, msgType) {
  const article = document.querySelector("article");
  const panel = document.createElement("div");
  panel.setAttribute("class", "msgBox");
  article.appendChild(panel);

  const msg = document.createElement("p");
  msg.textContent = msgText;
  panel.appendChild(msg);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "x";
  panel.appendChild(closeBtn);

  closeBtn.onclick = function () {
    panel.parentNode.removeChild(panel);
  };

  if (msgType === "warning") {
    msg.style.backgroundImage = "url(icons/warning.png)";
    panel.style.backgroundColor = "red";
  } else if (msgType === "chat") {
    msg.style.backgroundImage = "url(icons/chat.png)";
    panel.style.backgroundColor = "aqua";
  } else {
    msg.style.paddingLeft = "20px";
  }

}
btn.onclick = function () {
  displayMessage("Woo, this is a different message!", "chat");
};



/*Image Gallery */
const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

const btn_dark = document.querySelector('.full-img button');
const overlay = document.querySelector('.overlay');

/* Declaring the array of image filenames */

const images = ['pic1.jpg', `pic2.jpg`, `pic3.jpg`, `pic4.jpg`, `pic5.jpg`];
const alts = {
  'pic1.jpg': 'ginkgo',
  'pic2.jpg': 'Rock that looks like a wave',
  'pic3.jpg': 'Purple and white pansies',
  'pic4.jpg': 'Section of wall from a pharoah\'s tomb',
  'pic5.jpg': 'Large moth on a leaf'
}

/* Looping through images */

for (const image of images) {
  const newImage = document.createElement('img');
  newImage.setAttribute('src', `image/${image}`);
  newImage.setAttribute('alt', alts[image]);
  thumbBar.appendChild(newImage);
  newImage.addEventListener('click', e => {
    displayedImage.src = e.target.src;
    displayedImage.alt = e.target.alt;
  });
}

/* Wiring up the Darken/Lighten button */

btn_dark.addEventListener('click', () => {
  const btn_darkClass = btn_dark.getAttribute('class');
  if (btn_darkClass === 'dark') {
    btn_dark.setAttribute('class', 'light');
    btn_dark.textContent = 'Lighten';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  } else {
    btn_dark.setAttribute('class', 'dark');
    btn_dark.textContent = 'Darken';
    overlay.style.backgroundColor = 'rgba(0,0,0,0)';
  }
});

/*import JSON*/
var header = document.querySelector(".header");
var section = document.querySelector("section");

var requestURL =
  "https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json";
var request = new XMLHttpRequest();
request.open("GET", requestURL);
request.responseType = "json";
request.send();

request.onload = function () {
  var superHeroes = request.response;
  populateHeader(superHeroes);
  showHeroes(superHeroes);
};

function populateHeader(jsonObj) {
  var myH1 = document.createElement("h1");
  myH1.textContent = jsonObj["squadName"];
  header.appendChild(myH1);

  var myPara = document.createElement("p");
  myPara.textContent =
    "Hometown: " + jsonObj["homeTown"] + " // Formed: " + jsonObj["formed"];
  header.appendChild(myPara);
}
function showHeroes(jsonObj) {
  var heroes = jsonObj["members"];

  for (i = 0; i < heroes.length; i++) {
    var myArticle = document.createElement("article");
    var myH2 = document.createElement("h2");
    var myPara1 = document.createElement("p");
    var myPara2 = document.createElement("p");
    var myPara3 = document.createElement("p");
    var myList = document.createElement("ul");

    myH2.textContent = heroes[i].name;
    myPara1.textContent = "Secret identity: " + heroes[i].secretIdentity;
    myPara2.textContent = "Age: " + heroes[i].age;
    myPara3.textContent = "Superpowers:";

    var superPowers = heroes[i].powers;
    for (j = 0; j < superPowers.length; j++) {
      var listItem = document.createElement("li");
      listItem.textContent = superPowers[j];
      myList.appendChild(listItem);
    }

    myArticle.appendChild(myH2);
    myArticle.appendChild(myPara1);
    myArticle.appendChild(myPara2);
    myArticle.appendChild(myPara3);
    myArticle.appendChild(myList);

    section.appendChild(myArticle);
  }
}





