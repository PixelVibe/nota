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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/global/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/global/Storage.js":
/*!*******************************!*\
  !*** ./src/global/Storage.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Storage; });
class Storage {
  // Retrieve single
  async retrieveNotesForUrl(id, index = false) {
    try {
      const res = await browser.storage.local.get(id);

      if (index) {
        return res[id].notes[index];
      } else {
        return res[id];
      }
    } catch (error) {
      console.log("something went wrong", error.message);
    }
  } // Put single


  async createNote({
    id,
    data
  } = note) {
    const dbObject = await this.retrieveNotesForUrl(id);
    let doc = {};
    console.log(dbObject); // If the

    if (!dbObject) {
      doc[id] = data;
    } else {
      doc[id] = dbObject; // Check if the document is in edit mode

      if (data.editingInfo.isEditing) {
        console.log('edit', data);
        doc[id].notes.splice(data.editingInfo.index, 1, data.notes[0]);
      } else {
        doc[id].notes = [data.notes[0], ...dbObject.notes];
      }
    } // Store the new/updated document


    browser.storage.local.set(doc);
  } // Delete notes


  async deleteNote({
    id,
    index
  } = noteInfo) {
    try {
      const dbObject = await this.retrieveNotesForUrl(id);
      let doc = {};
      doc[id] = dbObject;
      doc[id].notes.splice(index, 1);
      browser.storage.local.set(doc); // const document = await this.retrieveNotesForUrl(noteInfo._id);
      // document.notes.splice(noteInfo.index, 1);
      // const result = await this.db.put(document);
      // // Notify areas that need to be updated like the side panel and the extension page
      // browser.runtime.sendMessage({
      //   type: "refresh-content",
      //   body: {
      //     id: result.id
      //   }
      // });
    } catch (error) {
      console.log("there was an error while trying to delete the note", error);
    }
  } // Sync with remote?


  syncDb() {}

}

/***/ }),

/***/ "./src/global/index.js":
/*!*****************************!*\
  !*** ./src/global/index.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Storage */ "./src/global/Storage.js");

const notaExtensionDb = new _Storage__WEBPACK_IMPORTED_MODULE_0__["default"]('notaExtensionDb'); // let note = {};

browser.runtime.onMessage.addListener(message => {
  // console.log('kkk', message);
  switch (message.type) {
    case 'fetch-notes-for-active-tab-url':
      {
        try {
          let noteIndexToRetrieve = message.noteIndex > -1 ? message.noteIndex : false;
          return notaExtensionDb.retrieveNotesForUrl(message.docId, noteIndexToRetrieve);
        } catch (error) {
          console.log('Error while fetching notes ', error);
        }

        break;
      }
    // New notes coming from the popup action and not from selected text

    case 'new-note':
      {
        createNewNote(message.body);
        break;
      }

    case 'delete-note':
      {
        deleteNote(message.body);
        break;
      }

    case 'selected-text':
      {
        console.log(message.body);
        break; // createNewNote(note);
      }
  }
}); // Context menu

browser.contextMenus.onClicked.addListener(OnClickData => {
  let type;

  switch (OnClickData.menuItemId) {
    case 'highlight-interesting':
      {
        type = 'interesting';
        break;
      }

    case 'highlight-review':
      {
        type = 'review';
        break;
      }

    case 'highlight-other':
      {
        type = 'other';
        break;
      }
  } // note = {
  //   id: OnClickData.pageUrl,
  //   data: {
  //     editingInfo: {
  //       isEditing: false
  //     },
  //     notes: [{
  //       text: OnClickData.selectionText,
  //       type, tags: []
  //     }],
  //     meta: []
  //   }
  // }
  // console.log(note);


  createNewNote({
    id: OnClickData.pageUrl,
    data: {
      editingInfo: {
        isEditing: false
      },
      notes: [{
        text: OnClickData.selectionText,
        type,
        tags: []
      }],
      meta: []
    }
  }); // browser.tabs.executeScript({
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
  contexts: ["selection"]
});
browser.contextMenus.create({
  id: "highlight-review",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightReview"),
  contexts: ["selection"]
});
browser.contextMenus.create({
  id: "highlight-other",
  type: "normal",
  title: browser.i18n.getMessage("contextMenuItemHighlightOther"),
  contexts: ["selection"]
}); // Functions to handle events

function createNewNote(note) {
  console.log(note);
  notaExtensionDb.createNote(note);
}

function deleteNote(note) {
  notaExtensionDb.deleteNote(note);
}

/***/ })

/******/ });
//# sourceMappingURL=index.js.map