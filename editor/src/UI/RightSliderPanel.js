import { Component } from '../../LIGHTER';
import Button from './common/Button';
import styles from './RightSliderPanel.module.scss';
import { getSceneParamR, getSceneParam, setSceneParamR } from '../sceneData/sceneParams';
import { saveEditorState } from '../sceneData/saveSession';
import UIWorld from './RightSliderPanels/UIWorld';
import UICamera from './RightSliderPanels/UICamera';

class RightSidePanel extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.uiPanelRight];
    this.innerContentId = this.id + '-inner-content';
    this.innerContent = this.addChild({ id: this.innerContentId, class: styles.uiPanelRightInner });
    this.tabId = getSceneParamR('editor.show.rightPanelTab', '');
    if (this.tabId.length) {
      data.class.push(styles.showPanel);
    }
  }

  paint = () => {
    this.innerContent.draw();
    this.innerContent.addListener({
      id: this.id + '-panel-scroll-listener',
      type: 'scroll',
      fn: (e) => {
        const currentTab = getSceneParamR('editor.show.rightPanelTab', null);
        if (currentTab) {
          const scrollPos = e.target.scrollTop;
          setSceneParamR('editor.rightPanelScrollTop.' + currentTab, scrollPos);
          saveEditorState({ editor: { rightPanelScrollTop: { [currentTab]: scrollPos } } });
        }
      },
    });
    for (let i = 0; i < this._tabs.length; i++) {
      const tab = this._tabs[i];
      tab.btn.draw();
      if (tab.id === this.tabId) {
        tab.content.draw({ attach: this.innerContentId });
        tab.btn.elem.classList.add('current');
      }
    }
    this.innerContent.elem.scrollTop = getSceneParamR(
      'editor.rightPanelScrollTop.' + getSceneParamR('editor.show.rightPanelTab', '_'),
      0
    );
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
        tab.content.draw({ attach: this.innerContentId });
        this.innerContent.elem.scrollTop = getSceneParamR('editor.rightPanelScrollTop.' + tabId, 0);
      } else {
        tab.content.discard();
      }
    });
  };

  updatePanel = (tabId) => {
    if (!tabId) {
      this.rePaint();
      return;
    }
    if (this.tabId === tabId) this.rePaint();
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
      content: this.addChild(
        new UICamera({ id: 'ui-tab-camera-' + this.id, updatePanel: this.updatePanel })
      ),
    },
  ];
}

export default RightSidePanel;
