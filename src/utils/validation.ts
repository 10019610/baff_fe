export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${fieldName}은(는) 필수 입력 항목입니다`;
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // String length validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName}은(는) 최소 ${rules.minLength}자 이상이어야 합니다`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName}은(는) 최대 ${rules.maxLength}자 이하여야 합니다`;
    }
  }

  // Number validations
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);
    if (rules.min !== undefined && numValue < rules.min) {
      return `${fieldName}은(는) ${rules.min} 이상이어야 합니다`;
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return `${fieldName}은(는) ${rules.max} 이하여야 합니다`;
    }
  }

  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return `${fieldName} 형식이 올바르지 않습니다`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>,
  fieldNames: Record<string, string>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field], rules[field], fieldNames[field] || field);
    if (error) {
      errors.push({ field, message: error });
    }
  });

  return errors;
};

// Common validation rules
export const validationRules = {
  weight: {
    required: true,
    min: 20,
    max: 300,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) {
        return '올바른 숫자를 입력해주세요';
      }
      if (num % 0.1 !== 0 && String(value).split('.')[1]?.length > 1) {
        return '소수점 첫째 자리까지만 입력 가능합니다';
      }
      return null;
    }
  },
  goal: {
    required: true,
    min: 0.1,
    max: 50,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) {
        return '올바른 숫자를 입력해주세요';
      }
      return null;
    }
  },
  roomName: {
    required: true,
    minLength: 2,
    maxLength: 30,
    custom: (value: string) => {
      if (value && /^\s/.test(value)) {
        return '공백으로 시작할 수 없습니다';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 4,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9]+$/,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
        return '영문자와 숫자만 사용 가능합니다';
      }
      return null;
    }
  },
  roomId: {
    required: true,
    minLength: 6,
    maxLength: 6,
    pattern: /^[A-Z0-9]{6}$/,
    custom: (value: string) => {
      if (value && !/^[A-Z0-9]{6}$/.test(value)) {
        return '6자리 영문 대문자와 숫자로 구성되어야 합니다';
      }
      return null;
    }
  }
};