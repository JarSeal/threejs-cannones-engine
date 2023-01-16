import axios from 'axios';

import { getFSUrl } from '../utils/getFSUrl';

export const saveSceneApi = async (sceneParams) => {
  const response = await axios.post(getFSUrl('saveScene'), sceneParams);
  if (response?.data) {
    return response.data;
  } else {
    console.error('ForThree: Could not save data.');
    return { error: `Error in saving sceneId "${sceneParams.sceneId}"`, sceneParams };
  }
};
