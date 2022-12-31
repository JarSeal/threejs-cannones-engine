import * as THREE from 'three';

import { setSceneParam } from '../sceneData/sceneParams';
import { setSceneItem } from '../sceneData/sceneItems';
import ElementLoader from './ElementLoader';
import { saveStateByKey } from '../sceneData/saveSession';
import { AMBIENT_LIGHT, HEMI_LIGHT, POINT_LIGHT } from '../utils/defaultSceneValues';
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
    for (let i = 0; i < camerasA.length; i++) {
      addCamera(camerasA[i], true);
    }
    setSceneParam('cameras', camerasA);

    // @TODO: remove the commented code when this (addCamera approach) has been fully tested

    // const reso = getScreenResolution();
    // const aspectRatio = reso.x / reso.y;
    // const allCameras = [];
    // const helpers = [];
    // const ids = [];
    // for (let i = 0; i < camerasA.length; i++) {
    //   const c = camerasA[i];
    //   c.paramType = 'camera';
    //   if (!c.id) {
    //     console.error('Camera must have an ID and type');
    //     continue;
    //   }
    //   if (ids.includes(c.id)) {
    //     console.error('Multiple cameras with the same ID: ' + c.id);
    //     continue;
    //   }
    //   ids.push(c.id);
    //   let camera;
    //   c.index = i;
    //   const near = c.near || 0.1;
    //   const far = c.far || 256;
    //   if (c.type === 'perspectiveTarget') {
    //     const fov = c.fov || 45;
    //     camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    //   } else if (c.type === 'orthographicTarget') {
    //     const viewSize = c.viewSize || 1;
    //     camera = new THREE.OrthographicCamera(
    //       -viewSize * aspectRatio,
    //       viewSize * aspectRatio,
    //       viewSize,
    //       -viewSize,
    //       near,
    //       far
    //     );
    //   }

    //   if (c.name === undefined) c.name = '';

    //   camera.userData = c;
    //   camera.userData.id = c.id || 'camera' + i;
    //   const pos = c.position ? c.position : [5, 5, 5];
    //   camera.position.set(pos[0], pos[1], pos[2]);

    //   const target = c.target ? c.target : [0, 0, 0];
    //   camera.lookAt(new THREE.Vector3(target[0], target[1], target[2]));

    //   allCameras.push(camera);
    //   new CameraMeshIcon(camera, c);
    //   if (
    //     i === sceneParams.curCameraIndex ||
    //     camerasA.length <= sceneParams.curCameraIndex ||
    //     ((sceneParams.curCameraIndex === null || sceneParams.curCameraIndex === undefined) &&
    //       i === 0)
    //   ) {
    //     setSceneItem('curCamera', camera);
    //     if (sceneParams.curCameraIndex === null || sceneParams.curCameraIndex === undefined) {
    //       setSceneParam('curCameraIndex', 0);
    //     } else {
    //       setSceneParam('curCameraIndex', i);
    //     }
    //     helpers.push(null);
    //   } else {
    //     // Create camera helpers
    //     const helper = new THREE.CameraHelper(camera);
    //     helper.userData = c;
    //     if (!c.showHelper) helper.visible = false;
    //     helpers.push(helper);
    //     helper.update();
    //     this.scene.add(helper);
    //     camera.updateWorldMatrix();
    //   }

    //   if (c.orbitControls && getSceneParam('curCameraIndex') === i) {
    //     createOrbitControls();
    //   }
    // }
    // setSceneItem('allCameras', allCameras);
    // setSceneItem('cameraHelpers', helpers);
    // setSceneParam('cameras', camerasA);
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

  _createObjects = (objects) => {
    const objectMeshes = [];
    const objectParams = [];
    for (let i = 0; i < objects.length; i++) {
      const objLoader = new ElementLoader(objects[i]);
      const obj = objLoader.getObject();
      objects[i].paramType = 'element';
      objectParams.push(objects[i]);
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
