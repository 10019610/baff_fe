import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { validateField, type ValidationRule } from '../../utils/validation';

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
    const newValue =
      type === 'number'
        ? e.target.value === ''
          ? ''
          : Number(e.target.value)
        : e.target.value;

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
            type === 'date' ? new Date().toISOString().split('T')[0] : undefined
          }
          step={type === 'number' ? '0.1' : undefined}
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
