import { Component } from '../../LIGHTER';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
import { saveEditorState } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import FloatingView from './FloatingView';
import { getSelectedElemIcon } from '../utils/utils';
import styles from './ElemTool.module.scss';
import Button from './common/Button';
import SvgIcon from './icons/svg-icon';
import Transforms from './ElemToolPanels/Transforms';

class ElemTool extends Component {
  constructor(data) {
    super(data);
    this.elemToolWrapper = null;
  }

  paint = () => {
    this.updateTool();
  };

  _createTool = () => {
    const toolWrapperId = this.id + '-main-wrapper';
    if (this.elemToolWrapper) this.elemToolWrapper.discard(true);

    const selections = getSceneItem('selection') || [];
    if (!getSceneParamR('editor.show.elemTool') || !selections.length) return;

    let headerText = `[ ${selections.length} items ]`;
    if (selections.length === 1) {
      if (selections[0]?.userData.paramType === 'cameraTarget') {
        headerText = selections[0].userData.params.name || '';
      } else {
        headerText = selections[0]?.userData.name || '';
      }
    }

    this.elemToolWrapper = this.addChildDraw(
      new FloatingView({
        id: toolWrapperId,
        headerText,
        iconData: getSelectedElemIcon(selections),
        position: getSceneParamR('editor.positions.elemTool'),
        height: getSceneParamR('editor.heights.elemTool'),
        minified: getSceneParamR('editor.show.elemToolContent') === false,
        countLastContentChildHeight: true,
        closeButtonFn: () => {
          setSceneParamR('editor.show.elemTool', false);
          saveEditorState({ show: { elemTool: false } });
          getSceneItem('elemTool').updateTool();
        },
        afterDragFn: (newPos) => {
          setSceneParamR('editor.positions.elemTool', newPos);
          saveEditorState({ positions: { elemTool: newPos } });
        },
        afterMinifyFn: (showContent) => {
          setSceneParamR('editor.show.elemToolContent', showContent);
          saveEditorState({ show: { elemToolContent: showContent } });
        },
        afterResizeHeightFn: (newHeight) => {
          setSceneParamR('editor.heights.elemTool', newHeight);
          saveEditorState({ heights: { elemTool: newHeight } });
        },
        contentFn: (parent) => this._createViewContent(parent, selections),
      })
    );
  };

  updateTool = () => {
    this._createTool();
  };

  setPosition = (x, y) => {
    setSceneParamR('editor.positions.elemTool', { x, y });
    saveEditorState({ positions: { elemTool: { x, y } } });
    if (!this.elemToolWrapper || !this.elemToolWrapper.elem) return;
    this.elemToolWrapper.elem.style.cssText = `left: ${x}px; top: ${y}px;`;
  };

  _createViewContent = (parent, selections) => {
    if (selections.length === 1) {
      parent.addChildDraw({
        id: parent.id + '-id-text',
        text:
          selections[0]?.userData.paramType === 'cameraTarget'
            ? '(camera target for..) ' + selections[0].userData.params.id
            : selections[0]?.userData.id || '[ ID NOT FOUND ]',
        class: [styles.idText],
      });
      // TODO: Create Tools here (buttons for group, copy, etc.)
      this._createElemTabs(parent, selections);
    }
  };

  _createElemTabs = (parent, selections) => {
    const tabsWrapper = parent.addChildDraw({
      id: parent.id + '-tabs-wrapper',
      class: [styles.tabsWrapper],
    });
    let currentTabId = getSceneParamR('editor.show.elemToolCurTabId');

    if (selections.length === 1) {
      // Only one selection
      const tabs = ['transforms', 'info'];
      if (!tabs.includes(currentTabId)) currentTabId = tabs[0];
      tabs.forEach((tabId) => {
        if (!this._allTabs[tabId]) {
          console.warn(`Could not find tabId "${tabId}" in allTabs`);
          return;
        }
        const tabData = this._allTabs[tabId];
        tabsWrapper.addChildDraw(
          new Button({
            id: this.id + '-tab-' + tabId,
            class: tabId === currentTabId ? ['current'] : [],
            icon: new SvgIcon({
              id: this.id + '-tab-icon-' + tabId,
              ...tabData.iconData,
            }),
            onClick: () => {
              if (tabId === currentTabId) return;
              setSceneParamR('editor.show.elemToolCurTabId', tabId);
              setSceneParamR('editor.scrollPositions.elemTool', 0);
              saveEditorState({
                show: { elemToolCurTabId: tabId },
                scrollPositions: { elemTool: 0 },
              });
              getSceneItem('elemTool').updateTool();
            },
          })
        );
      });
      const tabsContentWrapper = parent.addChildDraw({
        id: parent.id + '-tabs-content',
        class: [styles.tabsContent, 'scrollbar'],
      });
      tabsContentWrapper.addListener({
        id: parent.id + '-tabs-content-scroll-listener',
        type: 'scroll',
        fn: (e) => {
          const amount = e.target.scrollTop;
          setSceneParamR('editor.scrollPositions.elemTool', amount);
          saveEditorState({ scrollPositions: { elemTool: amount } });
        },
      });
      if (this._allTabs[currentTabId])
        this._allTabs[currentTabId].content(tabsContentWrapper, selections[0]);
      setTimeout(() => {
        if (tabsContentWrapper && tabsContentWrapper.elem) {
          tabsContentWrapper.elem.scrollTop =
            getSceneParamR('editor.scrollPositions.elemTool') || 0;
        }
      }, 200);
    }
  };

  _allTabs = {
    transforms: {
      iconData: { icon: 'moveArrows', width: 14 },
      content: (parent, selection) => {
        parent.addChildDraw(new Transforms({ id: this.id + '-tab-content-transforms', selection }));
      },
    },
    info: {
      iconData: { icon: 'info', width: 4 },
      content: (parent, selection) => {
        for (let i = 0; i < 30; i++) {
          parent.addChildDraw({
            id: this.id + '-tab-content-info-' + i, // TEMP: remove i
            text: 'Information ' + i, // TEMP: remove i
          });
        }
      },
    },
  };
}

export default ElemTool;
