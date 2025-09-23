import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { validateField, type ValidationRule } from '../../utils/validation';
import { formatNumberInput } from '../../utils/numberUtils';

interface ValidatedInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  validationRules?: ValidationRule;
  type?: 'text' | 'number' | 'password' | 'email' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidIcon?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  customValidation?: (value: string | number) => string | null;
  maxLength?: number;
  decimalPlaces?: number; // 소수점 자릿수 제어 (number 타입일 때만 적용)
  maxNumber?: number; // 최대 입력 가능한 숫자 (number 타입일 때만 적용)
}

export default function ValidatedInput({
  id,
  label,
  value,
  onChange,
  validationRules,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  showValidIcon = true,
  validateOnBlur = true,
  validateOnChange = false,
  customValidation,
  maxLength,
  decimalPlaces,
  maxNumber,
}: ValidatedInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validate = (val: string | number) => {
    let errorMessage = null;

    // 커스텀 유효성 검사가 있으면 우선 실행
    if (customValidation) {
      errorMessage = customValidation(val);
    } else if (validationRules) {
      errorMessage = validateField(val, validationRules, label);
    }

    setError(errorMessage);
    setIsValid(
      !errorMessage && val !== '' && val !== null && val !== undefined
    );
    return errorMessage;
  };

  useEffect(() => {
    if (touched && validateOnChange) {
      validate(value);
    }
  }, [value, touched, validateOnChange]);

  // value가 초기화될 때 touched와 error 상태도 초기화
  useEffect(() => {
    if (
      (type === 'number' && (value === 0 || value === '')) ||
      (type !== 'number' && value === '')
    ) {
      setTouched(false);
      setError(null);
      setIsValid(false);
    }
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // maxLength 처리
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    // 숫자 타입 처리
    if (type === 'number') {
      const formattedValue = formatNumberInput(newValue, {
        decimalPlaces,
        maxNumber,
        allowNegative: false,
      });

      // 유효하지 않은 값이면 무시
      if (formattedValue === '') {
        return;
      }

      onChange(formattedValue);
      return;
    }

    onChange(newValue);

    if (validateOnChange && touched) {
      validate(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateOnBlur) {
      validate(value);
    }
  };

  const handleFocus = () => {
    if (error && touched) {
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          max={
            type === 'date'
              ? new Date().toISOString().split('T')[0]
              : type === 'number' && maxNumber !== undefined
                ? maxNumber
                : undefined
          }
          step={
            type === 'number' && decimalPlaces !== undefined
              ? String(Math.pow(0.1, decimalPlaces))
              : undefined
          }
          maxLength={maxLength}
          className={`pr-10 ${
            error
              ? 'border-destructive focus:ring-destructive'
              : isValid && showValidIcon
                ? 'border-green-500 focus:ring-green-500'
                : ''
          } ${className}`}
        />

        {/* Validation Icon */}
        <AnimatePresence>
          {showValidIcon && touched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {error ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && touched && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1 text-sm text-destructive"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
