import * as THREE from 'three';

import { createOrbitControls, removeOrbitControls } from '../controls/orbitControls';
import { selectObjects } from '../controls/stageClick';
import { saveAllCamerasState, saveCameraState, saveSceneState } from '../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import ConfirmationDialog from '../UI/dialogs/Confirmation';
import NewCamera from '../UI/dialogs/NewCamera';
import CameraMeshIcon from '../UI/icons/meshes/CameraMeshIcon';
import { CAMERA_TARGET_ID, NEW_CAMERA_DEFAULT_PARAMS } from './defaultSceneValues';
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
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: i, [key]: value });
  updateCamUserDataHelpersAndIcon(i);
  getSceneItem('topTools')?.updateTools();
  if (args?.doNotUpdateUndo !== true) {
    const isTransform = key === 'position' || key === 'target' || key === 'rotation';
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

export const addCamera = (params, initiatingCameras) => {
  const scene = getSceneItem('scene');
  // Create three.js camera and helper
  const reso = getScreenResolution();
  const aspectRatio = reso.x / reso.y;
  params.paramType = 'camera';
  let camera;
  if (!params.id) {
    console.error('Camera must have an ID');
    return;
  }

  // Check and set default params if some missing (for all camera types)
  if (!params.name) params.name = NEW_CAMERA_DEFAULT_PARAMS.name;
  if (!params.type) params.type = NEW_CAMERA_DEFAULT_PARAMS.type;
  if (!params.near) params.near = NEW_CAMERA_DEFAULT_PARAMS.near;
  if (!params.far) params.far = NEW_CAMERA_DEFAULT_PARAMS.far;
  if (!params.orbitControls === undefined)
    params.orbitControls = NEW_CAMERA_DEFAULT_PARAMS.orbitControls;
  if (params.showHelper === undefined) params.showHelper = NEW_CAMERA_DEFAULT_PARAMS.showHelper;
  if (!params.position) params.position = NEW_CAMERA_DEFAULT_PARAMS.position;
  if (!params.defaultPosition) params.defaultPosition = NEW_CAMERA_DEFAULT_PARAMS.defaultPosition;

  // @TODO: check also for if the id is unique or not
  let isTargetingCamera = false;
  let isTargetingObject = false;
  if (params.type === 'perspectiveTarget') {
    if (!params.fov) params.fov = NEW_CAMERA_DEFAULT_PARAMS.fov;
    camera = new THREE.PerspectiveCamera(params.fov, aspectRatio, params.near, params.far);
    isTargetingCamera = true;
    isTargetingObject = true;
  } else if (params.type === 'orthographicTarget') {
    const viewSize = params.orthoViewSize || NEW_CAMERA_DEFAULT_PARAMS.orthoViewSize;
    camera = new THREE.OrthographicCamera(
      -viewSize * aspectRatio,
      viewSize * aspectRatio,
      viewSize,
      -viewSize,
      params.near,
      params.far
    );
    isTargetingCamera = true;
    isTargetingObject = true;
  }
  params.isTargetingCamera = isTargetingCamera;
  params.isTargetingObject = isTargetingObject;
  if (!camera) {
    console.error('Camera type invalid');
    return;
  }

  camera.position.set(...params.position);
  if (isTargetingCamera) {
    if (!params.target) params.target = NEW_CAMERA_DEFAULT_PARAMS.target;
    if (!params.defaultTarget) params.defaultTarget = NEW_CAMERA_DEFAULT_PARAMS.defaultTarget;
    camera.lookAt(new THREE.Vector3(...params.target));
  }

  camera.userData = params;

  new CameraMeshIcon(camera, params);

  let allCameras = getSceneItem('allCameras') || [];
  const nextIndex = allCameras.length;
  allCameras.push(camera);
  setSceneItem('allCameras', allCameras);
  params.index = nextIndex;

  const helpers = getSceneItem('cameraHelpers') || [];
  if (nextIndex !== getSceneParam('curCameraIndex')) {
    const helper = new THREE.CameraHelper(camera);
    helper.userData = params;
    if (!params.showHelper) helper.visible = false;
    helpers.push(helper);
    helper.update();
    scene.add(helper);
    camera.updateWorldMatrix();
  } else {
    helpers.push(null);
    setSceneItem('curCamera', camera);
    const targetMesh = getSceneItem('editorTargetMeshes')?.find(
      (mesh) => mesh.userData.params.id === params.id
    );
    if (targetMesh) targetMesh.visible = false;
    const camIcon = getSceneItem('editorIcons').find((i) => i.icon.userData.id === params.id);
    camIcon.icon.visible = false;
  }
  setSceneItem('cameraHelpers', helpers);

  if (!initiatingCameras) {
    const cameraParams = getSceneParam('cameras') || [];
    cameraParams.push(params);
    setSceneParam('cameras', cameraParams);
    saveAllCamerasState(cameraParams);

    getSceneItem('topTools')?.updateTools();
    getSceneItem('rightSidePanel')?.updatePanel();
    getSceneItem('dialog')?.disappear();

    getSceneItem('undoRedo').addAction({
      type: 'addCamera',
      prevVal: null,
      newVal: cameraParams.length - 1,
      params,
    });
  } else {
    if (params.orbitControls && getSceneParam('curCameraIndex') === nextIndex) {
      createOrbitControls();
    }
  }
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
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: cameraIndex, position: curPos, target: curTarget });
  if (posOrTar === 'target' && cameraIndex === getSceneParam('curCameraIndex')) {
    getSceneItem('orbitControls').target = new THREE.Vector3(...curTarget);
  }
  const rightPanel = getSceneItem('rightSidePanel');
  if (updateRightPanel && rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
  updateCamUserDataHelpersAndIcon(cameraIndex);
  getSceneItem('undoRedo').addAction({
    type: 'updateCameraTransforms',
    prevVal: prevVal,
    newVal: value,
    posOrTar,
    cameraIndex,
    valueIndex,
  });

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
  updateCamUserDataHelpersAndIcon(cameraIndex);
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
  updateCamUserDataHelpersAndIcon(cameraIndex);
  getSceneItem('undoRedo').addAction({
    type: 'toggleOrbitControls',
    prevVal: !isTurnedOn,
    newVal: isTurnedOn,
    cameraIndex,
  });
};

