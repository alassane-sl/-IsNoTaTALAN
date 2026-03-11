// document.addEventListener('DOMContentLoaded', () => {
//   function insertHtml(selector, path) {
//     const box = document.querySelector(selector);
//     if (!box) return;

//     const request = new XMLHttpRequest();
//     request.open('GET', path, true);
//     request.onreadystatechange = function () {
//       if (request.readyState === 4) {
//         if (request.status === 200) {
//           box.innerHTML = request.responseText;
//         } else {
//           console.log('Impossible de charger', path);
//         }
//       }
//     };
//     request.send();
//   }

//   insertHtml('#component-header', './composants/header.html');
//   insertHtml('#component-footer', './composants/footer.html');
// });
