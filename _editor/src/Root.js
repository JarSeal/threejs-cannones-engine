import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

import { Component } from '../LIGHTER';
import { OutlinePass } from './postFX/OutlinePass/OutlinePass.js';
import {
  getSceneParams,
  setSceneParam,
  setSceneParams,
  getSceneParam,
} from './sceneData/sceneParams';
import { getSceneItem, getSceneItems, setSceneItem } from './sceneData/sceneItems';
import { getScreenResolution } from './utils/utils';
import SceneLoader from './SceneLoader/SceneLoader';
import RightSidePanel from './UI/RightSliderPanel';
import { getSceneStates, saveProjectFolder, saveSceneId } from './sceneData/saveSession';
import TopTools from './UI/TopTools';
import Dialog from './UI/dialogs/Dialog';
import { registerStageClick, selectObjects } from './controls/stageClick';
import SmallStats from './UI/stats/SmallStats';
import styleVariables from './sass/variables.scss?raw';
import LeftTools from './UI/LeftTools';
import ElemTool from './UI/ElemTool';
import UndoRedo from './UI/UndoRedo/UndoRedo';
import KeyboardShortcuts from './UI/KeyboarShortcuts';
import { createTransformControls } from './controls/transformControls';
import TextureLoader from './loaders/TextureLoader';
import {
  CANVAS_ELEM_ID,
  CREATE_DEFAULT_SCENE,
  SELECTION_GROUP_ID,
} from './utils/defaultSceneValues';
import { loadSceneApi } from './api/loadScene';

class Root {
  constructor() {
    // initialise the app
    this._initApp();
  }

  _initApp = async () => {
    // Load data from LocalStorage
    // If not found, show Projects view
    const sessionParams = await getSceneStates();

    // Load scene data from FS
    sessionParams.projectFolder = 'devProject1'; // TEMP
    sessionParams.sceneId = 'scene1'; // TEMP
    if (sessionParams.projectFolder && sessionParams.sceneId) {
      const response = await loadSceneApi(sessionParams);
      let curScene;
      if (response && !response.error) {
        curScene = response;
        saveSceneId(curScene.sceneId);
        saveProjectFolder(curScene.projectFolder);
      } else {
        // @TODO: show user the error while loading scene (toast) and maybe redirect back to Projects view
        curScene = CREATE_DEFAULT_SCENE();
      }
      // @TODO: we need to compare also the dateSaved values here
      if (curScene.sceneId === sessionParams.sceneId) {
        curScene = { ...curScene, ...sessionParams };
      }

      this.loadScene(curScene, true);

      // Start the show...
      setSceneItem('looping', true);
      this._renderLoop();
    } else {
      // Show Projects view
    }
  };

