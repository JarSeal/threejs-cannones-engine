import * as THREE from 'three';

import { createOrbitControls, removeOrbitControls } from '../controls/orbitControls';
import { saveAllCamerasState, saveCameraState, saveSceneState } from '../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import ConfirmationDialog from '../UI/dialogs/Confirmation';
import NewCamera from '../UI/dialogs/NewCamera';
import CameraMeshIcon from '../UI/icons/meshes/CameraMeshIcon';
import { getScreenResolution } from './utils';

export const updateCameraProperty = (value, i, key, args) => {
  let prevVal = getSceneParam('cameras')[i][key];
  const newCamParams = getSceneParam('cameras').map((cam, index) => {
    if (index === i) return { ...cam, [key]: value };
    return cam;
  });
  const cam = getSceneItem('allCameras')[i];
  if (key === 'orthoViewSize') {
    const reso = getScreenResolution();
    const aspectRatio = reso.x / reso.y;
    cam.left = -value * aspectRatio;
    cam.right = value * aspectRatio;
    cam.top = value;
    cam.bottom = -value;
  } else {
    cam[key] = value;
  }
  cam.userData = newCamParams;
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: i, [key]: value });
  const helpers = getSceneItem('cameraHelpers');
  if (helpers && helpers.length && helpers[i]) {
    helpers[i].update();
  }
  getSceneItem('topTools')?.updateTools();
  if (args?.doNotUpdateUndo !== true) {
    const isTransform = key === 'position' || key === 'target' || key === 'quaternion';
    const additionalParams = isTransform && args ? { valueIndex: args.valueIndex } : {};
    getSceneItem('undoRedo').addAction({
      type: isTransform ? 'updateCameraTransforms' : 'updateCameraProperty',
      prevVal: prevVal,
      newVal: value,
      key,
      index: i,
      ...additionalParams,
    });
  }
};

export const newCameraDialog = () =>
  getSceneItem('dialog').appear({
    component: NewCamera,
    title: 'Add new camera',
  });

export const addCamera = (params) => {
  const scene = getSceneItem('scene');
  // Create three.js camera and helper
  const reso = getScreenResolution();
  const aspectRatio = reso.x / reso.y;
  params.paramType = 'camera';
  let camera;
  if (params.type === 'perspective') {
    camera = new THREE.PerspectiveCamera(params.fov, aspectRatio, params.near, params.far);
  } else if (params.type === 'orthographic') {
    const viewSize = params.orthoViewSize;
    camera = new THREE.OrthographicCamera(
      -viewSize * aspectRatio,
      viewSize * aspectRatio,
      viewSize,
      -viewSize,
      params.near,
      params.far
    );
  }
  if (!camera) {
    console.error('Camera type invalid');
    return;
  }

  camera.position.set(...params.position);
  camera.lookAt(new THREE.Vector3(...params.target));
  const helpers = getSceneItem('cameraHelpers');
  const helper = new THREE.CameraHelper(camera);
  helper.userData = params;
  if (!params.showHelper) helper.visible = false;
  helpers.push(helper);
  helper.update();
  scene.add(helper);
  camera.updateWorldMatrix();
  camera.userData = params;

  new CameraMeshIcon(camera, params);

  let allCameras = getSceneItem('allCameras');
  if (allCameras && Array.isArray(allCameras)) {
    allCameras.push(camera);
  } else {
    allCameras = [camera];
  }
  setSceneItem('allCameras', allCameras);
  const cameraParams = getSceneParam('cameras');
  const nextIndex = cameraParams.length;
  params.index = nextIndex;
  params.defaultPosition = [...params.position];
  params.defaultTarget = [...params.target];
  if (cameraParams && Array.isArray(cameraParams)) {
    cameraParams.push(params);
  } else {
    allCameras = [params];
  }
  saveAllCamerasState(cameraParams);

  getSceneItem('topTools').updateTools();
  getSceneItem('rightSidePanel').updatePanel();

  getSceneItem('dialog').disappear();

  getSceneItem('undoRedo').addAction({
    type: 'addCamera',
    prevVal: null,
    newVal: cameraParams.length - 1,
    params,
  });
};

