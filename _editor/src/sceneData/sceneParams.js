const emptyScene = {
  sceneId: null,
  name: '',
  rendererClearColor: '#000000',
  grid: false,
  gridSize: 26,
  axesHelper: false,
  axesHelperLength: 100,
  shadowType: null,
  cameraIndex: 0,
  aspectRatio: 0,
  pixelRatio: 0,
  cameras: [],
  lights: [],
  elements: [],
  selection: [],
};

let sceneParams = { ...emptyScene };

export const getSceneParams = () => sceneParams;

export const getSceneParam = (key, defaultValue) =>
  sceneParams[key] === undefined ? defaultValue : sceneParams[key];
export const getSceneParamR = (keys, defaultValue) => {
  const pKeys = keys.split('.');
  let value = sceneParams[pKeys[0]];
  if (value === undefined) return defaultValue;
  for (let i = 1; i < pKeys.length; i++) {
    if (value[pKeys[i]] === undefined) return defaultValue;
    value = value[pKeys[i]];
  }
  return value;
};

export const setSceneParam = (key, value) => (sceneParams[key] = value);
export const setSceneParamR = (keys, value) => {
  if (!keys) return;
  const pKeys = keys.split('.');
  pKeys.reduce((obj, level, index) => {
    if (index + 1 === pKeys.length) {
      obj[level] = value;
      return false;
    }
    const result = obj && obj[level];
    if (result === undefined) obj[level] = { [pKeys[index + 1]]: undefined };
    return obj[level];
  }, sceneParams);
};

export const setSceneParams = (params) => (sceneParams = params);

export const resetSceneParams = () => (sceneParams = { ...emptyScene });
