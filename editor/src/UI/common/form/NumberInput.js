import { Component } from '../../../../LIGHTER';
import SvgIcon from '../../icons/svg-icon';

// Attributes:
// - label = field label [String]
// - name = input name property [String]
// - hideMsg = if field's error message should not be shown [Booolean]
// - changeFn = function that is ran after each change [Function]
// - value = input value [Number]
// - max = maximum value
// - min = minimum value
// - disabled = whether the field is disabled or not [Boolean]
// - error = an error boolean or object to tell if the field has errors {hasError:Boolean, errorMsg:String} [Boolean/Object]
// - doNotSelectOnFocus = boolean whether to select all content or not [Boolean]
// - doNotBlurOnEnter = boolean whether to blur from the input field when Enter key is pressed [Boolean]
// - readOnly = boolean that works the same way as disabled, but removes the arrows from the inputs
class NumberInput extends Component {
  constructor(data) {
    super(data);
    if (!data.name) data.name = data.id;
    if (!data.label) data.label = data.id;
    this.inputId = this.id + '-number-input';
    this.buttonUpId = this.id + '-arrow-up';
    this.buttonDownId = this.id + '-arrow-down';
    this.min = data.min;
    this.max = data.max;
    this.template = `
            <div class="form-elem form-elem--number-input inputNumber${
              data.readOnly ? ' readOnly' : ''
            }">
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
                    <button id="${this.buttonUpId}" class="buttonUp" tabindex="-1"></button>
                    <button id="${this.buttonDownId}" class="buttonDown" tabindex="-1"></button>
                </label>
            </div>
        `;
    this.value = data.value;
    this.step = data.step;
    this.precision = data.precision;
    this.errorComp = this.addChild({
      id: this.id + '-error-msg',
      class: 'form-elem__error-msg',
    });
    if (data.error) data.class = 'form-elem--error';
    this.disabled = data.disabled;
    this.readOnly = data.readOnly;
  }

  paint = () => {
    this.addChildDraw(
      new SvgIcon({
        id: this.id + '-arrow-up-icon',
        icon: 'caretUp',
        width: 8,
        attach: this.buttonUpId,
      })
    );
    this.addChildDraw(
      new SvgIcon({
        id: this.id + '-arrow-down-icon',
        icon: 'caretDown',
        width: 8,
        attach: this.buttonDownId,
      })
    );
    this.toggleDisabled(this.disabled || this.readOnly);
  };

  addListeners(data) {
    const inputElem = document.getElementById(this.inputId);
    const checkMinMaxValue = (value) => {
      if (this.max !== undefined && value > this.max) {
        value = this.max;
      }
      if (this.min !== undefined && value < this.min) {
        value = this.min;
      }
      return value;
    };
    this.addListener({
      id: this.inputId + '-change',
      target: inputElem,
      type: 'change',
      fn: (e) => {
        const value = checkMinMaxValue(this._parsePrecision(e.target.value));
        const prevValue = this.value;
        this.setValue(value);
        if (data.changeFn) data.changeFn(value, prevValue, this.setValue);
      },
    });
    if (!data.doNotBlurOnEnter) {
      this.addListener({
        id: this.inputId + '-keyup',
        target: inputElem,
        type: 'keyup',
        fn: (e) => {
          if (data.doNotBlurOnEnter) return;
          if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Escape')
            inputElem.blur();
        },
      });
    }
    this.addListener({
      id: this.inputId + '-focus',
      target: inputElem,
      type: 'focus',
      fn: (e) => {
        this.elem.classList.add('focus');
        if (data.doNotSelectOnFocus) return;
        e.target.select();
      },
    });
    this.addListener({
      id: this.inputId + '-blur',
      target: inputElem,
      type: 'blur',
      fn: () => this.elem.classList.remove('focus'),
    });
    this.addListener({
      id: this.id + '-buttonUp-listener',
      target: document.getElementById(this.buttonUpId),
      type: 'click',
      fn: () => {
        this.setValue(checkMinMaxValue(this._parsePrecision(this.value + (this.step || 1))));
        inputElem.focus();
      },
    });
    this.addListener({
      id: this.id + '-buttonDown-listener',
      target: document.getElementById(this.buttonDownId),
      type: 'click',
      fn: () => {
        this.setValue(checkMinMaxValue(this._parsePrecision(this.value - (this.step || 1))));
        inputElem.focus();
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
    const prevValue = this.value;
    this.data.value = this.value = newValue;
    inputElem.value = newValue;
    if (noChangeFn) return;
    if (this.data.changeFn) this.data.changeFn(newValue, prevValue, this.setValue);
  };

  toggleDisabled = (isDisabled) => {
    const inputElem = document.getElementById(this.inputId);
    const buttonUpElem = document.getElementById(this.buttonUpId);
    const buttonDownElem = document.getElementById(this.buttonDownId);
    if (isDisabled) {
      this.elem.classList.add('disabled');
      inputElem.setAttribute('disabled', '');
      buttonUpElem.setAttribute('disabled', '');
      buttonDownElem.setAttribute('disabled', '');
    } else {
      this.elem.classList.remove('disabled');
      inputElem.removeAttribute('disabled');
      buttonUpElem.removeAttribute('disabled');
      buttonDownElem.removeAttribute('disabled');
    }
  };

  _parsePrecision = (value) => {
    if (!value) value = 0;
    if (this.precision === 0) return parseInt(value);
    if (!this.precision) return parseFloat(value);
    return parseFloat(parseFloat(value).toFixed(this.precision));
  };
}

export default NumberInput;
