import axios from 'axios';

import { getFSUrl } from '../utils/getFSUrl';

export const loadSceneApi = async (props) => {
  const { projectFolder, sceneId } = props;
  const response = await axios.post(getFSUrl('loadScene'), {
    projectFolder,
    sceneId,
  });
  if (response.data) {
    return response.data;
  } else {
    console.error('ForThree: Could not load data.');
    return { error: `Error in loading projectFolder "${projectFolder}" with sceneId "${sceneId}"` };
  }
};
