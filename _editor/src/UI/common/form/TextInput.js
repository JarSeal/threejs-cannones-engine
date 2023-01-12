import { Component } from '../../../../LIGHTER';

// Attributes:
// - value = value to display on the field [String]
// - password = whether the input type is password [Boolean]
// - label = field label [String]
// - placeholder = field placeholder [String]
// - name = input name property [String]
// - hideMsg = if field's error message should not be shown [Booolean]
// - changeFn = function that is ran after each change [Function]
// - onFocus = function that is ran when the input gets focus [Function(e)]
// - onBlur = function that is ran when the input is out of focus (blur) [Function(e)]
// - disabled = whether the field is disabled or not [Boolean]
// - error = an error boolean or object to tell if the field has errors {hasError:Boolean, errorMsg:String} [Boolean/Object]
// - maxlength = html max length attribute value for input elem [Number/String]
// - doNotSelectOnFocus = boolean whether to select all content or not [Boolean]
// - doNotBlurOnEnter = boolean whether to blur from the input field when Enter key is pressed [Boolean]
// - focus = boolean whether the input should have focus after initiation or not [Boolean]
class TextInput extends Component {
  constructor(data) {
    super(data);
    if (!data.name) data.name = data.id;
    if (!data.label && data.label !== '') data.label = data.id;
    this.inputId = this.id + '-input';
    this.template = `
            <div class="form-elem form-elem--text-input inputText">
                <label for="${this.inputId}">
                    <span class="form-elem__label">${data.label}</span>
                    <input
                        id="${this.inputId}"
                        class="form-elem__input"
                        type="${data.password ? 'password' : 'text'}"
                        name="${data.name}"
                        placeholder="${data.placeholder || ''}"
                        value="${data.value || ''}"
                        ${data.maxlength ? 'maxlength="' + data.maxlength + '"' : ''}
                        ${data.disabled ? 'disabled' : ''}
                    />
                </label>
            </div>
        `;
    this.value = data.value || '';
    this.errorComp = new Component({
      id: this.id + '-error-msg',
      class: 'form-elem__error-msg',
    });
    if (data.error) data.class = 'form-elem--error';
    this.focus = data.focus;
    this.onFocus = data.onFocus ? data.onFocus : null;
    this.onBlur = data.onBlur ? data.onBlur : null;
  }

  erase = () => {
    this.errorComp.discard(true);
  };

  addListeners = (data) => {
    const inputElem = this.elem.querySelector('#' + this.inputId);
    if (data.changeFn || !data.doNotBlurOnEnter) {
      this.addListener({
        id: this.inputId + '-keyup',
        target: inputElem,
        type: 'keyup',
        fn: (e) => {
          this.value = e.target.value;
          this.data.value = this.value;
          if (data.changeFn) data.changeFn(e);
          if (!data.doNotBlurOnEnter && e.code === 'Enter') inputElem.blur();
        },
      });
    }
    this.addListener({
      id: this.inputId + '-focus',
      target: inputElem,
      type: 'focus',
      fn: (e) => {
        this.elem.classList.add('focus');
        if (!data.doNotSelectOnFocus) e.target.select();
        if (this.onFocus) this.onFocus(e);
      },
    });
    this.addListener({
      id: this.inputId + '-blur',
      target: inputElem,
      type: 'blur',
      fn: (e) => {
        this.elem.classList.remove('focus');
        if (this.onBlur) this.onBlur(e);
      },
    });
  };

  paint(data) {
    const inputElem = document.getElementById(this.inputId);
    if (data.value !== undefined) {
      this.value = data.value;
      this.data.value = data.value;
    }
    inputElem.value = this.value;
    if (data.error) {
      this.elem.classList.add('form-elem--error');
      if (data.error.errorMsg) {
        this.elem.classList.add('form-elem--error-msg');
        this.addChild(this.errorComp).draw({ text: data.error.errorMsg });
      }
    }
    if (data.disabled) inputElem.setAttribute('disabled', '');
    if (this.focus) inputElem.select();
  }

  error(err) {
    this.errorComp.discard();
    if (err) {
      this.elem.classList.add('form-elem--error');
      if (err.errorMsg && !this.data.hideMsg) {
        this.elem.classList.add('form-elem--error-msg');
        this.addChild(this.errorComp).draw({ text: err.errorMsg });
      }
    } else {
      this.elem.classList.remove('form-elem--error');
      this.elem.classList.remove('form-elem--error-msg');
    }
  }

  setValue(newValue, noChangeFn) {
    this.value = String(newValue);
    const inputElem = document.getElementById(this.inputId);
    inputElem.value = this.value;
    this.data.value = this.value;
    if (noChangeFn) return;
    if (this.data.changeFn) this.data.changeFn({ target: inputElem });
  }

  focus = (caretPos) => {
    const inputElem = this.elem.querySelector('#' + this.inputId);
    inputElem.focus();
    if (caretPos) inputElem.setSelectionRange(caretPos, caretPos);
  };

  blur = () => {
    const inputElem = this.elem.querySelector('#' + this.inputId);
    inputElem.blur();
  };
}

export default TextInput;
