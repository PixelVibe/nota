// browser.contextMenus.onClicked.addListener((info, tab) => {
//   console.log(info);
//   browser.runtime.sendMessage('la');
// });

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