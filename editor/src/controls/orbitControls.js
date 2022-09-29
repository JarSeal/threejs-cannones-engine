import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { getSceneParams } from '../sceneData/sceneParams';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { saveCameraState } from '../sceneData/saveSession';

export const createOrbitControls = () => {
  const sceneParams = getSceneParams();
  const cameras = sceneParams.cameras;
  const curCamera = cameras[sceneParams.curCameraIndex];
  if (!curCamera.orbitControls) return;

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
  controls.addEventListener('start', () => {
    rootElem.style.transitionDelay = '0.5s';
    rootElem.style.opacity = 0.5;
    const editorIcons = getSceneItem('editorIcons');
    editorIcons[sceneParams.curCameraIndex].cameraIcon.visible = false;
  });
  controls.addEventListener('end', () => {
    const quaternion = curCameraItem.quaternion;
    const position = curCameraItem.position;
    const target = controls.target;
    const saveState = { index: sceneParams.curCameraIndex, position, target };
    if (quaternion) saveState.quaternion = quaternion;
    saveCameraState(saveState);
    const rightSidePanel = getSceneItem('rightSidePanel');
    rightSidePanel.updatePanel('UICamera');
    rootElem.style.transitionDelay = '0s';
    rootElem.style.opacity = 1;
    const editorIcons = getSceneItem('editorIcons');
    editorIcons[sceneParams.curCameraIndex].cameraIcon.visible = true;
    editorIcons[sceneParams.curCameraIndex].update(curCameraItem);
  });
  controls.update();
  setSceneItem('orbitControls', controls);
};

export const removeOrbitControls = () => {
  const controls = getSceneItem('orbitControls');
  if (!controls) return;
  controls.dispose();
  setSceneItem('orbitControls', null);
};
