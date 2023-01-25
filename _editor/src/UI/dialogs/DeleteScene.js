import { Component } from '../../../LIGHTER';
import { deleteSceneApi } from '../../api/deleteScene';
import { unsetHasUnsavedChanges } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import { closeProject } from '../../utils/utils';
import Button from '../common/Button';

// Attributes:
// - projectFolder
// - sceneId
class DeleteSceneDialog extends Component {
  constructor(data) {
    super({ ...data, id: 'delete-scene-dialog' });
    this.Dialog = getSceneItem('dialog');
    this.projectFolder = data.projectFolder;
    this.sceneId = data.sceneId;
    this.template =
      '<div class="confirmation-dialog">' +
      `<p>Are you absolutely sure you want to delete this scene (scene ID: "${data.sceneId}", project ID: "${data.projectFolder}")? This action cannot be undone.</p>` +
      '</div>';
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
          this.Dialog.disappear();
        },
      })
    );
    const deleteButton = new Button({
      id: this.id + '-confirm-button',
      attach: buttonDivId,
      text: 'Delete',
      class: ['saveButton', 'confirmButtonDelete'],
      onClick: async () => {
        if (this.Dialog.isLocked) return;
        this.Dialog.disappear(async () => {
          unsetHasUnsavedChanges();
          const response = await deleteSceneApi(this.projectFolder, this.sceneId);
          if (response.sceneDeleted) {
            closeProject();
            getSceneItem('toaster').addToast({
              type: 'success',
              content: 'Scene deleted!',
            });
          }
        });
      },
    });
    this.addChildDraw(deleteButton);
    deleteButton.elem.focus();
  };
}

export default DeleteSceneDialog;
