import * as THREE from 'three';

import { getSceneItem, setSceneItem } from '../../../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../../../sceneData/sceneParams';
import { CAMERA_TARGET_ID } from '../../../utils/defaultSceneValues';
import { removeMeshFromScene } from '../../../utils/utils';

class CameraMeshIcon {
  constructor(camera, cameraParams) {
    const scene = getSceneItem('scene');

    // This is the "group" mesh for the icon that gets transformed but is transparent
    const cameraIconHolderGeo = new THREE.BoxGeometry(0.2, 0.2, 0.28);
    const cameraIconHolderMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cameraIcon = new THREE.Mesh(cameraIconHolderGeo, cameraIconHolderMat);

    // This is the actual icon of the camera
    // @TODO: create (in Blender) and import a proper camera icon
    const cameraIconGeo = new THREE.BoxGeometry(0.2, 0.2, 0.28);
    const cameraIconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cameraIconMesh = new THREE.Mesh(cameraIconGeo, cameraIconMat); // The actual visible box (the bigger box)

    cameraIcon.add(cameraIconMesh);
    cameraIconMesh.position.set(0, 0, 0.14); // Offset the actual icon mesh (the inner mesh) to be at the beginning of the camera
    const directionPointerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xeeaa00 })
    );
    directionPointerMesh.position.set(0, 0.1, 0);
    cameraIcon.add(directionPointerMesh);

    cameraIcon.userData = cameraParams;

    cameraIcon.position.set(...camera.position);
    cameraIcon.quaternion.set(...camera.quaternion);

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
    this.icon.userData = camera.userData;
  };

  remove = () => {
    const transControls = getSceneItem('transformControls');
    if (transControls.object?.userData.isTargetingCamera || transControls.object?.isCameraTarget) {
      transControls.detach();
    }
    const newEditorIcons = getSceneItem('editorIcons').filter(
      (icon) => this.icon.userData.id !== icon.userData.id
    );
    setSceneItem('editorIcons', newEditorIcons);
    this.icon.traverse((obj) => removeMeshFromScene(obj));
    this.icon.removeFromParent();
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
