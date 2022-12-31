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
  const sel = selections[0].userData;
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
  if (!obj) return;
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((mat) => mat.dispose());
    } else {
      obj.material.dispose();
    }
  }
  obj.removeFromParent();
};
