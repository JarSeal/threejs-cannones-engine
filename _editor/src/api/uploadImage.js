import { getSceneParam } from '../sceneData/sceneParams';
import { postRequest } from './utils/connect';

export const uploadImageApi = async (params) => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('fileName', params.fileName);
  formData.append('fileSize', params.fileSize);
  formData.append('id', params.id);
  formData.append('name', params.name);
  formData.append('projectFolder', getSceneParam('projectFolder'));
  const response = await postRequest('uploadImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};
