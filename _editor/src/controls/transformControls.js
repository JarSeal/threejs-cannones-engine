import * as THREE from 'three';

import { APP_DEFAULTS } from '../../../APP_CONFIG';
import { saveStateByKey } from '../sceneData/saveSession';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { SELECTION_GROUP_ID } from '../utils/defaultSceneValues';
import { TransformControls } from './TransformControls/TransformControls.js';

export const createTransformControls = () => {
  const rootElem = document.getElementById('root');
  rootElem.style.transitionProperty = 'opacity';
  rootElem.style.transitionDuration = '0.2s';
  rootElem.style.transitionTimingFunction = 'ease-in-out';

  const curCameraItem = getSceneItem('curCamera');
  const controls = new TransformControls(curCameraItem, getSceneItem('renderer').domElement);
  controls.size = 1;
  const rotationSnap = Math.PI / 8;
  let startPosX = null;
  let startPosY = null;
  let startPosZ = null;
  let startRotX = null;
  let startRotY = null;
  let startRotZ = null;
  let startScaleX = null;
  let startScaleY = null;
  let startScaleZ = null;
  let multiSelectStartTransforms = [];

  controls.addEventListener('change', () => {
    if (!controls.dragging) return;
    const keysDown = getSceneItem('keyboard').keysDown;
    if (keysDown.includes('Shift')) {
      if (controls.dragging && controls.mode === 'rotate') {
        // Make the rotation snap exactly to the rotationSnap value and not something in between (when Shift is pressed)
        let curRotationX = controls.object.rotation.x;
        let curRotationY = controls.object.rotation.y;
        let curRotationZ = controls.object.rotation.z;
        if (controls.axis.includes('X')) {
          const snapTimes = Math.round(curRotationX / rotationSnap);
          curRotationX = snapTimes * rotationSnap;
        }
        if (controls.axis.includes('Y')) {
          const snapTimes = Math.round(curRotationY / rotationSnap);
          curRotationY = snapTimes * rotationSnap;
        }
        if (controls.axis.includes('Z')) {
          const snapTimes = Math.round(curRotationZ / rotationSnap);
          curRotationZ = snapTimes * rotationSnap;
        }
        controls.object.rotation.set(curRotationX, curRotationY, curRotationZ);
      }
      controls.setTranslationSnap(0.5);
      controls.setRotationSnap(rotationSnap);
      controls.setScaleSnap(0.5);
    } else {
      controls.setTranslationSnap(null);
      controls.setRotationSnap(null);
      controls.setScaleSnap(null);
    }
    if (controls.dragging && controls.mode === 'scale' && keysDown.includes('Control')) {
      // Change the position of the object according to the scaled value
      // so that only one end of the object is scaled (even though the whole axis scales)
      const curScaleX = controls.object.scale.x;
      const curScaleY = controls.object.scale.y;
      const curScaleZ = controls.object.scale.z;
      const aabb = new THREE.Box3();
      aabb.setFromObject(controls.object);
      if (controls.axis === 'X') {
        const length = aabb.max.x - aabb.min.x;
        if (controls.pointerDownPoint.x > startPosX) {
          controls.object.position.x =
            startPosX + (length / curScaleX / 2) * (curScaleX - startScaleX);
        } else {
          controls.object.position.x =
            startPosX + (length / curScaleX / 2) * (startScaleX - curScaleX);
        }
      } else if (controls.axis === 'Y') {
        const length = aabb.max.y - aabb.min.y;
        if (controls.pointerDownPoint.y > startPosY) {
          controls.object.position.y =
            startPosY + (length / curScaleY / 2) * (curScaleY - startScaleY);
        } else {
          controls.object.position.y =
            startPosY + (length / curScaleY / 2) * (startScaleY - curScaleY);
        }
      } else if (controls.axis === 'Z') {
        const length = aabb.max.z - aabb.min.z;
        if (controls.pointerDownPoint.z > startPosZ) {
          controls.object.position.z =
            startPosZ + (length / curScaleZ / 2) * (curScaleZ - startScaleZ);
        } else {
          controls.object.position.z =
            startPosZ + (length / curScaleZ / 2) * (startScaleZ - curScaleZ);
        }
      }
    } else if (controls.dragging && controls.mode === 'scale') {
      controls.object.position.x = startPosX;
    }
    if (controls.dragging && controls.mode === 'translate') {
      if (controls.object.userData.isSelectionGroup) {
        const groupChildren = [...controls.object.children];
        groupChildren.forEach((child) => {
          getSceneItem('scene').attach(child);
          _checkAndSetTargetingObjects(child);
        });
        // This needs to be in its own loop because if the user moves a targeting object and a target, the _checkAndSetTargetingObjects would get wrong params for these
        groupChildren.forEach((child) => controls.object.attach(child));
      } else {
        _checkAndSetTargetingObjects(controls.object);
      }
    }
    getSceneItem('elemTool').updateTool(true);
  });

  controls.addEventListener('dragging-changed', (e) => {
    const orbitControls = getSceneItem('orbitControls');
    if (orbitControls) {
      orbitControls.enabled = !e.value;
    }
    if (e.value) {
      // Dragging started
      startPosX = controls.object.position.x;
      startPosY = controls.object.position.y;
      startPosZ = controls.object.position.z;
      startRotX = controls.object.rotation.x;
      startRotY = controls.object.rotation.y;
      startRotZ = controls.object.rotation.z;
      startScaleY = controls.object.scale.y;
      startScaleX = controls.object.scale.x;
      startScaleZ = controls.object.scale.z;
      if (controls.object.userData.isSelectionGroup) {
        const selectedElems = getSceneItem('selection');
        multiSelectStartTransforms = [];
        for (let i = 0; i < selectedElems.length; i++) {
          const worldPos = selectedElems[i].getWorldPosition(new THREE.Vector3());
          const worldRot = new THREE.Euler().setFromQuaternion(
            selectedElems[i].getWorldQuaternion(new THREE.Quaternion())
          );
          const worldScale = selectedElems[i].getWorldScale(new THREE.Vector3());
          multiSelectStartTransforms.push({
            position: [worldPos.x, worldPos.y, worldPos.z],
            rotation: [worldRot.x, worldRot.y, worldRot.z],
            scale: [worldScale.x, worldScale.y, worldScale.z],
          });
        }
      }
    } else {
      // Dragging stopped
      controls.setTranslationSnap(null);
      controls.setRotationSnap(null);
      controls.setScaleSnap(null);

      // Save new values
      const obj = controls.object;
      const position = [obj.position.x, obj.position.y, obj.position.z];
      const rotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
      const scale = [obj.scale.x, obj.scale.y, obj.scale.z];
      // const prevVal = obj.userData.isSelectionGroup
      //   ? multiSelectStartTransforms
      //   : {
      //       position: [startPosX, startPosY, startPosZ],
      //       rotation: [startRotX, startRotY, startRotZ],
      //       scale: [startScaleX, startScaleY, startScaleZ],
      //     };
      const prevVal = {
        position: [startPosX, startPosY, startPosZ],
        rotation: [startRotX, startRotY, startRotZ],
        scale: [startScaleX, startScaleY, startScaleZ],
      };
      updateElemTranslation(obj.userData.id, { position, rotation, scale }, prevVal, obj);
    }
  });

  setSceneItem('transformControls', controls);
  getSceneItem('scene').add(controls);
  return controls;
};

