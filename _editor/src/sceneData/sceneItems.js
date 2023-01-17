import { removeMeshFromScene } from '../utils/utils';

const emptyItems = {
  renderer: null,
  cameras: [],
  curCamera: null,
  elements: [],
  particles: [],
  helpers: [],
  scene: null,
  uiWorld: null,
  topTools: null,
  leftTools: null,
  resizers: [],
  smallStats: null,
  orbitControls: null,
  looping: false,
  editorIcons: [],
};

let sceneItems = { ...emptyItems };

export const getSceneItems = () => sceneItems;

export const getSceneItem = (key, defaultValue) => sceneItems[key] || defaultValue;

export const setSceneItem = (key, value) => (sceneItems[key] = value);

export const resetSceneItems = () => {
  setSceneItem('looping', false);
  const scene = getSceneItem('scene');
  removeMeshFromScene(scene);
  const renderer = getSceneItem('renderer');
  _clearRenderer(renderer);
  emptySceneItems();
};

const _clearRenderer = (renderer) => renderer && renderer.dispose();

export const emptySceneItems = () => {
  const root = getSceneItem('root');
  const rootWrap = getSceneItem('rootWrap');
  const dialog = getSceneItem('dialog');
  const toaster = getSceneItem('toaster');
  sceneItems = { ...emptyItems, root, rootWrap, dialog, toaster };
};