export const toggleShowCameraHelper = (isTurnedOn, cameraIndex) => {
  const cameraParams = getSceneParam('cameras');
  if (cameraIndex !== getSceneParam('curCameraIndex')) {
    const helpers = getSceneItem('cameraHelpers');
    if (helpers && helpers.length && helpers[cameraIndex]) {
      helpers[cameraIndex].visible = isTurnedOn;
    }
    const curId = cameraParams[cameraIndex].id;
    const targetMesh = getSceneItem('editorTargetMeshes')?.find(
      (mesh) => mesh.userData.params.id === curId
    );
    if (
      targetMesh &&
      cameraParams[cameraIndex].isTargetingCamera &&
      !getSceneParam('selection').includes(curId) && // The camera is selected (target cannot be hidden)
      !getSceneParam('selection').includes(CAMERA_TARGET_ID + '--' + curId) // The target is selected (target cannot be hidden)
    ) {
      targetMesh.visible = isTurnedOn;
    }
  }
  cameraParams[cameraIndex].showHelper = isTurnedOn;
  setSceneParam('cameras', cameraParams);
  saveCameraState({ index: cameraIndex, showHelper: isTurnedOn });
  updateCamUserDataHelpersAndIcon(cameraIndex);
  getSceneItem('undoRedo').addAction({
    type: 'toggleShowCameraHelper',
    prevVal: !isTurnedOn,
    newVal: isTurnedOn,
    cameraIndex,
  });
};

