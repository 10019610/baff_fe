import { api } from './Api';

export const getWeightDataForDashboard = async () => {
  const response = await api.get('/weight/getWeightDataForDashboard');
  console.log(response.data);
  return response.data;
};
