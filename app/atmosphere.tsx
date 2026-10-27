'use client';

import { useEffect, useRef } from 'react';

const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const vertexShaderSource = `
  precision highp float;
  attribute vec3 aPosition;
  attribute float aOpacity;
  attribute float aSize;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uAspect;
  uniform float uFov;
  uniform float uCameraZ;
  uniform float uMotion;
  uniform vec2 uCamera;
  varying float vOpacity;

  void main() {
    float z = mod(aPosition.z + 25.0 + uTime * aSpeed * uMotion, 75.0) - 25.0;
    float distanceToCamera = max(1.0, uCameraZ - z);
    float projection = tan(uFov * 0.5);
    float projectedX = (aPosition.x - uCamera.x) / (distanceToCamera * projection * uAspect);
    float projectedY = (aPosition.y - uCamera.y) / (distanceToCamera * projection);
    gl_Position = vec4(projectedX, projectedY, 0.0, 1.0);
    gl_PointSize = clamp(aSize * (55.0 / distanceToCamera), 1.0, 6.0);
    vOpacity = aOpacity;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float uOpacity;
  varying float vOpacity;

  void main() {
    float radius = distance(gl_PointCoord, vec2(0.5));
    float pointAlpha = 1.0 - smoothstep(0.28, 0.5, radius);
    float alpha = vOpacity * uOpacity * pointAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      depth: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.innerWidth < 640;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const maximumCount = mobile ? 1000 : 2000;
    const random = seededRandom(26092026);
    const data = new Float32Array(maximumCount * 6);
    for (let index = 0; index < maximumCount; index += 1) {
      const offset = index * 6;
      data[offset] = random() * 100 - 50;
      data[offset + 1] = random() * 100 - 50;
      data[offset + 2] = random() * 40 - 25;
      data[offset + 3] = 0.5 + random() * 0.5;
      data[offset + 4] = 1 + Math.pow(random(), 1.7) * 5;
      data[offset + 5] = 1.2 + random() * 7.2;
    }

    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.useProgram(program);

    const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
    const bindAttribute = (name: string, size: number, offset: number) => {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
    };
    bindAttribute('aPosition', 3, 0);
    bindAttribute('aOpacity', 1, 3 * Float32Array.BYTES_PER_ELEMENT);
    bindAttribute('aSize', 1, 4 * Float32Array.BYTES_PER_ELEMENT);
    bindAttribute('aSpeed', 1, 5 * Float32Array.BYTES_PER_ELEMENT);

    const timeUniform = gl.getUniformLocation(program, 'uTime');
    const aspectUniform = gl.getUniformLocation(program, 'uAspect');
    const fovUniform = gl.getUniformLocation(program, 'uFov');
    const cameraZUniform = gl.getUniformLocation(program, 'uCameraZ');
    const cameraUniform = gl.getUniformLocation(program, 'uCamera');
    const opacityUniform = gl.getUniformLocation(program, 'uOpacity');
    const motionUniform = gl.getUniformLocation(program, 'uMotion');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.012, 0.012, 0.012, 1);
    gl.uniform1f(fovUniform, (75 * Math.PI) / 180);
    gl.uniform1f(cameraZUniform, mobile ? 60 : 55);
    gl.uniform1f(motionUniform, reduceMotion ? 0.15 : 1);

    let frame = 0;
    let width = 0;
    let height = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let globalOpacity = 0.68;
    let targetOpacity = 0.68;
    let cameraX = 0;
    let cameraY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let particleMotion = reduceMotion ? 0.15 : 1;
    let targetParticleMotion = particleMotion;
    let activeCount = maximumCount;
    let measuredFrames = 0;
    let measuredTime = 0;
    let orientationListening = false;
    let orientationPermissionRequested = false;
    let originBeta: number | null = null;
    let originGamma: number | null = null;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, width, height);
      gl.uniform1f(aspectUniform, width / Math.max(1, height));
    };

    const draw = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      elapsed += delta;
      const inertia = 1 - Math.exp(-1.519 * delta);
      const fade = 1 - Math.exp(-6 * delta);
      const motionEase = 1 - Math.exp(-4 * delta);
      globalOpacity += (targetOpacity - globalOpacity) * fade;
      cameraX += (targetCameraX - cameraX) * inertia;
      cameraY += (targetCameraY - cameraY) * inertia;
      particleMotion += (targetParticleMotion - particleMotion) * motionEase;

      if (elapsed > 2.5 && activeCount === maximumCount) {
        measuredFrames += 1;
        measuredTime += delta;
        if (measuredTime >= 1.2) {
          const measuredFps = measuredFrames / measuredTime;
          if (measuredFps < 38) activeCount = mobile ? 700 : 800;
          else if (measuredFps < 50) activeCount = mobile ? 850 : 1400;
          measuredFrames = 0;
          measuredTime = 0;
        }
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeUniform, elapsed);
      gl.uniform2f(cameraUniform, cameraX, cameraY);
      gl.uniform1f(opacityUniform, globalOpacity);
      gl.uniform1f(motionUniform, particleMotion);
      gl.drawArrays(gl.POINTS, 0, activeCount);
      frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (coarsePointer || reduceMotion) return;
      targetCameraX = (event.clientX - width / 2) / 100;
      targetCameraY = -(event.clientY - height / 2) / 100;
    };
    const onPointerLeave = () => {
      if (coarsePointer) return;
      targetCameraX = 0;
      targetCameraY = 0;
      targetParticleMotion = reduceMotion ? 0.15 : 1;
    };
    const onDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (reduceMotion || event.beta === null || event.gamma === null) return;
      if (originBeta === null || originGamma === null) {
        originBeta = event.beta;
        originGamma = event.gamma;
      }

      const beta = Math.max(-32, Math.min(32, event.beta - originBeta));
      const gamma = Math.max(-32, Math.min(32, event.gamma - originGamma));
      const angle = screen.orientation?.angle ?? 0;
      let horizontal = gamma;
      let vertical = beta;

      if (angle === 90) {
        horizontal = -beta;
        vertical = gamma;
      } else if (angle === 270) {
        horizontal = beta;
        vertical = -gamma;
      } else if (angle === 180) {
        horizontal = -gamma;
        vertical = -beta;
      }

      targetCameraX = horizontal * 0.065;
      targetCameraY = -vertical * 0.05;
      const tiltStrength = Math.min(1, Math.hypot(horizontal, vertical) / 30);
      targetParticleMotion = 1 + tiltStrength * 0.55;
    };
    const resetOrientationOrigin = () => {
      originBeta = null;
      originGamma = null;
      targetCameraX = 0;
      targetCameraY = 0;
      targetParticleMotion = reduceMotion ? 0.15 : 1;
    };
    const startOrientation = () => {
      if (orientationListening) return;
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
      orientationListening = true;
    };
    const requestOrientationPermission = () => {
      if (orientationPermissionRequested || reduceMotion) return;
      orientationPermissionRequested = true;
      const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof orientationEvent?.requestPermission === 'function') {
        void orientationEvent.requestPermission().then((permission) => {
          if (permission === 'granted') startOrientation();
        }).catch(() => undefined);
      } else {
        startOrientation();
      }
    };
    const onIntroMotion = (event: Event) => {
      const progress = (event as CustomEvent<number>).detail;
      const eased = progress * progress * (3 - 2 * progress);
      targetOpacity = 0.68 - eased * 0.42;
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else {
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-atmosphere-opacity]'));
    const observer = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) targetOpacity = Number((active.target as HTMLElement).dataset.atmosphereOpacity ?? 0.68);
    }, { threshold: [0.2, 0.4, 0.6, 0.8] });

    resize();
    sections.forEach((section) => observer.observe(section));
    if (coarsePointer && !reduceMotion) {
      const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof orientationEvent?.requestPermission === 'function') {
        window.addEventListener('pointerdown', requestOrientationPermission, { once: true, passive: true });
      } else {
        startOrientation();
      }
    }
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resetOrientationOrigin, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('intro-motion', onIntroMotion);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resetOrientationOrigin);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', requestOrientationPermission);
      if (orientationListening) window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('intro-motion', onIntroMotion);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="site-atmosphere" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="atmosphere-vignette" />
      <div className="atmosphere-depth-mask" />
    </div>
  );
}
