import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Input } from '../ui/input.tsx';
import { Switch } from '../ui/switch.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog.tsx';
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
import { Textarea } from '../ui/textarea.tsx';
import { Bell, Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type { NoticeItem } from '../../types/Admin.api.type.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate } from '../../utils/DateUtil.ts';

/**
 * 어드민 페이지 공지사항 관리 탭 컴포넌트
 *
 * @description
 * - 나만그래 NoticeManagement 패턴 참조
 * - CRUD 완전 구현: 목록/생성/수정/삭제
 * - 활성/비활성 토글 (Switch)
 * - Dialog 모달로 작성/수정, AlertDialog로 삭제 확인
 *
 * @author hjkim
 */
const AdminNoticeManagement = () => {
  /**
   * Hooks
   */
  const queryClient = useQueryClient();

  /**
   * States
   */
  // 작성 Dialog
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');

  // 수정 Dialog
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');

  /**
   * Query
   */
  const { data, isLoading, isError } = useQuery<NoticeItem[]>({
    queryKey: ['admin-notices'],
    queryFn: () => adminApi.getNotices().then((res) => res.data),
  });

  const noticeList = data ?? [];

  /**
   * Mutations
   */
  const createMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      adminApi.createNotice(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      resetCreateForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title?: string; content?: string; isActive?: boolean } }) =>
      adminApi.updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
    },
  });

  /**
   * Variables
   */
  const tableHeader = [
    { id: 1, name: '제목' },
    { id: 2, name: '상태' },
    { id: 3, name: '등록일' },
    { id: 4, name: '수정일' },
    { id: 5, name: '액션' },
  ];

  const activeCount = noticeList.filter((n) => n.isActive).length;

  /**
   * Handlers
   */
  /* 작성 폼 초기화 */
  const resetCreateForm = () => {
    setShowCreateDialog(false);
    setNewTitle('');
    setNewContent('');
  };

  /* 새 공지 저장 */
  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    createMutation.mutate({ title: newTitle.trim(), content: newContent.trim() });
  };

  /* 수정 모달 열기 */
  const startEdit = (item: NoticeItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  /* 수정 저장 */
  const saveEdit = () => {
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      data: { title: editTitle, content: editContent },
    });
  };

  /* 활성/비활성 토글 */
  const toggleActive = (item: NoticeItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { isActive: !item.isActive },
    });
  };

  /* 삭제 */
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">전체 공지</span>
            </div>
            <p className="text-2xl font-bold mt-2">{noticeList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">활성 공지</span>
            </div>
            <p className="text-2xl font-bold mt-2">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">비활성 공지</span>
            </div>
            <p className="text-2xl font-bold mt-2">{noticeList.length - activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 공지사항 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>공지사항 관리</CardTitle>
              <CardDescription>공지사항을 작성하고 관리할 수 있어요</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              새 공지 작성
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeader.map((item) => (
                    <TableHead key={item.id}>{item.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {noticeList.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <div className="min-w-[200px]">
                        <p className="font-medium">{notice.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {notice.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notice.isActive}
                          onCheckedChange={() => toggleActive(notice)}
                        />
                        {notice.isActive ? (
                          <Badge className="bg-green-500 text-white">활성</Badge>
                        ) : (
                          <Badge variant="secondary">비활성</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(notice.regDateTime)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(notice.modDateTime)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {/* 수정 버튼 */}
                        <Button variant="ghost" size="sm" onClick={() => startEdit(notice)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
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
                              <AlertDialogTitle>공지사항을 삭제할까요?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{notice.title}" 공지사항을 삭제하면 되돌릴 수 없어요.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(notice.id)}
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
                {noticeList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeader.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      등록된 공지사항이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 작성 Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>새 공지사항 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">제목</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">본문</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="공지사항 본문을 입력하세요"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetCreateForm}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newContent.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? '등록 중...' : '등록'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">제목</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">본문</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="공지사항 본문을 입력하세요"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              취소
            </Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNoticeManagement;
