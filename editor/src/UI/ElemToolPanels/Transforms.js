import { Component } from '../../../LIGHTER';
import { getObjectParams, isCameraObject } from '../../utils/utils';
import VectorInput from '../common/form/VectorInput';

import styles from './Transforms.module.scss';

class Transforms extends Component {
  constructor(data) {
    super(data);
    data.template = `<div>
      <span class="${styles.panelHeading}">Transforms</span>
    </div>`;
    this.selection = data.selection;
  }

  paint = () => {
    const params = getObjectParams(this.selection);
    const isCamera = isCameraObject(this.selection);
    const isTargetingObject = this.selection.userData.isTargetingObject;
    const isTargetObject = this.selection.userData.isTargetingObject;
    const isMultiselect = this.selection.length > 1;

    // Position
    this.addChildDraw(
      new VectorInput({
        id: this.id + '-position',
        label: 'Position',
        step: 0.5,
        class: [styles.vector3],
        inputLabels: ['X', 'Y', 'Z'],
        values: params.position,
        onChange: (value, index) => {}, // @TODO: add the tool util function to change the transform
      })
    );

    // Rotation
    if (!isTargetObject) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-rotation',
          label: 'Rotation',
          step: 0.5,
          class: [styles.vector3],
          readOnly: isCamera,
          inputLabels: ['X', 'Y', 'Z'],
          values: params.rotation,
          onChange: (value, index) => {},
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
          class: [styles.vector3],
          inputLabels: ['X', 'Y', 'Z'],
          values: params.scale,
          onChange: (value, index) => {},
        })
      );
    }

    // Target (if the actual camera icon is selected)
    if (isTargetingObject) {
      this.addChildDraw(
        new VectorInput({
          id: this.id + '-target',
          label: 'Target position',
          step: 0.5,
          class: [styles.vector3],
          inputLabels: ['X', 'Y', 'Z'],
          values: params.target,
          onChange: (value, index) => {},
        })
      );
    }
  };
}

export default Transforms;
