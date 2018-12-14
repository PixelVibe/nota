// import * as snabbdom from 'snabbdom';
// import { h } from 'snabbdom';

import { h, render, Component } from "preact";
const container = document.getElementById('notesContainer');

class SidePanelNotes extends Component {
  constructor() {
    super();
    this.state.notes = [];
    this.state.filteringTag = '';
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.updateState();
    browser.webNavigation.onCompleted.addListener(this.updateState);
    browser.tabs.onActivated.addListener(this.updateState);
    browser.storage.onChanged.addListener(this.updateState);
  }

  updateState() {
    browser
      .windows
      .getCurrent()
      .then((windowInfo) => {
        browser
          .tabs
          .query({ windowId: windowInfo.id, active: true })
          .then((tabs) => {
            browser.storage.local
              .get(tabs[0].url)
              .then((results) => {
                // Check if we have anything for the active url
                if (!results[tabs[0].url]) {
                  this.setState({notes: []});
                } else {
                  this.setState({notes: results[tabs[0].url].notes});
                }
              })
              .catch((error) => {throw error});
          })
          .catch((error) => {throw error});
    })
    .catch((error) => {
      console.log('There was an error while trying to update the sidepanel');
      console.log(error);
    })
  }

  renderNoteTools(index) {
    return (
      <div className="note-tools">
        <a href="#" className="note-tools--edit" onClick={(e) => editNote(index, e)}>
          <svg className="edit" width='24' height='24' viewBox='0 0 24 24'>
            <use xlinkHref="#edit" />
          </svg>
        </a>
        <a href="#" className="note-tools--fold" onClick={(e) => {
          e.preventDefault();
          this.base.childNodes[index].classList.toggle('open');
        }}>
          <svg className="more" width='24' height='24' viewBox='0 0 24 24'>
            <use xlinkHref="#more" />
          </svg>
          <svg className="less" width='24' height='24' viewBox='0 0 24 24'>
            <use xlinkHref="#less" />
          </svg>
        </a>
        <a href="#" className="note-tools--delete" onClick={() => deleteNote(index)}>
          <svg className="delete" width='24' height='24' viewBox='0 0 24 24'>
            <use xlinkHref="#delete" />
          </svg>
        </a>
      </div>
    )
  }

