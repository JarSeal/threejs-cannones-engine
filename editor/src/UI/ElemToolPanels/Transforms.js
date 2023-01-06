import { Component } from '../../../LIGHTER';
import { updateElemTransforms } from '../../utils/toolsForElems';
import { getObjectParams, isCameraObject } from '../../utils/utils';
import VectorInput from '../common/form/VectorInput';

import styles from './Transforms.module.scss';

class Transforms extends Component {
  constructor(data) {
    super(data);
    this.transformsWrapperId = this.id + '-transforms-wrapper';
    this.defaultTransformsWrapperId = this.id + '-default-transforms-wrapper';
    data.template = `<div>
      <span class="${styles.panelHeading}">Transforms</span>
      <div id="${this.transformsWrapperId}"></div>
      <span class="${styles.panelHeading}">Default transforms</span>
      <div id="${this.defaultTransformsWrapperId}"></div>
    </div>`;
    this.selection = data.selection;
  }

  paint = () => {
    const params = getObjectParams(this.selection);
    const isCamera = isCameraObject(this.selection);
    const isTargetingObject = this.selection.userData.isTargetingObject;
    const isTargetObject = this.selection.userData.isTargetObject;
    const isMultiselect = this.selection.length > 1;

    // Position
    this.addChildDraw(
      new VectorInput({
        id: this.id + '-position',
        label: 'Position',
        step: 0.5,
        attach: this.transformsWrapperId,
        class: [styles.vector3],
        inputLabels: ['X', 'Y', 'Z'],
        values: isTargetObject ? [...this.selection.position] : params.position,
        onChange: (value, index) => {
          updateElemTransforms('position', value, index, this.selection, { updateElemTool: false });
        },
      })
    );

    // Target (if the actual camera icon is selected)
    if (isTargetingObject) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-target',
          label: 'Target position',
          step: 0.5,
          attach: this.transformsWrapperId,
          class: [styles.vector3],
          inputLabels: ['X', 'Y', 'Z'],
          values: params.target,
          onChange: (value, index) => {
            updateElemTransforms('target', value, index, this.selection, {
              updateElemTool: false,
            });
          },
        })
      );
    }

    // Rotation
    if (!isTargetObject) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-rotation',
          label: 'Rotation',
          step: 0.5,
          attach: this.transformsWrapperId,
          class: [styles.vector3],
          readOnly: isTargetingObject,
          inputLabels: ['X', 'Y', 'Z'],
          values: params.rotation,
          onChange: (value, index) => {
            updateElemTransforms('rotation', value, index, this.selection, {
              updateElemTool: false,
            });
          },
        })
      );
    }

    // Scale
    if (!isCamera && !isMultiselect) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-scale',
          label: 'Scale',
          step: 0.5,
          attach: this.transformsWrapperId,
          class: [styles.vector3],
          inputLabels: ['X', 'Y', 'Z'],
          values: params.scale,
          onChange: (value, index) => {
            updateElemTransforms('scale', value, index, this.selection, {
              updateElemTool: false,
            });
          },
        })
      );
    }

    // DEFAULT TRANSFORMS
    // ************************************

    // Default POSITION
    this.addChildDraw(
      new VectorInput({
        id: this.id + '-default-position',
        label: 'Default position',
        step: 0.5,
        attach: this.defaultTransformsWrapperId,
        class: [styles.vector3],
        inputLabels: ['X', 'Y', 'Z'],
        values: isTargetObject ? params.defaultTarget : params.defaultPosition,
        onChange: (value, index) => {
          updateElemTransforms('defaultPosition', value, index, this.selection, {
            updateElemTool: false,
          });
        },
      })
    );

    // Default TARGET (if the actual camera icon is selected)
    if (isTargetingObject) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-default-target',
          label: 'Default target position',
          step: 0.5,
          attach: this.defaultTransformsWrapperId,
          class: [styles.vector3],
          inputLabels: ['X', 'Y', 'Z'],
          values: params.defaultTarget,
          onChange: (value, index) => {
            updateElemTransforms('defaultTarget', value, index, this.selection, {
              updateElemTool: false,
            });
          },
        })
      );
    }

    // Default ROTATION
    if (!isTargetObject && !isTargetingObject) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-default-rotation',
          label: 'Default rotation',
          step: 0.5,
          attach: this.defaultTransformsWrapperId,
          class: [styles.vector3],
          readOnly: isTargetingObject,
          inputLabels: ['X', 'Y', 'Z'],
          values: params.defaultRotation,
          onChange: (value, index) => {
            updateElemTransforms('defaultRotation', value, index, this.selection, {
              updateElemTool: false,
            });
          },
        })
      );
    }

    // Default SCALE
    if (!isCamera && !isMultiselect) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-default-scale',
          label: 'Default scale',
          step: 0.5,
          attach: this.defaultTransformsWrapperId,
          class: [styles.vector3],
          inputLabels: ['X', 'Y', 'Z'],
          values: params.defaultScale,
          onChange: (value, index) => {
            updateElemTransforms('defaultScale', value, index, this.selection, {
              updateElemTool: false,
            });
          },
        })
      );
    }
  };
}

export default Transforms;
