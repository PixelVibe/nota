import { h, render, Component } from "preact";
const app = document.getElementById("app");

class NotesListFull extends Component {
  constructor() {
    super();
    this.state.notes;
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.updateState();
    browser.storage.onChanged.addListener(this.updateState);
  }

  updateState() {
    browser.storage.local.get().then(notes => {
      this.setState({ notes });
    });
  }

  renderNoteGroups(state) {
    let a = [];
    for (const key in state.notes) {
      if (state.notes.hasOwnProperty(key)) {
        a.push(
          <h2>
            <a onClick={(e) => {openTab(key, e)}}>{key}</a>
          </h2>
        );
        a.push(
          <ul>
            {
              state
                .notes[key]
                .notes
                .map((note, index) => {
                  return (
                    <li className={'note-type--' + note.type}>
                      <div className="note-content">
                        <p><span>{note.text}</span></p>
                      </div>
                      <div className="note-tools">
                        <a href="#" className="note-tools--delete" onClick={(e) => deleteNote(index, key, e)}>
                          <svg className="delete" width='24' height='24' viewBox='0 0 24 24'>
                            <use xlinkHref="#delete" />
                          </svg>
                        </a>
                      </div>
                    </li>
                  )
                })
            }
          </ul>
        )
      }
    }
    return a;
  }

  render(_props, state) {
    return <div>{this.renderNoteGroups(state)}</div>;
  }
}

async function deleteNote(noteIndex, url, event) {
  event.cancelBubble = true;
  if (window.confirm(browser.i18n.getMessage("panelDeleteNoteConfirmation"))) {
    browser.runtime.sendMessage({
      type: 'delete-note',
      body: {
        id: url,
        index: noteIndex,
      }
    });
  }
}

function openTab(ref, event) {
  event.preventDefault();
  browser.tabs.create({url: ref})
}

render(<NotesListFull />, app);