  loadScene = (sceneParams, isEditor) => {
    setSceneParams(sceneParams);

    // Setup textureLoader
    const textureLoader = new TextureLoader();
    setSceneItem('textureLoader', textureLoader);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
    });
    const pixelRatio = window.devicePixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false; // Because we do post processing, this needs to be false
    if (sceneParams.shadowType !== undefined && sceneParams.shadowType !== null) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE[sceneParams.shadowType];
    }
    renderer.setClearColor(sceneParams.rendererClearColor || '#000000');
    if (isEditor) renderer.debug.checkShaderErrors = true; // Disable this for production (performance gain), @TODO: create an env variable to control this
    renderer.domElement.id = CANVAS_ELEM_ID;
    document.body.appendChild(renderer.domElement);
    setSceneItem('renderer', renderer);

    // Create scene
    const scene = new SceneLoader(sceneParams, isEditor);

    if (isEditor) {
      // Editor post processing (outline and SMAA/FXAA)
      const reso = getScreenResolution();
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
        samples: 4,
      });
      this.editorComposer = new EffectComposer(renderer, renderTarget);
      this.renderPass = new RenderPass(scene, getSceneItem('curCamera'));
      this.editorComposer.addPass(this.renderPass);
      const editorOutlinePass = new OutlinePass(
        new THREE.Vector2(reso.x * pixelRatio, reso.y * pixelRatio),
        scene,
        getSceneItem('curCamera')
      );
      editorOutlinePass.edgeStrength = 10.0;
      editorOutlinePass.edgeGlow = 0.25;
      editorOutlinePass.edgeThickness = 2.5;
      editorOutlinePass.pulsePeriod = 2;
      editorOutlinePass.visibleEdgeColor.set('#f69909');
      editorOutlinePass.hiddenEdgeColor.set('#ff4500');
      editorOutlinePass.overlayMaterial.blending = THREE.NormalBlending;
      const textureData = textureLoader.loadTexture(
        'src/UI/textures/multiselect-stripe-pattern.png'
      );
      textureData.texture.wrapS = THREE.RepeatWrapping;
      textureData.texture.wrapT = THREE.RepeatWrapping;
      editorOutlinePass.usePatternTexture = false;
      editorOutlinePass.patternTexture = textureData.texture;
      setSceneItem('editorOutlinePass', editorOutlinePass);
      this.editorOutlinePass = editorOutlinePass;
      this.editorComposer.addPass(editorOutlinePass);
      // const effectFXAA = new ShaderPass(FXAAShader);
      // effectFXAA.uniforms['resolution'].value.set(
      //   1 / (reso.x * pixelRatio),
      //   1 / (reso.y * pixelRatio)
      // );
      // this.editorComposer.addPass(effectFXAA);
      const SMAA = new SMAAPass(reso.x * pixelRatio, reso.y * pixelRatio); // @TODO: change to this library: https://pmndrs.github.io/postprocessing/public/demo/#antialiasing
      this.editorComposer.addPass(SMAA);
      setSceneItem('editorComposer', this.editorComposer);

      // Stats
      const smallStatsColors = {
        FPS: { fg: null, bg: null },
        MS: { fg: null, bg: null },
        MB: { fg: null, bg: null },
      };
      const styleVars = styleVariables.split('\n');
      for (let i = 0; i < styleVars.length; i++) {
        if (styleVars[i].includes('$smallStats-fg')) {
          const value = styleVars[i].split(' ')[1].replace(';\r', '').replace(';', '');
          smallStatsColors.FPS.fg = value;
          smallStatsColors.MS.fg = value;
          smallStatsColors.MB.fg = value;
        }
        if (styleVars[i].includes('$smallStats-bg')) {
          const value = styleVars[i].split(' ')[1].replace(';\r', '').replace(';', '');
          smallStatsColors.FPS.bg = value;
          smallStatsColors.MS.bg = value;
          smallStatsColors.MB.bg = value;
          break;
        }
      }
      const smallStatsContainer = document.createElement('div');
      smallStatsContainer.id = 'smallStats-container';
      const renderStats = new SmallStats(smallStatsColors);
      renderStats.domElement.id = 'smallStats';
      smallStatsContainer.appendChild(renderStats.domElement);
      document.getElementById('root').appendChild(smallStatsContainer);
      registerStageClick();
      setSceneItem('runningRenderStats', renderStats);

      // Create selection group
      const selectionGroup = new THREE.Group();
      selectionGroup.userData.isSelectionGroup = true;
      selectionGroup.userData.id = SELECTION_GROUP_ID;
      scene.add(selectionGroup);
      setSceneItem('selectionGroup', selectionGroup);

      // Set selection(s)
      const selectionIds = sceneParams.selection;
      const selection = [];
      if (selectionIds && selectionIds.length) {
        selectionIds.forEach((id) => {
          const editorIcons = getSceneItem('editorIcons');
          for (let i = 0; i < editorIcons.length; i++) {
            if (editorIcons[i]?.icon.userData.id === id) {
              selection.push(editorIcons[i].icon);
            }
          }
          const editorTargetMeshes = getSceneItem('editorTargetMeshes') || [];
          for (let i = 0; i < editorTargetMeshes.length; i++) {
            if (editorTargetMeshes[i]?.userData.id === id) {
              editorTargetMeshes[i].visible = true;
              selection.push(editorTargetMeshes[i]);
            }
          }
          const elements = getSceneItem('elements');
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].userData.id === id) {
              selection.push(elements[i]);
            }
          }
        });
        setSceneItem('selection', selection);
      } else {
        setSceneParam('selection', []);
        setSceneItem('selection', []);
      }

      // Undo / Redo
      const undoRedo = new UndoRedo();
      setSceneItem('undoRedo', undoRedo);

      // Init UI
      const topTools = new TopTools({ id: 'top-tools', parentId: 'root' });
      topTools.draw();
      setSceneItem('topTools', topTools);

      const leftTools = new LeftTools({ id: 'left-tools', parentId: 'root' });
      leftTools.draw();
      setSceneItem('leftTools', leftTools);

      const elemTool = new ElemTool({ id: 'elem-tool', parentId: 'root', class: 'elemTool' });
      elemTool.draw();
      setSceneItem('elemTool', elemTool);

      const rightSidePanel = new RightSidePanel({ id: 'right-side-panel', parentId: 'root' });
      rightSidePanel.draw();
      setSceneItem('rightSidePanel', rightSidePanel);

      new Component({ id: 'overlays', parentId: 'root' }).draw();
      const dialog = new Dialog({ id: 'dialog', parentId: 'overlays' });
      dialog.draw();
      dialog.disappear();
      setSceneItem('dialog', dialog);

      const keyboard = new KeyboardShortcuts();
      setSceneItem('keyboard', keyboard);

      // Transform controls
      const transControls = createTransformControls();
      if (
        selection.length &&
        (leftTools.selectAndTransformTool === 'translate' ||
          leftTools.selectAndTransformTool === 'rotate' ||
          leftTools.selectAndTransformTool === 'scale')
      ) {
        transControls.enabled = true;
        transControls.mode = leftTools.selectAndTransformTool;
        transControls.attach(selection[0]); // @TODO: add multiselection
      } else {
        transControls.enabled = false;
      }

      // Select possible selected object(s)
      selectObjects(selection);
    }

    this._resize();
    setSceneItem('resizers', [this._resize]);
    this._initResizer();

    if (isEditor) {
      console.log('SCENE PARAMS', getSceneParams());
      console.log('SCENE ITEMS', getSceneItems());
      console.log('RENDERER', renderer);
      console.log('SCENE', scene, this.editorOutlinePass);
    }
  };

  _renderLoop = () => {
    const SI = getSceneItems();
    if (SI.looping) {
      requestAnimationFrame(this._renderLoop);
      // SI.renderer.render(SI.scene, SI.curCamera);
      this.editorComposer.camera = SI.curCamera;
      this.editorOutlinePass.renderCamera = SI.curCamera;
      this.renderPass.camera = SI.curCamera;
      this.editorComposer.render();
      SI.runningRenderStats.update(); // Debug statistics
      const controls = getSceneItem('orbitControls');
      if (controls) controls.update(); // @TODO: also add the ability to turn the damping off which also turns this updating off (more performant)
    }
  };

  _resize = () => {
    const SI = getSceneItems();
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
      if (
        camParams[i] &&
        (camParams[i].type === 'orthographicTarget' || camParams[i].type === 'orthographicFree')
      ) {
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
