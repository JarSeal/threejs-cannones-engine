import { saveSceneState, saveStateByKey } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { updateCameraDefaultTransforms, updateCameraTransforms } from './toolsForCamera';
import { getObjectParams, isCameraObject } from './utils';

export const updateElemProperty = (value, id, key, args) => {
  const findId = key === 'id' ? args?.prevVal : id;
  const elem = getSceneItem('elements').find((e) => e.userData.id === findId);
  const params = getObjectParams(elem);
  const prevVal = args?.prevVal || params[key];
  const newElemParams = getSceneParam('elements').map((elem) => {
    if (elem.id === findId) return { ...elem, [key]: value };
    return elem;
  });
  params[key] = value;
  elem.userData[key] = value;
  if (key === 'id') {
    const selectionIds = getSceneParam('selection');
    const newSelectionIds = selectionIds.map((selId) => {
      if (selId === prevVal) return value;
      return selId;
    });
    setSceneParam('selection', newSelectionIds);
    saveSceneState({ selection: newSelectionIds });
  }
  setSceneParam('elements', newElemParams);
  saveStateByKey('elements', newElemParams);
  getSceneItem('elemTool').updateTool();
  getSceneItem('rightSidePanel').updatePanel();
  if (args?.doNotUpdateUndo !== true) {
    getSceneItem('undoRedo').addAction({
      type: 'updateElemProperty',
      prevVal: prevVal,
      newVal: value,
      id,
      key,
    });
  }
};

export const updateElemTransforms = (key, value, valueIndex, obj, args) => {
  if (typeof obj === 'string') {
    getSceneItem('scene').traverse((item) => {
      if (item.userData?.id === obj) obj = item;
    });
  }
  if (!obj) {
    console.warn(
      'Could not update elem transforms, "obj" property is missing or elem was not found in the scene.'
    );
    return;
  }
  if (typeof obj === 'string') {
    console.warn(
      `Could not update elem transforms, "obj" elem was not found in the scene with id "${obj}".`
    );
    return;
  }
  const isDefaultParameter = key.startsWith('default');

  if (isCameraObject(obj, true)) {
    // Camera targeting object
    const updateArgs = args ? { ...args, updateRightPanel: true } : { updateRightPanel: true };
    if (isDefaultParameter) {
      let posOrTar = 'position';
      if (key.includes('Target')) posOrTar = 'target';
      updateCameraDefaultTransforms(posOrTar, value, valueIndex, obj.userData.index, updateArgs);
    } else {
      updateCameraTransforms(key, value, valueIndex, obj.userData.index, updateArgs);
    }
  } else if (isCameraObject(obj)) {
    // Camera target object
    const updateArgs = args ? { ...args, updateRightPanel: true } : { updateRightPanel: true };
    if (isDefaultParameter) {
      updateCameraDefaultTransforms(
        'target',
        value,
        valueIndex,
        obj.userData.params.index,
        updateArgs
      );
    } else {
      updateCameraTransforms('target', value, valueIndex, obj.userData.params.index, updateArgs);
    }
  } else {
    // Regular elem
    const params = getObjectParams(obj);
    if (!params || params[key] === undefined || params[key][valueIndex] === undefined) {
      console.warn(
        `Could not find key "${key}" in value index "${valueIndex}" in object params`,
        obj
      );
      return;
    }
    const prevVal = params[key][valueIndex];
    const newVal = parseFloat(value);
    params[key][valueIndex] = newVal;
    const newElemParams = getSceneParam('elements').map((elem) => {
      if (elem.id === params.id) return params;
      return elem;
    });
    setSceneParam('elements', newElemParams);
    saveStateByKey('elements', newElemParams);
    obj.userData = params;
    if (!isDefaultParameter) {
      obj.position.set(...params.position);
      obj.rotation.set(...params.rotation);
      obj.scale.set(...params.scale);
    }
    getSceneItem('undoRedo').addAction({
      type: 'updateElemTransforms',
      prevVal,
      newVal,
      valueIndex,
      key,
      elemId: params.id,
      args,
    });
  }
};
