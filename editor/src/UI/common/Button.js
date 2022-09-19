import Component from '../../../LIGHTER/Component';

// Attributes:
// - onClick: (e) => {}
class Button extends Component {
  constructor(data) {
    super(data);
    if (!data.onClick) {
      console.error('Button must have a clickFn declared.', this.id);
    }
    if (!data.template) {
      this.template = '<button type="button"></button>';
    } else {
      this.template = data.template;
    }
    if (Array.isArray(data.class)) {
      data.class = [...data.class, 'button'];
    } else if (data.class) {
      data.class = [data.class, 'button'];
    } else {
      data.class = 'button';
    }
    this.onClick = data.onClick;
  }

  addListeners = () => {
    this.addListener({
      id: this.id + '-listener',
      type: 'click',
      fn: this.onClick,
    });
  };
}

export default Button;
