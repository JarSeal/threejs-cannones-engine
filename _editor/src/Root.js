import { Component } from '../LIGHTER';
import { setSceneParam, getSceneParam } from './sceneData/sceneParams';
import { getSceneItem, getSceneItems, setSceneItem } from './sceneData/sceneItems';
import { getScreenResolution } from './utils/utils';
import SceneLoader from './SceneLoader/SceneLoader';
import { getSceneStates, saveProjectFolder, saveSceneId } from './sceneData/saveSession';
import Dialog from './UI/dialogs/Dialog';
import { CREATE_DEFAULT_SCENE } from './utils/defaultSceneValues';
import { loadSceneApi } from './api/loadScene';

class Root {
  constructor() {
    // Overlays and dialog
    new Component({ id: 'overlays', parentId: 'root' }).draw();
    const dialog = new Dialog({ id: 'dialog', parentId: 'overlays' });
    dialog.draw();
    dialog.disappear();
    setSceneItem('dialog', dialog);

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

      // Load the scene
      new SceneLoader(curScene, true);

      // Start the show...
      setSceneItem('looping', true);
      this._renderLoop();
    } else {
      // Show Projects view
    }
  };

  _renderLoop = () => {
    const SI = getSceneItems();
    if (SI.looping) {
      requestAnimationFrame(this._renderLoop);
      // SI.renderer.render(SI.scene, SI.curCamera);
      SI.editorComposer.camera = SI.curCamera;
      SI.editorOutlinePass.renderCamera = SI.curCamera;
      SI.renderPass.camera = SI.curCamera;
      SI.editorComposer.render();
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
