import { Component } from '../../LIGHTER';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam } from '../sceneData/sceneParams';
import { changeCurCamera, newCameraDialog } from '../utils/toolsForCamera';
import { saveScene } from '../utils/toolsForFS';
import { closeProject, printName } from '../utils/utils';
import Button from './common/Button';
import SvgIcon from './icons/svg-icon';
import styles from './TopTools.module.scss';

class TopTools extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.topTools];
    this.mainButtonsWrapper = null;
    this.undoRedoButtonsWrapper = null;
  }

  paint = () => {
    this.updateTools();
  };

  _mainButtons = () => {
    const buttonWrapperId = this.id + '-main-buttons-wrapper';
    const buttons = [
      {
        // MAIN MENU
        type: 'menu',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-main-menu-button',
            class: ['menuButton'],
            icon: new SvgIcon({ id: this.id + '-main-menu-icon', icon: 'bars', width: 16 }),
            ...this._menuButtonListeners,
          })
        ),
        options: [
          {
            // MAIN MENU: SAVE SCENE
            icon: new SvgIcon({ id: this.id + '-save-scene-icon', icon: 'save' }),
            text: 'Save scene',
            onClick: async () => {
              await saveScene();
              document.activeElement.blur();
            },
          },
          {
            // MAIN MENU: CLOSE PROJECT
            icon: new SvgIcon({ id: this.id + '-close-project-icon', icon: 'xMark' }),
            text: 'Close project',
            onClick: async () => {
              closeProject();
              document.activeElement.blur();
            },
          },
        ],
      },
      {
        // ADD MENU
        type: 'menu',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-add-menu-button',
            class: ['menuButton'],
            icon: new SvgIcon({ id: this.id + '-add-icon', icon: 'plus', width: 18 }),
            ...this._menuButtonListeners,
          })
        ),
        options: [
          {
            // ADD MENU: ADD NEW CAMERA
            icon: new SvgIcon({ id: this.id + '-add-camera-icon', icon: 'camera', width: 18 }),
            text: 'Add Camera',
            onClick: () => newCameraDialog(),
          },
        ],
      },
      {
        // CAMERA SELECTOR
        type: 'cameraSelector',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-change-cam-menu-button',
            class: ['menuButton', 'camSelector'],
            icon: new SvgIcon({ id: this.id + '-change-cam-icon', icon: 'camera', width: 18 }),
            ...this._menuButtonListeners,
          })
        ),
      },
    ];

    if (this.mainButtonsWrapper) this.mainButtonsWrapper.discard(true);
    this.mainButtonsWrapper = this.addChildDraw({
      id: buttonWrapperId,
      class: ['floatingUIButtons', 'mainButtons'],
    });
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (button.type === 'menu') {
        button.btn.draw({ attach: buttonWrapperId });
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
      } else if (button.type === 'cameraSelector') {
        const cams = getSceneParam('cameras');
        button.btn.draw({
          attach: buttonWrapperId,
          appendHtml: `<span class="curCamName">
            ${printName(cams[getSceneParam('curCameraIndex')])}
          </span>`,
        });
        const buttonMenu = button.btn.addChildDraw({
          id: button.btn.data.id + '-menu-wrapper',
          class: ['menuWrapper'],
        });
        for (let j = 0; j < cams.length; j++) {
          buttonMenu.addChildDraw(
            new Button({
              id: button.btn.data.id + '-cameras-' + j,
              class: getSceneParam('curCameraIndex') === j ? 'current' : [],
              text: printName(cams[j]),
              onClick: () => {
                changeCurCamera(j);
              },
            })
          );
        }
      }
    }
  };

  _undoRedoButtons = () => {
    const buttonWrapperId = this.id + '-undoredo-buttons-wrapper';
    if (this.undoRedoButtonsWrapper) this.undoRedoButtonsWrapper.discard(true);
    this.undoRedoButtonsWrapper = this.addChildDraw({
      id: buttonWrapperId,
      class: ['floatingUIButtons', 'undoRedoButtons'],
    });
    this.undoRedoButtonsWrapper.addChildDraw(
      new Button({
        id: this.id + '-btn-undo-button',
        disabled: getSceneItem('undoRedo').isLastUndo(),
        icon: new SvgIcon({ id: this.id + '-undo-icon', icon: 'undo', width: 18 }),
        onClick: () => getSceneItem('undoRedo').undo(),
      })
    );
    this.undoRedoButtonsWrapper.addChildDraw(
      new Button({
        id: this.id + '-btn-redo-button',
        disabled: getSceneItem('undoRedo').isFirstUndo(),
        icon: new SvgIcon({ id: this.id + '-redo-icon', icon: 'redo', width: 18 }),
        onClick: () => getSceneItem('undoRedo').redo(),
      })
    );
  };

  updateTools = () => {
    this._mainButtons();
    this._undoRedoButtons();
  };

  _menuButtonListeners = {
    onFocus: (_, comp) => {
      comp.hasFocus = true;
      comp.focusStart = performance.now();
    },
    onBlur: (_, comp) => (comp.hasFocus = false),
    onClick: (_, comp) => {
      if (performance.now() > comp.focusStart + 200) comp.elem.blur();
    },
  };
}

export default TopTools;
