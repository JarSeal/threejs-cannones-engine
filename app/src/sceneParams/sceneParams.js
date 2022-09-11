const emptyScene = {
  id: null,
  renderer: null,
  rendererElemId: 'main-stage',
  scene: null,
  camera: null,
  cameraControls: null,
  screenResolution: { x: 0, y: 0 },
  aspectRatio: 0,
  pixelRatio: 0,
};

let sceneParams = emptyScene;

export const getSceneParams = () => sceneParams;

export const getSceneParam = (key) => sceneParams[key];

export const setSceneParam = (key, value) => (sceneParams[key] = value);

export const resetSceneParams = () => (sceneParams = emptyScene);
