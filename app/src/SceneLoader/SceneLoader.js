import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { setSceneParam, getSceneParam } from '../sceneParams/sceneParams';
import { getScreenResolution } from '../utils/utils';

class SceneLoader {
  constructor(scene) {
    this.scene;
    if (scene) this._createScene(scene);
    return this.scene;
  }

  _createScene = (scene) => {
    this.scene = new THREE.Scene();
    this._createCameras(scene.cameras, scene);
    this._createAxesHelper(scene);
    this._createLights(scene.lights);
    setSceneParam('scene', this.scene);
  };

  _createCameras = (camerasA, scene) => {
    const reso = getScreenResolution();
    const aspectRatio = reso.x / reso.y;
    const allCameras = [];
    for (let i = 0; i < camerasA.length; i++) {
      const c = camerasA[i];
      let camera;
      if (c.type === 'perspective') {
        const fov = c.fov || 45;
        const near = c.near || 0.1;
        const far = c.far || 256;
        camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
        camera.userData.id = c.id || 'camera' + i;
      }
      // TODO: define ortographic camera
      const pos = c.position ? c.position : [5, 5, 5];
      const lookAt = c.lookAt ? c.lookAt : [0, 0, 0];
      camera.position.set(pos[0], pos[1], pos[2]);
      camera.lookAt(new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]));
      allCameras.push(camera);
      if (i === scene.curCameraIndex) {
        setSceneParam('camera', camera);
      }
    }
    setSceneParam('allCameras', allCameras);
    if (scene.orbitControls) {
      const controls = new OrbitControls(
        allCameras[scene.curCameraIndex],
        getSceneParam('renderer').domElement
      ); // Disable this for production (performance gain), TODO: create an env variable to control this
      controls.update(); // Disable this for production (performance gain), TODO: create an env variable to control this
      setSceneParam('cameraControls', controls); // Disable this for production (performance gain), TODO: create an env variable to control this
    }
  };

  _createLights = (lightsA) => {
    for (let i = 0; i < lightsA.length; i++) {
      const l = lightsA[i];
      if (l.type === 'ambient') {
        const color = l.color || 0xffffff;
        const intensity = l.intensity || 1;
        const light = new THREE.AmbientLight(color, intensity);
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
        light.position.set(pos[0], pos[1], [2]);
        light.userData.id = l.id || 'ligth' + i;
        this.scene.add(light);
        continue;
      }
    }
  };

  _createAxesHelper = (scene) => {
    if (scene.axesHelper) {
      const axesHelperLength = scene.axesHelperLength || 100;
      const axesHelper = new THREE.AxesHelper(axesHelperLength);
      this.scene.add(axesHelper);
    }
  };
}

export default SceneLoader;
