import { h, render, Component } from "preact";
const container = document.getElementById('notesContainer');

class SidePanelNotes extends Component {
  constructor() {
    super();
    this.state.notes = [];
    this.state.types = ['interesting', 'review', 'other'];
    this.state.filterByTag = '';
    this.state.filterByType = '';
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.updateState();
    browser.webNavigation.onCompleted.addListener(this.updateState);
    browser.tabs.onActivated.addListener(this.updateState);
    browser.storage.onChanged.addListener(this.updateState);
  }

  updateState() {
    retrieveActiveTabURL()
      .then((tabUrl) => {
        browser.storage.local
          .get(tabUrl)
          .then((results) => {
            // Check if we have anything for the active url
            if (!results[tabUrl]) {
              this.setState({notes: []});
            } else {
              this.setState({notes: results[tabUrl].notes});
            }
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
        <a href="#" className="note-tools--edit" onClick={() => {
          editNote(index);
        }}>
          <svg className="edit" width='24' height='24' viewBox='0 0 24 24'>
            <use xlinkHref="#edit" />
          </svg>
        </a>
        <a href="#" className="note-tools--fold" onClick={(e) => {
          e.preventDefault();
          this.base.childNodes[1].childNodes[index].classList.toggle('open');
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
    let filteredNotesIdx = [];
    const notes =
      state
        .notes
        .filter((note, index) => {
          if (state.filterByType === '' || state.filterByType == note.type) {
            filteredNotesIdx.push(index);
            return true;
          } else {
            return false;
          }
        })
        .map((note, index) => {
          const trimText = note.text.length > 400;
          return (
            <li className={[trimText ? 'folded' : '', 'note-type--' + note.type].join(' ')}>
              {this.renderNoteTools(filteredNotesIdx[index])}
              <div className="note-content">
                <p>{note.text}</p>
                <div className="note-tags">{note.tags.map((tag) => <span>#{tag}</span>)}</div>
              </div>

            </li>
          )
        });
    if (notes.length === 0) {
      return <li><h3>{browser.i18n.getMessage("panelNoNotes")}</h3></li>
    } else {
      return notes;
    }
  }

  renderNoteslistToolbar(state) {
    if (state.filterByType === '') {
      return (
        <div>
          <span>{browser.i18n.getMessage("panelViewAllNotesInfo")}</span>
          {this.state.types.map((type) => {
            return <a href="#" title={type} className={['note-type-selector', 'note-type--' + type].join(' ')} onClick={() => {
              this.setState({
                filterByType: type
              })
            }}></a>
          })}
        </div>
      )
    } else {
      return (<a href="#" onClick={() => this.setState({filterByType: ''})}>
        <span>{browser.i18n.getMessage("panelViewFilteredNotesOfType") + ' ' + state.filterByType}</span>
      </a>)
    }
  }

  render(_props, state) {
    return (
      <div>
        <div className="info">
          {this.renderNoteslistToolbar(state)}
        </div>
        <ul className="notes">
          {this.renderNoteItems(state)}
        </ul>
      </div>
    )
  }
}

render(<SidePanelNotes />, container);

async function deleteNote(index) {
  const url = await retrieveActiveTabURL();
  
  if (window.confirm(browser.i18n.getMessage("panelDeleteNoteConfirmation"))) {
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

let editingNote = -1;

function editNote(noteIndex, event) {
  editingNote = noteIndex;
  browser.browserAction.openPopup();
}

function captureClickEvents(event, node) {
  switch(event.target.className) {
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

// Listen for incoming messages from other parts of the extension
browser.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
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