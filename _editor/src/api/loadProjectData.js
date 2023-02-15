import { postRequest } from './utils/connect';

export const loadProjectDataApi = async (props) => {
  const {
    amount,
    projectFolder,
    loadScenesData,
    loadImagesData,
    loadModelsData,
    loadTexturesData,
    loadCubetexturesData,
    loadMaterialsData,
  } = props;
  const response = await postRequest('projectData', {
    amount,
    projectFolder,
    loadScenesData,
    loadImagesData,
    loadModelsData,
    loadTexturesData,
    loadCubetexturesData,
    loadMaterialsData,
  });
  if (response.error) return [];
  return response;
};
