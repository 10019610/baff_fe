import * as React from "react";

import { cn } from "./utils";

// React.ComponentProps<"input"> 타입은 onChange를 포함하고 있습니다.
function Input({ className, type, onChange, ...props }: React.ComponentProps<"input">) {
  
  // 1. 컴포넌트 내부에 자체적인 onChange 핸들러를 정의합니다.
  const internalOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 부모로부터 받은 onChange가 없으면 아무것도 하지 않습니다.
    if (!onChange) {
      return;
    }

    // 2. type이 'number'일 때만 특별한 로직을 적용합니다.
    if (type === 'number') {
      const value = e.target.value;
      if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
        // 값이 '05' 같은 형태일 경우, 앞의 '0'을 제거합니다.
        const processedValue = parseFloat(value).toString();
        
        // 3. 가공된 값으로 이벤트 객체를 새로 만들어서 부모의 onChange를 호출합니다.
        // 이렇게 하면 부모 컴포넌트는 아무것도 몰라도 됩니다.
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: processedValue },
        };
        onChange(syntheticEvent);
        return;
      }
    }

    // 4. 그 외의 모든 경우에는 원래 이벤트 그대로 부모의 onChange를 호출합니다.
    onChange(e);
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
      onChange={internalOnChange} // 5. input 요소에는 우리가 만든 내부 핸들러를 연결합니다.
    />
  );
}

export { Input };