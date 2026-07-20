import { useState, useEffect } from 'react';

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export function formatDateSafe(dateVal: string | Date | null | undefined, language: string = 'en') {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return d.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', options);
  } catch (e) {
    return '';
  }
}
