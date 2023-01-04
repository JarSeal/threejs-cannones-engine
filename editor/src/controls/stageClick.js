import * as THREE from 'three';
import { saveSceneState } from '../sceneData/saveSession';

import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam, setSceneParamR } from '../sceneData/sceneParams';

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

  const selectableObjectTypes = ['camera', 'cameraTarget', 'element', 'light'];
  const checkHitObjectParamType = (hitObject) => {
    // Check the hitObject and its' parent
    let paramTypeFound = selectableObjectTypes.includes(hitObject.userData.paramType);
    if (!paramTypeFound) {
      paramTypeFound = selectableObjectTypes.includes(hitObject.parent.userData.paramType);
    }
    return paramTypeFound;
  };

  const mouse = { x: 0, y: 0 };
  mouse.x = (parseInt(e.clientX) / document.documentElement.clientWidth) * 2 - 1;
  mouse.y = -(parseInt(e.clientY) / document.documentElement.clientHeight) * 2 + 1;
  rayClicker.setFromCamera(mouse, getSceneItem('curCamera'));
  const intersects = rayClicker.intersectObjects(getSceneItem('scene').children);
  let selectedObjects = [];
  for (let i = 0; i < intersects.length; i++) {
    let hitObject = intersects[i].object;
    if (
      hitObject &&
      !hitObject.isLine && // Helpers cannot be selected
      hitObject.visible &&
      checkHitObjectParamType(hitObject)
    ) {
      if (!hitObject.userData.paramType) hitObject = hitObject.parent; // The hit is on one of the direct children elements, make the parent the hitObject
      const keysDown = getSceneItem('keyboard')?.keysDown || [];
      let curSelection = getSceneItem('selection') || [];
      if (!hitObject) {
        break;
      } else if (keysDown.includes('Shift')) {
        let selectionFound = false;
        const filteredSelection = [];
        for (let i = 0; i < curSelection.length; i++) {
          if (curSelection[i].uuid === hitObject.uuid) {
            selectionFound = true;
          } else {
            filteredSelection.push(curSelection[i]);
          }
        }
        if (selectionFound) {
          selectedObjects = filteredSelection;
        } else {
          selectedObjects = [...curSelection, hitObject];
        }
      } else {
        selectedObjects = [hitObject];
      }
      break;
    }
  }

  selectObjects(selectedObjects);
};

