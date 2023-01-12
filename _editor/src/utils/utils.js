import { getSceneParam } from '../sceneData/sceneParams';

export const getScreenResolution = () => ({
  x: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
  y: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
});

export const printName = (obj) => {
  if (obj?.name) return obj.name;
  if (obj?.id) return `[ ${obj.id} ]`;
  console.warn('No name or id found in object');
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

export const removeMeshFromScene = (obj) => {
  if (!obj || !obj.isMesh) return;
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
      removeMeshFromScene(obj.children[i]);
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
