import * as THREE from 'three';

import { saveAllLightsState, saveSceneState } from '../sceneData/saveSession';
import { getSceneItem, removeMeshFromScene } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { AMBIENT_LIGHT, HEMI_LIGHT } from './defaultSceneValues';

export const toggleWorldAxesHelper = () => {
  const scene = getSceneItem('scene');
  const axesHelper = scene.children.find((item) => item.type === 'AxesHelper');
  axesHelper.visible = !axesHelper.visible;
  setSceneParam('axesHelper', axesHelper.visible);
  saveSceneState();
  getSceneItem('undoRedo').addAction({
    type: 'toggleWorldAxesHelper',
    prevVal: axesHelper.visible,
    newVal: !axesHelper.visible,
  });
};

export const toggleWorldGridHelper = (gridSizeComponent) => {
  const scene = getSceneItem('scene');
  const gridHelper = scene.children.find((item) => item.type === 'GridHelper');
  gridHelper.visible = !gridHelper.visible;
  setSceneParam('grid', gridHelper.visible);
  saveSceneState();
  getSceneItem('undoRedo').addAction({
    type: 'toggleWorldGridHelper',
    prevVal: gridHelper.visible,
    newVal: !gridHelper.visible,
  });
  if (gridSizeComponent) gridSizeComponent.toggleDisabled(!gridHelper.visible);
};

export const setWorldGridHelperSize = (value, prevValue, setValue) => {
  value = parseInt(value);
  if (setValue && value % 2 !== 0) {
    value += 1;
    setValue(value, true);
  }
  setSceneParam('gridSize', value);
  saveSceneState({ gridSize: value });
  const scene = getSceneItem('scene');
  let gridHelper = scene.children.find((item) => item.type === 'GridHelper');
  removeMeshFromScene(gridHelper, scene);
  gridHelper = new THREE.GridHelper(value, value);
  if (!getSceneParam('grid')) gridHelper.visible = false;
  scene.add(gridHelper);
  getSceneItem('undoRedo').addAction({
    type: 'setWorldGridHelperSize',
    prevVal: prevValue,
    newVal: value,
  });
};

export const changeWorldBackgroundColor = (newColorHex) => {
  const prevHexColor = getSceneParam('rendererClearColor');
  setSceneParam('rendererClearColor', newColorHex);
  getSceneItem('renderer').setClearColor(newColorHex);
  saveSceneState();
  getSceneItem('undoRedo').addAction({
    type: 'changeWorldBackgroundColor',
    prevVal: prevHexColor,
    newVal: newColorHex,
  });
};

export const toggleWorldAmbientLight = () => {
  const scene = getSceneItem('scene');
  const ambientParams = getSceneParam('lights').find((l) => l.type === 'ambient');
  let lightParams = {};
  const useAmbientLight = ambientParams.disabled === undefined ? false : ambientParams.disabled;
  if (useAmbientLight) {
    const color = ambientParams.color || AMBIENT_LIGHT.color;
    const intensity = ambientParams.intensity || AMBIENT_LIGHT.intensity;
    const light = new THREE.AmbientLight(color, intensity);
    const params = {
      id: THREE.MathUtils.generateUUID(),
      type: 'ambient',
      color,
      intensity,
      disabled: false,
    };
    light.userData = params;
    light.userData.id = params.id;
    scene.add(light);
    lightParams = getSceneParam('lights').map((l) => {
      if (l.type === 'ambient') return params;
      return l;
    });
  } else {
    const light = scene.children.find((item) => item.type === 'AmbientLight');
    light.removeFromParent();
    lightParams = getSceneParam('lights').map((l) => {
      if (l.type === 'ambient') return { ...ambientParams, disabled: true };
      return l;
    });
  }
  setSceneParam('lights', lightParams);
  saveAllLightsState();
};

export const changeWorldAmbientColor = (newColorHex) => {
  const scene = getSceneItem('scene');
  const ambientLight = scene.children.find((item) => item.type === 'AmbientLight');
  if (ambientLight) ambientLight.color.set(newColorHex);
  const lightParams = getSceneParam('lights').map((l) => {
    if (l.type === 'ambient') return { ...l, color: newColorHex };
    return l;
  });
  setSceneParam('lights', lightParams);
  saveAllLightsState();
};

export const changeWorldAmbientIntensity = (newIntensity) => {
  const scene = getSceneItem('scene');
  const ambientLight = scene.children.find((item) => item.type === 'AmbientLight');
  if (ambientLight) ambientLight.intensity = newIntensity;
  const lightParams = getSceneParam('lights').map((l) => {
    if (l.type === 'ambient') return { ...l, intensity: newIntensity };
    return l;
  });
  setSceneParam('lights', lightParams);
  saveAllLightsState();
};

export const toggleWorldHemiLight = () => {
  const scene = getSceneItem('scene');
  const hemiParams = getSceneParam('lights').find((l) => l.type === 'hemisphere');
  let lightParams = {};
  const useAmbientLight = hemiParams.disabled === undefined ? false : hemiParams.disabled;
  if (useAmbientLight) {
    const colorTop = hemiParams.colorTop || HEMI_LIGHT.colorTop;
    const colorBottom = hemiParams.colorBottom || HEMI_LIGHT.colorBottom;
    const intensity = hemiParams.intensity || HEMI_LIGHT.intensity;
    const light = new THREE.HemisphereLight(colorTop, colorBottom, intensity);
    const params = {
      id: THREE.MathUtils.generateUUID(),
      type: 'hemisphere',
      colorTop,
      colorBottom,
      intensity,
      disabled: false,
    };
    light.userData = params;
    light.userData.id = params.id;
    scene.add(light);
    lightParams = getSceneParam('lights').map((l) => {
      if (l.type === 'hemisphere') return params;
      return l;
    });
  } else {
    const light = scene.children.find((item) => item.type === 'HemisphereLight');
    light.removeFromParent();
    lightParams = getSceneParam('lights').map((l) => {
      if (l.type === 'hemisphere') return { ...hemiParams, disabled: true };
      return l;
    });
  }
  setSceneParam('lights', lightParams);
  saveAllLightsState();
};

export const changeWorldHemiColors = (newColorHex, topOrBottom) => {
  const scene = getSceneItem('scene');
  const hemiLight = scene.children.find((item) => item.type === 'HemisphereLight');
  if (hemiLight)
    topOrBottom === 'bottom'
      ? hemiLight.groundColor.set(newColorHex)
      : hemiLight.color.set(newColorHex);
  const lightParams = getSceneParam('lights').map((l) => {
    const changedColor =
      topOrBottom === 'bottom' ? { colorBottom: newColorHex } : { colorTop: newColorHex };
    if (l.type === 'hemisphere') return { ...l, ...changedColor };
    return l;
  });
  setSceneParam('lights', lightParams);
  saveAllLightsState();
};

export const changeWorldHemiIntensity = (newIntensity) => {
  const scene = getSceneItem('scene');
  const hemiLight = scene.children.find((item) => item.type === 'HemisphereLight');
  if (hemiLight) hemiLight.intensity = newIntensity;
  const lightParams = getSceneParam('lights').map((l) => {
    if (l.type === 'hemisphere') return { ...l, intensity: newIntensity };
    return l;
  });
  setSceneParam('lights', lightParams);
  saveAllLightsState();
};
