import { Component } from '../../../../LIGHTER';
import NumberInput from './NumberInput';

// Attributes:
// - label = field label [String]
// - fieldLabels = fields' labels [String[]]
// - values = input value numbers [Number[] | String[]]
// - disabled = whether the fields are disabled or not [Boolean]
class VectorInput extends Component {
  constructor(data) {
    super(data);
    this.fieldsId = this.id + '-fields';
    this.inputFieldIdPrefix = this.id + '-field-';
    this.template = `
            <div class="form-elem form-elem--vector-input">
              <span class="form-elem__label">${data.label}${data.label ? ':' : ''}</span>
              <div class="form-elem__fields" id="${this.fieldsId}"></div>
            </div>
        `;
    this.values = data.values;
    this.labels = data.inputLabels;
  }

  paint = () => {
    for (let i = 0; i < this.values.length; i++) {
      this.addChildDraw(
        new NumberInput({
          id: this.inputFieldIdPrefix + i,
          attach: this.fieldsId,
          label: this.labels[i],
          step: 0.1,
          value: this.values[i],
          changeFn: (e) => {
            this.data.onChange(e, i);
          },
        })
      );
    }
  };

  setValue = (newValue, index, noChangeFn) => {
    const inputElem = document.getElementById(this.inputFieldIdPrefix + index);
    this.values[index] = newValue;
    this.data.values = this.values;
    inputElem.value = newValue;
    if (noChangeFn) return;
    if (this.data.onChange) this.data.onChange({ target: { value: newValue } }, index);
  };

  setValues = (newValues, noChangeFn) => {
    this.values = newValues;
    this.data.values = this.values;
    for (let i = 0; i < this.values.length; i++) {
      const inputElem = document.getElementById(this.inputFieldIdPrefix + i);
      inputElem.value = newValues[i];
      if (!noChangeFn && this.data.onChange)
        this.data.onChange({ target: { value: newValues[i] } }, i);
    }
  };
}

export default VectorInput;
