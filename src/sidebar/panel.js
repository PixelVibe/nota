import * as snabbdom from 'snabbdom';
import { h } from 'snabbdom';

const patch = snabbdom.init([
  require('snabbdom/modules/eventlisteners').default
]);
const container = document.getElementById('notesContainer');

// Holds the active window id when it is focused
let activeWindowId;
let editingNote = -1;

const vNode = h('ul', {}, '');
patch(container, vNode);

// Any changes to the URL will trigger this when the page has been fully loaded
// Initially it was with tabs.onUpdated, but it was triggering multiple times
browser.webNavigation.onCompleted.addListener(refreshContent);
browser.tabs.onActivated.addListener(refreshContent);

// This is to handle the cases of opening the sidepanel or when creating a new window
browser.windows.getCurrent().then((windowInfo) => {
  activeWindowId = windowInfo.id;
  refreshContent();
});

// Listen for incoming messages from other parts of the extension
// and refresh the notes list
browser.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case 'refresh-content': {
      refreshContent();
      break;
    }
    
    case 'popup-is-active': {
      if (editingNote > -1) {
        const noteIndex = editingNote;
        editingNote = -1;
        return Promise.resolve({
          type: 'editing',
          noteIndex
        });
      }
    }

  }
})

// It will return the URL for the active tab in the focused window instance
function retrieveActiveTabURL() {
  return browser.tabs.query({ windowId: activeWindowId, active: true }).then((tabs) => tabs[0].url);
}

// Refreshes the panel content with the notes list
// It will fallback to a "no notes message" in case the array is empty
// or the document (id: url) is missing all together
async function refreshContent() {
  const url = await retrieveActiveTabURL();

  try {
    const response = await browser.runtime.sendMessage({
      type: 'fetch-notes-for-active-tab-url',
      docId: url,
    });

    // If the notes array is empty, throw an error with the string missing, to match
    // the default error message from pouchDb when a document doesn't exist
    if (response.notes.length === 0) {
      throw Error('missing');
    }

    buildSidePanelNotes(response.notes).then((notesList) => {
      // Reset the parent node
      patch(vNode, h('ul', {}, notesList));
    });

  } catch (error) {
    switch (error.message) {
      // Missing is a default message from pouchDb when the key doesn't exist
      case 'missing': {
        patch(vNode, h('ul', {}, [
          h('li', {}, 'There are no notes for this page!')
        ]));
        break;
      }

      default: {
        patch(vNode, h('ul', {}, [
          h('li', {}, error.message)
        ]));
      }
    }
  }
}

// Iterates an array of objects and returns a tree of hyperscript nodes
// to be added from snabbdom
async function buildSidePanelNotes(notes) {
  return notes.map((note, index) => {
    return (
      h(`li.note-type--${note.type}`, {}, [
        h('div.note-content', {}, [
          h('p', {}, note.text),
          h('div.note-tags', {}, note.tags.map((tag) => {
            return h('span', `#${tag}`)
          })),
          h('div.note-tools', {}, [
            h('a.note-tools--edit', { on: { click: [editNote, index] } }, 'edit'),
            h('a.note-tools--delete', { on: { click: [deleteNote, index] } }, 'delete'),
          ])])
      ])
    )
  });
}

function editNote(noteIndex) {
  editingNote = noteIndex;
  browser.browserAction.openPopup();
}

function deleteNote(noteIndex) {
  console.log('delete ', noteIndex)
  alert('are you sure?')
}