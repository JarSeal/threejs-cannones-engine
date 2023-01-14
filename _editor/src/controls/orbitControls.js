import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { getSceneParam, getSceneParams, setSceneParam } from '../sceneData/sceneParams';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { saveCameraState } from '../sceneData/saveSession';

export const createOrbitControls = () => {
  let dampingTimeout;
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
  controls.enableDamping = true; // @TODO: make an editor setting for this
  controls.dampingFactor = 0.12; // @TODO: make an editor setting for this
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

  const endOrbiterMove = (saveUndoRedo) => {
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
    const rootElem = document.getElementById('root');
    rootElem.style.transitionDelay = '0s';
    rootElem.style.opacity = 1;
    const camIcon = getSceneItem('editorIcons').find((i) => curCamera.id === i.icon.userData.id);
    if (camIcon) camIcon.update(curCameraItem);
    if (saveUndoRedo) {
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
    }
  };
  let prevPosX, prevPosY, prevPosZ;
  const dampingTimeoutFn = () => {
    // Check if the camera is still moving
    const roundedDecimals = 100;
    const camIsStill =
      prevPosX ===
        (prevPosX
          ? Math.round(curCameraItem.position.x * roundedDecimals) / roundedDecimals
          : prevPosX + 1) &&
      (prevPosY === prevPosY
        ? Math.round(curCameraItem.position.y * roundedDecimals) / roundedDecimals
        : prevPosY + 1) &&
      (prevPosZ === prevPosZ
        ? Math.round(curCameraItem.position.z * roundedDecimals) / roundedDecimals
        : prevPosZ + 1);
    prevPosX = Math.round(curCameraItem.position.x * roundedDecimals) / roundedDecimals;
    prevPosY = Math.round(curCameraItem.position.y * roundedDecimals) / roundedDecimals;
    prevPosZ = Math.round(curCameraItem.position.z * roundedDecimals) / roundedDecimals;
    if (camIsStill) {
      endOrbiterMove(true);
    } else {
      endOrbiterMove(false);
      clearTimeout(dampingTimeout);
      dampingTimeout = setTimeout(dampingTimeoutFn, 100);
    }
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
    if (controls.enableDamping) {
      endOrbiterMove(false);
      clearTimeout(dampingTimeout);
      dampingTimeout = setTimeout(dampingTimeoutFn, 100);
    } else {
      endOrbiterMove(true);
    }
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
