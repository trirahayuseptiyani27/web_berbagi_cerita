// src/scripts/data/story-idb.js
import { openDB } from 'idb';

const DATABASE_NAME = 'storymap-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      const store = database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      store.createIndex('title', 'title', { unique: false });
      store.createIndex('date', 'date', { unique: false });
    }
  },
});

const StoryIDB = {
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async getStory(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async putStory(story) {
    // ✅ Simpan file gambar sebagai base64
    if (story.photoFile instanceof File) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(story.photoFile);
      });
      story.photoBase64 = base64;
      delete story.photoFile; // hapus properti File mentah
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, Number(id));
  },
};

export default StoryIDB;