export const updateElemTranslation = (id, newVal, prevVal, object, doNotUpdateUndo) => {
  let newPos = newVal.position,
    newRot = newVal.rotation,
    newScale = newVal.scale;
  if (!object) {
    // If the object is not in the params, we have to search it.
    // For example the undo/redo needs to do this, since the object cannot
    // be part of the saved undo/redo data.
    let objectFound = false;
    getSceneItem('scene').children.find((elem) => {
      if (elem.userData?.id === id && elem.isMesh) {
        object = elem;
        objectFound = true;
        return true;
      } else if (elem.userData?.id === id && elem.userData.id === SELECTION_GROUP_ID) {
        object = elem;
        objectFound = true;
        return true;
      }
    });
    if (!objectFound)
      console.warn(`${APP_DEFAULTS.APP_NAME}: Could not find element in scene with id: ${id}`);
  }
  if (object?.userData.isTargetingObject) {
    // Targeting object
    if (
      object.userData.type === 'perspectiveTarget' ||
      object.userData.type === 'orthographicTarget'
    ) {
      // Targeting camera
      const newCamParams = getSceneParam('cameras').map((cam) => {
        if (cam.id === id)
          return {
            ...cam,
            position: newVal.position,
            rotation: newVal.rotation,
            scale: [1, 1, 1],
          };
        return cam;
      });
      setSceneParam('cameras', newCamParams);
      saveStateByKey('cameras', newCamParams);
    }
    newScale = [1, 1, 1];
    if (object) {
      object.userData.position = newVal.position;
      object.userData.rotation = newVal.rotation;
      object.userData.scale = newScale;
    }
  } else if (object?.userData.isTargetObject) {
    // Target object
    if (object.userData.paramType === 'cameraTarget') {
      // Camera target
      const id = object.userData.params.id;
      const newCamParams = getSceneParam('cameras').map((cam) => {
        if (cam.id === id)
          return {
            ...cam,
            target: [...newVal.position],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          };
        return cam;
      });
      setSceneParam('cameras', newCamParams);
      saveStateByKey('cameras', newCamParams);
    }
    newRot = [0, 0, 0];
    newScale = [1, 1, 1];
    if (object) {
      object.userData.params.position = newVal.position;
      object.userData.params.rotation = newRot;
      object.userData.params.scale = newScale;
    }
  } else {
    // Basic elements
    const newElemParams = getSceneParam('elements').map((elem) => {
      if (elem.id === id)
        return {
          ...elem,
          position: newVal.position,
          rotation: newVal.rotation,
          scale: newVal.scale,
        };
      return elem;
    });
    if (object && !object.userData.isSelectionGroup) {
      object.userData.position = newVal.position;
      object.userData.rotation = newVal.rotation;
      object.userData.scale = newVal.scale;
    }
    setSceneParam('elements', newElemParams);
    saveStateByKey('elements', newElemParams);
  }

  object.position.set(...newPos);
  object.rotation.set(...newRot);
  object.scale.set(...newScale);
  if (object?.userData.isSelectionGroup) {
    // Multiselection
    const scene = getSceneItem('scene');
    const selectionGroup = getSceneItem('selectionGroup');
    const selectedElems = getSceneItem('selection');
    for (let i = 0; i < selectedElems.length; i++) {
      scene.attach(selectedElems[i]);
      const worldPos = selectedElems[i].position;
      const worldRot = selectedElems[i].rotation;
      const worldScale = selectedElems[i].scale;
      const idPerElem = selectedElems[i].userData.id;
      const newValPerElem = {
        position: [worldPos.x, worldPos.y, worldPos.z],
        rotation: [worldRot.x, worldRot.y, worldRot.z],
        scale: [worldScale.x, worldScale.y, worldScale.z],
      };
      updateElemTranslation(idPerElem, newValPerElem, undefined, selectedElems[i], true);
    }
    for (let i = 0; i < selectedElems.length; i++) {
      // This needs to be in its own loop because all the elements' translations need to be saved before this is run (see comment on the next loop)
      _checkAndSetTargetingObjects(selectedElems[i]);
    }
    for (let i = 0; i < selectedElems.length; i++) {
      // This needs to be in its own loop because if the user moves a targeting object and a target, the _checkAndSetTargetingObjects would get wrong params for these
      selectionGroup.attach(selectedElems[i]);
    }
  } else {
    _checkAndSetTargetingObjects(object);
  }
  getSceneItem('elemTool').updateTool();
  if (!doNotUpdateUndo) {
    getSceneItem('undoRedo').addAction({
      type: 'updateElemTranslation',
      prevVal,
      newVal,
      elemId: id,
    });
  }
};

