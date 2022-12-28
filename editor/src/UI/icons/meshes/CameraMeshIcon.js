import * as THREE from 'three';

import { getSceneItem, setSceneItem } from '../../../sceneData/sceneItems';

class CameraMeshIcon {
  constructor(camera, cameraParams) {
    const scene = getSceneItem('scene');
    const cameraIcon = new THREE.Group();
    // TODO: create (in Blender) and import a proper camera icon
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
    this.cameraIcon.traverse((obj) => this.removeMeshFromScene(obj));
    this.cameraIcon.removeFromParent();
  };

  removeMeshFromScene = (obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => mat.dispose());
      } else {
        obj.material.dispose();
      }
    }
    obj.removeFromParent();
  };
}

export default CameraMeshIcon;
