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
  document.getElementById("leftside").style.width = "20rem";
}
/*隐藏左边栏*/
function closeNavleft() {
  document.getElementById("leftside").style.display = "none";
}
/*以250px显示右边栏*/
function openNavright() {
  document.getElementById("rightside").style.display = "block";
  document.getElementById("rightside").style.width = "10rem";
}
/*隐藏右边栏*/
function closeNavright() {
  document.getElementById("rightside").style.display = "none";
}

const verseChoose = document.querySelector("select");
const poemDisplay = document.querySelector("pre");

verseChoose.addEventListener("change", () => {
  const verse = verseChoose.value;
  updateDisplay(verse);
});
function updateDisplay(verse) {
  verse = verse.replace(" ", "").toLowerCase();
  const url = `txt/${verse}.txt`;
  // 调用 `fetch()`，传入 URL。
  fetch(url)
    // fetch() 返回一个 promise。当我们从服务器收到响应时，
    // 会使用该响应调用 promise 的 `then()` 处理器。
    .then((response) => {
      // 如果请求没有成功，我们的处理器会抛出错误。
      if (!response.ok) {
        throw new Error(`HTTP 错误：${response.status}`);
      }
      // 否则（如果请求成功），我们的处理器通过调用
      // response.text() 以获取文本形式的响应，
      // 并立即返回 `response.text()` 返回的 promise。
      return response.text();
    })
    // 若成功调用 response.text()，会使用返回的文本来调用 `then()` 处理器，
    // 然后我们将其拷贝到 `poemDisplay` 框中。
    .then((text) => (poemDisplay.textContent = text))
    // 捕获可能出现的任何错误，
    // 并在 `poemDisplay` 框中显示一条消息。
    .catch((error) => (poemDisplay.textContent = `获取诗歌失败：${error}`));


}
updateDisplay("Verse 1");
verseChoose.value = "Verse 1";

