import axios from 'axios';

import { getFSUrl } from '../utils/getFSUrl';

export const loadRecentProjectsApi = async (props) => {
  const { amount } = props;
  const response = await axios.post(getFSUrl('recentProjects'), { amount });
  if (response?.data) {
    return response.data;
  } else {
    console.error('ForThree: Could not load data.');
    return { error: `Error in loading recent projects.` };
  }
};
