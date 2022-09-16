import { Component } from '../../../LIGHTER';
import styles from './SettingsPanel.module.scss';

class SettingsPanel extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.settingsPanel, data.panelClosed ? 'closed' : null];
    this.title = data.title;
    this.contentId = data.contentId;
    this.panelClosed = data.panelClosed || false;
  }

  addListeners = () => {
    this.addListener({
      id: 'panel-toggle-listener-' + this.id,
      target: document.getElementById('settings-panel-title-' + this.id),
      type: 'click',
      fn: () => {
        if (this.panelClosed) {
          this.elem.classList.remove('closed');
        } else {
          this.elem.classList.add('closed');
        }
        this.panelClosed = !this.panelClosed;
      },
    });
  };

  paint() {
    this.addChildDraw({
      id: 'settings-panel-title-' + this.id,
      tag: 'h4',
      text: this.title,
    });
    this.addChildDraw({
      id: this.contentId,
      class: styles.settingsPanelContent,
    });
  }
}

export default SettingsPanel;
