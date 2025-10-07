/**
 * 문의 관련 API 용도 타입 모음
 */

/**
 * 문의 타입 (백엔드 InquiryType과 일치)
 */
export type InquiryType = 'IMPROVEMENT' | 'QUESTION' | 'BUG';

/**
 * 문의 상태 (백엔드와 일치)
 */
export type InquiryStatus = 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

/**
 * 문의 작성 요청 타입 (백엔드 createInquiry와 일치)
 */
export interface CreateInquiryRequest {
  title: string;
  content: string;
  inquiryType: InquiryType;
}

/**
 * 문의 작성 응답 타입
 */
export interface CreateInquiryResponse {
  success: boolean;
  message?: string;
  inquiryId?: string;
}

/**
 * 개별 문의 응답 DTO (백엔드 getInquiryList DTO와 일치)
 */
export interface InquiryResponseDto {
  inquiryId: number; // Long -> number
  regDateTime: string; // LocalDateTime -> string (ISO format)
  title: string;
  content: string;
  inquiryType: InquiryType;
  inquiryStatus: InquiryStatus; // 백엔드는 inquiryStatus
}

/**
 * 문의 목록 조회 응답 타입 (백엔드 List<InquiryDto.getInquiryList>와 일치)
 */
export type GetInquiryListResponse = InquiryResponseDto[];

/**
 * 문의 목록 조회 요청 타입 (백엔드 @ModelAttribute와 일치)
 */
export interface GetInquiryListRequest {
  inquiryStatus?: InquiryStatus | 'ALL';
  inquiryType?: InquiryType | 'ALL';
}

/**
 * 문의 상세 조회 응답 타입
 */
// export interface GetInquiryDetailResponse extends InquiryResponseDto {
// }
