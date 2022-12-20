import { Component } from '../../LIGHTER';
import { saveEditorState } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
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
            onClick: () => {
              if (this.selectAndTransformTool === 'select') return;
              this.selectAndTransformTool = 'select';
              this.updateTools();
            },
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
              ...this._selectedElemIcon(selections),
            }),
            class: ['selectedElemToolToggle'],
            onClick: () => {
              const newValue = !getSceneParamR('editor.show.elemTool');
              setSceneParamR('editor.show.elemTool', newValue);
              saveEditorState({ show: { elemTool: newValue } });
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

  _selectedElemIcon = (selections) => {
    if (selections.length > 1) return { icon: 'cubes', width: 26 };
    const sel = selections[0].userData;
    if (sel?.paramType === 'element') return { icon: 'cube', width: 22 };
    if (sel?.paramType === 'camera') return { icon: 'camera', width: 18 };
    return { icon: '', width: 22 };
  };
}

export default LeftTools;
