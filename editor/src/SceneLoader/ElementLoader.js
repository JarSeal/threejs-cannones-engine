import * as THREE from 'three';

// obj: {
// - type: String ('shape' | 'physicsshape' | 'particles' | 'particlesphysics' | 'custom' | 'physics')
// - id: String
// - shape: String (primitive shape type that three.js and cannon-es support, does not apply to custom shape)
// - compoundId: String (cannon-es/physics compound group id)
// - material: Object (three.js material params, defined in _createMaterial)
// - position: Number[] ([x, y, z])
// }
class ElementLoader {
  constructor(obj) {
    this.obj;
    if (obj) this._createObj(obj);
  }

  getObject = () => this.obj;

  _createObj = (obj) => {
    switch (obj.type) {
      case 'shape':
        this.obj = this._createShape(obj);
    }
  };

  _createShape = (obj) => {
    if (obj.shape === 'box') {
      const material = this._createMaterial(obj.material);
      const size = obj.size ? obj.size : [1, 1, 1];
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
      const pos = obj.position ? obj.position : [0, 0, 0];
      mesh.position.set(...pos);
      const rot = obj.rotation ? obj.rotation : [0, 0, 0];
      mesh.rotation.set(...rot);
      const scale = obj.scale ? obj.scale : [1, 1, 1];
      mesh.scale.set(...scale);
      mesh.castShadow = obj.castShadow || false;
      mesh.receiveShadow = obj.receiveShadow || false;
      mesh.userData = obj;
      return mesh;
    }
  };

  _createMaterial = (mat) => {
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
