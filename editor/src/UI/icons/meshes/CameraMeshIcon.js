import * as THREE from 'three';
import { saveEditorState } from '../../../sceneData/saveSession';

import { getSceneItem, setSceneItem } from '../../../sceneData/sceneItems';
import { setSceneParamR } from '../../../sceneData/sceneParams';
import { CAMERA_TARGET_ID } from '../../../utils/defaultSceneValues';
import { removeMeshFromScene } from '../../../utils/utils';

class CameraMeshIcon {
  constructor(camera, cameraParams) {
    const scene = getSceneItem('scene');
    const cameraIcon = new THREE.Group();
    // @TODO: create (in Blender) and import a proper camera icon
    const cameraIconGeo = new THREE.BoxGeometry(0.2, 0.2, 0.28);
    const cameraIconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cameraIconMesh = new THREE.Mesh(cameraIconGeo, cameraIconMat);
    cameraIconMesh.position.set(0, 0, 0.14);
    cameraIcon.add(cameraIconMesh);

    cameraIcon.userData = cameraParams;
    cameraIconMesh.userData = cameraParams;

    const newPos = [camera.position.x, camera.position.y, camera.position.z];
    const newQuat = [
      camera.quaternion.x,
      camera.quaternion.y,
      camera.quaternion.z,
      camera.quaternion.w,
    ];
    cameraIcon.position.set(...newPos);
    cameraIcon.quaternion.set(...newQuat);

    this.cameraIcon = cameraIcon;
    this.iconMesh = cameraIconMesh;
    scene.add(cameraIcon);
    this.icon = cameraIcon;
    const editorIcons = getSceneItem('editorIcons') || [];
    setSceneItem('editorIcons', [...editorIcons, this]);
  }

  update = (camera) => {
    const newPos = [camera.position.x, camera.position.y, camera.position.z];
    const newQuat = [
      camera.quaternion.x,
      camera.quaternion.y,
      camera.quaternion.z,
      camera.quaternion.w,
    ];
    this.icon.position.set(...newPos);
    this.icon.quaternion.set(...newQuat);
    this.cameraIcon.userData = camera.userData;
    this.iconMesh.userData = camera.userData;
  };

  remove = () => {
    const newEditorIcons = getSceneItem('editorIcons').filter(
      (icon) => this.cameraIcon.userData.id !== icon.cameraIcon.userData.id
    );
    setSceneItem('editorIcons', newEditorIcons);
    this.cameraIcon.traverse((obj) => removeMeshFromScene(obj));
    this.cameraIcon.removeFromParent();
  };
}

export const updateCameraTargetMesh = (params) => {
  if (!params) return;

  const currentMesh = getSceneItem('cameraTargetMesh');
  if (currentMesh && currentMesh.userData.cameraParams.id === params.id) {
    // Just update the already existing mesh
    currentMesh.position.set(...params.target);
    currentMesh.userData.cameraParams = params;
    setSceneParamR('editor.cameraTargetParams', params);
    saveEditorState({ cameraTargetParams: params });
    return;
  }

  removeMeshFromScene(currentMesh);
  setSceneItem('cameraTargetMesh', null);

  // Create a new mesh if not present
  const cameraTargetGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const cameraTargetMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const cameraTargetMesh = new THREE.Mesh(cameraTargetGeo, cameraTargetMat);
  cameraTargetMesh.position.set(...params.target);
  cameraTargetMesh.isCameraTarget = true;
  cameraTargetMesh.userData = {
    cameraParams: params,
    paramType: 'cameraTarget',
    id: CAMERA_TARGET_ID,
  };
  setSceneItem('cameraTargetMesh', cameraTargetMesh);
  setSceneParamR('editor.cameraTargetParams', params);
  saveEditorState({ cameraTargetParams: params });
  getSceneItem('scene').add(cameraTargetMesh);
};

export const removeCameraTargetMesh = () => {
  const transControls = getSceneItem('transformControls');
  if (transControls.object?.userData.isTargetedCamera || transControls.object?.isCameraTarget) {
    transControls.detach();
  }
  removeMeshFromScene(getSceneItem('cameraTargetMesh'));
  setSceneItem('cameraTargetMesh', null);
  // @NOTE: DO NOT CLEAR THE "setSceneParamR('editor.cameraTargetParams', null)" nor "saveEditorState({ cameraTargetParams: null })",
  // because we need it for undo/redo. It gets overwritten anyways, when a new camera target mesh is created.
};

export default CameraMeshIcon;
