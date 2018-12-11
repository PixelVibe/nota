export default class Storage {
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
  }

  // Put single
  async createNote({ id, data } = note) {
    const dbObject = await this.retrieveNotesForUrl(id);
    console.log('edit', data);
    let doc = {};
    if (!dbObject) {
      doc[id] = data;
    } else {
      doc[id] = dbObject;
      // Check if the document is in edit mode
      if (data.editingInfo.isEditing) {
        doc[id].notes.splice(data.editingInfo.index, 1, data.notes[0]);
      } else {
        doc[id].notes = [data.notes[0], ...dbObject.notes];
      }
    }

    // Store the new/updated document
    browser.storage.local.set(doc);
  }

  // Delete notes
  async deleteNote({id, index} = noteInfo) {
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
