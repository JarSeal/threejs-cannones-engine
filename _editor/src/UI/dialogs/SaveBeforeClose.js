import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import Button from '../common/Button';

// Attributes:
// - message: String
// - saveButtonFn: Function
// - dontSaveButtonFn: Function
// - cancelButtonFn: Function
class SaveBeforeCloseDialog extends Component {
  constructor(data) {
    super(data);
    this.Dialog = getSceneItem('dialog');
    this.template = '<div class="confirmation-dialog">' + `<p>${data.message}</p>` + '</div>';
  }

  paint = () => {
    const buttonDivId = 'confirmation-buttons-' + this.id;
    this.addChildDraw({ id: buttonDivId, class: 'buttons' });
    this.addChildDraw(
      new Button({
        id: this.id + '-cancel-button',
        text: 'Cancel',
        attach: buttonDivId,
        class: 'cancelButton',
        onClick: () => {
          if (this.Dialog.isLocked) return;
          if (this.data.cancelButtonFn) {
            this.data.cancelButtonFn();
            this.Dialog.disappear();
          }
        },
      })
    );
    this.addChildDraw(
      new Button({
        id: this.id + '-dont-save-button',
        text: `Don't save`,
        attach: buttonDivId,
        class: 'saveButton',
        onClick: () => {
          if (this.Dialog.isLocked) return;
          if (this.data.dontSaveButtonFn) {
            this.data.dontSaveButtonFn();
            this.Dialog.disappear();
          }
        },
      })
    );
    const saveButton = new Button({
      id: this.id + '-confirm-button',
      attach: buttonDivId,
      text: 'Save',
      class: 'saveButton',
      onClick: () => {
        if (this.Dialog.isLocked) return;
        if (this.data.saveButtonFn) {
          this.data.saveButtonFn();
          this.Dialog.disappear();
        }
      },
    });
    this.addChildDraw(saveButton);
    saveButton.elem.focus();
  };
}

export default SaveBeforeCloseDialog;
