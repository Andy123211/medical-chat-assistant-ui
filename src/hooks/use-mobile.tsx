import { useEffect, useState } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检查
    checkIfMobile();

    // 添加窗口大小变化监听器
    window.addEventListener('resize', checkIfMobile);

    // 清理监听器
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return isMobile;
}