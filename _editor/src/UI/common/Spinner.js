import { Component } from '../../../LIGHTER';
import SvgIcon from '../icons/svg-icon';

class Spinner extends Component {
  constructor(data) {
    super(data);
    this.width = data.width || 24;
    this.spinWrapperId = this.id + '-spin-wrapper';
    this.template = `<div class="spinner">
      <div id="${this.spinWrapperId}" style="width:${this.width}px;height:${this.width}px;"></div>
    </div>`;
    this.icon;
  }

  paint = () => {
    this.icon = this.addChildDraw(
      new SvgIcon({
        id: this.id + '-spinner-icon',
        icon: 'gear',
        width: this.width,
        attach: this.spinWrapperId,
      })
    );
  };
}

export default Spinner;