export const updateCameraTransforms = (
  posOrTar,
  value,
  valueIndex,
  cameraIndex,
  updateRightPanel
) => {
  const cam = getSceneItem('allCameras')[cameraIndex];
  const curPos = getSceneParam('cameras')[cameraIndex].position;
  const curTarget = getSceneParam('cameras')[cameraIndex].target;
  let prevVal;
  if (posOrTar === 'position') {
    prevVal = curPos[valueIndex];
    curPos[valueIndex] = parseFloat(value);
  } else if (posOrTar === 'target') {
    prevVal = curTarget[valueIndex];
    curTarget[valueIndex] = parseFloat(value);
  }
  const newCamParams = getSceneParam('cameras').map((cam, index) => {
    if (index === cameraIndex) return { ...cam, position: curPos, target: curTarget };
    return cam;
  });
  cam.position.set(...curPos);
  cam.lookAt(...curTarget);
  cam.userData = newCamParams;
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: cameraIndex, position: curPos, target: curTarget });
  if (posOrTar === 'target' && cameraIndex === getSceneParam('curCameraIndex')) {
    getSceneItem('orbitControls').target = new THREE.Vector3(...curTarget);
  }
  getSceneItem('undoRedo').addAction({
    type: 'updateCameraTransforms',
    prevVal: prevVal,
    newVal: value,
    posOrTar,
    cameraIndex,
    valueIndex,
  });
  const rightPanel = getSceneItem('rightSidePanel');
  if (updateRightPanel && rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
  const editorIcon = getSceneItem('editorIcons').find(
    (icon) => newCamParams[cameraIndex].id === icon.iconMesh.userData.id
  );
  if (editorIcon) editorIcon.update(cam);

  // // Rotation
  // const rotationA = [cam.rotation.x, cam.rotation.y, cam.rotation.z];
  // rotationA[valueIndex] = parseFloat(value);

  // // 1. Get the length from camera position to target position
  // const curTarget = getSceneParam('cameras')[cameraIndex].target;
  // const curRotation = getSceneParam('cameras')[cameraIndex].quaternion;
  // const targetDistance = cam.position.distanceTo(new THREE.Vector3(...curTarget));

  // cam.rotation.set(...rotationA);
  // cam.updateProjectionMatrix();
  // const curQuats = [cam.quaternion.x, cam.quaternion.y, cam.quaternion.z, cam.quaternion.w];
  // updateCameraProperty(curQuats, cameraIndex, 'quaternion', {
  //   valueIndex,
  //   prevVal: [...curRotation],
  // });

  // // 2. Find the position at the end of this distance
  // const newTarget = new THREE.Vector3();
  // const camDirection = cam.getWorldDirection(new THREE.Vector3());
  // newTarget.addVectors(cam.position, camDirection.multiplyScalar(targetDistance));
  // const newTargetA = [newTarget.x, newTarget.y, newTarget.z];
  // updateCameraProperty(newTargetA, cameraIndex, 'target', { doNotUpdateUndo: true });
  // if (cameraIndex === getSceneParam('curCameraIndex')) {
  //   getSceneItem('orbitControls').target = newTarget;
  // }
};