export const changeCurCamera = (newCamIndex) => {
  const prevVal = getSceneParam('curCameraIndex');
  const camItems = getSceneItem('allCameras');
  const camHelpers = getSceneItem('cameraHelpers');
  const camParams = getSceneParam('cameras');
  const camPanels = getSceneItem('cameraPanels');
  const editorIcons = getSceneItem('editorIcons');
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
    if (camPanels && camPanels[i] && camPanels[i].elem) {
      camPanels[i].elem.classList.remove('highlight');
    }
    const targetMesh = getSceneItem('editorTargetMeshes').find(
      (mesh) => mesh.userData.params.id === camParams[i].id
    );
    const camIcon = editorIcons.find((icon) => icon.icon.id === camParams[i].id);
    if (camParams[i].id === camParams[newCamIndex].id) {
      newCamera = camItems[i];
      newCameraIndex = i;
      newCameraHasOrbitControls = camParams[i].orbitControls;
      helpers.push(null);
      if (camPanels && camPanels[i] && camPanels[i].elem) {
        camPanels[i].elem.classList.add('highlight');
      }
      if (targetMesh) {
        targetMesh.visible = false;
      }
      if (camIcon) {
        camIcon.icon.visible = false;
      }
    } else {
      const helper = new THREE.CameraHelper(camItems[i]);
      helper.userData = camParams[i];
      helpers.push(helper);
      helper.update();
      helper.visible = camParams[i].showHelper;
      scene.add(helper);
      if (targetMesh) {
        targetMesh.visible = camParams[i].showHelper;
      }
      if (camIcon) {
        camIcon.icon.visible = true;
      }
    }
  }

  const transformControls = getSceneItem('transformControls');
  const newCamId = camParams[newCamIndex].id;
  const targetMesh = getSceneItem('editorTargetMeshes').find(
    (mesh) => mesh.userData.params.id === newCamId
  );
  if (newCamId === transformControls.object?.userData.id) {
    // Remove the selection, if current camera icon is selected
    selectObjects(getSceneItem('selection').filter((sel) => sel.userData.id !== newCamId));
    if (targetMesh) targetMesh.visible = false;
  }
  if (newCamId === transformControls.object?.userData.params?.id) {
    // Remove the selection, if current camera target mesh is selected
    selectObjects(
      getSceneItem('selection').filter(
        (sel) => sel.userData.id !== CAMERA_TARGET_ID + '--' + newCamId
      )
    );
    if (targetMesh) targetMesh.visible = false;
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
  getSceneItem('undoRedo').addAction({
    type: 'changeCurCamera',
    prevVal,
    newVal: newCamIndex,
  });
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
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: cameraIndex, position: pos, target: target });
  if (cameraIndex === getSceneParam('curCameraIndex')) {
    const controls = getSceneItem('orbitControls');
    if (controls) controls.target = new THREE.Vector3(...target);
  }
  updateCamUserDataHelpersAndIcon(cameraIndex);
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
      let filteredSelection;
      if (selection[i].userData?.id === cameraItems[index].userData.id) {
        filteredSelection = selection.filter(
          (sel) => sel.userData.id !== cameraItems[index].userData.id
        );
      }
      if (
        selection[i].userData.id === CAMERA_TARGET_ID &&
        selection[i].userData.params.id === destroyCameraParams.id
      ) {
        filteredSelection = selection.filter(
          (sel) => sel.userData.params.id !== destroyCameraParams.id
        );
      }
      if (filteredSelection) {
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
      if (icon.icon.userData.id === destroyCameraParams.id) {
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
    getSceneItem('elemTool').updateTool();
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
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  setSceneParam('cameras', newCamParams);
  saveCameraState({ index: cameraIndex, position, target });
  if (cameraIndex === getSceneParam('curCameraIndex')) {
    const controls = getSceneItem('orbitControls');
    if (controls) controls.target = new THREE.Vector3(...target);
  }
  updateCamUserDataHelpersAndIcon(cameraIndex);
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('undoRedo').addAction({
    type: 'setNewCameraTransforms',
    prevVal,
    newVal: { position, target },
    cameraIndex,
  });
};

export const updateCamUserDataHelpersAndIcon = (cameraIndex, updateById) => {
  const allCamParams = getSceneParam('cameras');
  if (updateById) {
    for (let i = 0; i < allCamParams.length; i++) {
      if (allCamParams[i].id === updateById) {
        cameraIndex = i;
        break;
      }
    }
  }
  const params = allCamParams[cameraIndex];
  const cameraItem = getSceneItem('allCameras')[cameraIndex];
  const helpers = getSceneItem('cameraHelpers');
  cameraItem.userData = params;
  const editorIcon = getSceneItem('editorIcons').find(
    (icon) => params.id === icon.icon.userData.id
  );
  if (editorIcon) editorIcon.update(cameraItem);
  if (helpers && helpers.length && helpers[cameraIndex]) {
    helpers[cameraIndex].userData = params[cameraIndex];
    helpers[cameraIndex].update();
  }
  getSceneItem('elemTool').updateTool();
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
  updateCamUserDataHelpersAndIcon,
};
