import { useEffect, useRef, useState, useCallback } from 'react';

export const useScrollAnimation = (options = {}) => {
  const [element, setElement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const { threshold = 0.05, rootMargin = '50px 0px', triggerOnce = true } = options;

  const ref = useCallback((node) => {
    if (node) setElement(node);
  }, []);

  useEffect(() => {
    if (!element) {
      setIsVisible(false);
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight + 50) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(entry.target);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

export default useScrollAnimation;
