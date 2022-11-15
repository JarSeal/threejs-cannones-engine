import * as THREE from 'three';

import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam } from '../sceneData/sceneParams';

let rayClicker;
const mouseClickStart = { x: 0, y: 0 };

export const registerStageClick = () => {
  rayClicker = new THREE.Raycaster();
  document.getElementById('main-stage').addEventListener('mouseup', _mouseUpOnStage);
  document.getElementById('main-stage').addEventListener('mousedown', _mouseDownOnStage);
};

export const unregisterStageClick = () => {
  document.getElementById('main-stage').removeEventListener('mouseup', _mouseUpOnStage);
  document.getElementById('main-stage').removeEventListener('mousedown', _mouseDownOnStage);
};

const _mouseDownOnStage = (e) => {
  e.preventDefault();

  mouseClickStart.x = e.clientX;
  mouseClickStart.y = e.clientY;
};

const _mouseUpOnStage = (e) => {
  e.preventDefault();

  if (
    getSceneParam('orbiterMoving') ||
    e.clientX !== mouseClickStart.x ||
    e.clientY !== mouseClickStart.y
  ) {
    return;
  }

  const mouse = { x: 0, y: 0 };
  mouse.x = (parseInt(e.clientX) / document.documentElement.clientWidth) * 2 - 1;
  mouse.y = -(parseInt(e.clientY) / document.documentElement.clientHeight) * 2 + 1;
  rayClicker.setFromCamera(mouse, getSceneItem('curCamera'));
  const intersects = rayClicker.intersectObjects(getSceneItem('scene').children);
  let selectedObject = null;
  const selectableObjectTypes = ['camera', 'element', 'light'];
  for (let i = 0; i < intersects.length; i++) {
    const hitObject = intersects[i].object;
    if (
      hitObject &&
      hitObject.userData?.paramType &&
      selectableObjectTypes.includes(hitObject.userData.paramType)
    ) {
      selectedObject = hitObject;
      break;
    }
  }

  if (selectedObject) {
    console.log('click', selectedObject.userData.id);
  }
};