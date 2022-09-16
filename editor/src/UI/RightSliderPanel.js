import { Component } from '../../LIGHTER';
import Button from './common/Button';
import styles from './RightSliderPanel.module.scss';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
import { saveEditorState } from '../sceneData/saveSession';
import UIWorld from './RightSliderPanels/UIWorld';
import UICamera from './RightSliderPanels/UICamera';

class RightSidePanel extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.uiPanelRight];
    this.tabId = getSceneParamR('editor.show.rightPanelTab', '');
    if (this.tabId.length) {
      data.class.push(styles.showPanel);
    }
  }

  paint = () => {
    for (let i = 0; i < this._tabs.length; i++) {
      const tab = this._tabs[i];
      tab.btn.draw();
      if (tab.id === this.tabId) {
        tab.content.draw();
        tab.btn.elem.classList.add('current');
      }
    }
  };

  togglePanel = (tabId) => {
    if (this.tabId === tabId) {
      setSceneParamR('editor.show.rightPanelTab', '');
      this.elem.classList.remove(styles.showPanel);
      this.tabId = '';
    } else {
      setSceneParamR('editor.show.rightPanelTab', tabId);
      this.elem.classList.add(styles.showPanel);
      this.tabId = tabId;
    }
    saveEditorState({ show: { rightPanelTab: this.tabId } });
    this._tabs.forEach((tab) => {
      tab.btn.elem.classList.remove('current');
      if (tab.id === this.tabId) {
        tab.btn.elem.classList.add('current');
        tab.content.draw();
      } else {
        tab.content.discard();
      }
    });
  };

  _tabs = [
    {
      id: 'UIWorld',
      btn: this.addChild(
        new Button({
          id: 'btn-UIWorld' + this.id,
          onClick: () => this.togglePanel('UIWorld'),
          class: ['panelTogglerButton', 'UIWorld'],
          text: 'W',
        })
      ),
      content: this.addChild(new UIWorld({ id: 'ui-tab-world-' + this.id })),
    },
    {
      id: 'UICamera',
      btn: this.addChild(
        new Button({
          id: 'btn-UICamera' + this.id,
          onClick: () => this.togglePanel('UICamera'),
          class: ['panelTogglerButton', 'UICamera'],
          text: 'C',
        })
      ),
      content: this.addChild(new UICamera({ id: 'ui-tab-camera-' + this.id })),
    },
  ];
}

export default RightSidePanel;
