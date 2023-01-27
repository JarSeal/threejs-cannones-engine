import { Component } from '../../../LIGHTER';
import Button from '../common/Button';

// Attributes:
// - title = string
// - component = Component
class PopupForm extends Component {
  constructor(data) {
    super(data);
  }

  paint = () => {
    this.elem.classList.add('popupFormWrapper');
    this.addChildDraw({
      id: this.id + '-title',
      text: this.data.title,
      tag: 'h5',
    });
    this.addChildDraw(
      new Button({
        id: this.id + '-closeBtn',
        class: 'closeBtn',
        onClick: () => this.discard(true),
      })
    );

    this.addChildDraw(this.data.component);
    this.addChildDraw(
      new Button({
        id: this.id + '-confirmBtn',
        class: 'confirmBtn',
        onClick: () => this.discard(true),
      })
    );
  };
}

export default PopupForm;
