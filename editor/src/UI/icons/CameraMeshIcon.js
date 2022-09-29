import * as THREE from 'three';

import { getSceneItem, setSceneItem } from '../../sceneData/sceneItems';

class CameraMeshIcon {
  constructor(camera, cameraId) {
    const scene = getSceneItem('scene');
    const cameraIcon = new THREE.Group();
    // TODO: import a good camera icon
    const cameraIconGeo = new THREE.BoxGeometry(0.2, 0.2, 0.28);
    const cameraIconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cameraIconMesh = new THREE.Mesh(cameraIconGeo, cameraIconMat);
    cameraIconMesh.position.set(0, 0, 0.14);
    cameraIcon.add(cameraIconMesh);

    cameraIcon.userData.cameraId = cameraId;

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
    this.cameraIconMesh = cameraIconMesh;
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
  };

  remove = (index) => {
    const editorIcons = getSceneItem('editorIcons');
    if (editorIcons[index]) {
      editorIcons[index].cameraIcon.traverse((obj) => this.removeMeshFromScene(obj));
      editorIcons[index].cameraIcon.removeFromParent();
      setSceneItem(
        'editorIcons',
        editorIcons.filter((_, i) => index !== i)
      );
    }
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
