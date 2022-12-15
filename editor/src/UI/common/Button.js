import Component from '../../../LIGHTER/Component';

// Attributes:
// - onClick: (e) => {}
class Button extends Component {
  constructor(data) {
    super(data);
    if (!data.onClick) {
      console.error('Button must have a onClick declared.', this.id);
    }
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

    if (data.icon) this.icon = data.icon;
    this.disabled = data.disabled;
  }

  paint = () => {
    if (this.icon) this.addChildDraw(this.icon);
  };

  addListeners = () => {
    this.addListener({
      id: this.id + '-listener',
      type: 'click',
      fn: this.onClick,
    });
  };
}

export default Button;
