import PouchDb from 'pouchdb'

// _id: string,
// notes: [{
//   text: string,
//   type: string,
//   tags: [] string,
// }]

export default class Storage {

  config = {
    include_docs: true,
  }

  constructor(dbName /* string */) {
    this.db = new PouchDb(dbName);
  }

  // Retrieve single
  retrieveNotesForUrl(id, index = false) {
    if (index !== false) {
      return this.db.get(id).then((results) => results.notes[index]);
    } else {
      return this.db.get(id);
    }
  }

  // Put single
  async createNote(document) {
    try {
      const existingDoc = await this.retrieveNotesForUrl(document._id);
      console.log(document.editingInfo);
      if (document.editingInfo.isEditing) {
        existingDoc.notes.splice(document.editingInfo.index, 1, document.notes[0]);
      } else {
        existingDoc.notes.push(document.notes[0]);
      }
      try {
        const result = await this.db.put(existingDoc);

        // Notify areas that need to be updated like the side panel and the extension page
        browser.runtime.sendMessage({
          type: 'refresh-content',
          body: {
            id: result.id,
          }
        });

      } catch (error) {
        console.log('error while trying to update a document', error);
      }
    } catch (error) {
      // If it is missing create a new one
      if (error.status === 404) {
        try {
          const result = await this.db.put(document);

          // Notify areas that need to be updated like the side panel and the extension page
          browser.runtime.sendMessage({
            type: 'refresh-content',
            body: {
              id: result.id,
            }
          });

          // Let the initiator know that the document has been saved into the db
          return Promise.resolve(result.id);

        } catch (error) {
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  }

  // Delete notes
  deleteNotes(noteIndex) {
    // 
  }

  // Sync with remote?
  syncDb() { }
}