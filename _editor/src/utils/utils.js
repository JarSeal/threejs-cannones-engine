import * as THREE from 'three';
import APP_CONFIG, { APP_DEFAULTS } from '../../../APP_CONFIG';

import {
  clearProjectData,
  getHasUnsavedChanges,
  saveProjectFolder,
  saveSceneId,
  saveSceneState,
} from '../sceneData/saveSession';
import { getSceneItem, resetSceneItems, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, resetSceneParams, setSceneParam } from '../sceneData/sceneParams';
import SaveBeforeCloseDialog from '../UI/dialogs/SaveBeforeClose';
import {
  CANVAS_ELEM_ID,
  DEFAULT_TEXTURE,
  SMALL_STATS_CONTAINER_ID,
  SMALL_STATS_ID,
} from './defaultSceneValues';
import { saveScene } from './toolsForFS';

export const getScreenResolution = () => ({
  x: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
  y: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
});

export const printName = (obj) => {
  if (obj?.name) return obj.name;
  if (obj?.sceneName) return obj.sceneName;
  if (obj?.id) return `[ ${obj.id} ]`;
  if (obj?.sceneId) return `[ ${obj.sceneId} ]`;
  console.warn('No name, id, sceneName, or sceneId found in object');
  return '';
};

export const printProjectName = (prj) => {
  if (prj?.name) return prj.name;
  if (prj?.projectName) return prj.projectName;
  if (prj?.projectFolder) return `[ ${prj.projectFolder} ]`;
  console.warn('No name, projectFolder, or projectName found in project object');
  return '';
};

export const getSelectedElemIcon = (selections) => {
  if (selections.length > 1) return { icon: 'cubes', width: 26 };
  const sel = selections[0]?.userData;
  if (sel?.paramType === 'element') return { icon: 'cube', width: 22 };
  if (sel?.paramType === 'camera') return { icon: 'camera', width: 18 };
  if (sel?.paramType === 'cameraTarget') return { icon: 'camera', width: 18 }; // @TODO: figure out a new icon (maybe the camera with crosshair target or something...)
  return { icon: '', width: 22 };
};

export const getElemParamsById = (id) => {
  const groups = ['lights', 'cameras', 'scenes', 'elements'];
  let foundParams = null;
  for (let i = 0; i < groups.length; i++) {
    const params = getSceneParam(groups[i]);
    if (!params) continue;
    for (let j = 0; j < params.length; j++) {
      if (params[j].id === id) {
        foundParams = params[j];
        break;
      }
    }
    if (foundParams) break;
  }
  if (!foundParams) {
    console.warn(`Could not find element params with ID "${id}" from groups ${groups.join(', ')}.`);
  }
  return foundParams;
};

export const removeMeshFromScene = (obj, canBeAnyType) => {
  if (!obj) return;
  if (!obj.isMesh && !canBeAnyType) return;
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((mat) => mat.dispose());
    } else {
      obj.material.dispose();
    }
  }
  if (obj.children.length) {
    for (let i = 0; i < obj.children.length; i++) {
      removeMeshFromScene(obj.children[i], canBeAnyType);
    }
  }
  obj.removeFromParent();
};

export const getObjectParams = (obj) => {
  if (!obj || !obj.userData) {
    console.warn('Could not find object or object userData', obj);
    return null;
  }
  if (obj.userData.isTargetObject) return obj.userData.params;
  return obj.userData;
};

// Checks if object is camera or cameraTarget (can be set to check only for the camera object)
export const isCameraObject = (obj, checkOnlyForCamera) => {
  if (!obj || !obj.isObject3D || !obj.userData) {
    console.warn('Object provided for isCameraObject util is not a proper 3D object. Object:', obj);
    return null;
  }
  if (checkOnlyForCamera) return obj.userData.paramType === 'camera';
  return obj.userData.paramType === 'camera' || obj.userData.paramType === 'cameraTarget';
};

