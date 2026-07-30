import { useEffect, useRef } from 'react';

type AppState = 'intro' | 'carousel' | 'transitioning' | 'main' | 'project' | 'admin';

interface CanvasBackgroundProps {
  appState: AppState;
  onTransitionComplete?: () => void;
}

export function CanvasBackground({ appState, onTransitionComplete }: CanvasBackgroundProps) {
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
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
    const particleCanvas = particleCanvasRef.current;
    const lineCanvas = lineCanvasRef.current;
    if (!particleCanvas || !lineCanvas) return;
    const pCtx = particleCanvas.getContext('2d');
    const lCtx = lineCanvas.getContext('2d');
    if (!pCtx || !lCtx) return;

    let w: number, h: number;
    let animationFrameId: number;

    const mouse = { x: 0, y: 0, normX: 0, normY: 0 };
    const centerPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    let transitionProgress = stateRef.current === 'main' ? 1 : 0;
    let introTime = 0;
    let camAngleY = 0;
    let camAngleX = 0;

    const resize = () => {
      w = particleCanvas.width = lineCanvas.width = window.innerWidth;
      h = particleCanvas.height = lineCanvas.height = window.innerHeight;
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

    const particleCount = 2000;
    const particles: any[] = [];

    const isMobile = window.innerWidth < 768;
    const globalScale = isMobile ? 0.55 : 1.0;

    class Particle {
      index: number;
      cx: number;
      cy: number;
      cz: number;
      targetArchX: number = 0;
      targetArchY: number = 0;
      targetArchZ: number = 0;

      constructor(index: number) {
        this.index = index;
        this.cx = (Math.random() - 0.5) * 1000 * globalScale;
        this.cy = (Math.random() - 0.5) * 1000 * globalScale;
        this.cz = (Math.random() - 0.5) * 1000 * globalScale;
        this.calcArchTarget();
      }

      calcArchTarget() {
        let gridSize = 14;
        let gx = this.index % gridSize;
        let gy = Math.floor(this.index / gridSize) % gridSize;
        let gz = Math.floor(this.index / (gridSize * gridSize));

        let spacing = 45 * globalScale;

        let distToCenter = Math.sqrt(Math.pow(gx - 7, 2) + Math.pow(gz - 7, 2));
        if (distToCenter < 3 && gy < 10) {
          gy += 8;
        }

        this.targetArchX = (gx - gridSize / 2) * spacing;
        this.targetArchY = (gy - gridSize / 2) * spacing * 1.5;
        this.targetArchZ = (gz - gridSize / 2) * spacing;
      }

      update(time: number, currentState: AppState) {
        let phi = Math.acos(-1 + (2 * this.index) / particleCount);
        let theta = Math.sqrt(particleCount * Math.PI) * phi;
        let r = (550 + Math.sin(phi * 5 + time * 1.5) * 100 + Math.cos(theta * 3 + time) * 100) * globalScale;
        let tx = r * Math.cos(theta) * Math.sin(phi);
        let ty = r * Math.sin(theta) * Math.sin(phi);
        let tz = r * Math.cos(phi);

        let morphFactor = 0;
        if (currentState === 'intro') {
          morphFactor = Math.max(0, Math.min(1, (introTime - 2.0) / 3.0));
          morphFactor = morphFactor * morphFactor * (3 - 2 * morphFactor);
        } else {
          morphFactor = 1;
        }

        let currentTargetX = lerp(tx, this.targetArchX, morphFactor);
        let currentTargetY = lerp(ty, this.targetArchY, morphFactor);
        let currentTargetZ = lerp(tz, this.targetArchZ, morphFactor);

        this.cx += (currentTargetX - this.cx) * 0.05;
        this.cy += (currentTargetY - this.cy) * 0.05;
        this.cz += (currentTargetZ - this.cz) * 0.05;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(i));
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      if (currentState === 'intro') {
        introTime += 0.016;
      }

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

      let bgR = Math.round(lerp(10, 244, transitionProgress));
      let bgG = Math.round(lerp(10, 244, transitionProgress));
      let bgB = Math.round(lerp(12, 240, transitionProgress));
      const newBg = `rgb(${bgR}, ${bgG}, ${bgB})`;
      if (document.body.style.backgroundColor !== newBg) {
        document.body.style.backgroundColor = newBg;
      }

      pCtx.clearRect(0, 0, w, h);
      lCtx.clearRect(0, 0, w, h);

      let time = Date.now() * 0.001;

      // Adjusted rotation to match carousel rotation speed more closely when morphing to structure
      // Intro starts chaotic (fast or unpredictable), then morphs into architectural structure.
      // We want the structure rotation to match the feel of the carousel.
      let autoRotate = time * 0.45; // 조금 더 빠르게 회전하도록 변경 (기존 0.2 -> 0.45)
      let targetCamY = mouse.normX * 0.4 + autoRotate;
      let targetCamX = mouse.normY * 0.2;
      camAngleY += (targetCamY - camAngleY) * 0.1; // Smoother transition for continuous rotation
      camAngleX += (targetCamX - camAngleX) * 0.1; // Smoother transition for continuous rotation

      centerPoint.x = lerp(centerPoint.x, mouse.x, 0.12); // Increased response speed (was 0.05)
      centerPoint.y = lerp(centerPoint.y, mouse.y, 0.12); // Increased response speed (was 0.05)
      
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

      let cosY = Math.cos(camAngleY);
      let sinY = Math.sin(camAngleY);
      let cosX = Math.cos(camAngleX);
      let sinX = Math.sin(camAngleX);

      let pR = lerp(255, 0, transitionProgress);
      let pAlpha = lerp(0.8, 0.0, transitionProgress); // Fade out dots completely on landing page
      pCtx.fillStyle = `rgba(${pR}, ${pR}, ${pR}, ${pAlpha})`;

      if (pAlpha > 0.01) {
      particles.forEach((p) => {
        p.update(time, currentState);

        let dx = p.cx;
        let dy = p.cy;
        let dz = p.cz;

        let x1 = dx * cosY - dz * sinY;
        let z1 = dz * cosY + dx * sinY;

        let y2 = dy * cosX - z1 * sinX;
        let z2 = z1 * cosX + dy * sinX;

        let zOffset = z2 + 1500;
        if (zOffset > 0) {
          let scale = 1200 / zOffset;
          let px = w / 2 + x1 * scale;
          let py = h / 2 + y2 * scale;

          if (px > 0 && px < w && py > 0 && py < h) {
            pCtx.fillRect(px, py, 1.5 * scale, 1.5 * scale);
          }
        }
      });
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
        ref={particleCanvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-30 pointer-events-none"
      />
      <canvas
        ref={lineCanvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none"
      />
    </>
  );
}
