import * as THREE from 'three';
import * as Stats from 'stats.js';

import { getSceneParams, setSceneParam } from './sceneParams/sceneParams';
import { getScreenResolution } from './utils/utils';
import SceneLoader from './SceneLoader/SceneLoader';
import UIWorld from './UI/UIWorld';
import { scenes } from '../../data';

class Root {
  constructor() {
    // Get empty sceneParams
    this.sceneParams = getSceneParams();
    console.log('sceneparams', this.sceneParams);

    // initialise the app
    this._initApp();
  }

  _initApp = () => {
    // Get scene data
    const curScene = scenes.scene1;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    if (curScene.shadowType !== undefined) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE[curScene.shadowType];
    }
    renderer.setClearColor('#000000');
    renderer.debug.checkShaderErrors = true; // Disable this for production (performance gain), TODO: create an env variable to control this
    renderer.domElement.id = this.sceneParams.rendererElemId;
    document.body.appendChild(renderer.domElement);
    setSceneParam('renderer', renderer);

    // Create scene
    const scene = new SceneLoader(curScene);

    // Create UI
    const app = new UIWorld({ id: 'ui-world', parentId: 'root' });
    app.draw();

    // Create grid
    const size = curScene.gridSize || 100;
    const grid = new THREE.GridHelper(size, size);
    if (!curScene.grid) grid.visible = false;
    scene.add(grid);

    // Stats
    const renderStats = new Stats();
    document.body.appendChild(renderStats.dom);
    setSceneParam('renderStats', renderStats);

    this._resize();

    console.log('SCENE', scene);

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
