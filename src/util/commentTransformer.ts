import { Comment } from '../types/Comment.type';
import { CreateCommentResponse } from '../types/Comment.api.type';

/**
 * API 응답(CreateCommentResponse)을 프론트엔드 UI 모델(Comment)로 변환합니다.
 *
 * @param response - 백엔드 API로부터 받은 댓글 생성 응답 데이터
 * @returns Comment - 프론트엔드 UI에서 사용될 댓글 객체
 */
export function toCommentModel(response: CreateCommentResponse): Comment {
  return {
    id: response.id,
    questionId: response.id,
    commentContent: response.commentContent, // content -> commentContent
    authorName: response.authorName,
    regDateTime: response.regDateTime,
    isAnonymous: true, // 익명 댓글은 항상 true
    replies: [], // 새로 생성된 댓글은 대댓글이 없으므로 빈 배열로 초기화
    parentId: response.parentId ? response.parentId : undefined,
  };
}
