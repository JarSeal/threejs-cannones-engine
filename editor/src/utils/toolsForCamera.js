import * as THREE from 'three';

import { createOrbitControls, removeOrbitControls } from '../controls/orbitControls';
import { saveAllCamerasState, saveCameraState, saveSceneState } from '../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import ConfirmationDialog from '../UI/dialogs/Confirmation';
import NewCamera from '../UI/dialogs/NewCamera';
import CameraMeshIcon from '../UI/icons/meshes/CameraMeshIcon';
import { getScreenResolution } from './utils';

export const updateCameraProperty = (value, i, key) => {
  const newCamParams = getSceneParam('cameras').map((cam, index) => {
    if (index === i) return { ...cam, [key]: value };
    return cam;
  });
  const cam = getSceneItem('allCameras')[i];
  if (key === 'position' || key === 'quaternion') {
    cam[key].set(...value);
  } else if (key === 'target') {
    cam.lookAt(...value);
  } else if (key === 'orthoViewSize') {
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
  const helpers = getSceneItem('cameraHelpers');
  if (helpers && helpers.length && helpers[i]) {
    helpers[i].update();
  }
  getSceneItem('topTools')?.updateTools();
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

export const updateCameraTransforms = (
  posTarOrRot,
  value,
  valueIndex,
  cameraIndex,
  updateRightPanel
) => {
  const cam = getSceneItem('allCameras')[cameraIndex];
  if (posTarOrRot !== 'rotation') {
    // Position and Target
    const curPos = getSceneParam('cameras')[cameraIndex].position;
    const curTarget = getSceneParam('cameras')[cameraIndex].target;
    const curQuat = cam.quaternion;
    if (posTarOrRot === 'position') curPos[valueIndex] = parseFloat(value);
    if (posTarOrRot === 'target') curTarget[valueIndex] = parseFloat(value);
    updateCameraProperty(curPos, cameraIndex, 'position');
    updateCameraProperty(curTarget, cameraIndex, 'target');
    updateCameraProperty([curQuat.x, curQuat.y, curQuat.z, curQuat.w], cameraIndex, 'quaternion');
    if (posTarOrRot === 'target' && cameraIndex === getSceneParam('curCameraIndex')) {
      getSceneItem('orbitControls').target = new THREE.Vector3(...curTarget);
    }
  } else {
    // Rotation
    const rotationA = [cam.rotation.x, cam.rotation.y, cam.rotation.z];
    rotationA[valueIndex] = parseFloat(value);

    // 1. Get the length from camera position to target position
    const curTarget = getSceneParam('cameras')[cameraIndex].target;
    const targetDistance = cam.position.distanceTo(new THREE.Vector3(...curTarget));

    cam.rotation.set(...rotationA);
    cam.updateProjectionMatrix();
    const curQuats = [cam.quaternion.x, cam.quaternion.y, cam.quaternion.z, cam.quaternion.w];
    updateCameraProperty(curQuats, cameraIndex, 'quaternion');

    // 2. Find the position at the end of this distance
    const newTarget = new THREE.Vector3();
    const camDirection = cam.getWorldDirection(new THREE.Vector3());
    newTarget.addVectors(cam.position, camDirection.multiplyScalar(targetDistance));
    const newTargetA = [newTarget.x, newTarget.y, newTarget.z];
    updateCameraProperty(newTargetA, cameraIndex, 'target');
    if (cameraIndex === getSceneParam('curCameraIndex')) {
      getSceneItem('orbitControls').target = newTarget;
    }
  }
  const rightPanel = getSceneItem('rightSidePanel');
  if (updateRightPanel && rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
  const editorIcons = getSceneItem('editorIcons');
  editorIcons[cameraIndex].update(cam);
};

export const updateCameraDefaultTransforms = (
  posOrTar,
  value,
  valueIndex,
  cameraIndex,
  updateRightPanel
) => {
  const cameraParams = getSceneParam('cameras');
  if (posOrTar === 'position') {
    if (!cameraParams[cameraIndex].defaultPosition)
      cameraParams[cameraIndex].defaultPosition = [5, 5, 5];
    cameraParams[cameraIndex].defaultPosition[valueIndex] = parseFloat(value);
  } else if (posOrTar === 'target') {
    if (!cameraParams[cameraIndex].defaultTarget)
      cameraParams[cameraIndex].defaultTarget = [0, 0, 0];
    cameraParams[cameraIndex].defaultTarget[valueIndex] = parseFloat(value);
  }
  setSceneParam('cameras', cameraParams);
  saveAllCamerasState(cameraParams);
  const rightPanel = getSceneItem('rightSidePanel');
  if (updateRightPanel && rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
};

export const toggleOrbitControls = (isTurnedOn, cameraIndex) => {
  updateCameraProperty(isTurnedOn, cameraIndex, 'orbitControls');
  if (isTurnedOn) {
    if (cameraIndex === getSceneParam('curCameraIndex')) createOrbitControls();
  } else {
    if (cameraIndex === getSceneParam('curCameraIndex')) removeOrbitControls();
  }
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
};

export const resetCameraTransforms = (cameraIndex, afterConfFn) => {
  const resetTransforms = () => {
    if (cameraIndex === getSceneParam('curCameraIndex')) {
      removeOrbitControls();
      createOrbitControls();
    }
    const cameraParams = getSceneParam('cameras');
    const pos = cameraParams[cameraIndex].defaultPosition || [5, 5, 5];
    updateCameraProperty(pos, cameraIndex, 'position');
    const target = cameraParams[cameraIndex].defaultTarget || [0, 0, 0];
    updateCameraProperty(target, cameraIndex, 'target');
    updateCameraProperty(target, cameraIndex, 'target'); // Needs to be called twice (@TODO: look into this) in order to make the cam helper place correctly as well
    if (cameraIndex === getSceneParam('curCameraIndex')) {
      const controls = getSceneItem('orbitControls');
      if (controls) controls.target = new THREE.Vector3(...target);
    }
    const editorIcons = getSceneItem('editorIcons');
    editorIcons[cameraIndex].update(getSceneItem('allCameras')[cameraIndex]);
  };
  getSceneItem('dialog').appear({
    component: ConfirmationDialog,
    componentData: {
      id: 'reset-cam-conf-dialog-' + cameraIndex,
      message: 'Are you sure you want to reset to default transforms?',
      confirmButtonFn: () => {
        resetTransforms();
        getSceneItem('dialog').disappear();
        if (afterConfFn) afterConfFn();
      },
    },
    title: 'Are you sure?',
  });
};

export const destroyCamera = (cameraIndex) => {
  const destoryCamera = () => {
    const cameraItems = getSceneItem('allCameras');
    if (cameraItems.length <= 1) return; // There has to always at least one camera in the scene
    const index = cameraIndex;
    const destroyCameraParams = getSceneParam('cameras')[index];
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
    cameraItems[index].clear();
    cameraItems[index].removeFromParent();
    setSceneItem(
      'allCameras',
      cameraItems.filter((c, i) => i !== index)
    );
    const helpers = getSceneItem('cameraHelpers');
    if (helpers[index]) {
      getSceneItem('scene').remove(helpers[index]);
      setSceneItem(
        'cameraHelpers',
        helpers.filter((c, i) => i !== index)
      );
    }
    saveCameraState({ removeIndex: index });
    if (index === getSceneParam('curCameraIndex')) {
      changeCurCamera(0);
    }
    getSceneItem('topTools').updateTools();
    getSceneItem('leftTools').updateTools();
    const editorIcons = getSceneItem('editorIcons');
    editorIcons[index].remove(index);
    const rightPanel = getSceneItem('rightSidePanel');
    if (rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
  };

  const destroyCameraParams = getSceneParam('cameras')[cameraIndex];
  const cameraTextToDestroy = destroyCameraParams.name
    ? `${destroyCameraParams.name} (id: ${destroyCameraParams.id})`
    : destroyCameraParams.id;
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
};
