import Storage from './Storage';

const notaExtensionDb = new Storage('notaExtensionDb');

browser
  .runtime
  .onMessage
  .addListener((message) => {
    switch (message.type) {
      case 'fetch-notes-for-active-tab-url': {
        try {
          let noteIndexToRetrieve = message.noteIndex > -1 ? message.noteIndex : false;
          return notaExtensionDb.retrieveNotesForUrl(message.docId, noteIndexToRetrieve);
        } catch (error) {
          console.log('Error while fetching notes ', error);
        }
        break;
      }

      case 'new-note': {
        createNewNote(message.body);
        break;
      }

      case 'delete-note': {
        deleteNote(message.body);
        break;
      }

    }
  });

// Context menu
browser.contextMenus.onClicked.addListener((contextMenuItem, tab) => {

  let type;
  switch(contextMenuItem.menuItemId) {
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

  const note = {
    _id: contextMenuItem.pageUrl,
    editingInfo: {
      isEditing: false
    },
    notes: [{
      text: contextMenuItem.selectionText,
      type, tags: []
    }]
  }

  createNewNote(note);

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
  notaExtensionDb.createNote(note);
}

function deleteNote(note) {
  notaExtensionDb.deleteNote(note);
}