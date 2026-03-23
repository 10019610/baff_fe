import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card.tsx';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx';
import { formatDate } from '../../utils/DateUtil.ts';
import { adminApi } from '../../services/api/admin.api.ts';
import type {
  AdminInquiryListItem,
  PageResponse,
} from '../../types/Admin.api.type.ts';
import type { InquiryStatus, InquiryType } from '../../types/Inquiry.api.type.ts';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import AdminInquiryDetailModal from './AdminInquiryDetailModal.tsx';

const PAGE_SIZE = 10;

/**
 * 어드민 페이지 문의관리 탭 컴포넌트
 *
 * @description
 * - React Query로 자체 데이터 페칭
 * - 서버 사이드 필터링/페이징
 * - 문의 행 클릭 시 상세 모달 표시
 *
 * @author hjkim
 */
const AdminInquiryManagement = () => {
  /**
   * States
   */
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<InquiryType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | 'ALL'>(
    'ALL'
  );
  const [page, setPage] = useState<number>(0);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  /**
   * Query
   */
  const { data, isLoading, isError } = useQuery<PageResponse<AdminInquiryListItem>>({
    queryKey: [
      'adminInquiries',
      filterStatus,
      filterType,
      searchTerm,
      page,
    ],
    queryFn: async () => {
      const params: {
        status?: string;
        type?: string;
        search?: string;
        page: number;
        size: number;
      } = {
        page,
        size: PAGE_SIZE,
      };

      if (filterStatus !== 'ALL') {
        params.status = filterStatus;
      }
      if (filterType !== 'ALL') {
        params.type = filterType;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await adminApi.getInquiries(params);
      return response.data;
    },
  });

  const inquiryList = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  /**
   * Variables
   */
  const tableHeader = [
    { id: 1, name: 'ID' },
    { id: 2, name: '사용자' },
    { id: 3, name: '제목' },
    { id: 4, name: '유형' },
    { id: 5, name: '상태' },
    { id: 6, name: '답변' },
    { id: 7, name: '등록일' },
  ];

  /**
   * Handlers
   */
  /* 문의 유형 배지 제어 handler */
  const getInquiryTypeBadge = (type: string) => {
    switch (type) {
      case 'IMPROVEMENT':
        return (
          <Badge className="bg-blue-500 text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            개선요청
          </Badge>
        );
      case 'QUESTION':
        return (
          <Badge className="bg-purple-500 text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            질문
          </Badge>
        );
      case 'BUG':
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            버그
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  /* 문의 상태 배지 제어 handler */
  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            접수
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            진행중
          </Badge>
        );
      case 'ANSWERED':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            답변완료
          </Badge>
        );
      case 'CLOSED':
        return (
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            종료
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  /* 상태별 카운트 (현재 페이지 데이터 기준) */
  const getStatusCount = (status: InquiryStatus) => {
    return inquiryList.filter((inquiry) => inquiry.inquiryStatus === status)
      .length;
  };

  /* 타입별 카운트 (현재 페이지 데이터 기준) */
  const getTypeCount = (type: InquiryType) => {
    return inquiryList.filter((inquiry) => inquiry.inquiryType === type).length;
  };

  /* 검색 실행 (페이지 초기화) */
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  /* 필터 변경 시 페이지 초기화 */
  const handleFilterTypeChange = (value: InquiryType | 'ALL') => {
    setFilterType(value);
    setPage(0);
  };

  const handleFilterStatusChange = (value: InquiryStatus | 'ALL') => {
    setFilterStatus(value);
    setPage(0);
  };

  /* 문의 행 클릭 */
  const handleRowClick = (inquiryId: number) => {
    setSelectedInquiryId(inquiryId);
  };

  /* 모달 닫기 */
  const handleModalClose = () => {
    setSelectedInquiryId(null);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">총 문의</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalElements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">접수</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {getStatusCount('RECEIVED')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">진행중</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {getStatusCount('IN_PROGRESS')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">답변완료</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {getStatusCount('ANSWERED')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 유형별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">개선요청</span>
              <Badge className="bg-blue-500 text-white">
                {getTypeCount('IMPROVEMENT')}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">질문</span>
              <Badge className="bg-purple-500 text-white">
                {getTypeCount('QUESTION')}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">버그 제보</span>
              <Badge className="bg-red-500 text-white">
                {getTypeCount('BUG')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목, 내용, 사용자명으로 검색..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterType}
            onValueChange={(value) =>
              handleFilterTypeChange(value as InquiryType | 'ALL')
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="유형 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 유형</SelectItem>
              <SelectItem value="IMPROVEMENT">개선요청</SelectItem>
              <SelectItem value="QUESTION">질문</SelectItem>
              <SelectItem value="BUG">버그</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              handleFilterStatusChange(value as InquiryStatus | 'ALL')
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="RECEIVED">접수</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="ANSWERED">답변완료</SelectItem>
              <SelectItem value="CLOSED">종료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 문의 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardDescription>
            총 {totalElements}개의 문의
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableHeader.map((item) => (
                      <TableHead key={item.id}>{item.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiryList.map((inquiry) => (
                    <TableRow
                      key={inquiry.inquiryId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(inquiry.inquiryId)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        #{inquiry.inquiryId}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium">{inquiry.nickname}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {inquiry.userId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[200px] max-w-md">
                          <p className="font-medium truncate">{inquiry.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {inquiry.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getInquiryTypeBadge(inquiry.inquiryType)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getInquiryStatusBadge(inquiry.inquiryStatus)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {inquiry.replyCount}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(inquiry.regDateTime)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {inquiryList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={tableHeader.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {page * PAGE_SIZE + 1}-
                    {Math.min((page + 1) * PAGE_SIZE, totalElements)}
                    {' / '}
                    {totalElements}건
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>
                    <span className="text-sm font-medium px-2">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages - 1, prev + 1))
                      }
                      disabled={page >= totalPages - 1}
                    >
                      다음
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 문의 상세 모달 */}
      {selectedInquiryId !== null && (
        <AdminInquiryDetailModal
          inquiryId={selectedInquiryId}
          open={selectedInquiryId !== null}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AdminInquiryManagement;
