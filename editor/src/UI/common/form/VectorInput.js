import { Component } from '../../../../LIGHTER';
import NumberInput from './NumberInput';

// Attributes:
// - label = field label [String]
// - fieldLabels = fields' labels [String[]]
// - values = input value numbers [Number[] | String[]]
// - disabled = whether the fields are disabled or not [Boolean]
// - step = number input step amount [Number]
// - readOnly = boolean that works the same way as disabled, but removes the arrows from the inputs
class VectorInput extends Component {
  constructor(data) {
    super(data);
    this.fieldsId = this.id + '-fields';
    this.inputFieldIdPrefix = this.id + '-field-';
    this.template = `
            <div class="form-elem form-elem--vector-input inputVector${
              data.readOnly ? ' readOnly' : ''
            }">
              <span class="form-elem__label">${data.label}${data.label ? ':' : ''}</span>
              <div class="form-elem__fields" id="${this.fieldsId}"></div>
            </div>
        `;
    this.step = data.step;
    this.values = data.values;
    this.labels = data.inputLabels;
    this.readOnly = data.readOnly;
    this.inputComponents = [];
  }

  paint = () => {
    this.inputComponents = [];
    for (let i = 0; i < this.values.length; i++) {
      this.inputComponents.push(
        this.addChildDraw(
          new NumberInput({
            id: this.inputFieldIdPrefix + i,
            attach: this.fieldsId,
            label: this.labels[i],
            step: this.step || 0.1,
            readOnly: this.readOnly,
            value: this.values[i].toFixed(12),
            precision: 16,
            changeFn: (value) => {
              this.data.onChange(value, i);
            },
          })
        )
      );
    }
  };

  setValue = (newValue, index, noChangeFn) => {
    this.values[index] = newValue;
    this.data.values = this.values;
    this.inputComponents[index].setValue(newValue[index], noChangeFn);
  };

  setValues = (newValues, noChangeFn) => {
    this.values = newValues;
    this.data.values = this.values;
    for (let i = 0; i < this.values.length; i++) {
      this.inputComponents[i].setValue(newValues[i], noChangeFn);
    }
  };
}

export default VectorInput;