export const updateCameraDefaultTransforms = (
  posOrTar,
  value,
  valueIndex,
  cameraIndex,
  updateRightPanel
) => {
  const cameraParams = getSceneParam('cameras');
  let prevVal;
  if (posOrTar === 'position') {
    if (!cameraParams[cameraIndex].defaultPosition)
      cameraParams[cameraIndex].defaultPosition = [5, 5, 5];
    prevVal = cameraParams[cameraIndex].defaultPosition[valueIndex];
    cameraParams[cameraIndex].defaultPosition[valueIndex] = parseFloat(value);
  } else if (posOrTar === 'target') {
    if (!cameraParams[cameraIndex].defaultTarget)
      cameraParams[cameraIndex].defaultTarget = [0, 0, 0];
    prevVal = cameraParams[cameraIndex].defaultTarget[valueIndex];
    cameraParams[cameraIndex].defaultTarget[valueIndex] = parseFloat(value);
  }
  if (prevVal === value) return;
  setSceneParam('cameras', cameraParams);
  saveAllCamerasState(cameraParams);
  const rightPanel = getSceneItem('rightSidePanel');
  if (updateRightPanel && rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
  getSceneItem('undoRedo').addAction({
    type: 'updateCameraDefaultTransforms',
    prevVal,
    newVal: value,
    valueIndex,
    cameraIndex,
    posOrTar,
  });
};

export const toggleOrbitControls = (isTurnedOn, cameraIndex) => {
  updateCameraProperty(isTurnedOn, cameraIndex, 'orbitControls', { doNotUpdateUndo: true });
  if (isTurnedOn) {
    if (cameraIndex === getSceneParam('curCameraIndex')) createOrbitControls();
  } else {
    if (cameraIndex === getSceneParam('curCameraIndex')) removeOrbitControls();
  }
  getSceneItem('undoRedo').addAction({
    type: 'toggleOrbitControls',
    prevVal: !isTurnedOn,
    newVal: isTurnedOn,
    cameraIndex,
  });
};

export const toggleShowCameraHelper = (isTurnedOn, cameraIndex) => {
  if (cameraIndex !== getSceneParam('curCameraIndex')) {
    const helpers = getSceneItem('cameraHelpers');
    if (helpers && helpers.length && helpers[cameraIndex]) {
      helpers[cameraIndex].visible = isTurnedOn;
    }
  }
  const cameraParams = getSceneParam('cameras');
  cameraParams[cameraIndex].showHelper = isTurnedOn;
  setSceneParam('cameras', cameraParams);
  saveCameraState({ index: cameraIndex, showHelper: isTurnedOn });
  getSceneItem('undoRedo').addAction({
    type: 'toggleShowCameraHelper',
    prevVal: !isTurnedOn,
    newVal: isTurnedOn,
    cameraIndex,
  });
};

export const changeCurCamera = (newCamIndex) => {
  const camItems = getSceneItem('allCameras');
  const camHelpers = getSceneItem('cameraHelpers');
  const camParams = getSceneParam('cameras');
  const camPanels = getSceneItem('cameraPanels');
  let newCamera = null,
    newCameraIndex = 0,
    newCameraHasOrbitControls = false,
    helpers = [];
  const scene = getSceneItem('scene');
  if (newCamIndex > camParams.length - 1) newCamIndex = 0;
  for (let i = 0; i < camItems.length; i++) {
    if (camHelpers && camHelpers.length && camHelpers[i]) {
      camHelpers[i].dispose();
      scene.remove(camHelpers[i]);
    }
    if (camPanels && camPanels[i] && camPanels[i].elem)
      camPanels[i].elem.classList.remove('highlight');
    if (camParams[i].id === camParams[newCamIndex].id) {
      newCamera = camItems[i];
      newCameraIndex = i;
      newCameraHasOrbitControls = camParams[i].orbitControls;
      helpers.push(null);
      if (camPanels && camPanels[i] && camPanels[i].elem)
        camPanels[i].elem.classList.add('highlight');
    } else {
      const helper = new THREE.CameraHelper(camItems[i]);
      helper.userData = camParams[i];
      helpers.push(helper);
      helper.update();
      helper.visible = camParams[i].showHelper;
      scene.add(helper);
    }
  }
  removeOrbitControls();
  setSceneParam('curCameraIndex', newCameraIndex);
  saveSceneState();
  setSceneItem('curCamera', newCamera);
  setSceneItem('cameraHelpers', helpers);
  newCamera.updateProjectionMatrix();
  if (newCameraHasOrbitControls) createOrbitControls();

  const rightPanel = getSceneItem('rightSidePanel');
  if (rightPanel.tabId === 'UICamera') rightPanel.updatePanel();

  getSceneItem('topTools')?.updateTools();
};

export const resetCameraTransforms = (cameraIndex) => {
  if (cameraIndex === getSceneParam('curCameraIndex')) {
    removeOrbitControls();
    createOrbitControls();
  }
  const cameraParams = getSceneParam('cameras');
  const pos = [...(cameraParams[cameraIndex].defaultPosition || [5, 5, 5])];
  const target = [...(cameraParams[cameraIndex].defaultTarget || [0, 0, 0])];
  const prevVal = {
    pos: [...cameraParams[cameraIndex].position],
    target: [...cameraParams[cameraIndex].target],
  };
  const cam = getSceneItem('allCameras')[cameraIndex];
  const newCamParams = getSceneParam('cameras').map((cam, index) => {
    if (index === cameraIndex) return { ...cam, position: pos, target: target }; // TODO: ADD ROTATION
    return cam;
  });
  cam.position.set(...pos);
  cam.lookAt(...target);
  cam.userData = newCamParams;
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: cameraIndex, position: pos, target: target });
  if (cameraIndex === getSceneParam('curCameraIndex')) {
    const controls = getSceneItem('orbitControls');
    if (controls) controls.target = new THREE.Vector3(...target);
  }
  const editorIcon = getSceneItem('editorIcons').find(
    (icon) => newCamParams[cameraIndex].id === icon.iconMesh.userData.id
  );
  if (editorIcon) editorIcon.update(getSceneItem('allCameras')[cameraIndex]);
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('undoRedo').addAction({
    type: 'resetCameraTransforms',
    prevVal,
    newVal: null,
    cameraIndex,
  });
};

