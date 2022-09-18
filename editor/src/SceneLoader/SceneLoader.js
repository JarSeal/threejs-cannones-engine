import * as THREE from 'three';

import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { setSceneItem } from '../sceneData/sceneItems';
import { getScreenResolution } from '../utils/utils';
import ElementLoader from './ElementLoader';
import { createOrbitControls } from '../controls/orbitControls';

class SceneLoader {
  constructor(scene, isEditor) {
    this.scene;
    this.isEditor = isEditor;
    if (scene) this._createScene(scene);
    return this.scene;
  }

  _createScene = (sceneParams) => {
    this.scene = new THREE.Scene();
    this._createCameras(sceneParams.cameras, sceneParams);
    this._createLights(sceneParams.lights);
    this._createGrid(sceneParams);
    this._createAxesHelper(sceneParams);
    this._createObjects(sceneParams.elements);
    setSceneItem('scene', this.scene);
  };

  _createCameras = (camerasA, sceneParams) => {
    const reso = getScreenResolution();
    const aspectRatio = reso.x / reso.y;
    const allCameras = [];
    const ids = [];
    for (let i = 0; i < camerasA.length; i++) {
      const c = camerasA[i];
      if (!c.id) {
        console.error('Camera must have an ID');
        continue;
      }
      if (ids.includes(c.id)) {
        console.error('Multiple cameras with the same ID: ' + c.id);
        continue;
      }
      ids.push(c.id);
      let camera;
      c.index = i;
      if (c.type === 'perspective') {
        const fov = c.fov || 45;
        const near = c.near || 0.1;
        const far = c.far || 256;
        camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
        camera.userData = c;
        camera.userData.id = c.id || 'camera' + i;
      }
      // TODO: define ortographic camera

      const pos = c.position ? c.position : [5, 5, 5];
      camera.position.set(pos[0], pos[1], pos[2]);
      if (c.quaternion) {
        camera.quaternion.set(...c.quaternion);
      } else if (c.target) {
        const target = c.target ? c.target : [0, 0, 0];
        camera.lookAt(new THREE.Vector3(target[0], target[1], target[2]));
      } else {
        const lookAt = c.lookAt ? c.lookAt : [0, 0, 0];
        camera.lookAt(new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]));
      }
      allCameras.push(camera);
      if (
        i === sceneParams.curCameraIndex ||
        ((sceneParams.curCameraIndex === null || sceneParams.curCameraIndex === undefined) &&
          i === 0)
      ) {
        setSceneItem('curCamera', camera);
        if (sceneParams.curCameraIndex === null || sceneParams.curCameraIndex === undefined) {
          setSceneParam('curCameraIndex', 0);
        } else {
          setSceneParam('curCameraIndex', i);
        }
      }

      if (c.orbitControls && getSceneParam('curCameraIndex') === i) {
        createOrbitControls();
      }
    }
    setSceneItem('allCameras', allCameras);
  };

  _createLights = (lightsA) => {
    for (let i = 0; i < lightsA.length; i++) {
      const l = lightsA[i];
      l.index = i;
      if (l.type === 'ambient') {
        const color = l.color || 0xffffff;
        const intensity = l.intensity || 1;
        const light = new THREE.AmbientLight(color, intensity);
        light.userData = l;
        light.userData.id = l.id || 'ligth' + i;
        this.scene.add(light);
        continue;
      }
      if (l.type === 'hemisphere') {
        const colorTop = l.colorTop || 0xffffbb;
        const colorBottom = l.colorBottom || 0x080820;
        const intensity = l.intensity || 0.78;
        const pos = l.position ? l.position : [0, 0, 0];
        const light = new THREE.HemisphereLight(colorTop, colorBottom, intensity);
        light.position.set(pos[0], pos[1], pos[2]);
        light.userData = l;
        light.userData.id = l.id || 'ligth' + i;
        this.scene.add(light);
        continue;
      }
      if (l.type === 'point') {
        const color = l.color || 0xffffff;
        const intensity = l.intensity || 1;
        const distance = l.distance || 10;
        const decay = l.decay || 5;
        const light = new THREE.PointLight(color, intensity, distance, decay);
        const pos = l.position ? l.position : [0, 0, 0];
        light.position.set(pos[0], pos[1], pos[2]);
        light.userData = l;
        light.userData.id = l.id || 'ligth' + i;
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
    for (let i = 0; i < objects.length; i++) {
      const objLoader = new ElementLoader(objects[i]);
      const obj = objLoader.getObject();
      if (obj) this.scene.add(obj);
    }
  };

  _createGrid = (sceneParams) => {
    if (!this.isEditor) return;
    const size = sceneParams.gridSize || 100;
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
