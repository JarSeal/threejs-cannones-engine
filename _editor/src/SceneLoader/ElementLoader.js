import * as THREE from 'three';
import { NEW_MATERIAL, NEW_SHAPE_BOX } from '../utils/defaultSceneValues';

// objParams: {
// - type: String ('shape' | 'physicsshape' | 'particles' | 'particlesphysics' | 'custom' | 'physics')
// - id: String
// - shape: String (primitive shape type that three.js and cannon-es support, does not apply to custom shape)
// - compoundId: String (cannon-es/physics compound group id)
// - material: Object (three.js material params, defined in _createMaterial)
// - position: Number[] ([x, y, z])
// }
class ElementLoader {
  constructor(objParams) {
    this.obj;
    if (objParams) this._createObj(objParams);
  }

  getObject = () => this.obj;

  _createObj = (objParams) => {
    switch (objParams.type) {
      case 'shape':
        this.obj = this._createShape(objParams);
    }
  };

  _createShape = (objParams) => {
    // @TODO: move this to toolsForElems.js
    if (objParams.shape === 'box') {
      const material = this._createMaterial(objParams.material);
      if (!objParams.shapeParams) {
        objParams.shapeParams = { size: NEW_SHAPE_BOX.size };
      }
      const size = objParams.shapeParams.size;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      const pos = objParams.position ? objParams.position : [0, 0, 0];
      mesh.position.set(...pos);
      const rot = objParams.rotation ? objParams.rotation : [0, 0, 0];
      mesh.rotation.set(...rot);
      const scale = objParams.scale ? objParams.scale : [1, 1, 1];
      mesh.scale.set(...scale);
      mesh.castShadow = objParams.castShadow || false;
      mesh.receiveShadow = objParams.receiveShadow || false;
      mesh.userData = objParams;
      return mesh;
    }
  };

  _createMaterial = (mat) => {
    // @TODO: move this to toolsForElems.js
    if (!mat) mat = NEW_MATERIAL;
    if (!mat.type) mat.type = 'basic';
    if (mat.type === 'basic') {
      const material = new THREE.MeshBasicMaterial({ color: mat.color });
      if (mat.wireframe) material.wireframe = true;
      return material;
    }
    if (mat.type === 'phong') {
      const material = new THREE.MeshPhongMaterial({ color: mat.color });
      return material;
    }
    if (mat.type === 'lambert') {
      const material = new THREE.MeshLambertMaterial({ color: mat.color });
      return material;
    }
  };
}

export default ElementLoader;
