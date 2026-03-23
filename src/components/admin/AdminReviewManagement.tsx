import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Input } from '../ui/input.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Star, Search, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog.tsx';
import { adminApi } from '../../services/api/admin.api.ts';
import type { AdminReviewListItem, PageResponse } from '../../types/Admin.api.type.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate } from '../../utils/DateUtil.ts';

const PAGE_SIZE = 20;

/**
 * 어드민 페이지 리뷰관리 탭 컴포넌트
 *
 * @description
 * - React Query로 서버 사이드 페이징/검색
 * - 공개/비공개 전환 토글 (useMutation)
 * - 리뷰 삭제 (확인 다이얼로그 + useMutation)
 *
 * @author hjkim
 */
const AdminReviewManagement = () => {
  /**
   * Hooks
   */
  const queryClient = useQueryClient();

  /**
   * States
   */
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  /**
   * Query
   */
  const { data, isLoading, isError } = useQuery<PageResponse<AdminReviewListItem>>({
    queryKey: ['admin-reviews', searchTerm, page],
    queryFn: () =>
      adminApi
        .getReviews({
          search: searchTerm || undefined,
          page,
          size: PAGE_SIZE,
        })
        .then((res) => res.data),
  });

  const reviewList = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  /**
   * Mutations
   */
  const visibilityMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean }) =>
      adminApi.updateReviewVisibility(id, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  /**
   * Variables
   */
  const tableHeader = [
    { id: 1, name: '제목' },
    { id: 2, name: '작성자' },
    { id: 3, name: '난이도' },
    { id: 4, name: '다이어트 방법' },
    { id: 5, name: '공개여부' },
    { id: 6, name: '좋아요' },
    { id: 7, name: '댓글' },
    { id: 8, name: '작성일' },
    { id: 9, name: '' },
  ];

  /**
   * Handlers
   */
  /* 난이도 배지 제어 handler */
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return <Badge className="bg-green-500 text-white">쉬움</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 text-white">보통</Badge>;
      case 'HARD':
        return <Badge className="bg-red-500 text-white">어려움</Badge>;
      default:
        return <Badge variant="secondary">{difficulty}</Badge>;
    }
  };

  /* 공개여부 배지 제어 handler */
  const getVisibilityBadge = (isPublic: boolean) => {
    if (isPublic) {
      return (
        <Badge className="bg-green-500 text-white">
          <Eye className="h-3 w-3 mr-1" />
          공개
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <EyeOff className="h-3 w-3 mr-1" />
        비공개
      </Badge>
    );
  };

  /* 검색 실행 */
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(0);
  };

  /* 검색 입력 엔터키 처리 */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /* 공개/비공개 토글 */
  const handleToggleVisibility = (reviewId: number, currentIsPublic: boolean) => {
    visibilityMutation.mutate({ id: reviewId, isPublic: !currentIsPublic });
  };

  /* 리뷰 삭제 */
  const handleDelete = (reviewId: number) => {
    deleteMutation.mutate(reviewId);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">총 리뷰</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalElements}</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목 또는 작성자로 검색..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          검색
        </Button>
      </div>

      {/* 리뷰 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>리뷰 목록</CardTitle>
          <CardDescription>총 {totalElements}개의 리뷰</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
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
                  {reviewList.map((review) => (
                    <TableRow key={review.reviewId}>
                      <TableCell>
                        <p className="font-medium min-w-[150px] truncate">{review.title}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{review.authorNickname}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getDifficultyBadge(review.difficulty)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{review.dietMethods}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getVisibilityBadge(review.isPublic)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">{review.likes}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {review.commentCount}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(review.regDateTime)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {/* 공개/비공개 토글 버튼 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(review.reviewId, review.isPublic)}
                            disabled={visibilityMutation.isPending}
                          >
                            {review.isPublic ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-green-600" />
                            )}
                          </Button>

                          {/* 삭제 버튼 (AlertDialog) */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>리뷰를 삭제할까요?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{review.title}" 리뷰를 삭제하면 되돌릴 수 없어요.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(review.reviewId)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reviewList.length === 0 && (
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
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
    </div>
  );
};

export default AdminReviewManagement;
