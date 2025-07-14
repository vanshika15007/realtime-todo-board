import { useEffect } from 'react';

export default function useDarkMode(enabled) {
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark', 'false');
    }
  }, [enabled]);
} 