import { useEffect, useRef } from 'react';

type AppState = 'intro' | 'carousel' | 'transitioning' | 'main' | 'project' | 'admin';

interface CanvasBackgroundProps {
  appState: AppState;
  onTransitionComplete?: () => void;
}

export function CanvasBackground({ appState, onTransitionComplete }: CanvasBackgroundProps) {
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(appState);
  const onCompleteRef = useRef(onTransitionComplete);

  useEffect(() => {
    stateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    onCompleteRef.current = onTransitionComplete;
  }, [onTransitionComplete]);

  useEffect(() => {
    const lineCanvas = lineCanvasRef.current;
    if (!lineCanvas) return;
    const lCtx = lineCanvas.getContext('2d');
    if (!lCtx) return;

    let w: number, h: number;
    let animationFrameId: number;

    const mouse = { x: 0, y: 0, normX: 0, normY: 0 };
    const centerPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    let transitionProgress = stateRef.current === 'main' ? 1 : 0;

    const resize = () => {
      w = lineCanvas.width = window.innerWidth;
      h = lineCanvas.height = window.innerHeight;
      centerPoint.x = w / 2;
      centerPoint.y = h / 2;
    };
    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.normX = (e.clientX / w) * 2 - 1;
      mouse.normY = (e.clientY / h) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      if (currentState === 'transitioning') {
        transitionProgress += 0.015;
        if (transitionProgress >= 1) {
          transitionProgress = 1;
          if (onCompleteRef.current && stateRef.current === 'transitioning') {
            onCompleteRef.current();
          }
        }
      } else if (currentState === 'main') {
        transitionProgress = 1;
      }

      let bgR = Math.round(lerp(0, 244, transitionProgress));
      let bgG = Math.round(lerp(0, 244, transitionProgress));
      let bgB = Math.round(lerp(0, 240, transitionProgress));
      const newBg = `rgb(${bgR}, ${bgG}, ${bgB})`;
      if (document.body.style.backgroundColor !== newBg) {
        document.body.style.backgroundColor = newBg;
      }

      lCtx.clearRect(0, 0, w, h);

      centerPoint.x = mouse.x;
      centerPoint.y = mouse.y;
      
      const isMobile = window.innerWidth < 768;
      
      if (!isMobile) {
        let lineR = lerp(255, 0, transitionProgress);
        let lineAlpha = lerp(0.35, 1.0, transitionProgress); // Darker and completely visible on landing page

        lCtx.strokeStyle = `rgba(${lineR}, ${lineR}, ${lineR}, ${lineAlpha})`;
        lCtx.lineWidth = 0.5; // Constant thickness, even thinner
        
        lCtx.beginPath();
        // 상단 수직선 (중앙에서 위쪽으로)
        lCtx.moveTo(centerPoint.x, centerPoint.y);
        lCtx.lineTo(centerPoint.x, -h * 0.2);
        
        // 좌측 하단 대각선 (중앙에서 왼쪽 아래로)
        lCtx.moveTo(centerPoint.x, centerPoint.y);
        lCtx.lineTo(-w * 0.2, h * 1.2);
        
        // 우측 하단 대각선 (중앙에서 오른쪽 아래로)
        lCtx.moveTo(centerPoint.x, centerPoint.y);
        lCtx.lineTo(w * 1.2, h * 1.2);
        lCtx.stroke();
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Remove dependencies so the loop doesn't restart

  return (
    <>
      <canvas
        ref={lineCanvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none"
      />
    </>
  );
}
