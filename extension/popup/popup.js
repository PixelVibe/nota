/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/popup/popup.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/popup/popup.js":
/*!****************************!*\
  !*** ./src/popup/popup.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

const form = document.getElementById('new-note-form');
const notification = document.getElementById('notifyUser');
const tagsInput = document.getElementById('note-tags');
const tagsList = document.getElementById('tags-list');
let tags = new Set();
const editingInfo = {
  isEditing: false // Notify that the popup is visible and use it in other parts of the extension
  // to respond back with an "editing" note message for example!

};
browser.runtime.sendMessage({
  type: 'popup-is-active'
}).then(async response => {
  if (response.type && response.type === 'editing') {
    // Set a flag to read it in our event listener when it receives the message for a new note
    editingInfo.isEditing = true;

    try {
      // We need it to get the URL
      const tab = await getActiveTab(); // Keep some info for the editing note, so that we can send it over
      // when submiting the form

      editingInfo.url = tab[0].url;
      editingInfo.index = response.noteIndex; // The response is a single object from the notes array.

      const responseWithNote = await browser.runtime.sendMessage({
        type: 'fetch-notes-for-active-tab-url',
        docId: editingInfo.url,
        noteIndex: editingInfo.index
      }); // Update the tags set

      tags = new Set(responseWithNote.tags);
      updateTagsListDOM(); // Text area and type of highlight are in the form element

      updateFormWithNoteInformation(responseWithNote);
    } catch (error) {
      console.log(error);
    }
  }
}).catch(error => {
  // Catch error that might occur because there is no response when the pop up
  // sends the message that is active
  if (!error instanceof TypeError && !error.message == 'response is undefined') {
    console.log(error);
  }
});
form.addEventListener('submit', elem => {
  elem.preventDefault();
  const formDataJson = [].reduce.call(form.elements, (acc, item) => {
    if (item.checked || item.checked === undefined) {
      acc[item.name] = item.value;
    }

    return acc;
  }, {});

  if (formDataJson['note-content'] === '') {
    notifyUser({
      type: 'info',
      body: 'Hey, you need to add some content at least!'
    });
    return;
  }

  submitForm(formDataJson);
});

function getActiveTab() {
  return browser.windows.getCurrent().then(currentWindow => currentWindow.id).then(windowId => browser.tabs.query({
    windowId,
    active: true
  })).catch(error => {
    console.log('Error while trying to retrieve the current url');
    console.log(error);
  });
}

async function submitForm(formDataJson) {
  const currentTab = await getActiveTab();
  const id = currentTab[0].url;

  try {
    await browser.runtime.sendMessage({
      type: 'new-note',
      body: {
        id,
        data: {
          editingInfo,
          notes: [{
            text: formDataJson['note-content'],
            type: formDataJson['note-type'],
            tags: Array.from(tags)
          }]
        }
      }
    });
    window.close();
  } catch (error) {
    notifyUser({
      type: 'error',
      body: 'Ooopps, something went wrong while trying to save the note!',
      payload: error
    });
    console.log(error);
  }
} // Go through the tags set and create the dom elements for display


function updateTagsListDOM() {
  const tagsElems = Array.from(tags).filter(item => item.toString().trim() !== '').map(item => `<span class="tag">#${item}</span>`).reduce((acc, item) => {
    acc = acc + item;
    return acc;
  }, '');
  tagsList.innerHTML = tagsElems;
}

function addTagToTheList(event) {
  tags.add(event.target.value);
  event.target.value = '';
  updateTagsListDOM();
}

function removeTagFromTheList(tag) {
  tags.delete(tag);
  updateTagsListDOM();
}

tagsInput.addEventListener('change', addTagToTheList);
tagsInput.addEventListener('select', addTagToTheList);
tagsList.addEventListener('click', event => {
  const tagName = event.target.textContent.substring(1);
  removeTagFromTheList(tagName);
});

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

function updateFormWithNoteInformation(note) {
  [...form.elements].forEach(elem => {
    switch (elem.name) {
      case 'note-content':
        {
          elem.innerText = note.text;
          break;
        }

      case 'note-type':
        {
          elem.value === note.type ? elem.checked = true : elem.checked = false;
          break;
        }
    }
  });
}

/***/ })

/******/ });
//# sourceMappingURL=popup.js.map