import { api } from '../../services/api/Api';
import { useQuery } from '@tanstack/react-query';

interface WeightData {
  weightId: number;
  regDateTime: string;
  weight: number;
  userName: string;
}

const Test1 = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['test1'],
    queryFn: () => api.get('/weight/testWeightList'),
  });

  const weightData: WeightData[] = response?.data || [];

  // 날짜 포맷팅 함수
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">체중 기록 목록</h1>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                사용자명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                체중 (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                등록일시
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {weightData.map((item, index) => (
              <tr
                key={item.weightId}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.weightId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.weight} kg
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(item.regDateTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        총 {weightData.length}개의 기록
      </div>
    </div>
  );
};

export default Test1;
