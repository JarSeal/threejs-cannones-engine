import { Component } from '../../../../LIGHTER';
import Button from '../Button';

class ActionButtons extends Component {
  constructor(data) {
    super(data);
    data.class = ['form-elem', 'form-elem--action-buttons'];
    this.buttons = [];
    data.buttons.forEach((btn) => {
      this.buttons.push(this.addChild(new Button(btn)));
    });
  }

  paint = () => {
    this.buttons.forEach((btn) => btn.draw());
  };
}

export default ActionButtons;
