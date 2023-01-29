import { Component } from '../../../../LIGHTER';

class FileUploader extends Component {
  constructor(data) {
    super(data);
    data.text = data.label;
  }
}

export default FileUploader;
