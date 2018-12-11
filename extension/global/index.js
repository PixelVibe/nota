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
  async retrieveNotesForUrl(id, index = -1) {
    try {
      const res = await browser.storage.local.get(id);

      if (index > -1) {
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

    if (!dbObject) {
      doc[id] = data;
    } else {
      doc[id] = dbObject; // Check if the document is in edit mode

      if (data.editingInfo.isEditing) {
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
      browser.storage.local.set(doc);
    } catch (error) {
      console.log("there was an error while trying to delete the note", error);
    }
  }

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

const bjExtensionDb = new _Storage__WEBPACK_IMPORTED_MODULE_0__["default"]();
browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case 'fetch-notes-for-active-tab-url':
      {
        try {
          return bjExtensionDb.retrieveNotesForUrl(message.docId, message.noteIndex);
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

    case 'open-extension-page':
      {
        openExtensionPage();
        break;
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
  }

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
  bjExtensionDb.createNote(note);
}

function deleteNote(note) {
  bjExtensionDb.deleteNote(note);
}

var createData = {
  type: "detached_panel",
  url: "./extensionPage/index.html",
  width: 800,
  height: 600
};

function openExtensionPage() {
  var creating = browser.windows.create(createData);
}

/***/ })

/******/ });
//# sourceMappingURL=index.js.map