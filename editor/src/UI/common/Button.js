import Component from '../../../LIGHTER/Component';

// Attributes:
// - onClick: (e) => {} (optional)
// - onFocus: (e) => {} (optional)
// - onBlur: (e) => {} (optional)
class Button extends Component {
  constructor(data) {
    super(data);

    if (!data.template) {
      this.template = `<button type="button"${
        this.data.disabled ? ' disabled="true"' : ''
      }></button>`;
    } else {
      this.template = data.template;
    }
    if (Array.isArray(data.class)) {
      data.class = [...data.class, 'button'];
    } else if (data.class) {
      data.class = [data.class, 'button'];
    } else {
      data.class = ['button'];
    }
    if (data.disabled)
      typeof data.class === 'string'
        ? (data.class = [data.class, 'disabled'])
        : data.class.push('disabled');

    this.onClick = data.onClick;
    this.onFocus = data.onFocus;
    this.onBlur = data.onBlur;

    if (data.icon) this.icon = data.icon;
    this.disabled = data.disabled;
  }

  paint = () => {
    if (this.icon) {
      this.addChildDraw(this.icon);
    }
  };

  addListeners = () => {
    if (this.onClick) {
      this.addListener({
        id: this.id + '-click-listener',
        type: 'click',
        fn: (e) => this.onClick(e, this),
      });
    }
    if (this.onFocus) {
      this.addListener({
        id: this.id + '-focus-listener',
        type: 'focus',
        fn: (e) => this.onFocus(e, this),
      });
    }
    if (this.onBlur) {
      this.addListener({
        id: this.id + '-blur-listener',
        type: 'blur',
        fn: (e) => this.onBlur(e, this),
      });
    }
  };
}

export default Button;
