'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis } from 'lenis/react';

interface SmoothScrollProps {
  children: React.ReactNode;
}

function SmoothScrollChild({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  const lenis = useLenis();

  // Scroll to top immediately on route changes
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  // Global prevention of Lenis hijacking scroll on any overflow-y-auto/scroll elements
  useEffect(() => {
    if (!lenis) return;

    const handleScrollAttempt = (e: WheelEvent | TouchEvent) => {
      let el = e.target as Node | null;
      while (el && el !== document.documentElement && el !== document.body) {
        if (el.nodeType === Node.ELEMENT_NODE) {
          const element = el as HTMLElement;
          const style = window.getComputedStyle(element);
          const overflowY = style.overflowY || '';
          const overflowX = style.overflowX || '';
          const hasOverflowY = overflowY === 'auto' || overflowY === 'scroll';
          const hasOverflowX = overflowX === 'auto' || overflowX === 'scroll';

          if (hasOverflowY || hasOverflowX) {
            const isScrollableY = hasOverflowY && element.scrollHeight > element.clientHeight;
            const isScrollableX = hasOverflowX && element.scrollWidth > element.clientWidth;

            if (isScrollableY) {
              if (!element.hasAttribute('data-lenis-prevent')) {
                element.setAttribute('data-lenis-prevent', 'true');
              }
              break;
            }
          }
        }
        el = el.parentNode;
      }
    };

    window.addEventListener('wheel', handleScrollAttempt, { capture: true, passive: true });
    window.addEventListener('touchstart', handleScrollAttempt, { capture: true, passive: true });
    window.addEventListener('touchmove', handleScrollAttempt, { capture: true, passive: true });

    return () => {
      window.removeEventListener('wheel', handleScrollAttempt, { capture: true });
      window.removeEventListener('touchstart', handleScrollAttempt, { capture: true });
      window.removeEventListener('touchmove', handleScrollAttempt, { capture: true });
    };
  }, [lenis]);

  // Prevent scroll when page is locked (e.g. modals, dialogs set overflow: hidden on body or html)
  useEffect(() => {
    if (!lenis) return;

    const checkOverflow = () => {
      const isLocked =
        window.getComputedStyle(document.body).overflow === 'hidden' ||
        window.getComputedStyle(document.documentElement).overflow === 'hidden';

      if (isLocked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    // Run initial check
    checkOverflow();

    // Set up MutationObserver to watch style/class changes on body and html
    const observer = new MutationObserver(checkOverflow);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      observer.disconnect();
      // Ensure we clean up by starting lenis on unmount
      lenis.start();
    };
  }, [lenis]);

  // Handle global anchor link clicks for smooth scrolling
  useEffect(() => {
    if (!lenis) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href) {
          // If it is a pure hash link on the same page
          if (href.startsWith('#')) {
            const targetElement = document.getElementById(href.substring(1));
            if (targetElement) {
              e.preventDefault();
              lenis.scrollTo(targetElement);
            }
          } else {
            // Check if it's an absolute or relative link ending with a hash pointing to the current page
            try {
              const url = new URL(href, window.location.href);
              if (url.pathname === window.location.pathname && url.hash) {
                const targetElement = document.getElementById(url.hash.substring(1));
                if (targetElement) {
                  e.preventDefault();
                  lenis.scrollTo(targetElement);
                }
              }
            } catch (err) {
              // Ignore invalid URLs
            }
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [lenis]);

  return <>{children}</>;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (!isHomePage) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        smoothWheel: true,
        touchMultiplier: 1.5,
        wheelMultiplier: 1,
        infinite: false,
      }}
    >
      <SmoothScrollChild>{children}</SmoothScrollChild>
    </ReactLenis>
  );
}
