import Storage from './Storage';

const bjExtensionDb = new Storage();

browser
  .runtime
  .onMessage
  .addListener((message) => {
    switch (message.type) {
      case 'fetch-notes-for-active-tab-url': {
        try {
          return bjExtensionDb.retrieveNotesForUrl(message.docId, message.noteIndex);
        } catch (error) {
          console.log('Error while fetching notes ', error);
        }
        break;
      }

      // New notes coming from the popup action and not from selected text
      case 'new-note': {
        createNewNote(message.body);
        break;
      }

      case 'delete-note': {
        deleteNote(message.body);
        break;
      }

      case 'open-extension-page': {
        openExtensionPage();
        break;
      }

    }
  });

// Context menu
browser.contextMenus.onClicked.addListener((OnClickData) => {
  let type;
  switch(OnClickData.menuItemId) {
    case 'highlight-interesting': {
      type = 'interesting';
      break;
    }
    case 'highlight-review': {
      type = 'review';
      break;
    }
    case 'highlight-other': {
      type = 'other';
      break;
    }
  }
  createNewNote({
    id: OnClickData.pageUrl,
    data: {
      editingInfo: {
        isEditing: false
      },
      notes: [{
        text: OnClickData.selectionText,
        type, tags: []
      }],
      meta: []
    }
  });

  // browser.tabs.executeScript({
  //   file: "./../contentScripts/index.js",
  // })
  // .catch((error) => {
  //   console.log('There was an error while injecting the content script', error);
  // })

});

browser.contextMenus.create({
  id: "highlight-interesting",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightInteresting"),
  contexts: ["selection"],
});

browser.contextMenus.create({
  id: "highlight-review",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightReview"),
  contexts: ["selection"],
});

browser.contextMenus.create({
  id: "highlight-other",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightOther"),
  contexts: ["selection"],
});

// Functions to handle events
function createNewNote(note) {
  bjExtensionDb.createNote(note);
}

function deleteNote(note) {
  bjExtensionDb.deleteNote(note);
}

var createData = {
  type: "detached_panel",
  url: "./extensionPage/index.html",
  width: 800,
  height: 600
};

function openExtensionPage() {
  var creating = browser.windows.create(createData);
}