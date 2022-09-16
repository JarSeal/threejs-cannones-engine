import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { setSceneParam } from '../sceneData/sceneParams';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { getScreenResolution } from '../utils/utils';
import ElementLoader from './ElementLoader';
import { saveCameraState } from './SceneEditorState';

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
    let curCameraQuaternion, curCameraTarget;
    for (let i = 0; i < camerasA.length; i++) {
      const c = camerasA[i];
      let camera;
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
      } else {
        const lookAt = c.lookAt ? c.lookAt : [0, 0, 0];
        camera.lookAt(new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]));
      }
      allCameras.push(camera);
      if (
        i === sceneParams.cameraIndex ||
        ((sceneParams.cameraIndex === null || sceneParams.cameraIndex === undefined) && i === 0)
      ) {
        setSceneItem('curCamera', camera);
        if (sceneParams.cameraIndex === null || sceneParams.cameraIndex === undefined)
          setSceneParam('cameraIndex', 0);
        if (c.quaternion) curCameraQuaternion = [...c.quaternion];
        if (c.target) curCameraTarget = [...c.target];
      }
    }
    setSceneItem('allCameras', allCameras);

    // Editor Orbit Controls
    // TODO: Later rewrite your own orbit controls
    const controls = new OrbitControls(
      allCameras[sceneParams.curCameraIndex],
      getSceneItem('renderer').domElement
    );
    if (curCameraQuaternion) {
      allCameras[sceneParams.curCameraIndex].quaternion.set(...curCameraQuaternion);
    }
    if (curCameraTarget) {
      controls.target = new THREE.Vector3(...curCameraTarget);
    }
    setSceneItem('cameraControls', controls);
    controls.addEventListener('end', () => {
      const quaternion = allCameras[sceneParams.curCameraIndex].quaternion;
      const position = allCameras[sceneParams.curCameraIndex].position;
      const target = controls.target;
      saveCameraState({ index: sceneParams.curCameraIndex, quaternion, position, target });
    });
  };

  _createLights = (lightsA) => {
    for (let i = 0; i < lightsA.length; i++) {
      const l = lightsA[i];
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
    if (!sceneParams.axesHelper) axesHelper.visible = false;
    this.scene.add(axesHelper);
  };
}

export default SceneLoader;
