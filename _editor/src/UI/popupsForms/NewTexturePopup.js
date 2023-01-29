import { Component } from '../../../LIGHTER';
import { createNewTexture } from '../../utils/toolsForTextures';
import Button from '../common/Button';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';

class NewTexturePopup extends Component {
  constructor(data) {
    super(data);
    this.newTextureParams = {
      id: '',
      name: '',
    };
    this.formHasErrors = false;
  }

  paint = () => {
    // ID
    const textureIdInput = this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-texture-id',
        label: 'Texture ID',
        curId: this.newTextureParams.id,
        newId: true,
        focus: true,
        onValidationErrors: () => (this.formHasErrors = true),
        onValidationSuccess: () => (this.formHasErrors = false),
        afterSuccessBlur: (id) => (this.newTextureParams.id = id),
      })
    );

    // Name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-texture-name',
        label: 'Texture name',
        value: this.newTextureParams.name,
        changeFn: (e) => {
          this.newTextureParams.name = e.target.value;
        },
      })
    );

    // Confirm button
    this.addChildDraw(
      new Button({
        id: this.id + '-confirmBtn',
        class: 'confirmBtn',
        text: 'Confirm',
        onClick: () => {
          if (!this.newTextureParams.id) {
            const texutureIdError = textureIdInput._validate(textureIdInput.inputComponent.value);
            if (texutureIdError.hasError) textureIdInput.inputComponent.error(texutureIdError);
          }
          if (this.formHasErrors) return;

          createNewTexture(this.newTextureParams.id, this.newTextureParams.name);
          const parentComp = this.data.textureInputComponent;
          if (parentComp && parentComp.update) parentComp.update(this.newTextureParams.id);
          this.closePopup();
        },
      })
    );
  };
}

export default NewTexturePopup;
