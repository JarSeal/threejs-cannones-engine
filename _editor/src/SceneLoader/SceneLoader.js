import * as THREE from 'three';

import { setSceneParam } from '../sceneData/sceneParams';
import { setSceneItem } from '../sceneData/sceneItems';
import ElementLoader from './ElementLoader';
import { saveStateByKey } from '../sceneData/saveSession';
import {
  AMBIENT_LIGHT,
  HEMI_LIGHT,
  NEW_CAMERA_DEFAULT_PARAMS,
  NEW_ELEM_DEFAULT_PARAMS,
  POINT_LIGHT,
} from '../utils/defaultSceneValues';
import { addCamera } from '../utils/toolsForCamera';

class SceneLoader {
  constructor(scene, isEditor) {
    this.scene;
    this.isEditor = isEditor;
    if (scene) this._createScene(scene);
    return this.scene;
  }

  _createScene = (sceneParams) => {
    this.scene = new THREE.Scene();
    setSceneItem('scene', this.scene);
    this._createCameras(sceneParams.cameras, sceneParams);
    this._createLights(sceneParams.lights);
    this._createObjects(sceneParams.elements);
    this._createGrid(sceneParams);
    this._createAxesHelper(sceneParams);
  };

  _createCameras = (camerasA, sceneParams) => {
    if (sceneParams.curCameraIndex === undefined || sceneParams.curCameraIndex === null) {
      setSceneParam('curCameraIndex', 0);
    }
    const defaultParamsKeys = Object.keys(NEW_CAMERA_DEFAULT_PARAMS);
    for (let i = 0; i < camerasA.length; i++) {
      defaultParamsKeys.forEach((key) => {
        if (camerasA[i][key] === undefined) camerasA[i][key] = NEW_CAMERA_DEFAULT_PARAMS[key];
      });
      addCamera(camerasA[i], true);
    }
    setSceneParam('cameras', camerasA);
  };

  _createLights = (lightsA) => {
    for (let i = 0; i < lightsA.length; i++) {
      const l = lightsA[i];
      l.paramType = 'light';
      l.index = i;
      if (l.type === 'ambient' && !l.disabled) {
        const color = l.color || AMBIENT_LIGHT.color;
        const intensity = l.intensity || AMBIENT_LIGHT.intensity;
        const light = new THREE.AmbientLight(color, intensity);
        light.userData = l;
        light.userData.id = l.id || 'light-' + i;
        this.scene.add(light);
        continue;
      }
      if (l.type === 'hemisphere' && !l.disabled) {
        const colorTop = l.colorTop || HEMI_LIGHT.colorTop;
        const colorBottom = l.colorBottom || HEMI_LIGHT.colorBottom;
        const intensity = l.intensity || HEMI_LIGHT.intensity;
        const pos = l.position ? l.position : [0, 1, 0];
        const light = new THREE.HemisphereLight(colorTop, colorBottom, intensity);
        light.position.set(pos[0], pos[1], pos[2]);
        light.userData = l;
        light.userData.id = l.id || 'light-' + i;
        this.scene.add(light);
        continue;
      }
      if (l.type === 'point') {
        const color = l.color || POINT_LIGHT.color;
        const intensity = l.intensity || POINT_LIGHT.intensity;
        const distance = l.distance || POINT_LIGHT.distance;
        const decay = l.decay || POINT_LIGHT.decay;
        const light = new THREE.PointLight(color, intensity, distance, decay);
        const pos = l.position ? l.position : [0, 0, 0];
        light.position.set(pos[0], pos[1], pos[2]);
        light.userData = l;
        light.userData.id = l.id || 'light-' + i;
        if (l.castShadow) light.castShadow = true;
        this.scene.add(light);
        if (this.isEditor && l.showHelper) {
          const helper = new THREE.PointLightHelper(light, 0.1);
          this.scene.add(helper);
        }
        continue;
      }
    }
  };

  _createObjects = (objectParams) => {
    // @TODO: move this into toolsForElems.js
    const objectMeshes = [];
    const defaultParamsKeys = Object.keys(NEW_ELEM_DEFAULT_PARAMS);
    for (let i = 0; i < objectParams.length; i++) {
      defaultParamsKeys.forEach((key) => {
        if (objectParams[i][key] === undefined) objectParams[i][key] = NEW_ELEM_DEFAULT_PARAMS[key];
      });
      const objLoader = new ElementLoader(objectParams[i]);
      const obj = objLoader.getObject();
      objectMeshes.push(obj);
      if (obj) this.scene.add(obj);
    }
    setSceneItem('elements', objectMeshes);
    const elementsParams = objectParams;
    setSceneParam('elements', elementsParams);
    saveStateByKey('elements', elementsParams);
  };

  _createGrid = (sceneParams) => {
    if (!this.isEditor) return;
    let size = sceneParams.gridSize || 100;
    if (size > 200000) {
      size = 200000;
      sceneParams.gridSize = size;
    }
    const grid = new THREE.GridHelper(size, size);
    if (!sceneParams.grid) grid.visible = false;
    this.scene.add(grid);
  };

  _createAxesHelper = (sceneParams) => {
    if (!this.isEditor) return;
    const axesHelperLength = sceneParams.axesHelperLength || 100;
    const axesHelper = new THREE.AxesHelper(axesHelperLength);
    axesHelper.position.set(0, 0.001, 0);
    if (!sceneParams.axesHelper) axesHelper.visible = false;
    this.scene.add(axesHelper);
  };
}

export default SceneLoader;
