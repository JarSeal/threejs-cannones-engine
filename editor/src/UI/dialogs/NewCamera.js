import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import Button from '../common/Button';
import Checkbox from '../common/form/Checbox';
import Dropdown from '../common/form/Dropdown';
import NumberInput from '../common/form/NumberInput';
import TextInput from '../common/form/TextInput';
import VectorInput from '../common/form/VectorInput';
import SettingsPanel from '../common/SettingsPanel';

class NewCamera extends Component {
  constructor() {
    super({ id: 'new-camera-dialog' });
  }

  paint = () => {
    // Change to General ID when it is implemented
    this.addChildDraw(
      new TextInput({
        id: this.id + '-id',
        label: 'ID',
        value: '',
        changeFn: () => {
          console.log('TUUT ID');
        },
      })
    );

    // Name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-name',
        label: 'Name',
        value: '',
        changeFn: () => {
          console.log('TUUT name');
        },
      })
    );

    // Type
    this.addChildDraw(
      new Dropdown({
        id: this.id + '-type',
        label: 'Type',
        value: 'Perspective',
        options: [{ value: 'Perspective', label: 'Perspective' }],
        changeFn: () => {
          console.log('TUUT type');
        },
      })
    );

    // Field of view (FOV)
    this.addChildDraw(
      new NumberInput({
        id: 'new-cam-fov-' + this.id,
        label: 'Field of view',
        step: 1,
        min: 1,
        value: 45,
        changeFn: (e) => {
          console.log('TUUT FOV', e.target.value);
        },
      })
    );

    // Frustum near plane
    this.addChildDraw(
      new NumberInput({
        id: 'new-cam-near-' + this.id,
        label: 'Frustum near plane',
        step: 0.001,
        min: 0.001,
        value: 0.001,
        changeFn: (e) => {
          console.log('TUUT near plane', e.target.value);
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
        value: 256,
        changeFn: (e) => {
          console.log('TUUT far plane', e.target.value);
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
        inputLabels: ['x', 'y', 'z'],
        values: [5, 5, 5],
        onChange: (e, index) => {
          console.log('TUUT position', e.target.value, index);
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
        inputLabels: ['x', 'y', 'z'],
        values: [0, 0, 0],
        onChange: (e, index) => {
          console.log('TUUT target', e.target.value, index);
        },
      })
    );

    // Orbit controls
    this.addChildDraw(
      new Checkbox({
        id: 'new-cam-orbitControls-' + this.id,
        label: 'Orbit controls',
        changeFn: (e) => {
          console.log('TUUT orbit controls', e.target.value);
        },
        value: false,
      })
    );

    // Show helper
    this.addChildDraw(
      new Checkbox({
        id: 'new-cam-showHelper-' + this.id,
        label: 'Show helper',
        changeFn: (e) => {
          console.log('TUUT show helper', e.target.value);
        },
        value: true,
      })
    );

    // Cancel button
    this.addChildDraw(
      new Button({
        id: 'new-cam-cancel-' + this.id,
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
        text: 'Create',
        onClick: () => {
          // Create the camera here (add to sceneParams, saveCameraStates, createThreeJSCamera)
          getSceneItem('dialog').disappear();
        },
      })
    );
  };
}

export default NewCamera;
