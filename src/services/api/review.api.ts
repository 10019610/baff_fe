import { api } from './Api';
import type {
  CreateReviewRequest,
  ReviewListResponse,
  ReviewComment,
} from '../../types/review.type';

/**
 * 이미지 업로드 (최대 2장)
 * @param files 업로드할 이미지 파일들 (1~2개)
 * @returns 업로드된 이미지 URL 목록
 */
export const uploadReviewImages = async (files: File[]): Promise<string[]> => {
  // FormData 생성
  const formData = new FormData();

  // 파일들을 "images" 키로 추가
  files.forEach((file) => {
    formData.append('images', file);
  });

  // Content-Type을 multipart/form-data로 설정
  const response = await api.post('/review/uploadImages', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 리뷰 작성
 * @param data 리뷰 작성 데이터
 * @returns 생성된 리뷰 정보
 */
export const createReview = async (data: CreateReviewRequest) => {
  const response = await api.post('/review/createReview', data);
  return response.data;
};

/**
 * 리뷰 리스트 조회 (페이지네이션)
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @returns 페이지네이션된 리뷰 리스트
 */
export const getReviewList = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewListResponse> => {
  const response = await api.get('/review/getReviewList', {
    params: { page, size },
  });
  return response.data;
};

/**
 * 리뷰 좋아요 토글
 * @param reviewId 리뷰 ID
 * @returns void
 */
export const toggleReviewLike = async (reviewId: string): Promise<void> => {
  await api.post(`/review/toggleReviewLike/${reviewId}`);
};

/**
 * 댓글 작성
 * @param content 댓글 내용
 * @param reviewId 리뷰 ID
 * @returns void
 */
export const createComment = async (
  content: string,
  reviewId: string
): Promise<void> => {
  const reviewIdNumber = parseInt(reviewId, 10);

  if (isNaN(reviewIdNumber)) {
    throw new Error(`Invalid reviewId: ${reviewId}`);
  }

  console.log('Creating comment:', { content, reviewId, reviewIdNumber });

  await api.post('/review/createComment', {
    content,
    reviewId: reviewIdNumber,
  });
};

/**
 * 댓글 리스트 조회
 * @param reviewId 리뷰 ID
 * @returns 댓글 리스트
 */
export const getReviewCommentList = async (
  reviewId: string | number
): Promise<ReviewComment[]> => {
  const response = await api.get(`/review/getReviewCommentList/${reviewId}`);
  return response.data;
};

/**
 * 댓글 삭제
 * @param commentId 댓글 ID
 * @returns void
 */
export const deleteReviewComment = async (
  commentId: number,
  reviewId: string
): Promise<void> => {
  const reviewIdNumber = parseInt(reviewId, 10);
  await api.post(`/review/deleteReviewComment`, {
    commentId,
    reviewId: reviewIdNumber,
  });
};

/**
 * 리뷰 삭제
 * @param reviewId 리뷰 ID
 * @returns void
 */
export const deleteReview = async (
  reviewId: string | number
): Promise<void> => {
  await api.post(`/review/deleteReview/${reviewId}`);
};

export default {
  uploadReviewImages,
  createReview,
  getReviewList,
  toggleReviewLike,
  createComment,
  getReviewCommentList,
  deleteReviewComment,
  deleteReview,
};
