// src/scripts/presenter/story-presenter.js
class StoryPresenter {
  constructor({ view, api }) {
    this._view = view;
    this._api = api;
  }

  async loadStories() {
    try {
      const token = localStorage.getItem('token');
      const response = await this._api.getStories({ token, location: 1 });
      
      if (response.error) {
        this._view.showError(response.message);
        return;
      }

      this._view.showStories(response.listStory);
    } catch (error) {
      this._view.showError('Gagal memuat data cerita');
    }
  }

  async addStory(storyData) {
    try {
      const token = localStorage.getItem('token');
      const response = await this._api.addStory({ token, ...storyData });
      
      if (response.error) {
        this._view.showError(response.message);
        return;
      }

      this._view.showSuccess('Cerita berhasil ditambahkan');
      this._view.resetForm();
    } catch (error) {
      this._view.showError('Gagal menambahkan cerita');
    }
  }
}

export default StoryPresenter;