import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import { CAMERA_TYPES, NEW_CAMERA_DEFAULT_PARAMS } from '../../utils/defaultSceneValues';
import { addCamera } from '../../utils/toolsForCamera';
import Button from '../common/Button';
import Checkbox from '../common/form/Checbox';
import Dropdown from '../common/form/Dropdown';
import NumberInput from '../common/form/NumberInput';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';
import VectorInput from '../common/form/VectorInput';
import SettingsPanel from '../common/SettingsPanel';

class NewCamera extends Component {
  constructor() {
    super({ id: 'new-camera-dialog', class: 'dialog-form' });
    this.formHasErrors = false;
    // Defalt values
    this.newCameraParams = {
      id: THREE.MathUtils.generateUUID(),
      ...NEW_CAMERA_DEFAULT_PARAMS,
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
        options: CAMERA_TYPES,
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
          min: 0.1,
          precision: 3,
          value: this.newCameraParams.fov,
          changeFn: (value) => {
            this.newCameraParams.fov = parseInt(value);
          },
        })
      );
    } else if (this.newCameraParams.type === 'orthographic') {
      // View size (Only for orthographic camera)
      this.addChildDraw(
        new NumberInput({
          id: 'new-cam-view-size-' + this.id,
          label: 'View size',
          step: 1,
          min: 0.1,
          precision: 3,
          value: this.newCameraParams.orthoViewSize,
          changeFn: (value) => {
            this.newCameraParams.orthoViewSize = parseFloat(value);
          },
        })
      );
    }

    // Frustum near plane
    this.addChildDraw(
      new NumberInput({
        id: 'new-cam-near-' + this.id,
        label: 'Frustum near plane',
        step: 1,
        min: 0.1,
        precision: 3,
        value: this.newCameraParams.near,
        changeFn: (value) => {
          this.newCameraParams.near = parseFloat(value);
        },
      })
    );

    // Frustum far plane
    this.addChildDraw(
      new NumberInput({
        id: 'new-cam-far-' + this.id,
        label: 'Frustum far plane',
        step: 1,
        min: 0.2,
        precision: 3,
        value: this.newCameraParams.far,
        changeFn: (value) => {
          this.newCameraParams.far = parseFloat(value);
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
        onChange: (value, index) => {
          this.newCameraParams.position[index] = parseFloat(value);
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
        onChange: (value, index) => {
          this.newCameraParams.target[index] = parseFloat(value);
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
          addCamera(this.newCameraParams);
        },
      })
    );
  };
}

export default NewCamera;
