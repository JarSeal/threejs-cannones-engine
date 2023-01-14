import { removeMeshFromScene } from '../utils/utils';

const emptyItems = {
  renderer: null,
  cameras: [],
  curCamera: null,
  elements: [],
  particles: [],
  helpers: [],
  scene: null,
  physicsNonMoving: [],
  physicsMoving: [],
  physicsParticles: [],
  uiWorld: null,
  resizers: [],
  renderStats: null,
  orbitControls: null,
  looping: false,
  editorIcons: [],
};

let sceneItems = emptyItems;

export const getSceneItems = () => sceneItems;

export const getSceneItem = (key, defaultValue) => sceneItems[key] || defaultValue;

export const setSceneItem = (key, value) => (sceneItems[key] = value);

export const resetSceneItems = () => {
  setSceneItem('looping', false);
  const scene = getSceneItem('scene');
  _clearScene(scene);
  const renderer = getSceneItem('renderer');
  _clearRenderer(renderer);
  sceneItems = emptyItems;
};

const _clearScene = (scene) => {
  if (!scene) return;
  scene.traverse((obj) => removeMeshFromScene(obj));
};

const _clearRenderer = (renderer) => renderer && renderer.dispose();
