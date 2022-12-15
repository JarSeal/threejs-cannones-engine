import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import Button from '../common/Button';

// Attributes:
// - message: String
// - confirmButtonText: String
// - confirmButtonFn: Function
// - confirmButtonClasses: Array[String]
// - cancelButtonText: String
// - cancelButtonFn: Function
// - noCancelButton: Boolean (hide cancel button)
class ConfirmationDialog extends Component {
  constructor(data) {
    super(data);
    this.Dialog = getSceneItem('dialog');
    this.template = '<div class="confirmation-dialog">' + `<p>${data.message}</p>` + '</div>';
  }

  paint = () => {
    const buttonDivId = 'confirmation-buttons-' + this.id;
    this.addChildDraw({ id: buttonDivId, class: 'buttons' });
    if (!this.data.noCancelButton) {
      this.addChild(
        new Button({
          id: this.id + '-cancel-button',
          text: this.data.cancelButtonText || 'Cancel',
          attach: buttonDivId,
          class: 'cancelButton',
          onClick: () => {
            if (this.Dialog.isLocked) return;
            if (this.data.cancelButtonFn) {
              this.data.cancelButtonFn();
            } else {
              this.Dialog.disappear();
            }
          },
        })
      ).draw();
    }
    let classes = ['saveButton'];
    if (Array.isArray(this.data.confirmButtonClasses))
      classes = [...classes, ...this.data.confirmButtonClasses];
    const confirmButton = new Button({
      id: this.id + '-confirm-button',
      attach: buttonDivId,
      text: this.data.confirmButtonText || 'Confirm',
      class: classes,
      onClick: () => {
        if (this.Dialog.isLocked) return;
        if (this.data.confirmButtonFn) {
          if (this.data.confirmSpinner) this.spinner.showSpinner(true);
          this.data.confirmButtonFn();
        } else {
          this.Dialog.disappear();
        }
      },
    });
    this.addChildDraw(confirmButton);
    if (this.data.confirmSpinner) this.spinner.draw();
    confirmButton.elem.focus();
  };
}

export default ConfirmationDialog;
