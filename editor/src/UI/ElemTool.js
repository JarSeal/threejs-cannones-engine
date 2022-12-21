import { Component } from '../../LIGHTER';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
import { saveEditorState } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import FloatingView from './FloatingView';
import { getSelectedElemIcon } from '../utils/utils';
import styles from './ElemTool.module.scss';

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
      headerText =
        selections[0].userData.name && selections[0].userData.name.length
          ? selections[0].userData.name
          : '';
    } else if (selections.length === 0) {
      headerText = '';
    }

    this.elemToolWrapper = this.addChildDraw(
      new FloatingView({
        id: toolWrapperId,
        headerText,
        iconData: getSelectedElemIcon(selections),
        position: getSceneParamR('editor.positions.elemTool'),
        minified: getSceneParamR('editor.show.elemToolContent') === false,
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
        text: selections[0].userData.id,
        class: [styles.idText],
      });
      // Show Tools
      this._createElemTabs(parent, selections);
      // Show scrollable tab content
    }
  };

  _createElemTabs = (parent, selections) => {
    const tabsWrapperId = parent.id + '-tabs-wrapper';
    parent.addChildDraw({
      id: tabsWrapperId,
      class: [styles.tabsWrapper],
    });
    if (selections.length === 1) {
      // Render buttons
    }
  };
}

export default ElemTool;
