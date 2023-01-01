import { saveStateByKey } from '../sceneData/saveSession';
import { setSceneItem, getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
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
  // let undoRedoPrevVal = {};

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
      if (controls.axis === 'X') {
        if (controls.pointerDownPoint.x > startPosX) {
          controls.object.position.x = startPosX + (curScaleX - startScaleX) / 2;
        } else {
          controls.object.position.x = startPosX + (startScaleX - curScaleX) / 2;
        }
      } else if (controls.axis === 'Y') {
        if (controls.pointerDownPoint.y > startPosY) {
          controls.object.position.y = startPosY + (curScaleY - startScaleY) / 2;
        } else {
          controls.object.position.y = startPosY + (startScaleY - curScaleY) / 2;
        }
      } else if (controls.axis === 'Z') {
        if (controls.pointerDownPoint.z > startPosZ) {
          controls.object.position.z = startPosZ + (curScaleZ - startScaleZ) / 2;
        } else {
          controls.object.position.z = startPosZ + (startScaleZ - curScaleZ) / 2;
        }
      }
    } else if (controls.dragging && controls.mode === 'scale') {
      controls.object.position.x = startPosX;
    }
    if (controls.dragging && controls.mode === 'translate') {
      _checkAndSetTargetedObjects(controls.object);
    }
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
      updateElemTranslation(
        obj.userData.id,
        { position, rotation, scale },
        {
          position: [startPosX, startPosY, startPosZ],
          rotation: [startRotX, startRotY, startRotZ],
          scale: [startScaleX, startScaleY, startScaleZ],
        },
        obj
      );
    }
  });

  setSceneItem('transformControls', controls);
  getSceneItem('scene').add(controls);
  return controls;
};

export const updateElemTranslation = (id, newVal, prevVal, object) => {
  let isTarget = false;
  if (!object) {
    let objectFound = false;
    getSceneItem('scene').children.find((elem) => {
      if (elem.userData?.id === id || elem.userData?.params?.id === id) {
        object = elem;
        objectFound = true;
      }
    });
    if (!objectFound) console.warn('ForThree: Could not find element in scene with id: ' + id);
  }
  if (object?.userData.isTargetedObject) {
    // Targeted object
    if (
      object.userData.type === 'perspectiveTarget' ||
      object.userData.type === 'orthographicTarget'
    ) {
      // Targeted camera
      const newCamParams = getSceneParam('cameras').map((cam) => {
        if (cam.id === id)
          return {
            ...cam,
            position: newVal.position,
            rotation: newVal.rotation,
            scale: newVal.scale,
          };
        return cam;
      });
      setSceneParam('cameras', newCamParams);
      saveStateByKey('cameras', newCamParams);
    }
  } else if (object?.userData.isTargetObject) {
    // Target object
    isTarget = true;
    if (object.paramType === 'cameraTarget') {
      // Camera target
      const id = object.userData.params.id;
      // Save current position of target, camera lookAt, camera icon position and rotation
      console.log('OBJECT RANSVORM', object.userData);
    }
  } else {
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
    setSceneParam('elements', newElemParams);
    saveStateByKey('elements', newElemParams);
  }

  if (!isTarget) {
    object.position.set(...newVal.position);
    object.rotation.set(...newVal.rotation);
    object.scale.set(...newVal.scale);
  }
  getSceneItem('undoRedo').addAction({
    type: 'updateElemTranslation',
    prevVal,
    newVal,
    elemId: id,
  });
};

export const removeTransformControls = () => {
  const controls = getSceneItem('transformControls');
  if (!controls) return;
  controls.dispose();
  setSceneItem('transformControls', null);
};

const _checkAndSetTargetedObjects = (object) => {
  const params = object.userData;
  const helpers = getSceneItem('cameraHelpers') || [];
  if (params.isTargetedObject) {
    const targetMesh = getSceneItem('editorTargetMeshes').find(
      (mesh) => mesh.userData.params.id === params.id
    );
    if (params.paramType === 'camera') {
      // TARGETED CAMERA
      const camera = getSceneItem('allCameras').find((c) => c.userData.id === params.id);
      camera.position.set(...object.position);
      camera.lookAt(...targetMesh.position);
      const helper = helpers.find((h) => h?.userData.id === params.id);
      helper?.update();
      object.position.set(...camera.position);
      object.quaternion.set(...camera.quaternion);
    }
  } else if (params.isTargetObject) {
    if (params.params.paramType === 'camera') {
      // CAMERA TARGETS
      const camera = getSceneItem('allCameras').find((c) => c.userData.id === params.params.id);
      camera.lookAt(...object.position);
      const helper = helpers.find((h) => h?.userData.id === params.id);
      helper?.update();
      const editorIcon = getSceneItem('editorIcons').find(
        (icon) => icon.icon.userData.id === params.params.id
      );
      editorIcon.icon.position.set(...camera.position);
      editorIcon.icon.quaternion.set(...camera.quaternion);
    }
  }
};
