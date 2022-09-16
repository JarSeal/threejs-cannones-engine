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
  cameraControls: null,
  looping: false,
};

let sceneItems = emptyItems;

export const getSceneItems = () => sceneItems;

export const getSceneItem = (key) => sceneItems[key];

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
  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.geometry.dispose();
    if (Array.isArray(obj.material)) {
      obj.material.forEach((mat) => mat.dispose());
    } else {
      obj.material.dispose();
    }
    obj.removeFromParent();
    scene.remove(obj);
  });
};

const _clearRenderer = (renderer) => renderer && renderer.dispose();
