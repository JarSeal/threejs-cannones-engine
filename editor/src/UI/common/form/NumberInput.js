import { Component } from '../../../../LIGHTER';
import SvgIcon from '../../icons/svg-icon';

// Attributes:
// - label = field label [String]
// - name = input name property [String]
// - hideMsg = if field's error message should not be shown [Booolean]
// - changeFn = function that is ran after each change [Function]
// - value = input value [Number]
// - max = maximum value
// - disabled = whether the field is disabled or not [Boolean]
// - error = an error boolean or object to tell if the field has errors {hasError:Boolean, errorMsg:String} [Boolean/Object]
// - doNotSelectOnFocus = boolean whether to select all content or not [Boolean]
// - doNotBlurOnEnter = boolean whether to blur from the input field when Enter key is pressed [Boolean]
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
            <div class="form-elem form-elem--number-input inputNumber">
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
    this.errorComp = this.addChild({
      id: this.id + '-error-msg',
      class: 'form-elem__error-msg',
    });
    if (data.error) data.class = 'form-elem--error';
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
        const value = checkMinMaxValue(e.target.value);
        this.setValue(value);
        if (data.changeFn) data.changeFn(value, this.setValue);
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
        this.elem.classList.add('focused');
        if (data.doNotSelectOnFocus) return;
        e.target.select();
      },
    });
    this.addListener({
      id: this.inputId + '-blur',
      target: inputElem,
      type: 'blur',
      fn: () => this.elem.classList.remove('focused'),
    });
    this.addListener({
      id: this.id + '-buttonUp-listener',
      target: document.getElementById(this.buttonUpId),
      type: 'click',
      fn: () => {
        this.setValue(checkMinMaxValue(this.value + (this.step || 1)));
        inputElem.focus();
      },
    });
    this.addListener({
      id: this.id + '-buttonDown-listener',
      target: document.getElementById(this.buttonDownId),
      type: 'click',
      fn: () => {
        this.setValue(checkMinMaxValue(this.value - (this.step || 1)));
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
    this.data.value = this.value = newValue;
    inputElem.value = newValue;
    if (noChangeFn) return;
    if (this.data.changeFn) this.data.changeFn(newValue, this.setValue);
  };

  toggleDisabled = (isDisabled) => {
    const inputElem = document.getElementById(this.inputId);
    isDisabled ? inputElem.setAttribute('disabled', '') : inputElem.removeAttribute('disabled');
  };
}

export default NumberInput;
