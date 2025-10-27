import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// 브라우저 확장 프로그램으로 인한 에러 메시지 필터링
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  // 확장 프로그램 관련 에러 무시
  if (
    message.includes('message channel closed') ||
    message.includes('Extension context invalidated')
  ) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