export const destroyCamera = (cameraIndex, destroyWithoutDialogAndUndo) => {
  const destoryCamera = () => {
    const cameraItems = getSceneItem('allCameras');
    if (cameraItems.length <= 1) return; // There has to always at least one camera in the scene
    const index = cameraIndex;
    const destroyCameraParams = { ...getSceneParam('cameras')[index] };
    const cameraParams = getSceneParam('cameras')
      .filter((cam) => cam.id !== destroyCameraParams.id)
      .map((c, i) => {
        c.index = i;
        return c;
      });
    setSceneParam('cameras', cameraParams);
    const selection = getSceneItem('selection');
    for (let i = 0; i < selection.length; i++) {
      if (selection[i].userData?.id === cameraItems[index].userData.id) {
        const filteredSelection = selection.filter(
          (sel) => sel.userData.id !== cameraItems[index].userData.id
        );
        setSceneItem('selection', filteredSelection);
        const selectionIds = filteredSelection.map((sel) => sel.userData.id);
        setSceneParam('selection', selectionIds);
        saveSceneState({ selection: filteredSelection.map((sel) => sel.userData.id) });
        break;
      }
    }

    // Update camera helpers
    const helpers = getSceneItem('cameraHelpers');
    if (helpers[index]) {
      helpers[index].dispose();
      getSceneItem('scene').remove(helpers[index]);
    }
    setSceneItem(
      'cameraHelpers',
      helpers
        .filter((_, i) => i !== index)
        .map((c, i) => {
          if (c) {
            c.userData = cameraParams[i];
          }
          return c;
        })
    );

    // Update camera items
    setSceneItem(
      'allCameras',
      cameraItems
        .filter((c, i) => {
          if (i === index) {
            c.clear();
            c.removeFromParent();
          }
          return i !== index;
        })
        .map((c, i) => {
          c.userData = cameraParams[i];
          return c;
        })
    );

    // Update editor icons
    const editorIcons = getSceneItem('editorIcons');
    editorIcons.find((icon) => {
      if (icon.cameraIcon.userData.id === destroyCameraParams.id) {
        icon.remove();
      }
    });

    saveCameraState({ removeIndex: index });
    if (index === getSceneParam('curCameraIndex')) {
      changeCurCamera(0);
    } else if (index < getSceneParam('curCameraIndex')) {
      changeCurCamera(getSceneParam('curCameraIndex') - 1);
    }
    getSceneItem('topTools').updateTools();
    getSceneItem('leftTools').updateTools();
    const rightPanel = getSceneItem('rightSidePanel');
    if (rightPanel.tabId === 'UICamera') rightPanel.updatePanel();

    getSceneItem('undoRedo').addAction({
      type: 'destroyCamera',
      prevVal: destroyCameraParams,
      newVal: null,
      cameraIndex,
    });
  };

  const destroyCameraParams = { ...getSceneParam('cameras')[cameraIndex] };
  const cameraTextToDestroy = destroyCameraParams.name
    ? `${destroyCameraParams.name} (id: ${destroyCameraParams.id})`
    : destroyCameraParams.id;
  if (!destroyWithoutDialogAndUndo) {
    getSceneItem('dialog').appear({
      component: ConfirmationDialog,
      componentData: {
        id: 'delete-cam-conf-dialog-' + cameraIndex,
        confirmButtonClasses: ['confirmButtonDelete'],
        confirmButtonText: 'Destroy!',
        message:
          'Are you sure you want to destroy this camera completely: ' + cameraTextToDestroy + '?',
        confirmButtonFn: () => {
          destoryCamera();
          getSceneItem('dialog').disappear();
        },
      },
      title: 'Are you sure?',
    });
  } else {
    destoryCamera();
  }
};

export const setNewCameraTransforms = (transforms, cameraIndex) => {
  if (cameraIndex === getSceneParam('curCameraIndex')) {
    removeOrbitControls();
    createOrbitControls();
  }
  const cameraParams = getSceneParam('cameras');
  const cam = getSceneItem('allCameras')[cameraIndex];
  const position = transforms.position;
  const target = transforms.target;
  const prevVal = {
    position: [...cameraParams[cameraIndex].position],
    target: [...cameraParams[cameraIndex].target],
  };
  const newCamParams = getSceneParam('cameras').map((c, index) => {
    if (index === cameraIndex) return { ...c, position, target };
    return c;
  });
  cam.position.set(...position);
  cam.lookAt(...target);
  cam.userData = newCamParams;
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: cameraIndex, position, target });
  if (cameraIndex === getSceneParam('curCameraIndex')) {
    const controls = getSceneItem('orbitControls');
    if (controls) controls.target = new THREE.Vector3(...target);
  }
  const editorIcon = getSceneItem('editorIcons').find(
    (icon) => newCamParams[cameraIndex].id === icon.iconMesh.userData.id
  );
  if (editorIcon) editorIcon.update(getSceneItem('allCameras')[cameraIndex]);
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('undoRedo').addAction({
    type: 'setNewCameraTransforms',
    prevVal,
    newVal: { position, target },
    cameraIndex,
  });
};

export default {
  updateCameraProperty,
  newCameraDialog,
  addCamera,
  updateCameraTransforms,
  updateCameraDefaultTransforms,
  toggleOrbitControls,
  toggleShowCameraHelper,
  changeCurCamera,
  resetCameraTransforms,
  destroyCamera,
  setNewCameraTransforms,
};
