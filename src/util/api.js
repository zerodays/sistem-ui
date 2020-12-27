import axios from 'axios';
import { getUserData } from '../util/user';

async function getAuthHeader() {
  let token = getUserData().token || '';
  return `Bearer ${token}`;
}

const request = method => async (
  url,
  data = {},
  {
    onSuccess,
    onError,
    headers,
    config,
  } = {
    onSuccess: () => {
    },
    onError: () => {
    },
  },
) => {
  try {
    const response = await axios({
      method: method,
      url: url,
      headers: {Authorization: await getAuthHeader(), ...headers},
      data: data,
      ...config,
    });
    if (onSuccess !== undefined) onSuccess(response);
  } catch (error) {
    console.log(error);
    if (onError !== undefined) onError(error);
  }
};


// eslint-disable-next-line import/no-anonymous-default-export
export default {
  get: request('get'),
  post: request('post'),
  delete: request('delete'),
  put: request('put'),
};