export const removeTransformControls = () => {
  const controls = getSceneItem('transformControls');
  if (!controls) return;
  controls.detach();
  controls.dispose();
  setSceneItem('transformControls', null);
};

const _checkAndSetTargetingObjects = (object) => {
  const params = object.userData;
  const camHelpers = getSceneItem('cameraHelpers') || [];
  if (params.isTargetingObject) {
    const targetMesh = getSceneItem('editorTargetMeshes')?.find(
      (mesh) => mesh.userData.params.id === params.id
    );
    if (params.paramType === 'camera') {
      // TARGETING CAMERA
      const camera = getSceneItem('allCameras').find((c) => c.userData.id === params.id);
      camera.position.set(...object.position);
      camera.lookAt(...targetMesh.position);
      camera.updateWorldMatrix();
      const helper = camHelpers.find((h) => h?.userData?.id === params.id);
      helper?.update();
      object.position.set(...camera.position);
      object.quaternion.set(...camera.quaternion);
    }
  } else if (params.isTargetObject) {
    if (params.params.paramType === 'camera') {
      // CAMERA TARGETS
      const camera = getSceneItem('allCameras').find((c) => c.userData.id === params.params.id);
      camera.lookAt(...object.position);
      camera.updateWorldMatrix();
      const helper = camHelpers.find((h) => h?.userData?.id === params.params.id);
      helper?.update();
      const camIcon = getSceneItem('editorIcons').find(
        (i) => i.icon.userData.id === params.params.id
      );
      camIcon.icon.quaternion.set(...camera.quaternion);
    }
  }
};
