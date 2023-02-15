import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import { DEFAULT_TEXTURE } from '../../utils/defaultSceneValues';
import { makeTextureGlobal } from '../../utils/toolsForTextures';
import Button from '../common/Button';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';

class ToggleGlobalTextureDialog extends Component {
  constructor({ textureParams }) {
    super({ id: 'toggle-global-texture-dialog', class: 'dialog-form' });
    this.formHasErrors = true;
    this.textureParams = textureParams;
    // Defalt values
    this.newTextureParams = Object.assign({
      ...DEFAULT_TEXTURE,
      id: '',
      name: '',
      ...textureParams,
    });
    this.makeGlobal = !textureParams.global;
  }

  paint = async () => {
    const getProjectData = getSceneItem('getProjectData');
    const currentGlobalTexturesData = await getProjectData({
      loadTexturesData: true,
    });
    const currentGlobalTextures = currentGlobalTexturesData.globalTextures;

    let msg = 'Are you sure you want to make this texture global?';
    if (!this.makeGlobal) {
      msg =
        'Are you sure you want to copy this texture into a local texture? The global texture will not be removed.';
    }
    this.addChildDraw({
      id: this.id + '-msg',
      class: 'message',
      text: msg,
    });

    this.textureIdInput = this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-id',
        label: 'Texture ID',
        curId: this.newTextureParams.id,
        newId: true,
        focus: true,
        dontUpdateParam: true,
        onValidationErrors: () => (this.formHasErrors = true),
        onValidationSuccess: () => (this.formHasErrors = false),
        afterSuccessBlur: (id) => (this.newTextureParams.id = id),
        additionalValidationFn: (value) => {
          const textureFound = currentGlobalTextures.find((text) => text.id === value);
          if (textureFound) return this.textureIdInput.getAlreadyInUseError();
          return { hasError: false };
        },
      })
    );
    const texIdError = this.textureIdInput._validate(this.textureIdInput.inputComponent.value);
    if (texIdError.hasError) this.textureIdInput.inputComponent.error(texIdError);

    // Name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-name',
        label: 'Texture name',
        value: this.newTextureParams.name,
        changeFn: (e) => {
          this.newTextureParams.name = e.target.value;
        },
      })
    );

    const buttonDivId = 'new-tex-buttons-' + this.id;
    this.addChildDraw({ id: buttonDivId, class: 'buttons' });

    // Cancel button
    this.addChildDraw(
      new Button({
        id: 'new-tex-cancel-' + this.id,
        class: ['cancelButton'],
        attach: buttonDivId,
        text: 'Cancel',
        onClick: () => {
          getSceneItem('dialog').disappear();
        },
      })
    );

    // Create new scene button
    this.addChildDraw(
      new Button({
        id: 'new-tex-create-' + this.id,
        class: ['saveButton'],
        attach: buttonDivId,
        text: this.makeGlobal ? 'Make global' : 'Make local',
        onClick: () => {
          // Check if the texture Id is empty and show "Required" error
          if (!this.newTextureParams.id) {
            const texIdError = this.textureIdInput._validate(
              this.textureIdInput.inputComponent.value
            );
            if (texIdError.hasError) this.textureIdInput.inputComponent.error(texIdError);
          }
          if (this.formHasErrors) return;

          getSceneItem('dialog').disappear(() => {
            makeTextureGlobal(this.newTextureParams);
          });
        },
      })
    );
  };
}

export default ToggleGlobalTextureDialog;
