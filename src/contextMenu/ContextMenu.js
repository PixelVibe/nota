// browser.contextMenus.create({
//   id: "highlight-item",
//   title: browser.i18n.getMessage("contextMenuItemHighlightSelection"),
//   contexts: ["selection"],
//   type: "normal",
// });
browser.contextMenus.onClicked.addListener((info, tab) => {
  console.log(info);
  browser.runtime.sendMessage('la');
});

// function doSomething() {
//   // browser.browserAction.openPopup().then(() => {
//   //   console.log('is open');
//   //   browser.runtime.sendMessage({
//   //     type: "new-highlighted-note",
//   //     message: 'info.srcUrl',
//   //   });
//   // })
// }

browser.contextMenus.create({
  id: "highlight-interesting",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightInteresting"),
  contexts: ["selection"],
  checked: false,
});

browser.contextMenus.create({
  id: "highlight-review",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightReview"),
  contexts: ["selection"],
  checked: false,
});

browser.contextMenus.create({
  id: "highlight-other",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightOther"),
  contexts: ["selection"],
  checked: false,
});