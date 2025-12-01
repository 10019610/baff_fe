import { api } from './Api';

export const getUserInfoForProfile = async (userId: number) => {
  const response = await api.get(`/user/getUserInfo/${userId}`);
  return response.data;
};

export const editUserNickname = async (nickname: string) => {
  const response = await api.post('/user/editNickname', { nickname });
  return response.data;
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append('images', file);

  const response = await api.post('/user/uploadProfileImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data as string;
};

export const editProfileImage = async (imageUrl: string) => {
  const response = await api.post('/user/editProfileImage', {
    imageUrl,
  });
  return response.data;
};

export const getUserFlagForPopUp = async () => {
  const response = await api.get('/user/getUserFlagForPopUp');
  return response.data;
};

export const insertUserFlag = async (flagKey: string) => {
  const response = await api.post('/user/insertUserFlag', { flagKey });
  return response.data;
};
