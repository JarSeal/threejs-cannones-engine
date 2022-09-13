import { Component } from '../../LIGHTER';
import Button from './common/Button';
import styles from './UIWorld.module.scss';

class UIWorld extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.uiPanelWorld];
    this.showPanel = false;
    if (this.showPanel) {
      data.class.push(styles.showPanel);
    }
  }

  paint = () => {
    this.addChildDraw(
      new Button({
        id: 'btn-toggle-visiblity-' + this.id,
        onClick: () => this.togglePanel(),
        class: 'panelTogglerButton',
        text: 'W',
      })
    );
    this.addChildDraw({ id: 'panel-title-' + this.id, text: 'World settings' });
  };

  togglePanel = (close) => {
    if (close) {
      this.showPanel = false;
      this.elem.classList.remove(styles.showPanel);
      return;
    }
    this.showPanel = !this.showPanel;
    if (this.showPanel) {
      this.elem.classList.add(styles.showPanel);
    } else {
      this.elem.classList.remove(styles.showPanel);
    }
  };
}

export default UIWorld;
