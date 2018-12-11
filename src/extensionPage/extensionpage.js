const app = document.getElementById('app');

browser
  .storage
  .local
  .get()
  .then((res) => {
    const notes = document.createElement('div');
    for (const key in res) {
      if (res.hasOwnProperty(key)) {
        const notesHeader = document.createElement('div');
        notesHeader.innerHTML = `<h2>${key}</h2>`;
        const notesList = document.createElement('ul');
        notesList.classList.add('notesList');
        notesList.innerHTML = res[key].notes.map((note) => {
          return `<li class="note-type--${note.type}">
            <div class="note-content">
              <p><span>${note.text}</span></p>
              <div class="note-tags">
                ${note.tags.map((tag) => {
                  return `<span>#${tag}</span>`
                })}
              </div>
            </div>
          </li>`;
        })
        .join('');
        notes.appendChild(notesHeader);
        notes.appendChild(notesList);
      }
    }
    app.appendChild(notes);
  })
  .catch((error) => {
    console.log(error);
  })