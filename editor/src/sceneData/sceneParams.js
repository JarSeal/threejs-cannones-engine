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

export const getSceneParam = (key, defaultValue) =>
  sceneParams[key] === undefined ? defaultValue : sceneParams[key];
export const getSceneParamR = (keys, defaultValue) => {
  const pKeys = keys.split('.');
  let value = sceneParams[pKeys[0]];
  console.log('RECURSIVE-0', value);
  if (value === undefined) return defaultValue;
  for (let i = 1; i < pKeys.length; i++) {
    console.log('RECURSIVE-' + i, value);
    if (value[pKeys[i]] === undefined) return defaultValue;
    value = value[pKeys[i]];
    console.log('RECURSIVE-' + i, value);
  }
  return value;
};

export const setSceneParam = (key, value) => (sceneParams[key] = value);
export const setSceneParamR = (keys, value) => {
  const pKeys = keys.split('.');
  let node = sceneParams[pKeys[0]];
  if (node === undefined) node = { [pKeys[0]]: undefined };
  for (let i = 1; i < pKeys.length; i++) {
    if (node === undefined) node = { [pKeys[i]]: undefined };
    if (i + 1 === pKeys.length) {
      node[pKeys[i]] = value;
    } else {
      node = node[pKeys[i]];
    }
  }
};

export const setSceneParams = (params) => (sceneParams = params);

export const resetSceneParams = () => (sceneParams = emptyScene);
