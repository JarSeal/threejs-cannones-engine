import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import { saveAllCamerasState } from '../../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../../sceneData/sceneItems';
import { getSceneParam } from '../../sceneData/sceneParams';
import { getScreenResolution } from '../../utils/utils';
import Button from '../common/Button';
import Checkbox from '../common/form/Checbox';
import Dropdown from '../common/form/Dropdown';
import NumberInput from '../common/form/NumberInput';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';
import VectorInput from '../common/form/VectorInput';
import SettingsPanel from '../common/SettingsPanel';
import CameraMeshIcon from '../icons/meshes/CameraMeshIcon';

class NewCamera extends Component {
  constructor() {
    super({ id: 'new-camera-dialog', class: 'dialog-form' });
    this.formHasErrors = false;
    // Defalt values
    this.newCameraParams = {
      id: THREE.MathUtils.generateUUID(),
      name: '',
      type: 'perspective',
      orthoViewSize: 1,
      fov: 45,
      near: 0.001,
      far: 256,
      position: [5, 5, 5],
      target: [0, 0, 0],
      rotation: [0, 0, 0],
      orbitControls: false,
      showHelper: true,
    };
  }

  paint = () => {
    this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-id',
        label: 'ID',
        curId: this.newCameraParams.id,
        newId: true,
        focus: true,
        onValidationErrors: () => (this.formHasErrors = true),
        onValidationSuccess: () => (this.formHasErrors = false),
      })
    );

    // Name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-name',
        label: 'Name',
        value: this.newCameraParams.name,
        changeFn: (e) => {
          this.newCameraParams.name = e.target.value;
        },
      })
    );

    // Type
    this.addChildDraw(
      new Dropdown({
        id: this.id + '-type',
        label: 'Type',
        value: this.newCameraParams.type,
        options: [
          { value: 'perspective', label: 'Perspective' },
          { value: 'orthographic', label: 'Orthographic' },
        ],
        changeFn: (e) => {
          this.newCameraParams.type = e.target.value;
          this.reDrawSelf();
        },
      })
    );

    if (this.newCameraParams.type === 'perspective') {
      // Field of view (FOV) (Only for perspective camera)
      this.addChildDraw(
        new NumberInput({
          id: 'new-cam-fov-' + this.id,
          label: 'Field of view',
          step: 1,
          min: 1,
          value: this.newCameraParams.fov,
          changeFn: (e) => {
            this.newCameraParams.fov = parseInt(e.target.value);
          },
        })
      );
    } else if (this.newCameraParams.type === 'orthographic') {
      // View size (Only for orthographic camera)
      this.addChildDraw(
        new NumberInput({
          id: 'new-cam-view-size-' + this.id,
          label: 'View size',
          step: 0.01,
          min: 0.00001,
          value: this.newCameraParams.orthoViewSize,
          changeFn: (e) => {
            this.newCameraParams.orthoViewSize = parseFloat(e.target.value);
          },
        })
      );
    }

    // Frustum near plane
    this.addChildDraw(
      new NumberInput({
        id: 'new-cam-near-' + this.id,
        label: 'Frustum near plane',
        step: 0.001,
        min: 0.001,
        value: this.newCameraParams.near,
        changeFn: (e) => {
          this.newCameraParams.near = parseFloat(e.target.value);
        },
      })
    );

    // Frustum far plane
    this.addChildDraw(
      new NumberInput({
        id: 'new-cam-far-' + this.id,
        label: 'Frustum far plane',
        step: 0.001,
        min: 0.001,
        value: this.newCameraParams.far,
        changeFn: (e) => {
          this.newCameraParams.far = parseFloat(e.target.value);
        },
      })
    );

    // Transforms
    const transformsId = 'new-cam-transforms-content-' + this.id;
    this.addChildDraw(
      new SettingsPanel({
        id: 'new-cam-transforms-' + this.id,
        title: 'Transforms',
        contentId: transformsId,
        showPanel: false,
      })
    );

    // Position
    this.addChildDraw(
      new VectorInput({
        id: 'new-cam-pos-' + this.id,
        attach: transformsId,
        label: 'Position',
        step: 0.5,
        inputLabels: ['X', 'Y', 'Z'],
        values: this.newCameraParams.position,
        onChange: (e, index) => {
          this.newCameraParams.position[index] = parseFloat(e.target.value);
        },
      })
    );

    // Target
    this.addChildDraw(
      new VectorInput({
        id: 'new-cam-target-' + this.id,
        attach: transformsId,
        label: 'Target',
        step: 0.5,
        inputLabels: ['X', 'Y', 'Z'],
        values: this.newCameraParams.target,
        onChange: (e, index) => {
          this.newCameraParams.target[index] = parseFloat(e.target.value);
        },
      })
    );

    // Orbit controls
    this.addChildDraw(
      new Checkbox({
        id: 'new-cam-orbitControls-' + this.id,
        label: 'Orbit controls',
        value: this.newCameraParams.orbitControls,
        changeFn: (e) => {
          this.newCameraParams.orbitControls = e.target.checked;
        },
      })
    );

    // Show helper
    this.addChildDraw(
      new Checkbox({
        id: 'new-cam-showHelper-' + this.id,
        label: 'Show helper',
        value: this.newCameraParams.showHelper,
        changeFn: (e) => {
          this.newCameraParams.showHelper = e.target.checked;
        },
      })
    );

    const buttonDivId = 'new-cam-buttons-' + this.id;
    this.addChildDraw({ id: buttonDivId, class: 'buttons' });

    // Cancel button
    this.addChildDraw(
      new Button({
        id: 'new-cam-cancel-' + this.id,
        class: ['cancelButton'],
        attach: buttonDivId,
        text: 'Cancel',
        onClick: () => {
          getSceneItem('dialog').disappear();
        },
      })
    );

    // Create new camera button
    this.addChildDraw(
      new Button({
        id: 'new-cam-create-' + this.id,
        class: ['saveButton'],
        attach: buttonDivId,
        text: 'Create',
        onClick: () => {
          if (this.formHasErrors) return;
          const scene = getSceneItem('scene');
          // Create three.js camera and helper
          const reso = getScreenResolution();
          const aspectRatio = reso.x / reso.y;
          this.newCameraParams.paramType = 'camera';
          let camera;
          if (this.newCameraParams.type === 'perspective') {
            camera = new THREE.PerspectiveCamera(
              this.newCameraParams.fov,
              aspectRatio,
              this.newCameraParams.near,
              this.newCameraParams.far
            );
          } else if (this.newCameraParams.type === 'orthographic') {
            const viewSize = this.newCameraParams.orthoViewSize;
            camera = new THREE.OrthographicCamera(
              -viewSize * aspectRatio,
              viewSize * aspectRatio,
              viewSize,
              -viewSize,
              this.newCameraParams.near,
              this.newCameraParams.far
            );
          }
          if (!camera) {
            console.error('Camera type invalid');
            return;
          }

          camera.position.set(...this.newCameraParams.position);
          camera.lookAt(new THREE.Vector3(...this.newCameraParams.target));
          const helpers = getSceneItem('cameraHelpers');
          const helper = new THREE.CameraHelper(camera);
          if (!this.newCameraParams.showHelper) helper.visible = false;
          helpers.push(helper);
          helper.update();
          scene.add(helper);
          camera.updateWorldMatrix();
          camera.userData = this.newCameraParams;

          new CameraMeshIcon(camera, this.newCameraParams);

          let allCameras = getSceneItem('allCameras');
          if (allCameras && Array.isArray(allCameras)) {
            allCameras.push(camera);
          } else {
            allCameras = [camera];
          }
          setSceneItem('allCameras', allCameras);
          const cameraParams = getSceneParam('cameras');
          const nextIndex = cameraParams.length;
          this.newCameraParams.index = nextIndex;
          this.newCameraParams.defaultPosition = [...this.newCameraParams.position];
          this.newCameraParams.defaultTarget = [...this.newCameraParams.target];
          if (cameraParams && Array.isArray(cameraParams)) {
            cameraParams.push(this.newCameraParams);
          } else {
            allCameras = [this.newCameraParams];
          }
          saveAllCamerasState(cameraParams);

          const cameraSelector = getSceneItem('cameraSelectorTool');
          cameraSelector.setOptions(
            cameraParams.map((c) => ({ value: c.id, label: c.name || c.id })),
            allCameras[getSceneParam('curCameraIndex')].id
          );
          getSceneItem('rightSidePanel').updatePanel();

          getSceneItem('dialog').disappear();
        },
      })
    );
  };
}

export default NewCamera;
