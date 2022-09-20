import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { getSceneParams } from '../sceneData/sceneParams';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { saveCameraState } from '../sceneData/saveSession';

export const createOrbitControls = () => {
  const sceneParams = getSceneParams();
  const curCameraItem = getSceneItem('curCamera');
  const cameras = sceneParams.cameras;
  const curCamera = cameras[sceneParams.curCameraIndex];
  const controls = new OrbitControls(curCameraItem, getSceneItem('renderer').domElement);
  if (curCamera.quaternion) {
    curCameraItem.quaternion.set(...curCamera.quaternion);
  }
  if (curCamera.target) {
    controls.target = new THREE.Vector3(...curCamera.target);
  }
  controls.addEventListener('end', () => {
    const quaternion = curCameraItem.quaternion;
    const position = curCameraItem.position;
    const target = controls.target;
    const saveState = { index: sceneParams.curCameraIndex, position, target };
    if (quaternion) saveState.quaternion = quaternion;
    saveCameraState(saveState);
    const rightSidePanel = getSceneItem('rightSidePanel');
    rightSidePanel.updatePanel('UICamera');
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
