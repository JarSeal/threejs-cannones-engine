import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import * as Stats from 'stats.js';

import { Component } from '../LIGHTER';
import {
  getSceneParams,
  setSceneParam,
  resetSceneParams,
  setSceneParams,
  getSceneParam,
} from './sceneData/sceneParams';
import { getSceneItem, getSceneItems, setSceneItem, resetSceneItems } from './sceneData/sceneItems';
import { getScreenResolution } from './utils/utils';
import SceneLoader from './SceneLoader/SceneLoader';
import RightSidePanel from './UI/RightSliderPanel';
import { scenes } from '../../data';
import { getSceneStates, saveSceneId } from './sceneData/saveSession';
import TopTools from './UI/TopTools';
import Dialog from './UI/Dialog';
import { registerStageClick } from './controls/stageClick';

class Root {
  constructor() {
    // Get empty scene params and items
    this.sceneParams = getSceneParams();
    this.sceneItems = getSceneItems();
    console.log('scene params and items', this.sceneParams, this.sceneItems);

    // initialise the app
    this._initApp();
  }

  _initApp = async () => {
    // Load data from LocalStorage
    // If not found, show project picker UI view
    const sessionParams = await getSceneStates();

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
      antialias: false,
    });
    const pixelRatio = window.devicePixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
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

    if (isEditor) {
      // Editor post processing
      this.editorComposer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, this.sceneItems.curCamera);
      this.editorComposer.addPass(renderPass);
      const reso = getScreenResolution();
      const editorOutlinePass = new OutlinePass(
        new THREE.Vector2(reso.x * pixelRatio, reso.y * pixelRatio),
        scene,
        this.sceneItems.curCamera
      );
      editorOutlinePass.edgeStrength = 3.0;
      editorOutlinePass.edgeGlow = 0.5;
      editorOutlinePass.edgeThickness = 0.5;
      editorOutlinePass.pulsePeriod = 2;
      editorOutlinePass.selectedObjects = getSceneParams('selections');
      editorOutlinePass.visibleEdgeColor.set('#f69909');
      editorOutlinePass.hiddenEdgeColor.set('#ff4500');
      editorOutlinePass.overlayMaterial.blending = THREE.NormalBlending;
      console.log('outline', editorOutlinePass);
      setSceneItem('editorOutlinePass', editorOutlinePass);
      const effectFXAA = new ShaderPass(FXAAShader);
      effectFXAA.uniforms['resolution'].value.set(
        1 / (reso.x * pixelRatio),
        1 / (reso.y * pixelRatio)
      );
      this.editorComposer.addPass(editorOutlinePass);
      this.editorComposer.addPass(effectFXAA);

      // Stats
      const renderStats = new Stats();
      renderStats.domElement.id = 'running-stats-render';
      renderStats.domElement.style.top = 'auto';
      renderStats.domElement.style.bottom = 0;
      document.getElementById('root').appendChild(renderStats.dom);
      registerStageClick();
      setSceneItem('runningRenderStats', renderStats);
    }

    this._resize();
    setSceneItem('resizers', [this._resize]);
    this._initResizer();

    // Init UI
    if (isEditor) {
      const rightSidePanel = new RightSidePanel({ id: 'right-side-panel', parentId: 'root' });
      rightSidePanel.draw();
      setSceneItem('rightSidePanel', rightSidePanel);

      const topTools = new TopTools({ id: 'top-tools', parentId: 'root' });
      topTools.draw();
      setSceneItem('topTools', topTools);

      new Component({ id: 'overlays', parentId: 'root' }).draw();
      const dialog = new Dialog({ id: 'dialog', parentId: 'overlays' });
      dialog.draw();
      dialog.disappear();
      setSceneItem('dialog', dialog);
    }

    console.log('SCENE', scene);
  };

  _renderLoop = () => {
    const SI = this.sceneItems;
    if (SI.looping) {
      // SI.renderer.render(SI.scene, SI.curCamera);
      this.editorComposer.render();
      SI.runningRenderStats.update(); // Debug statistics
      requestAnimationFrame(this._renderLoop);
    }
  };

  _resize = () => {
    const SI = this.sceneItems;
    const camParams = getSceneParam('cameras');
    const reso = getScreenResolution();
    const width = reso.x;
    const height = reso.y;
    const pixelRatio = window.devicePixelRatio || 1; // TODO: This needs to be a setting (editor, editor play, and final app) and default to 1, more info: https://stackoverflow.com/questions/60500710/how-to-enable-retina-resolution-render-setsize-on-iphone-with-threejs
    const aspectRatio = width / height;
    SI.renderer.setSize((width * pixelRatio) | 0, (height * pixelRatio) | 0, false);
    for (let i = 0; SI.allCameras.length; i++) {
      const camera = SI.allCameras[i];
      if (!camera) break;
      if (camParams[i] && camParams[i].type === 'orthographic') {
        const viewSize = camParams[i].orthoViewSize;
        camera.left = -viewSize * aspectRatio;
        camera.right = viewSize * aspectRatio;
        camera.top = viewSize;
        camera.bottom = -viewSize;
      }
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
      if (SI.cameraHelpers && SI.cameraHelpers.length && SI.cameraHelpers[i]) {
        SI.cameraHelpers[i].update();
      }
    }
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
