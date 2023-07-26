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
