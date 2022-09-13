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
