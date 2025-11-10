import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import AuthPage from '../pages/auth/auth-page';
import StoryListPage from '../pages/story/story-list';
import StoryAddPage from '../pages/story/story-add';
import StoryMapPage from '../pages/story/story-map';
import StoryDetailPage from '../pages/story/story-detail';
import OfflineStories from '../pages/offline-stories.js';

const routes = {
  '/': HomePage,
  '/about': AboutPage,
  '/auth': AuthPage,
  // '/login': AuthPage,     
  // '/register': AuthPage, 
  '/stories': StoryListPage,
  '/add': StoryAddPage,
  '/map': StoryMapPage,
  '/story/:id': StoryDetailPage,
  '/offline': OfflineStories,
};

export default routes;
