import { Component } from '../../../LIGHTER';
import styles from './SettingsPanel.module.scss';
import { saveEditorState } from '../../sceneData/saveSession';
import { getSceneParamR, setSceneParamR } from '../../sceneData/sceneParams';
import { getSceneItem } from '../../sceneData/sceneItems';
import Button from './Button';

class SettingsPanel extends Component {
  constructor(data) {
    super(data);
    let classNames = [styles.settingsPanel, 'collapsable-panel'];
    if (data.class && Array.isArray(data.class)) {
      classNames = [...classNames, ...data.class];
    } else if (data.class) {
      classNames = [...classNames, data.class];
    }
    if (data.panelClosed) classNames.push('closed');
    data.class = classNames;
    this.title = data.title;
    this.contentId = data.contentId;
    if (data.showPanel === undefined) data.showPanel = true;
    this.showPanel = getSceneParamR(`editor.show.${this.id}`, data.showPanel);
    this.panelTitleId = 'settings-panel-title-' + this.id;
  }

  paint() {
    this.addChildDraw(
      new Button({
        id: this.panelTitleId,
        text: this.title,
        onClick: () => {
          this.showPanel = !this.showPanel;
          this._setPanelClass();
          setSceneParamR(`editor.show.${this.id}`, this.showPanel);
          saveEditorState({ show: { [this.id]: this.showPanel } });
        },
      })
    );
    this.addChildDraw({
      id: this.contentId,
      class: [styles.settingsPanelContent, 'collapsable-panel__content'],
    });
    this._setPanelClass();
  }

  _setPanelClass = () => {
    if (this.showPanel) {
      this.elem.classList.remove('closed');
    } else {
      this.elem.classList.add('closed');
    }
    // TODO: Move findParentClass to helper functions
    const findParentClass = (elem, className) => {
      while (elem.parentNode) {
        elem = elem.parentNode;
        if (elem.classList?.contains(className)) return elem;
      }
      return null;
    };
    if (findParentClass(this.elem, 'dialog')) {
      getSceneItem('dialog').onResize();
    }
  };

  updateTitle = (newTitle) => {
    const elem = document.getElementById(this.panelTitleId);
    elem.textContent = newTitle;
  };
}

export default SettingsPanel;
