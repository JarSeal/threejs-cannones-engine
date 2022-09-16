import { LocalStorage } from '../../LIGHTER';
import { getSceneParam } from '../sceneData/sceneParams';

const LS = new LocalStorage('ft_');

const LSKeysJson = ['cameras', 'editor'];
const LSKeysStrings = ['sceneId'];

// Get all scene state values
export const getSceneStates = () => {
  const states = {};
  for (let i = 0; i < LSKeysJson.length; i++) {
    const key = LSKeysJson[i];
    const value = LS.getItem(key);
    if (value) states[key] = JSON.parse(value);
  }
  for (let i = 0; i < LSKeysStrings.length; i++) {
    const key = LSKeysStrings[i];
    const value = LS.getItem(key);
    if (value) states[key] = value;
  }
  return states;
};

export const saveSceneId = (id) => LS.setItem('sceneId', id);

export const saveCameraState = (values) => {
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
    if (values.target) newParams.target = [values.target.x, values.target.y, values.target.z];
    newParams.lookAt = null;
    const cameraParams = getSceneParam('cameras');
    const allCams = cameraParams.map((c, i) => {
      if (i === values.index) return { ...c, ...newParams };
      return c;
    });
    if (allCams.length) LS.setItem('cameras', JSON.stringify(allCams));
  } else {
    // TODO: Add / Remove a camera
  }
};

export const saveEditorState = (values) => {
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
  }
  if (newParams) LS.setItem('editor', JSON.stringify(newParams));
};
