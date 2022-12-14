import { Component } from '../../LIGHTER';
import Button from './common/Button';
import styles from './RightSliderPanel.module.scss';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
import { saveEditorState } from '../sceneData/saveSession';
import UIWorld from './RightSliderPanels/UIWorld';
import UICamera from './RightSliderPanels/UICamera';
import SvgIcon from './icons/svg-icon';

class RightSidePanel extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.uiPanelRight];
    this.innerContentId = this.id + '-inner-content';
    this.innerContent = this.addChild({
      id: this.innerContentId,
      class: [styles.uiPanelRightInner, 'scrollbar'],
    });
    this.tabButtonWrapperId = this.id + '-tab-btn-wrapper';
    this.tabButtonWrapper = this.addChild({
      id: this.tabButtonWrapperId,
      class: ['floatingUIButtons', 'vertical'],
    });
    this.tabId = getSceneParamR('editor.show.rightPanelTab', '');
    if (this.tabId.length) {
      data.class.push(styles.showPanel);
    }
  }

  paint = () => {
    this.tabButtonWrapper.draw();
    this.innerContent.draw();
    this.innerContent.addListener({
      id: this.id + '-panel-scroll-listener',
      type: 'scroll',
      fn: (e) => {
        const currentTab = getSceneParamR('editor.show.rightPanelTab', this.tabId);
        if (currentTab) {
          const scrollPos = e.target.scrollTop;
          setSceneParamR('editor.rightPanelScrollTop.' + currentTab, scrollPos);
          saveEditorState({ rightPanelScrollTop: { [currentTab]: scrollPos } });
        }
      },
    });
    for (let i = 0; i < this._tabs.length; i++) {
      const tab = this._tabs[i];
      tab.btn.draw({
        attach: this.tabButtonWrapperId,
        class: tab.id === this.tabId ? [...tab.btn.data.class, 'current'] : tab.btn.data.class,
      });
      if (tab.id === this.tabId) {
        tab.content.draw({ attach: this.innerContentId });
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

  updatePanel = (callback) => {
    this.rePaint();
    if (callback) callback();
  };

  _tabs = [
    {
      id: 'UICamera',
      icon: 'camera',
      btn: this.addChild(
        new Button({
          id: 'btn-UICamera' + this.id,
          onClick: () => this.togglePanel('UICamera'),
          icon: new SvgIcon({ id: this.id + '-world-icon', icon: 'camera', width: 22 }),
        })
      ),
      content: this.addChild(
        new UICamera({ id: 'ui-tab-camera-' + this.id, updatePanel: this.updatePanel })
      ),
    },
    {
      id: 'UIWorld',
      icon: 'globe',
      btn: this.addChild(
        new Button({
          id: 'btn-UIWorld' + this.id,
          onClick: () => this.togglePanel('UIWorld'),
          icon: new SvgIcon({ id: this.id + '-world-icon', icon: 'globe', width: 22 }),
        })
      ),
      content: this.addChild(new UIWorld({ id: 'ui-tab-world-' + this.id })),
    },
  ];
}

export default RightSidePanel;