export const getPreciseNumberString = (value, precision) => {
  if (!value) value = 0;
  if (precision === 0) return parseInt(value);
  if (!precision) return parseFloat(value);
  return parseFloat(value).toFixed(precision);
};

export const getObjectStats = (object) => {
  let objects = 0,
    vertices = 0,
    triangles = 0;
  object.traverseVisible((object) => {
    if (object.isMesh) {
      objects++;
      const geometry = object.geometry;
      vertices += geometry.attributes.position.count;
      if (geometry.index !== null) {
        triangles += geometry.index.count / 3;
      } else {
        triangles += geometry.attributes.position.count / 3;
      }
    }
  });
  return { objects, triangles, vertices };
};

export const removeTools = () => {
  getSceneItem('rightSidePanel').discard(true);
  getSceneItem('elemTool').discard(true);
  getSceneItem('leftTools').discard(true);
  getSceneItem('topTools').discard(true);
  const smallStats = getSceneItem('smallStats');
  smallStats.container.removeEventListener('click', smallStats.containerClick);
  document.getElementById(SMALL_STATS_ID).remove();
  document.getElementById(SMALL_STATS_CONTAINER_ID).remove();
};

export const closeProject = (beforeInitAppFn) => {
  const closeFn = () => {
    setSceneItem('looping', false);
    getSceneItem('keyboard').removeListeners();
    clearProjectData();
    removeTools();
    resetSceneItems();
    resetSceneParams();
    document.getElementById(CANVAS_ELEM_ID).remove();
    if (beforeInitAppFn) beforeInitAppFn();
    setTimeout(() => {
      // This small timeout is to make sure that the canvas and the smallStats have
      // been removed. Otherwise the smallStats are sometimes not fully removed
      // and the FPS goes to 120 (counting double frames).
      getSceneItem('root').initApp();
    }, 50);
  };
  const hasUnsavedChanges = getHasUnsavedChanges();
  if (hasUnsavedChanges === 'true') {
    // Cancel, Don't save, or Save Dialog
    getSceneItem('dialog').appear({
      component: SaveBeforeCloseDialog,
      componentData: {
        id: 'close-project-unsaved-changes-dialog',
        message:
          'You have unsaved changes on the scene. Do you want to save the changes before closing this scene?',
        cancelButtonFn: () => getSceneItem('dialog').disappear(),
        dontSaveButtonFn: () => closeFn(),
        saveButtonFn: async () => {
          await saveScene();
          closeFn();
        },
      },
      title: 'Unsaved changes!',
    });
  } else {
    closeFn();
  }
};

export const changeScene = (projectFolder, sceneId) => {
  if (!projectFolder) {
    console.error('Param "projectFolder" is missing for "changeScene".');
    return;
  }
  if (!sceneId) {
    console.error('Param "sceneId" is missing for "changeScene".');
    return;
  }
  const beforeInitAppFn = () => {
    saveSceneId(sceneId);
    saveProjectFolder(projectFolder);
  };
  closeProject(beforeInitAppFn);
};

export const getFileSizeString = (number) => {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  } else if (number >= 1073741824) {
    return `${(number / 1073741824).toFixed(1)} GB`;
  }
};

export const getDateString = (date) => {
  // @TODO: this needs more design & work...
  const dateObject = new Date(date);
  return `${dateObject.getDate()}.${dateObject.getMonth() + 1}.${dateObject.getFullYear()}`;
};

export const getImagePath = (imageParams) =>
  `${APP_CONFIG.PROJECTS_FOLDER_NAME}/${getSceneParam('projectFolder')}/${
    APP_CONFIG.SINGLE_PROJECT_IMAGES_FOLDER
  }/${imageParams.id}/${imageParams.fileName}`;

