import { LocalStorage } from '../../LIGHTER';
import { getSceneParam, getSceneParams } from './sceneParams';

const LS = new LocalStorage('ft_');

const LSKeysJson = [
  'cameras',
  'editor',
  'sceneState',
  'elements',
  'lights',
  'textures',
  'cubetextures',
];
const LSKeysStrings = ['sceneId', 'projectFolder'];

// Get all scene state values
export const getSceneStates = () => {
  let states = {};
  for (let i = 0; i < LSKeysJson.length; i++) {
    const key = LSKeysJson[i];
    const value = LS.getItem(key);
    if (!value) continue;
    if (key === 'sceneState') {
      const values = JSON.parse(value);
      states = { ...states, ...values };
    } else {
      states[key] = JSON.parse(value);
    }
  }
  for (let i = 0; i < LSKeysStrings.length; i++) {
    const key = LSKeysStrings[i];
    const value = LS.getItem(key);
    if (value) states[key] = value;
  }
  return states;
};

export const saveSceneId = (id) => LS.setItem('sceneId', id);
export const getSceneId = () => LS.getItem('sceneId');
export const saveProjectFolder = (name) => LS.setItem('projectFolder', name);
export const getProjectFolder = () => LS.getItem('projectFolder');
export const removeProjectFolderAndSceneId = () =>
  LS.removeItem('sceneId') && LS.removeItem('projectFolder');
export const clearProjectData = () => {
  for (let i = 0; i < LSKeysJson.length; i++) {
    const key = LSKeysJson[i];
    LS.removeItem(key);
  }
  for (let i = 0; i < LSKeysStrings.length; i++) {
    const key = LSKeysStrings[i];
    LS.removeItem(key);
  }
  LS.removeItem('hasUnsavedChanges');
};

export const saveCameraState = (values) => {
  if (values === undefined) return;
  // For camera the params and values are (object): {
  // - index: number (camera index number)
  // - quaternion: THREE.Vector3
  // - position: THREE.Vector3
  // - target: THREE.Vector3 (if the camera has orbitControls)
  // - orthoViewSize: number (if the camera is an orthographic camera)
  // }
  if (values.index !== undefined) {
    const newParams = {};

    if (values.quaternion && Array.isArray(values.quaternion)) {
      newParams.quaternion = values.quaternion;
    } else if (values.quaternion) {
      newParams.quaternion = [
        values.quaternion.x,
        values.quaternion.y,
        values.quaternion.z,
        values.quaternion.w,
      ];
    }

    if (values.position && Array.isArray(values.position)) {
      newParams.position = values.position;
    } else if (values.position)
      newParams.position = [values.position.x, values.position.y, values.position.z];

    if (values.target && Array.isArray(values.target)) {
      newParams.target = values.target;
    } else if (values.target) {
      newParams.target = [values.target.x, values.target.y, values.target.z];
      newParams.lookAt = null;
    }
    if (values.fov) newParams.fov = values.fov;

    const cameraParams = getSceneParam('cameras');
    if (values.index !== undefined) {
      cameraParams[values.index] = { ...cameraParams[values.index], ...newParams };
    }
    if (cameraParams.length) LS.setItem('cameras', JSON.stringify(cameraParams));
  } else if (values.removeIndex !== undefined) {
    // Remove a camera
    const cameras = getSceneParam('cameras');
    LS.setItem('cameras', JSON.stringify(cameras && cameras.length ? cameras : []));
  }
  setHasUnsavedChanges();
};

export const saveAllCamerasState = (cameras) => {
  if (cameras?.length) LS.setItem('cameras', JSON.stringify(cameras));
  setHasUnsavedChanges();
};

export const saveAllLightsState = () => {
  const lights = getSceneParam('lights');
  if (lights?.length) LS.setItem('lights', JSON.stringify(lights));
  setHasUnsavedChanges();
};

export const saveEditorState = (values) => {
  if (values === undefined) return;
  const editorParams = getSceneParam('editor');
  let newParams;
  if (values?.show) {
    let showParams;
    if (editorParams?.show) {
      showParams = { show: { ...editorParams.show, ...values.show } };
    } else {
      showParams = { show: values.show };
    }
    newParams = { ...editorParams, ...showParams };
  } else if (values?.rightPanelScrollTop) {
    let scrollParams;
    if (editorParams?.rightPanelScrollTop) {
      scrollParams = {
        rightPanelScrollTop: { ...editorParams.rightPanelScrollTop, ...values.rightPanelScrollTop },
      };
    } else {
      scrollParams = { rightPanelScrollTop: values.rightPanelScrollTop };
    }
    newParams = { ...editorParams, ...scrollParams };
  } else {
    // Flat object
    newParams = { ...editorParams, ...values };
  }
  if (newParams) LS.setItem('editor', JSON.stringify(newParams));
  setHasUnsavedChanges();
};

export const saveSceneState = (values) => {
  if (values === undefined) values = {};
  const sceneParams = { ...getSceneParams() }; // New copy
  delete sceneParams.sceneId;
  delete sceneParams.cameras;
  delete sceneParams.elements;
  delete sceneParams.lights;
  delete sceneParams.editor;
  delete sceneParams.textures;
  delete sceneParams.cubetextures;
  const newParams = { ...sceneParams, ...values };
  if (newParams) LS.setItem('sceneState', JSON.stringify(newParams));
  setHasUnsavedChanges();
};

export const saveStateByKey = (key, values) => {
  if (LSKeysJson.includes(key)) LS.setItem(key, JSON.stringify(values));
  setHasUnsavedChanges();
};

export const getHasUnsavedChanges = () => LS.getItem('hasUnsavedChanges', false);
const setHasUnsavedChanges = () => {
  LS.setItem('hasUnsavedChanges', true);
};
export const unsetHasUnsavedChanges = () => {
  LS.setItem('hasUnsavedChanges', false);
};
