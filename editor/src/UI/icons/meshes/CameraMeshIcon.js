import * as THREE from 'three';

import { getSceneItem, setSceneItem } from '../../../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../../../sceneData/sceneParams';
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
    const directionPointerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xeeaa00 })
    );
    directionPointerMesh.position.set(0, 0.1, -0.115);
    cameraIconMesh.add(directionPointerMesh);
    cameraIcon.add(cameraIconMesh);

    cameraIcon.userData = cameraParams;
    cameraIconMesh.userData = cameraParams;
    cameraIconMesh.userData.groupParentUuid = cameraIcon.uuid;

    cameraIcon.position.set(...camera.position);
    cameraIcon.quaternion.set(...camera.quaternion);

    this.cameraIcon = cameraIcon;
    this.iconMesh = cameraIconMesh;
    scene.add(cameraIcon);
    this.icon = cameraIcon;
    const editorIcons = getSceneItem('editorIcons') || [];
    setSceneItem('editorIcons', [...editorIcons, this]);

    this.cameraTargetMesh;
    this._createTargetMesh();
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
    if (this.cameraTargetMesh) {
      this.cameraTargetMesh.userData.params = camera.userData;
    }
  };

  remove = () => {
    const transControls = getSceneItem('transformControls');
    if (transControls.object?.userData.isTargetingCamera || transControls.object?.isCameraTarget) {
      transControls.detach();
    }
    const newEditorIcons = getSceneItem('editorIcons').filter(
      (icon) => this.cameraIcon.userData.id !== icon.cameraIcon.userData.id
    );
    setSceneItem('editorIcons', newEditorIcons);
    this.cameraIcon.traverse((obj) => removeMeshFromScene(obj));
    this.cameraIcon.removeFromParent();
    this._removeTargetMesh();
  };

  _createTargetMesh = () => {
    const params = this.icon.userData;
    if (params.isTargetingCamera) {
      const cameraTargetGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const cameraTargetMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const cameraTargetMesh = new THREE.Mesh(cameraTargetGeo, cameraTargetMat);
      cameraTargetMesh.position.set(...params.target);
      cameraTargetMesh.userData = {
        params,
        paramType: 'cameraTarget',
        id: CAMERA_TARGET_ID + '--' + params.id,
        isCameraTarget: true,
        isTargetObject: true,
      };
      cameraTargetMesh.visible = params.showHelper;
      this.cameraTargetMesh = cameraTargetMesh;
      const editorTargets = getSceneItem('editorTargetMeshes') || [];
      setSceneItem('editorTargetMeshes', [...editorTargets, cameraTargetMesh]);
      getSceneItem('scene').add(cameraTargetMesh);
    }
  };

  _removeTargetMesh = () => {
    if (this.cameraTargetMesh) {
      let targetMeshId;
      const newEditorTargets = getSceneItem('editorTargetMeshes').filter((target) => {
        if (this.cameraIcon.userData.id === target.userData.cameraParams.id) {
          targetMeshId = target.userData.id;
          return false;
        }
        return true;
      });
      setSceneItem('editorTargetMeshes', newEditorTargets);
      if (targetMeshId) {
        const selectionIds = getSceneParam('selection');
        const selectionItems = getSceneItem('selection');
        setSceneParam(
          'selection',
          selectionIds.filter((id) => id !== targetMeshId)
        );
        setSceneItem(
          'selection',
          selectionItems.filter((item) => item.userData.id !== targetMeshId)
        );
      }
      removeMeshFromScene(this.cameraTargetMesh);
    }
  };
}

export default CameraMeshIcon;
