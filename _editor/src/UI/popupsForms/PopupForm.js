import { Component } from '../../../LIGHTER';
import Button from '../common/Button';
import SvgIcon from '../icons/svg-icon';

// Attributes:
// - title = string
// - component = Component
// - componentData = object (the additional data that is passed to the PopupForm content component)
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
        icon: new SvgIcon({ id: this.id + '-closeBtn-icon', icon: 'xMark', width: 10 }),
        onClick: () => this.discard(true),
      })
    );
    this.data.component.closePopup = () => this.discard(true);
    this.data.component.data = { ...this.data.component.data, ...this.data.componentData };
    this.addChildDraw(this.data.component);
  };
}

export default PopupForm;
