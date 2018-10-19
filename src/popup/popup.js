const form = document.getElementById('new-note-form');
const notification = document.getElementById('notifyUser');
const tagsInput = document.getElementById('note-tags');
const tagsList = document.getElementById('tags-list');

const tags = new Set();

browser.runtime.sendMessage({
  type: 'popup-is-active'
})
.then(async (response) => {
  if (response.type && response.type === 'editing') {
    try {
      const url = await retrieveUrlForTheActiveTab();
      const responseWithNote = await browser.runtime.sendMessage({
        type: 'fetch-notes-for-active-tab-url',
        docId: url[0].url,
        noteIndex: response.noteIndex,
      });
      console.log(responseWithNote);
    } catch (error) {
      console.log('skata ', error);
    }
  }
})
.catch((error) => {
  console.log('error')
})

form.addEventListener('submit', (elem) => {
	elem.preventDefault();
	const formDataJson = [].reduce.call(form.elements, (acc, item) => {
    if(item.checked || item.checked === undefined) {
      acc[item.name] = item.value;
    }
    return acc;
  }, {});
  
  if (formDataJson.noteContent === '') {
  	notifyUser({
    	type: 'info',
      body: 'Hey, you need to add some content at least!',
    });
    return;
  }

  submitForm(formDataJson);
})

function retrieveUrlForTheActiveTab() {
  return browser
    .windows
    .getCurrent()
    .then((currentWindow) => currentWindow.id)
    .then((windowId) => browser.tabs.query({windowId, active: true}))
    .catch((error) => {
      console.log('Error while trying to retrieve the current url');
      console.log(error);
    })
}

async function submitForm(formDataJson) {
  const currentTab = await retrieveUrlForTheActiveTab();
  const _id = currentTab[0].url;

  try {
    await browser.runtime.sendMessage({
      type: 'new-note',
      body: {
        _id,
        notes: [{
          text: formDataJson['note-content'],
          type: formDataJson['note-type'],
          tags: Array.from(tags),
        }]
      }
    });
    window.close();
  } catch(error) {
    notifyUser({
      type: 'error',
      body: 'Ooopps, something went wrong while trying to save the note!',
      payload: error,
    });
    console.log(error);
  }
}

function updateTagsListDOM() {
  const tagsElems = Array.from(tags)
    .filter((item) => item.toString().trim() !== '')
  	.map((item) => `<span class="tag">#${item}</span>`)
    .reduce((acc, item) => {
	  	acc = acc + item;
      return acc;
  }, '');
  tagsList.innerHTML = tagsElems;
}

function updateTagsList(event) {
	if (!tags.has(event.target.value)) {
		tags.add(event.target.value);
    updateTagsListDOM();
    event.target.value = '';
  }
  return false;
}

tagsInput.addEventListener('change', updateTagsList);
tagsInput.addEventListener('select', updateTagsList);

function notifyUser(msg) {
  notification.className = `notify-${msg.type}`;

  if (msg.type === 'error') {
    notification.innerText = `${msg.body}
please open an issue ticket describing your steps and
paste the following message as well
↓

${msg.payload}`;
  } else {
    notification.innerText = msg.body;
  }
}