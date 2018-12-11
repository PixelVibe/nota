import * as snabbdom from 'snabbdom';
import { h } from 'snabbdom';

const patch = snabbdom.init([
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/class').default
]);
const container = document.getElementById('notesContainer');

// Holds the active window id when it is focused
let activeWindowId;
let editingNote = -1;
let filteringTag = '';

const vNode = h('ul', {}, '');
patch(container, vNode);

// Any changes to the URL will trigger this when the page has been fully loaded
// Initially it was with tabs.onUpdated, but it was triggering multiple times
browser.webNavigation.onCompleted.addListener(refreshContent);
browser.tabs.onActivated.addListener(refreshContent);
browser.storage.onChanged.addListener(refreshContent);

// Handle the cases of opening the sidepanel or when creating a new window
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
    const doc = await browser.storage.local.get(url);



    if (!doc[url]) {
      patch(vNode, h('ul', {}, [
        h('li', {}, 'There are no notes for this page!')
      ]));
    } else {
      buildSidePanelNotes(doc[url].notes).then((notesList) => {
        // Reset the parent node
        patch(vNode, h('ul', {}, notesList));
      });
    }


  } catch (error) {
    patch(vNode, h('ul', {}, [
      h('li', {}, error.message)
    ]));
  }
}

// Iterates an array of objects and returns a tree of hyperscript nodes
// to be added from snabbdom
async function buildSidePanelNotes(notes) {
  return notes.filter(note => !(filteringTag !== '' && !~note.tags.indexOf(filteringTag))).map((note, index) => {
    let trimText = note.text.length > 300;
    return (
      h(`li.note-type--${note.type}`, {class: {'trimmed-text' : trimText}, on: {click: captureClickEvents}}, [
        h('div.note-content', {}, [
          h('p', {}, 
            trimText ? [h('span.visible-text', note.text.slice(0, 300)), h('span.hidden-text-fragment', note.text.slice(300))] : h('span', note.text)
          ),
          h('div.note-tags', {}, note.tags.map((tag) => {
            return h('span', { on: { click: [filterNotesWithTag, tag] }, class: {'selected' : tag === filteringTag} }, `#${tag}`)
          })),
        ]),
        h('div.note-tools', {}, [
          h('a.note-tools--edit', { on: { click: [editNote, index] } }, [
            h('svg.edit', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
              h('use', { attrs: { 'xlink:href': "#edit" } })
            ])
          ]),
          h('a.note-tools--fold', { on: { click: [toggleFoldText, index] } }, [
            h('svg.more', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
              h('use', { attrs: { 'xlink:href': "#more" } })
            ]),
            h('svg.less', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
              h('use', { attrs: { 'xlink:href': "#less" } })
            ])
          ]),
          h('a.note-tools--delete', { on: { click: [deleteNote, index] } }, [
            h('svg.delete', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
              h('use', { attrs: { 'xlink:href': "#delete" } })
            ])
          ]),
        ])
      ])
    )
  });
}

function filterNotesWithTag(tag) {
  filteringTag = filteringTag === tag ? '' : tag;
  refreshContent();
}

function editNote(noteIndex, event) {
  event.cancelBubble = true;
  editingNote = noteIndex;
  browser.browserAction.openPopup();
}

async function deleteNote(noteIndex, event) {
  event.cancelBubble = true;
  const url = await retrieveActiveTabURL();
  if (window.confirm(`Are you sure you want to delete this note?`)) {
    browser.runtime.sendMessage({
      type: 'delete-note',
      body: {
        id: url,
        index: noteIndex,
      }
    });
  }
}

function toggleFoldText(_noteIndex, event, node) {
  if(event.target.tagName !== 'A') {
    event.cancelBubble = true;
    node.elm.dispatchEvent(new Event('click', {bubbles: true}));
    return;
  }
}

function captureClickEvents(event, node) {
  switch(event.target.className) {
    case 'note-tools--fold': {
      node.elm.classList.toggle('unfolded');
      break;
    }
    default: {
      // browser.find.find(node.elm.textContent.slice(0, 100), {
      //   includeRangeData: true,
      // })
      // .then((results) => {
      //   browser.find.highlightResults();
      //   console.log(results);
      // })
      // .catch((error) => {
      //   console.log(error);
      // })
    }
  }
}