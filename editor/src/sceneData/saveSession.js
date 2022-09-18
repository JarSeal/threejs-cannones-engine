import { LocalStorage } from '../../LIGHTER';
import { getSceneParam, getSceneParams } from './sceneParams';

const LS = new LocalStorage('ft_');

const LSKeysJson = ['cameras', 'editor', 'sceneState'];
const LSKeysStrings = ['sceneId'];

// Get all scene state values
export const getSceneStates = async () =>
  Promise.resolve().then(() => {
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
  });

export const saveSceneId = (id) => LS.setItem('sceneId', id);

export const saveCameraState = (values) => {
  if (values === undefined) return;
  // For camera the values are: {
  // - index: number (camera index number)
  // - quaternion: THREE.Vector3
  // - position: THREE.Vector3
  // - target: THREE.Vector3 (if the camera has orbitControls)
  // }
  if (values.index !== undefined) {
    const newParams = {};
    if (values.quaternion)
      newParams.quaternion = [
        values.quaternion.x,
        values.quaternion.y,
        values.quaternion.z,
        values.quaternion.w,
      ];
    if (values.position)
      newParams.position = [values.position.x, values.position.y, values.position.z];
    if (values.target) {
      newParams.target = [values.target.x, values.target.y, values.target.z];
      newParams.lookAt = null;
    }
    if (values.fov) newParams.fov = values.fov;

    const cameraParams = getSceneParam('cameras');
    cameraParams[values.index] = { ...cameraParams[values.index], ...newParams };
    if (cameraParams.length) LS.setItem('cameras', JSON.stringify(cameraParams));
  } else {
    // TODO: Add / Remove a camera
  }
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
  } else {
    // Flat object
    newParams = { ...editorParams, ...values };
  }
  if (newParams) LS.setItem('editor', JSON.stringify(newParams));
};

export const saveSceneState = (values) => {
  if (values === undefined) return;
  const sceneParams = { ...getSceneParams() };
  delete sceneParams.sceneId;
  delete sceneParams.cameras;
  delete sceneParams.elements;
  delete sceneParams.lights;
  delete sceneParams.editor;
  const newParams = { ...sceneParams, ...values };
  if (newParams) LS.setItem('sceneState', JSON.stringify(newParams));
};