export const createTexture = (params) => {
  let textureItem;
  if (params.image) {
    const textureLoader = getSceneItem('textureLoader');
    const imageParams = getSceneParam('images').find((img) => params.image === img.id);
    if (imageParams) {
      const imagePath = getImagePath(imageParams);
      const loadTexture = textureLoader.loadTexture(imagePath);
      textureItem = loadTexture.texture;
    } else {
      console.warn(
        `${APP_DEFAULTS.APP_NAME}: Could not find image params for image ID: "${params.image}".`
      );
    }
  }
  if (!textureItem) textureItem = new THREE.Texture();
  textureItem.flipY = params.flipY !== undefined ? params.flipY : DEFAULT_TEXTURE.flipY;
  textureItem.wrapS = params.wrapS || DEFAULT_TEXTURE.wrapS;
  textureItem.wrapT = params.wrapT || DEFAULT_TEXTURE.wrapT;
  textureItem.repeat = new THREE.Vector2(
    params.wrapSTimes || DEFAULT_TEXTURE.wrapSTimes,
    params.wrapTTimes || DEFAULT_TEXTURE.wrapTTimes
  );
  textureItem.offset = new THREE.Vector2(
    params.offsetU || DEFAULT_TEXTURE.offsetU,
    params.offsetV || DEFAULT_TEXTURE.offsetV
  );
  textureItem.center = new THREE.Vector2(
    params.centerU || DEFAULT_TEXTURE.centerU,
    params.centerV || DEFAULT_TEXTURE.centerV
  );
  textureItem.rotation = params.rotation || DEFAULT_TEXTURE.rotation;
  textureItem.userData = params;
  return textureItem;
};

// If the "targetItemKey" is an array (eg. textures, material, etc.), the itemId is required.
// This can also set value to a scene param when the switch "isParam" is set to true.
export const setValueToSceneItem = ({ targetItemKey, value, itemId, isParam }) => {
  if (!targetItemKey) {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: targetItemKey missing (targetItemKey: "${targetItemKey}").`;
    console.error(errorMsg);
    getSceneItem('toaster').addToast({
      type: 'error',
      delay: 0,
      content: errorMsg,
    });
    return;
  }
  const splitTargets = targetItemKey.split('.');
  let sceneItem = isParam ? getSceneParam(splitTargets[0]) : getSceneItem(splitTargets[0]);
  if (Array.isArray(sceneItem) && (itemId === undefined || itemId === null)) {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: the sceneItem "${splitTargets[0]}" is an array, but no itemId was provided (targetItemKey: "${targetItemKey}").`;
    console.error(errorMsg);
    getSceneItem('toaster').addToast({
      type: 'error',
      delay: 0,
      content: errorMsg,
    });
    return;
  }

  if (isParam) {
    if (itemId !== undefined && itemId !== null)
      sceneItem = sceneItem.find((item) => item.id === itemId);
  } else {
    if (itemId !== undefined && itemId !== null)
      sceneItem = sceneItem.find((item) => item.userData.id === itemId);
  }

  if (splitTargets.length === 1 && isParam) {
    setSceneParam(splitTargets[0], value);
    saveSceneState();
  } else if (splitTargets.length === 2) {
    sceneItem[splitTargets[1]] = value;
  } else if (splitTargets.length === 3) {
    sceneItem[splitTargets[1]][splitTargets[2]] = value;
  } else if (splitTargets.length === 4) {
    sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]] = value;
  } else if (splitTargets.length === 5) {
    sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]][splitTargets[4]] = value;
  } else if (splitTargets.length === 6) {
    sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]][splitTargets[4]][splitTargets[5]] =
      value;
  } else if (splitTargets.length === 7) {
    sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]][splitTargets[4]][splitTargets[5]][
      splitTargets[6]
    ] = value;
  } else {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: targetItemKey not valid (targetItemKey: "${targetItemKey}").`;
    console.error(errorMsg);
    getSceneItem('toaster').addToast({
      type: 'error',
      delay: 0,
      content: errorMsg,
    });
    return;
  }
};
