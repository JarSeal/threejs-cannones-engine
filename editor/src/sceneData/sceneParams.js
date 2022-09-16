const emptyScene = {
  sceneId: null,
  name: '',
  rendererElemId: 'main-stage',
  rendererAntialias: false,
  rendererClearColor: '#000000',
  orbitControls: true,
  shadowType: null,
  cameraIndex: 0,
  screenResolution: { x: 0, y: 0 },
  aspectRatio: 0,
  pixelRatio: 0,
  cameras: [],
  lights: [],
  elements: [],
};

let sceneParams = emptyScene;

export const getSceneParams = () => sceneParams;

export const getSceneParam = (key) => sceneParams[key];

export const setSceneParam = (key, value) => (sceneParams[key] = value);

export const setSceneParams = (params) => (sceneParams = params);

export const resetSceneParams = () => (sceneParams = emptyScene);