  renderNoteItems(state) {
    return state
      .notes
      .filter((note) => !(state.filteringTag !== '' && !~note.tags.indexOf(state.filteringTag)))
      .map((note, index) => {
        const trimText = note.text.length > 300;
        return (
          <li className={['note-type--' + note.type, trimText ? 'folded' : '', ].join(' ')}>
            {this.renderNoteTools(index)}
            <div className="note-content">
              <p><span>{note.text}</span></p>
              <div className="note-tags">{note.tags.map((tag) => <span>#{tag}</span>)}</div>
            </div>

          </li>
        )
      })
  }

  render(_props, state) {
    return (
      <ul className="notes">
        {this.renderNoteItems(state)}
      </ul>
    )
  }
}

render(<SidePanelNotes />, container);

async function deleteNote(index) {
  const url = await retrieveActiveTabURL();
  if (window.confirm(`Are you sure you want to delete this note?`)) {
    browser.runtime.sendMessage({
      type: 'delete-note',
      body: {
        id: url,
        index
      }
    });
  }
}

function retrieveActiveWindowId() {
  return browser.windows.getCurrent().then((windowInfo) => windowInfo.id);
}

async function retrieveActiveTabURL() {
  const windowId = await retrieveActiveWindowId();
  return browser.tabs.query({ windowId, active: true }).then((tabs) => tabs[0].url);
}

// const patch = snabbdom.init([
//   require('snabbdom/modules/eventlisteners').default,
//   require('snabbdom/modules/attributes').default,
//   require('snabbdom/modules/class').default
// ]);

// Holds the active window id when it is focused
// let activeWindowId;
// let editingNote = -1;
// let filteringTag = '';

// const vNode = h('ul', {}, '');
// patch(container, vNode);

// // Any changes to the URL will trigger this when the page has been fully loaded
// // Initially it was with tabs.onUpdated, but it was triggering multiple times
// browser.webNavigation.onCompleted.addListener(refreshContent);
// browser.tabs.onActivated.addListener(refreshContent);
// browser.storage.onChanged.addListener(refreshContent);

// // Handle the cases of opening the sidepanel or when creating a new window
// browser.windows.getCurrent().then((windowInfo) => {
//   activeWindowId = windowInfo.id;
//   refreshContent();
// });

// // Listen for incoming messages from other parts of the extension
// // and refresh the notes list
// browser.runtime.onMessage.addListener((msg) => {
//   switch (msg.type) {
//     case 'refresh-content': {
//       refreshContent();
//       break;
//     }

//     case 'popup-is-active': {
//       if (editingNote > -1) {
//         const noteIndex = editingNote;
//         editingNote = -1;
//         return Promise.resolve({
//           type: 'editing',
//           noteIndex
//         });
//       }
//     }

//   }
// })

// // It will return the URL for the active tab in the focused window instance
// function retrieveActiveTabURL() {
//   return browser.tabs.query({ windowId: activeWindowId, active: true }).then((tabs) => tabs[0].url);
// }

// // Refreshes the panel content with the notes list
// // It will fallback to a "no notes message" in case the array is empty
// // or the document (id: url) is missing all together
// async function refreshContent() {
//   const url = await retrieveActiveTabURL();

//   try {
//     const doc = await browser.storage.local.get(url);
    
//     if (!doc[url]) {
//       patch(vNode, h('ul', {}, [
//         h('li', {}, 'There are no notes for this page!')
//       ]));
//     } else {
//       buildSidePanelNotes(doc[url].notes).then((notesList) => {
//         // Reset the parent node
//         patch(vNode, h('ul', {}, notesList));
//       });
//     }


//   } catch (error) {
//     patch(vNode, h('ul', {}, [
//       h('li', {}, error.message)
//     ]));
//   }
// }

// // Iterates an array of objects and returns a tree of hyperscript nodes
// // to be added from snabbdom
// async function buildSidePanelNotes(notes) {
//   return notes.filter(note => !(filteringTag !== '' && !~note.tags.indexOf(filteringTag))).map((note, index) => {
//     let trimText = note.text.length > 300;
//     return (
//       h(`li.note-type--${note.type}`, {class: {'trimmed-text' : trimText}, on: {click: captureClickEvents}}, [
//         h('div.note-content', {}, [
//           h('p', {}, 
//             trimText ? [h('span.visible-text', note.text.slice(0, 300)), h('span.hidden-text-fragment', note.text.slice(300))] : h('span', note.text)
//           ),
//           h('div.note-tags', {}, note.tags.map((tag) => {
//             return h('span', { on: { click: [filterNotesWithTag, tag] }, class: {'selected' : tag === filteringTag} }, `#${tag}`)
//           })),
//         ]),
//         h('div.note-tools', {}, [
//           h('a.note-tools--edit', { on: { click: [editNote, index] } }, [
//             h('svg.edit', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
//               h('use', { attrs: { 'xlink:href': "#edit" } })
//             ])
//           ]),
//           h('a.note-tools--fold', { on: { click: [toggleFoldText, index] } }, [
//             h('svg.more', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
//               h('use', { attrs: { 'xlink:href': "#more" } })
//             ]),
//             h('svg.less', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
//               h('use', { attrs: { 'xlink:href': "#less" } })
//             ])
//           ]),
//           h('a.note-tools--delete', { on: { click: [deleteNote, index] } }, [
//             h('svg.delete', { attrs: { width: 24, height: 24, viewBox: '0 0 24 24' } }, [
//               h('use', { attrs: { 'xlink:href': "#delete" } })
//             ])
//           ]),
//         ])
//       ])
//     )
//   });
// }

// function filterNotesWithTag(tag) {
//   filteringTag = filteringTag === tag ? '' : tag;
//   refreshContent();
// }

function editNote(noteIndex, event) {
  event.cancelBubble = true;
  editingNote = noteIndex;
  browser.browserAction.openPopup();
}

// function deleteNote(index) {
//   event.cancelBubble = true;
//   const url = await retrieveActiveTabURL();
//   if (window.confirm(`Are you sure you want to delete this note?`)) {
//     browser.runtime.sendMessage({
//       type: 'delete-note',
//       body: {
//         id: url,
//         index: noteIndex,
//       }
//     });
//   }
// }

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