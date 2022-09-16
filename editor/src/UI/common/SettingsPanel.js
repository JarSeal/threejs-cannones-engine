import { Component } from '../../../LIGHTER';
import styles from './SettingsPanel.module.scss';
import { saveEditorState } from '../../sceneData/saveSession';
import { getSceneParamR, setSceneParamR } from '../../sceneData/sceneParams';

class SettingsPanel extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.settingsPanel, data.panelClosed ? 'closed' : null];
    this.title = data.title;
    this.contentId = data.contentId;
    if (data.showPanel === undefined) data.showPanel = true;
    this.showPanel = getSceneParamR(`editor.show.${this.id}`, data.showPanel);
  }

  addListeners = () => {
    this.addListener({
      id: 'panel-toggle-listener-' + this.id,
      target: document.getElementById('settings-panel-title-' + this.id),
      type: 'click',
      fn: () => {
        this.showPanel = !this.showPanel;
        this._setPanelClass();
        setSceneParamR(`editor.show.${this.id}`, this.showPanel);
        saveEditorState({ show: { [this.id]: this.showPanel } });
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
    this._setPanelClass();
  }

  _setPanelClass = () => {
    if (this.showPanel) {
      this.elem.classList.remove('closed');
    } else {
      this.elem.classList.add('closed');
    }
  };
}

export default SettingsPanel;
