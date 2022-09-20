import { Component } from '../../../../LIGHTER';

// Attributes:
// - label = field label [String]
// - name = input name property [String]
// - hideMsg = if field's error message should not be shown [Booolean]
// - changeFn = function that is ran after each change [Function]
// - value = input value [Number]
// - disabled = whether the field is disabled or not [Boolean]
// - error = an error boolean or object to tell if the field has errors {hasError:Boolean, errorMsg:String} [Boolean/Object]
class NumberInput extends Component {
  constructor(data) {
    super(data);
    if (!data.name) data.name = data.id;
    if (!data.label) data.label = data.id;
    this.inputId = this.id + '-number-input';
    this.template = `
            <div class="form-elem form-elem--number-input">
                <label for="${this.inputId}">
                    <span class="form-elem__label">${data.label}</span>
                    <input
                        id="${this.inputId}"
                        class="form-elem__number-input"
                        type="number"
                        name="${data.name}"
                        step="${data.step || 1}"
                        ${data.min !== undefined ? `min="${data.min}"` : ''}
                        ${data.max !== undefined ? `max="${data.max}"` : ''}
                        value="${data.value}"
                        ${data.disabled ? 'disabled' : ''}
                    />
                </label>
            </div>
        `;
    this.value = data.value;
    this.errorComp = this.addChild({
      id: this.id + '-error-msg',
      class: 'form-elem__error-msg',
    });
    if (data.error) data.class = 'form-elem--error';
  }

  addListeners(data) {
    this.addListener({
      id: this.inputId + '-number-input-change',
      target: document.getElementById(this.inputId),
      type: 'change',
      fn: (e) => {
        if (data.changeFn) data.changeFn(e, this.setValue);
      },
    });
    this.addListener({
      id: this.inputId + '-focus',
      target: document.getElementById(this.inputId),
      type: 'focus',
      fn: (e) => {
        if (data.doNotSelectOnFocus) return;
        e.target.select();
      },
    });
  }

  error(err) {
    if (err) {
      this.errorComp.discard();
      this.elem.classList.add('form-elem--error');
      if (err.errorMsg && !this.data.hideMsg) {
        this.elem.classList.add('form-elem--error-msg');
        this.errorComp.draw({ text: err.errorMsg });
      }
    } else {
      this.errorComp.discard();
      this.elem.classList.remove('form-elem--error');
      this.elem.classList.remove('form-elem--error-msg');
    }
  }

  setValue = (newValue, noChangeFn) => {
    const inputElem = document.getElementById(this.inputId);
    this.data.value = this.value = newValue;
    inputElem.value = newValue;
    if (noChangeFn) return;
    if (this.data.changeFn) this.data.changeFn({ target: inputElem });
  };

  toggleDisabled = (isDisabled) => {
    const inputElem = document.getElementById(this.inputId);
    isDisabled ? inputElem.setAttribute('disabled', '') : inputElem.removeAttribute('disabled');
  };
}

export default NumberInput;
