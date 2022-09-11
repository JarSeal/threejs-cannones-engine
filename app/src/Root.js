import * as THREE from 'three';
import * as Stats from 'stats.js';

import { getSceneParams, setSceneParam } from './sceneParams/sceneParams';
import { getScreenResolution } from './utils/utils';
import SceneLoader from './SceneLoader/SceneLoader';
import { scenes } from '../data';

class Root {
  constructor() {
    // Get empty sceneParams
    this.sceneParams = getSceneParams();
    console.log('sceneparams', this.sceneParams);

    // initialise the app
    this._initApp();
  }

  _initApp = () => {
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setClearColor('#000000');
    renderer.debug.checkShaderErrors = true; // Disable this for production (performance gain), TODO: create an env variable to control this
    renderer.domElement.id = this.sceneParams.rendererElemId;
    document.body.appendChild(renderer.domElement);
    setSceneParam('renderer', renderer);

    // Create scene
    const scene = new SceneLoader(scenes.scene1);

    // Stats
    const renderStats = new Stats();
    document.body.appendChild(renderStats.dom);
    setSceneParam('renderStats', renderStats);

    this._resize();

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    scene.add(cube);

    // Start the show...
    this._renderLoop();
  };

  _renderLoop = () => {
    const SP = this.sceneParams;
    SP.renderer.render(SP.scene, SP.camera);
    this.sceneParams.renderStats.update(); // Debug statistics
    requestAnimationFrame(() => {
      this._renderLoop();
    });
  };

  _resize = () => {
    const reso = getScreenResolution();
    const width = reso.x;
    const height = reso.y;
    const pixelRatio = window.devicePixelRatio;
    const aspectRatio = reso.x / reso.y;
    this.sceneParams.renderer.setSize((width * pixelRatio) | 0, (height * pixelRatio) | 0, false);
    this.sceneParams.camera.aspect = width / height;
    this.sceneParams.camera.updateProjectionMatrix();
    setSceneParam('screenResolution', reso);
    setSceneParam('pixelRatio', pixelRatio);
    setSceneParam('aspectRatio', aspectRatio);
  };
}

export default Root;
