import { Component } from '../../LIGHTER';
import { saveEditorState } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
import { getSelectedElemIcon } from '../utils/utils';
import Button from './common/Button';
import SvgIcon from './icons/svg-icon';
import styles from './LeftTools.module.scss';

class LeftTools extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.leftTools];
    this.mainButtonsWrapper = null;
    this.selectedElemButtonsWrapper = null;
    this.selectAndTransformTool = getSceneParamR('editor.selectAndTransformTool', 'select'); // TODO: Get the value form editor params
    this.disabledToolIds = [];
  }

  paint = () => {
    this.updateTools();
  };

  _selectAndTransformButtons = () => {
    const buttonWrapperId = this.id + '-select-and-transform-buttons-wrapper';
    const buttons = [
      {
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-select-button',
            icon: new SvgIcon({ id: this.id + '-add-icon', icon: 'pointer', width: 12 }),
            class: this.selectAndTransformTool === 'select' ? ['current'] : [],
            disabled: this.disabledToolIds.includes('select'),
            onClick: () => this.changeTool('select'),
          })
        ),
      },
      {
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-translate-button',
            icon: new SvgIcon({ id: this.id + '-translate-icon', icon: 'moveArrows', width: 18 }),
            class: this.selectAndTransformTool === 'translate' ? ['current'] : [],
            disabled: this.disabledToolIds.includes('translate'),
            onClick: () => this.changeTool('translate'),
          })
        ),
      },
      {
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-rotate-button',
            icon: new SvgIcon({ id: this.id + '-rotate-icon', icon: 'rotate', width: 18 }),
            class: this.selectAndTransformTool === 'rotate' ? ['current'] : [],
            disabled: this.disabledToolIds.includes('rotate'),
            onClick: () => this.changeTool('rotate'),
          })
        ),
      },
      {
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-scale-button',
            icon: new SvgIcon({ id: this.id + '-scale-icon', icon: 'scale', width: 18 }),
            class: this.selectAndTransformTool === 'scale' ? ['current'] : [],
            disabled: this.disabledToolIds.includes('scale'),
            onClick: () => this.changeTool('scale'),
          })
        ),
      },
    ];
    if (this.mainButtonsWrapper) this.mainButtonsWrapper.discard(true);
    this.mainButtonsWrapper = this.addChildDraw({
      id: buttonWrapperId,
      class: ['floatingUIButtons', 'vertical', 'selectAndTransformButtons'],
    });
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      button.btn.draw({ attach: buttonWrapperId });
    }
  };

  _selectedElemButtons = () => {
    if (this.selectedElemButtonsWrapper) this.selectedElemButtonsWrapper.discard(true);
    const selections = getSceneItem('selection');
    if (!selections || !selections.length) return;

    const buttonWrapperId = this.id + '-selected-elem-buttons-wrapper';
    const buttons = [
      {
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-toggle-selected-elem-tool-button',
            icon: new SvgIcon({
              id: this.id + '-selected-elem-icon',
              ...getSelectedElemIcon(selections),
            }),
            class: ['selectedElemToolToggle'],
            onClick: () => {
              const newValue = !getSceneParamR('editor.show.elemTool');
              setSceneParamR('editor.show.elemTool', newValue);
              setSceneParamR('editor.show.elemToolContent', true);
              setSceneParamR('editor.heights.elemTool', null);
              setSceneParamR('editor.scrollPositions.elemTool', 0);
              saveEditorState({
                show: { elemTool: newValue, elemToolContent: true },
                heights: { elemTool: null },
                scrollPositions: { elemTool: 0 },
              });
              const elemTool = getSceneItem('elemTool');
              elemTool.updateTool();
              const buttonPosAndSize = buttons[0].btn.elem.getBoundingClientRect();
              elemTool.setPosition(
                buttonPosAndSize.left + buttonPosAndSize.width + 2,
                buttonPosAndSize.top - 1
              );
            },
          })
        ),
      },
    ];

    this.selectedElemButtonsWrapper = this.addChildDraw({
      id: buttonWrapperId,
      class: ['floatingUIButtons', 'vertical', 'selectedElemButtons'],
    });
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      button.btn.draw({ attach: buttonWrapperId });
      if (button.type === 'menu') {
        if (button.options && Array.isArray(button.options)) {
          const buttonMenu = button.btn.addChildDraw({
            id: button.btn.data.id + '-menu-wrapper',
            class: ['menuWrapper'],
          });
          for (let j = 0; j < button.options.length; j++) {
            buttonMenu.addChildDraw(
              new Button({
                ...button.options[j],
                id: button.btn.data.id + '-option-' + j,
                class: button.options[j].icon ? ['hasIcon'] : [],
              })
            );
          }
        }
      }
    }
  };

  updateTools = () => {
    this._selectedElemButtons();
    this._selectAndTransformButtons();
  };

  changeTool = (toolId) => {
    if (
      this.selectAndTransformTool === toolId ||
      (toolId !== 'select' &&
        toolId !== 'translate' &&
        toolId !== 'rotate' &&
        toolId !== 'scale') ||
      this.disabledToolIds.includes(toolId)
    ) {
      return;
    }
    this.selectAndTransformTool = toolId;
    setSceneParamR('editor.selectAndTransformTool', toolId);
    saveEditorState({ selectAndTransformTool: toolId });
    const transControls = getSceneItem('transformControls');
    if (toolId === 'select') {
      transControls.detach();
      transControls.enabled = false;
      this.updateTools();
      return;
    }
    transControls.mode = toolId;
    const selections = getSceneItem('selection');
    if (selections.length) {
      transControls.attach(
        selections.length === 1 ? selections[0] : getSceneItem('selectionGroup')
      );
      transControls.enabled = true;
    }
    this.updateTools();
  };

  // toolIds: [string]
  disableTools = (toolIds) => {
    this.disabledToolIds = toolIds;
    this.updateTools();
  };
}

export default LeftTools;
