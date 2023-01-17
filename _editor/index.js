import Root from './src/Root';
import './src/sass/index.scss';
import { setSceneItem } from './src/sceneData/sceneItems';

document.addEventListener('DOMContentLoaded', () => {
  const root = new Root();
  setSceneItem('root', root);
});
