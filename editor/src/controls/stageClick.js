import * as THREE from 'three';
import { saveSceneState } from '../sceneData/saveSession';

import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam, setSceneParamR } from '../sceneData/sceneParams';
import { removeCameraTargetMesh, updateCameraTargetMesh } from '../UI/icons/meshes/CameraMeshIcon';
import { CAMERA_TARGET_ID } from '../utils/defaultSceneValues';

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

export const getMouseClickStart = () => mouseClickStart;

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
  let selectedObjects = [];
  const selectableObjectTypes = ['camera', 'cameraTarget', 'element', 'light'];
  for (let i = 0; i < intersects.length; i++) {
    const hitObject = intersects[i].object;
    if (
      hitObject &&
      hitObject.userData?.paramType &&
      !hitObject.isLine && // CameraHelpers cannot be selected
      selectableObjectTypes.includes(hitObject.userData.paramType)
    ) {
      // TODO: Add shift key addition to add multiple object and create a temp group for them
      // Also check here if SHIFT is pressed and if the object is already selected,
      // then that object should be deselected.
      // TODO: Check if the object is part of a group, then select all objects in that group if it is (selecting a group)
      selectedObjects = [hitObject];
      break;
    }
  }

  selectObjects(selectedObjects);
};

// The selectedObjects can be an array of object IDs (strings) or array of 3D objects
export const selectObjects = (selectedObjects, args) => {
  const prevSelection = [...getSceneParam('selection')];
  let selectionIds = [];
  if (selectedObjects?.length && !selectedObjects[0].isObject3D) {
    // The selectedObjects are object IDs, we need to get the 3D objects:
    selectionIds = [...selectedObjects];
    const selected3DObjects = [];
    selectedObjects.forEach((id) => {
      const object3D = getSceneItem('scene').children.find((obj) => obj.userData?.id === id);
      if (object3D?.isGroup && object3D?.userData.paramType === 'camera') {
        selected3DObjects.push(object3D.children[0]);
      } else if (object3D) {
        selected3DObjects.push(object3D);
      } else if (id === CAMERA_TARGET_ID && args.targetParamId) {
        const params = getSceneParam('cameras').find((c) => c.id === args.targetParamId);
        updateCameraTargetMesh(params);
        selected3DObjects.push(getSceneItem('cameraTargetMesh'));
      }
    });
    selectedObjects = selected3DObjects;
  }
  // @TODO: Check if object is part of a group, then select all objects belonging into that group (selecting a group)

  const outlinePass = getSceneItem('editorOutlinePass');
  const transControls = getSceneItem('transformControls');
  const leftTools = getSceneItem('leftTools');
  if (prevSelection && prevSelection.length) outlinePass.selectedObjects = [];
  if (selectedObjects?.length) {
    const selection = selectedObjects;
    selectionIds = selection.map((sel) => sel.userData?.id);
    outlinePass.selectedObjects = selection;
    if (
      leftTools.selectAndTransformTool === 'translate' ||
      leftTools.selectAndTransformTool === 'rotate' ||
      leftTools.selectAndTransformTool === 'scale'
    ) {
      transControls.enabled = true;
      if (selection[0].userData.paramType === 'camera') {
        transControls.attach(selection[0].parent); // @TODO: add multiselect
      } else {
        transControls.attach(selection[0]); // @TODO: add multiselect
      }
    }
    if (selection[0].userData.isTargetedCamera) {
      updateCameraTargetMesh(getSceneParam('cameras')[selection[0].userData.index]);
    } else if (!selection[0].userData.cameraParams?.isTargetedCamera) {
      removeCameraTargetMesh();
    }
    setSceneItem('selection', selection);
    setSceneParam('selection', selectionIds);
    saveSceneState({ selection: selectionIds });
  } else {
    removeCameraTargetMesh();
    setSceneItem('selection', []);
    setSceneParam('selection', []);
    transControls.detach();
    saveSceneState({ selection: [] });
  }
  getSceneItem('leftTools').updateTools();
  setSceneParamR('editor.scrollPositions.elemTool', 0);
  getSceneItem('elemTool').updateTool();
  getSceneItem('undoRedo').addAction({
    type: 'selection',
    prevVal: prevSelection,
    newVal: selectionIds,
    targetParamId:
      selectedObjects.length && selectionIds.includes(CAMERA_TARGET_ID)
        ? selectedObjects[0].userData.cameraParams.id
        : null,
  });

  console.log(
    'selection',
    getSceneParam('selection'),
    getSceneItem('selection'),
    selectedObjects[0]?.userData.cameraParams?.id
  );
};
