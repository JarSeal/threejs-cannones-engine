import { Component } from '../../../LIGHTER';
import Button from './Button';

// Attributes:
// - buttons = object[]
//     - object = { icon, onClick, selected (optional) }
class TinyButtonGroup extends Component {
  constructor(data) {
    super(data);
    this.buttons = data.buttons;
    this.template = `<div class="tinyButtonGroup"></div>`;
  }

  paint = () => {
    this.buttons.forEach((btn, index) => {
      this.addChildDraw(
        new Button({
          id: this.id + '-btn-' + index,
          icon: btn.icon,
          class: btn.selected ? 'selected' : undefined,
          onClick: btn.onClick,
        })
      );
    });
  };
}

export default TinyButtonGroup;
