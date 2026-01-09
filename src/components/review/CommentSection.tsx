import React, { useState, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  MessageCircle,
  Send,
  Trash2,
  AlertTriangle,
  Reply,
  ChevronUp,
  Loader2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import type { ReviewComment } from '../../types/review.type.ts';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  getReviewCommentList,
  deleteReviewComment,
  editReviewComment,
} from '../../services/api/review.api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import LoginModal from '../auth/LoginModal';
import { formatTimeAgo } from '../../utils/DateUtil.ts';

interface CommentSectionProps {
  reviewId: string;
  onCommentCountChange?: (count: number) => void;
  onClose?: () => void; // 댓글 섹션 접기 함수
}

const CommentSection = ({
  reviewId,
  onCommentCountChange,
  onClose,
}: CommentSectionProps) => {
  const { user, isAuthenticated } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // 답글 대상 닉네임
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  ); // 삭제 중인 댓글 ID
  const [commentIdToEdit, setCommentIdToEdit] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const queryClient = useQueryClient();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isInitialLoadRef = useRef(true); // 초기 로드 여부 추적
  const prevReviewIdRef = useRef<string | null>(null); // 이전 reviewId 추적

  // 댓글 목록 조회
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
  } = useQuery<ReviewComment[]>({
    queryKey: ['reviewComments', reviewId],
    queryFn: () => getReviewCommentList(reviewId),
    enabled: !!reviewId,
  });

  // reviewId가 변경되면 초기 로드 플래그 리셋
  React.useEffect(() => {
    if (prevReviewIdRef.current !== reviewId) {
      prevReviewIdRef.current = reviewId;
      isInitialLoadRef.current = true;
    }
  }, [reviewId]);

  // 댓글 개수가 변경되면 부모 컴포넌트에 알림
  // 초기 로드 중이거나 로딩 중일 때는 업데이트하지 않음 (댓글 개수가 0으로 바뀌는 것을 방지)
  React.useEffect(() => {
    if (isLoadingComments) {
      return; // 로딩 중이면 업데이트하지 않음
    }

    // 초기 로드가 완료되면 플래그를 false로 설정
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      // 초기 로드 완료 시에만 업데이트 (댓글 개수가 실제로 변경된 경우)
      if (onCommentCountChange) {
        onCommentCountChange(comments.length);
      }
      return;
    }

    // 이후 댓글 개수 변경 시에만 업데이트
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange, isLoadingComments]);

  // 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(content, reviewId),
    onSuccess: () => {
      // 성공 시 댓글 목록 다시 조회
      queryClient.invalidateQueries({ queryKey: ['reviewComments', reviewId] });
      setNewComment('');
      setReplyingTo(null);
      toast.success('댓글이 등록되었습니다');
    },
    onError: (error: unknown) => {
      console.error('댓글 작성 실패:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : '댓글 등록에 실패했습니다';
      toast.error(errorMessage);
    },
  });

  const handleReply = (nickname: string) => {
    const mention = `@${nickname} `;
    setReplyingTo(nickname);
    setNewComment(mention);
    // textarea에 포커스
    textareaRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error('댓글 내용을 입력해주세요');
      return;
    }

    if (newComment.length > 500) {
      toast.error('댓글은 500자 이내로 작성해주세요');
      return;
    }

    createCommentMutation.mutate(newComment.trim());
  };

  // 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteReviewComment(commentId, reviewId),
    onMutate: (commentId) => {
      // 삭제 시작 시 삭제 중인 댓글 ID 설정
      setDeletingCommentId(commentId);
    },
    onSuccess: () => {
      // 성공 시 댓글 목록 다시 조회
      queryClient.invalidateQueries({ queryKey: ['reviewComments', reviewId] });
      toast.success('댓글이 삭제되었습니다');
      setIsDeleteDialogOpen(false);
      setCommentToDelete(null);
      setDeletingCommentId(null);
    },
    onError: (error: unknown) => {
      console.error('댓글 삭제 실패:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : '댓글 삭제에 실패했습니다';
      toast.error(errorMessage);
      setDeletingCommentId(null);
    },
  });

  // 댓글 수정 mutation
  const editCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => editReviewComment(commentId, content),
    onMutate: async ({ commentId, content }) => {
      // Optimistic update: 즉시 UI 업데이트
      await queryClient.cancelQueries({
        queryKey: ['reviewComments', reviewId],
      });

      const previousComments = queryClient.getQueryData<ReviewComment[]>([
        'reviewComments',
        reviewId,
      ]);

      queryClient.setQueryData<ReviewComment[]>(
        ['reviewComments', reviewId],
        (old = []) =>
          old.map((comment) =>
            comment.commentId === commentId ? { ...comment, content } : comment
          )
      );

      return { previousComments };
    },
    onError: (_err, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['reviewComments', reviewId],
          context.previousComments
        );
      }
      toast.error('댓글 수정에 실패했습니다');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviewComments', reviewId],
      });
      toast.success('댓글이 수정되었습니다');
      setCommentIdToEdit(null);
      setEditContent('');
    },
  });

  const handleDeleteCommentClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCommentConfirm = () => {
    if (!commentToDelete) return;
    deleteCommentMutation.mutate(commentToDelete);
  };

  const handleDeleteCommentCancel = () => {
    setIsDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleEditClick = (commentId: number) => {
    const comment = comments.find((c) => c.commentId === commentId);
    if (comment) {
      setCommentIdToEdit(commentId);
      setEditContent(comment.content);
      // 수정 모드 진입 시 textarea에 포커스
      setTimeout(() => {
        editTextareaRef.current?.focus();
      }, 0);
    }
  };

  const handleEditCancel = () => {
    setCommentIdToEdit(null);
    setEditContent('');
  };

  const handleEditSave = (commentId: number) => {
    if (!editContent.trim()) {
      toast.error('댓글 내용을 입력해주세요');
      return;
    }

    if (editContent.length > 500) {
      toast.error('댓글은 500자 이내로 작성해주세요');
      return;
    }

    if (
      editContent.trim() ===
      comments.find((c) => c.commentId === commentId)?.content
    ) {
      handleEditCancel();
      return;
    }

    editCommentMutation.mutate({ commentId, content: editContent.trim() });
  };

  return (
    <div className="space-y-4">
      {!isAuthenticated && (
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      )}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">댓글 {comments.length}</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        {replyingTo && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <Reply className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">@{replyingTo}</span>
              님에게 답글 작성 중
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelReply}
              className="ml-auto h-6 text-xs"
            >
              취소
            </Button>
          </div>
        )}
        <Textarea
          ref={textareaRef}
          placeholder="응원의 댓글을 남겨보세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          maxLength={500}
          disabled={createCommentMutation.isPending}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {newComment.length}/500
          </p>
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createCommentMutation.isPending}
            className="gap-1"
          >
            <Send className="h-3 w-3" />
            {createCommentMutation.isPending ? '작성 중...' : '댓글 작성'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {isLoadingComments ? (
          <Card className="border-dashed">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-sm text-muted-foreground">
                댓글을 불러오는 중...
              </p>
            </CardContent>
          </Card>
        ) : commentsError ? (
          <Card className="border-dashed border-red-200">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-sm text-red-600">
                댓글을 불러오는데 실패했습니다
              </p>
            </CardContent>
          </Card>
        ) : comments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-8 pb-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                첫 번째 댓글을 남겨보세요!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.commentId} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  {comment.profileImageUrl ? (
                    <AvatarImage
                      src={comment.profileImageUrl}
                      alt={comment.userNickName}
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                    {comment.userNickName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.userNickName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.regDateTime)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(comment.userNickName)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary -ml-1"
                      >
                        답글
                      </Button>
                    </div>
                    {user &&
                      (user.userId === comment.userId ||
                        comment.userId.toString() === user.id ||
                        Number(user.id) === comment.userId) &&
                      commentIdToEdit !== comment.commentId && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(comment.commentId)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            aria-label="댓글 수정"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteCommentClick(comment.commentId)
                            }
                            disabled={deletingCommentId === comment.commentId}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                            aria-label="댓글 삭제"
                          >
                            {deletingCommentId === comment.commentId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                  </div>
                  {commentIdToEdit === comment.commentId ? (
                    <div className="space-y-2">
                      <Textarea
                        ref={editTextareaRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        maxLength={500}
                        disabled={editCommentMutation.isPending}
                        className="resize-none text-sm"
                        placeholder="댓글을 수정하세요..."
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {editContent.length}/500
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditCancel}
                            disabled={editCommentMutation.isPending}
                            className="h-7 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(comment.commentId)}
                            disabled={
                              !editContent.trim() ||
                              editCommentMutation.isPending ||
                              editContent.trim() === comment.content
                            }
                            className="h-7 text-xs gap-1"
                          >
                            {editCommentMutation.isPending ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                수정 중...
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3" />
                                저장
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 댓글 접기 버튼 */}
      {onClose && comments.length > 0 && (
        <div className="pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            댓글 접기
          </Button>
        </div>
      )}

      {/* 댓글 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <AlertDialogTitle className="text-left">
                  댓글을 삭제하시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-left">
                  삭제된 댓글은 복구할 수 없습니다.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={handleDeleteCommentCancel}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommentConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? '삭제 중...' : '삭제하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentSection;
