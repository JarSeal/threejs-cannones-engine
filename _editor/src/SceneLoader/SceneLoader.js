import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

import { OutlinePass } from '../postFX/OutlinePass/OutlinePass.js';
import { setSceneParam, setSceneParams } from '../sceneData/sceneParams';
import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import ElementLoader from './ElementLoader';
import { saveStateByKey } from '../sceneData/saveSession';
import {
  AMBIENT_LIGHT,
  CANVAS_ELEM_ID,
  DEFAULT_TEXTURE,
  HEMI_LIGHT,
  NEW_CAMERA_DEFAULT_PARAMS,
  NEW_ELEM_DEFAULT_PARAMS,
  POINT_LIGHT,
  SELECTION_GROUP_ID,
  SMALL_STATS_CONTAINER_ID,
  SMALL_STATS_ID,
} from '../utils/defaultSceneValues';
import { addCamera } from '../utils/toolsForCamera';
import TextureLoader from '../loaders/TextureLoader';
import { getScreenResolution } from '../utils/utils';
import styleVariables from '../sass/variables.scss?raw';
import SmallStats from '../UI/stats/SmallStats.js';
import { registerStageClick, selectObjects } from '../controls/stageClick.js';
import UndoRedo from '../UI/UndoRedo/UndoRedo.js';
import TopTools from '../UI/TopTools.js';
import LeftTools from '../UI/LeftTools.js';
import ElemTool from '../UI/ElemTool.js';
import RightSidePanel from '../UI/RightSliderPanel.js';
import KeyboardShortcuts from '../UI/KeyboarShortcuts.js';
import { createTransformControls } from '../controls/transformControls.js';

class SceneLoader {
  constructor(scene, isEditor) {
    this.scene;
    this.isEditor = isEditor;
    if (scene) this._createScene(scene);
    return this.scene;
  }

  _createScene = (sceneParams) => {
    setSceneParams(sceneParams);

    // Setup textureLoader @TODO: create TextureLoader class
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
    if (this.isEditor) renderer.debug.checkShaderErrors = true; // Disable this for production (performance gain), @TODO: create an env variable to control this
    renderer.domElement.id = CANVAS_ELEM_ID;
    document.body.appendChild(renderer.domElement);
    setSceneItem('renderer', renderer);

    // Create textures (sceneItems)
    this._createTextures(sceneParams.textures);

    // Create three.js Scene object
    this.scene = new THREE.Scene();
    setSceneItem('scene', this.scene);

    // Set scene texture or skybox
    if (sceneParams.backgroundSkybox) {
      // @TODO: Set skybox here...
    } else if (sceneParams.backgroundTexture) {
      const backgroundTexture = getSceneItem('textures').find(
        (tex) => tex.userData.id === sceneParams.backgroundTexture
      );
      if (backgroundTexture) {
        this.scene.background = backgroundTexture;
      } else {
        console.warn(
          `Could not find backgroundTexture from textures (sceneItems) with ID: "${sceneParams.backgroundTexture}".`
        );
      }
    }

    // Create entities according to params
    this._createCameras(sceneParams.cameras, sceneParams);
    this._createLights(sceneParams.lights);
    this._createObjects(sceneParams.elements);
    this._createGrid(sceneParams);
    this._createAxesHelper(sceneParams);

    if (this.isEditor) {
      // Editor post processing (outline and SMAA/FXAA)
      const reso = getScreenResolution();
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
        samples: 4,
      });
      const editorComposer = new EffectComposer(renderer, renderTarget);
      const renderPass = new RenderPass(this.scene, getSceneItem('curCamera'));
      editorComposer.addPass(renderPass);
      setSceneItem('renderPass', renderPass);
      const editorOutlinePass = new OutlinePass(
        new THREE.Vector2(reso.x * pixelRatio, reso.y * pixelRatio),
        this.scene,
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
      editorComposer.addPass(editorOutlinePass);
      // const effectFXAA = new ShaderPass(FXAAShader);
      // effectFXAA.uniforms['resolution'].value.set(
      //   1 / (reso.x * pixelRatio),
      //   1 / (reso.y * pixelRatio)
      // );
      // this.editorComposer.addPass(effectFXAA);
      const SMAA = new SMAAPass(reso.x * pixelRatio, reso.y * pixelRatio); // @TODO: change to this library: https://pmndrs.github.io/postprocessing/public/demo/#antialiasing
      editorComposer.addPass(SMAA);
      setSceneItem('editorComposer', editorComposer);

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
      smallStatsContainer.id = SMALL_STATS_CONTAINER_ID;
      const renderStats = new SmallStats(smallStatsColors);
      renderStats.domElement.id = SMALL_STATS_ID;
      smallStatsContainer.appendChild(renderStats.domElement);
      document.getElementById('root').appendChild(smallStatsContainer);
      registerStageClick();
      setSceneItem('smallStats', renderStats);

      // Create selection group
      const selectionGroup = new THREE.Group();
      selectionGroup.userData.isSelectionGroup = true;
      selectionGroup.userData.id = SELECTION_GROUP_ID;
      this.scene.add(selectionGroup);
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
        transControls.attach(selection[0]);
      } else {
        transControls.enabled = false;
      }

      // Select possible selected object(s)
      selectObjects(selection);
    }
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

  _createTextures = (textures) => {
    const newTextureItems = [];
    textures.forEach((tex) => {
      const newTextureItem = new THREE.Texture();
      newTextureItem.flipY = tex.flipY || DEFAULT_TEXTURE.flipY;
      newTextureItem.wrapS = tex.wrapS || DEFAULT_TEXTURE.wrapS;
      newTextureItem.wrapT = tex.wrapT || DEFAULT_TEXTURE.wrapT;
      newTextureItem.repeating = new THREE.Vector2(
        tex.wrapSTimes || DEFAULT_TEXTURE.wrapSTimes,
        tex.wrapTTimes || DEFAULT_TEXTURE.wrapTTimes
      );
      newTextureItem.offset = new THREE.Vector2(
        tex.offsetU || DEFAULT_TEXTURE.offsetU,
        tex.offsetV || DEFAULT_TEXTURE.offsetV
      );
      newTextureItem.center = new THREE.Vector2(
        tex.centerU || DEFAULT_TEXTURE.centerU,
        tex.centerV || DEFAULT_TEXTURE.centerV
      );
      newTextureItem.rotation = tex.rotation || DEFAULT_TEXTURE.rotation;
      newTextureItem.userData = tex;
      newTextureItems.push(newTextureItem);
    });
    setSceneItem('textures', newTextureItems);
    saveStateByKey('textures', textures);
  };
}

export default SceneLoader;
