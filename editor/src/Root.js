import * as THREE from 'three';
import * as Stats from 'stats.js';

import {
  getSceneParams,
  setSceneParam,
  resetSceneParams,
  setSceneParams,
} from './sceneData/sceneParams';
import { getSceneItem, getSceneItems, setSceneItem, resetSceneItems } from './sceneData/sceneItems';
import { getScreenResolution } from './utils/utils';
import SceneLoader from './SceneLoader/SceneLoader';
import UIWorld from './UI/UIWorld';
import { scenes } from '../../data';
import { getSceneStates, saveSceneId } from './SceneLoader/SceneEditorState';

class Root {
  constructor() {
    // Get empty scene params and items
    this.sceneParams = getSceneParams();
    this.sceneItems = getSceneItems();
    console.log('scene params and items', this.sceneParams, this.sceneItems);

    // initialise the app
    this._initApp();
  }

  _initApp = () => {
    // Load data from LocalStorage
    // If not found, show project picker UI view
    const sessionParams = getSceneStates();

    // Load scene data from file
    let curScene = scenes.scene1; // TODO: Create File System where to load via an API
    if (curScene.sceneId === sessionParams.sceneId) {
      curScene = { ...curScene, ...sessionParams };
    }
    saveSceneId(curScene.sceneId);

    this.loadScene(curScene, true);

    // Start the show...
    setSceneItem('looping', true);
    this._renderLoop();
  };

  loadScene = (sceneParams, isEditor) => {
    resetSceneParams();
    resetSceneItems();

    setSceneParams(sceneParams);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: sceneParams.rendererAntialias,
    });
    if (sceneParams.shadowType !== undefined || sceneParams.shadowType !== null) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE[sceneParams.shadowType];
    }
    renderer.setClearColor(sceneParams.rendererClearColor || '#000000');
    if (isEditor) renderer.debug.checkShaderErrors = true; // Disable this for production (performance gain), TODO: create an env variable to control this
    renderer.domElement.id = this.sceneParams.rendererElemId;
    document.body.appendChild(renderer.domElement);
    setSceneItem('renderer', renderer);
    console.log('RENDERER', renderer);

    // Create scene
    const scene = new SceneLoader(sceneParams, isEditor);

    // Stats
    if (isEditor) {
      const renderStats = new Stats();
      document.body.appendChild(renderStats.dom);
      setSceneItem('renderStats', renderStats);
    }

    this._resize();
    setSceneItem('resizers', [this._resize]);
    this._initResizer();

    // Init UI
    if (isEditor) {
      const uiWorld = new UIWorld({ id: 'ui-world', parentId: 'root' });
      uiWorld.draw();
      setSceneItem('uiWorld', uiWorld);
    }

    console.log('SCENE', scene);
  };

  _renderLoop = () => {
    const SI = this.sceneItems;
    if (SI.looping) {
      SI.renderer.render(SI.scene, SI.curCamera);
      SI.renderStats.update(); // Debug statistics
      requestAnimationFrame(() => {
        this._renderLoop();
      });
    }
  };

  _resize = () => {
    const SI = this.sceneItems;
    const reso = getScreenResolution();
    const width = reso.x;
    const height = reso.y;
    const pixelRatio = window.devicePixelRatio;
    const aspectRatio = reso.x / reso.y;
    SI.renderer.setSize((width * pixelRatio) | 0, (height * pixelRatio) | 0, false);
    SI.curCamera.aspect = width / height;
    SI.curCamera.updateProjectionMatrix();
    setSceneParam('screenResolution', reso);
    setSceneParam('pixelRatio', pixelRatio);
    setSceneParam('aspectRatio', aspectRatio);
  };

  _initResizer = () => {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        let i;
        const fns = getSceneItem('resizers'),
          fnsLength = fns.length;
        for (i = 0; i < fnsLength; i++) {
          fns[i](this.sceneState);
        }
      }, 500);
    });
  };
}

export default Root;