// **************************
// SELECT OBJECTS
// **************************
// The selectedObjects can be an array of object IDs (strings) or array of 3D objects
export const selectObjects = (selectedObjects) => {
  const prevSelection = [...getSceneParam('selection')];
  let selectionIds = [];
  let selectedObjectsHaveIds = false;
  const scene = getSceneItem('scene');
  let isMultiselect = selectedObjects.length > 1;

  for (let i = 0; i < selectedObjects.length; i++) {
    if (!selectedObjects[i]?.isObject3D) {
      selectedObjectsHaveIds = true;
      break;
    }
  }

  if (isMultiselect || getSceneItem('selectionGroup').children.length) {
    // Empty the selection group
    const selGroupChildren = [...getSceneItem('selectionGroup').children];
    selGroupChildren.forEach((elem) => {
      scene.attach(elem);
    });
  }

  if (selectedObjects?.length && selectedObjectsHaveIds) {
    // The selectedObjects are object IDs, we need to get the 3D objects:
    // For example the undo/redo uses only the IDs (since they need to be saved to the LS)
    selectionIds = [...selectedObjects];
    const selected3DObjects = [];
    selectedObjects.forEach((id) => {
      const object3D = scene.children.find((obj) => obj.isMesh && obj.userData?.id === id);
      if (object3D) {
        selected3DObjects.push(object3D);
        if (object3D.userData.isTargetObject) {
          object3D.visible = true;
        }
      }
    });
    selectedObjects = selected3DObjects; // After this point, the possible selected objects are always Object3D objects
    isMultiselect = selectedObjects.length > 1;
  }

  // Check if there are targeting objects or target objects in the selections,
  // then change and disable left tools accordingly (rotation and scale are disabled)
  const leftTools = getSceneItem('leftTools');
  let disabledLeftTools = [];
  if (isMultiselect) disabledLeftTools = ['scale'];
  for (let i = 0; i < selectedObjects.length; i++) {
    if (
      selectedObjects[i].userData.isTargetingObject ||
      selectedObjects[i].userData.isTargetObject
    ) {
      disabledLeftTools = ['rotate', 'scale'];
      break;
    }
  }
  if (disabledLeftTools.includes(leftTools.selectAndTransformTool)) {
    leftTools.changeTool(disabledLeftTools.includes('translate') ? 'select' : 'translate');
  }
  leftTools.disableTools(disabledLeftTools);

  const outlinePass = getSceneItem('editorOutlinePass');
  if (isMultiselect) {
    outlinePass.usePatternTexture = true;
  } else {
    outlinePass.usePatternTexture = false;
  }

  const selGroup = getSceneItem('selectionGroup');
  if (isMultiselect) {
    selectedObjects.forEach((obj) => selGroup.attach(obj));
  }

  const transControls = getSceneItem('transformControls');
  if (prevSelection && prevSelection.length) outlinePass.selectedObjects = [];
  if (selectedObjects.length) {
    const selection = selectedObjects;
    selectionIds = selection.map((sel) => sel.userData?.id);
    outlinePass.selectedObjects = selection;
    const leftToolSelected = leftTools.selectAndTransformTool;
    transControls.enabled = false;
    if (
      leftToolSelected === 'translate' ||
      leftToolSelected === 'rotate' ||
      leftToolSelected === 'scale'
    ) {
      transControls.mode = leftToolSelected;
      transControls.enabled = true;
      if (selectedObjects.length === 1) {
        transControls.attach(selection[0]);
      } else {
        // Count the group's bounding box
        const aabb = new THREE.Box3().setFromObject(selGroup);
        // Remove the selected items temporarily from the group (set them to the scene)
        const selGroupChildren = [...selGroup.children];
        selGroupChildren.forEach((sel) => scene.attach(sel)); // Attach the selGroup children temporarily to the scene
        // Position the group to the middle of the bounding box
        selGroup.position.set(
          aabb.min.x + 0.5 * (aabb.max.x - aabb.min.x),
          aabb.min.y + 0.5 * (aabb.max.y - aabb.min.y),
          aabb.min.z + 0.5 * (aabb.max.z - aabb.min.z)
        );
        selGroup.updateWorldMatrix();
        // Add the selected item back to the group
        selGroupChildren.forEach((sel) => selGroup.attach(sel));
        // Attach the transform controls
        transControls.attach(selGroup);
      }
    } else {
      // Selection tool (no transforms)
      transControls.detach();
    }
    for (let i = 0; i < selection.length; i++) {
      if (selection[i].userData.isTargetingObject) {
        const elemId = selection[i].userData.id;
        const targetMesh = getSceneItem('editorTargetMeshes')?.find(
          (mesh) => mesh.userData.params.id === elemId
        );
        if (targetMesh) targetMesh.visible = true;
      }
    }
    setSceneItem('selection', selection);
    setSceneParam('selection', selectionIds);
    saveSceneState({ selection: selectionIds });
  } else {
    setSceneItem('selection', []);
    setSceneParam('selection', []);
    transControls.detach();
    transControls.enabled = false;
    saveSceneState({ selection: [] });
  }

  // Hide possible target meshes when the selection changes
  for (let i = 0; i < prevSelection.length; i++) {
    const targetMesh = getSceneItem('editorTargetMeshes')?.find(
      (mesh) =>
        !selectionIds.includes(mesh.userData.params.id) &&
        !selectionIds.includes(mesh.userData.id) &&
        (mesh.userData.params.id === prevSelection[i] || // Targeting item (like camera) was selected
          mesh.userData.id === prevSelection[i]) // Target mesh was selected
    );
    if (targetMesh) targetMesh.visible = targetMesh.userData.params.showHelper;
  }

  getSceneItem('leftTools').updateTools();
  setSceneParamR('editor.scrollPositions.elemTool', 0);
  getSceneItem('elemTool').updateTool();
  getSceneItem('undoRedo').addAction({
    type: 'selection',
    prevVal: prevSelection,
    newVal: selectionIds,
  });

  console.log('selection', getSceneParam('selection'), getSceneItem('selection'));
};
