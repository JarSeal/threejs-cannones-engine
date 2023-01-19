import axios from 'axios';

import { APP_DEFAULTS } from '../../../../APP_CONFIG';
import { getSceneItem } from '../../sceneData/sceneItems';
import { getFSUrl } from '../../utils/getFSUrl';

export const postRequest = async (urlId, payload) => {
  let response;
  const url = getFSUrl(urlId);
  try {
    response = await axios.post(url, payload);
  } catch (err) {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: Could not get a response from url ${url}. Is the FS server running?`;
    console.error(errorMsg, err);
    getSceneItem('toaster').addToast({
      type: 'error',
      delay: 0,
      content: errorMsg,
    });
    return { error: true, errorMsg };
  }
  if (response?.data) {
    if (response.data.error) {
      console.error(response.data.errorMsg);
      getSceneItem('toaster').addToast({
        type: 'error',
        delay: 0,
        content: response.data.errorMsg,
      });
    }
    return response.data;
  } else {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: Could not get a response from url ${url} for an unknown reason.`;
    console.error(errorMsg);
    return { error: true, errorMsg };
  }
};
