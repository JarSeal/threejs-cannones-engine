import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { getSceneParam, getSceneParams, setSceneParam } from '../sceneData/sceneParams';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { saveCameraState } from '../sceneData/saveSession';

export const createOrbitControls = () => {
  const sceneParams = getSceneParams();
  const cameras = sceneParams.cameras;
  const curCamera = cameras[sceneParams.curCameraIndex];
  if (!curCamera || !curCamera.orbitControls) return;

  const rootElem = document.getElementById('root');
  rootElem.style.transitionProperty = 'opacity';
  rootElem.style.transitionDuration = '0.2s';
  rootElem.style.transitionTimingFunction = 'ease-in-out';

  const curCameraItem = getSceneItem('curCamera');
  const controls = new OrbitControls(curCameraItem, getSceneItem('renderer').domElement);
  if (curCamera.quaternion) {
    curCameraItem.quaternion.set(...curCamera.quaternion);
  }
  if (curCamera.target) {
    controls.target = new THREE.Vector3(...curCamera.target);
  }
  let undoRedoPrevVal = {
    position: curCamera.position,
    quaternion: curCamera.quaternion,
    target: curCamera.target,
  };
  controls.addEventListener('start', () => {
    document.activeElement.blur(); // In case there are drop down menus open (with focus), this will close them.
    rootElem.style.transitionDelay = '0.5s';
    rootElem.style.opacity = 0.5;
    const params = getSceneParam('cameras')[getSceneParam('curCameraIndex')];
    undoRedoPrevVal = {
      position: params.position,
      target: params.target,
    };
    // @TODO: Make this better by recording the start position of the movement and comparing
    // at the end listener if it has moved enough
    setTimeout(() => {
      setSceneParam('orbiterMoving', true);
    }, 100);
  });
  controls.addEventListener('end', () => {
    const position = curCameraItem.position;
    const quaternion = curCameraItem.quaternion;
    const target = controls.target;
    const undoRedoNewVal = {
      position: [position.x, position.y, position.z],
      target: [target.x, target.y, target.z],
    };
    const saveState = { index: sceneParams.curCameraIndex, position, target };
    if (quaternion) saveState.quaternion = quaternion;
    // @TODO: Make the zoom handling update the view size instead for orthographic cams (keep the zoom always 1 when scrolling the wheel)
    // (maybe do this, needs research)
    // if (curCamera && (curCamera.type === 'orthographicTarget' || curCamera.type === 'orthographicFree')) {
    //   console.log('CUR CAM', curCameraItem);
    //   saveState.orthoViewSize = curCameraItem.top + curCameraItem.bottom;
    // }
    saveCameraState(saveState);
    const rightSidePanel = getSceneItem('rightSidePanel');
    if (rightSidePanel.tabId === 'UICamera') rightSidePanel.updatePanel();
    rootElem.style.transitionDelay = '0s';
    rootElem.style.opacity = 1;
    const camIcon = getSceneItem('editorIcons').find((i) => curCamera.id === i.icon.userData.id);
    camIcon.update(curCameraItem);
    // @TODO: Make this better by recording the start position of the movement and comparing
    // at the end listener if it has moved enough
    setTimeout(() => {
      setSceneParam('orbiterMoving', false);
    }, 200);
    getSceneItem('undoRedo').addAction({
      type: 'setNewCameraTransforms',
      prevVal: undoRedoPrevVal,
      newVal: undoRedoNewVal,
      cameraIndex: getSceneParam('curCameraIndex'),
    });
  });
  // @TODO: remove this when the view size scrolling is enabled
  if (
    curCamera &&
    (curCamera.type === 'orthographicTarget' || curCamera.type === 'orthographicFree')
  ) {
    controls.enableZoom = false;
  }
  controls.update();
  setSceneItem('orbitControls', controls);
};

export const removeOrbitControls = () => {
  const controls = getSceneItem('orbitControls');
  if (!controls) return;
  controls.dispose();
  setSceneItem('orbitControls', null);
};
