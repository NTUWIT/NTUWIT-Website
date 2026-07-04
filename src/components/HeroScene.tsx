import { useEffect, useRef } from "react";

/**
 * Interactive mesh hero: drifting nodes, proximity links and subtle signal
 * traces. It keeps the original floating network idea, but tuned to feel more
 * like a polished tech interface than a sky effect.
 */
export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const readHsl = (variable: string, alpha = 1) => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
      return `hsl(${raw} / ${alpha})`;
    };

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    type MeshNode = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      phase: number;
      accent: boolean;
      depth: number;
    };

    type Link = {
      a: MeshNode;
      b: MeshNode;
      strength: number;
    };

    type TouchPulse = {
      x: number;
      y: number;
      start: number;
      force: number;
    };

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: MeshNode[] = [];
    let pulses: TouchPulse[] = [];
    let raf = 0;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    };

    function seed() {
      const count = clamp(Math.round((width * height) / 11000), 72, 150);

      nodes = Array.from({ length: count }, () => {
        const depth = 0.72 + Math.random() * 0.7;

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (0.16 + depth * 0.11),
          vy: (Math.random() - 0.5) * (0.16 + depth * 0.11),
          r: (0.9 + Math.random() * 1.35) * depth,
          phase: Math.random() * Math.PI * 2,
          accent: Math.random() < 0.14,
          depth,
        };
      });
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;

      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduceMotion) {
        draw(performance.now());
      }
    }

    function updateNodes(time: number) {
      for (const node of nodes) {
        if (!reduceMotion) {
          node.x +=
            node.vx + Math.sin(time * 0.7 + node.phase) * 0.035 * node.depth;
          node.y +=
            node.vy + Math.cos(time * 0.58 + node.phase) * 0.03 * node.depth;
        }

        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const distance = Math.hypot(dx, dy) || 1;
          const radius = 220;

          if (distance < radius) {
            const force = (1 - distance / radius) * 0.2;
            node.vx += (dx / distance) * force * 0.08;
            node.vy += (dy / distance) * force * 0.08;
            node.vx += (-dy / distance) * force * 0.055;
            node.vy += (dx / distance) * force * 0.055;
          }
        }

        for (const pulse of pulses) {
          const age = time - pulse.start;
          if (age < 0 || age > 1.2) continue;

          const dx = node.x - pulse.x;
          const dy = node.y - pulse.y;
          const distance = Math.hypot(dx, dy) || 1;
          const ring = 42 + age * 260;
          const band = 105;
          const falloff = 1 - Math.min(1, Math.abs(distance - ring) / band);

          if (falloff > 0) {
            const kick = falloff * (1 - age / 1.2) * pulse.force;
            node.vx += (dx / distance) * kick * 0.045;
            node.vy += (dy / distance) * kick * 0.045;
            node.vx += (-dy / distance) * kick * 0.025;
            node.vy += (dx / distance) * kick * 0.025;
          }
        }

        node.vx *= 0.988;
        node.vy *= 0.988;

        const speed = Math.hypot(node.vx, node.vy);
        if (speed > 0.72) {
          node.vx = (node.vx / speed) * 0.72;
          node.vy = (node.vy / speed) * 0.72;
        }

        if (node.x < -24) node.x = width + 24;
        if (node.x > width + 24) node.x = -24;
        if (node.y < -24) node.y = height + 24;
        if (node.y > height + 24) node.y = -24;
      }
    }

    function drawTraceGrid(time: number) {
      const grid = 92;
      const offset = reduceMotion ? 0 : (time * 5) % grid;

      ctx.save();
      ctx.lineWidth = 0.45;
      ctx.strokeStyle = readHsl("--ink", 0.035);

      for (let x = -grid + offset; x < width + grid; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = -grid + offset * 0.55; y < height + grid; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = readHsl("--primary-deep", 0.06);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 4; i++) {
        const y = height * (0.2 + i * 0.18);
        ctx.beginPath();
        ctx.moveTo(width * 0.08, y);
        ctx.lineTo(width * 0.28, y + 18);
        ctx.lineTo(width * 0.5, y - 12);
        ctx.lineTo(width * 0.76, y + 10);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawLinks(time: number) {
      const maxDistance = clamp(Math.min(width, height) * 0.18, 95, 155);
      const maxDistanceSq = maxDistance * maxDistance;
      const signalLinks: Link[] = [];

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq > maxDistanceSq) continue;

          const distance = Math.sqrt(distanceSq);
          const strength = 1 - distance / maxDistance;
          const accentLink = a.accent || b.accent;

          ctx.strokeStyle = accentLink
            ? readHsl("--primary-deep", 0.08 + strength * 0.24)
            : readHsl("--ink", 0.035 + strength * 0.13);
          ctx.lineWidth = accentLink ? 0.8 + strength * 0.35 : 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          if (accentLink && signalLinks.length < 20 && strength > 0.42) {
            signalLinks.push({ a, b, strength });
          }
        }
      }

      if (mouse.active) {
        const cursorRadius = 230;

        for (const node of nodes) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.hypot(dx, dy);

          if (distance > cursorRadius) continue;

          const strength = 1 - distance / cursorRadius;
          ctx.strokeStyle = readHsl("--accent", strength * 0.32);
          ctx.lineWidth = 0.65 + strength * 0.45;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.restore();
      drawSignalPackets(signalLinks, time);
    }

    function updatePointerNode() {
      if (!mouse.active) return;

      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;
    }

    function createPulse(x: number, y: number, force = 1) {
      const start = performance.now() * 0.001;
      pulses = [...pulses.slice(-4), { x, y, start, force }];

      for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        const distance = Math.hypot(dx, dy) || 1;
        const radius = 210;

        if (distance > radius) continue;

        const falloff = 1 - distance / radius;
        const kick = falloff * falloff * force;

        node.vx += (dx / distance) * kick * 1.12;
        node.vy += (dy / distance) * kick * 1.12;
        node.vx += (-dy / distance) * kick * 0.34;
        node.vy += (dx / distance) * kick * 0.34;
      }

      if (reduceMotion) {
        draw(performance.now());
      }
    }

    function drawSignalPackets(links: Link[], time: number) {
      ctx.save();
      ctx.fillStyle = readHsl("--accent", 0.72);

      for (const link of links) {
        const progress = (time * 0.18 + link.a.phase * 0.13) % 1;
        const x = link.a.x + (link.b.x - link.a.x) * progress;
        const y = link.a.y + (link.b.y - link.a.y) * progress;
        const size = 1.8 + link.strength * 1.6;

        ctx.translate(x, y);
        ctx.rotate(Math.atan2(link.b.y - link.a.y, link.b.x - link.a.x));
        ctx.fillRect(-size * 0.5, -size * 0.5, size, size);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.restore();
    }

    function drawPulseConnections(time: number) {
      ctx.save();
      ctx.lineCap = "round";

      for (const pulse of pulses) {
        const age = time - pulse.start;
        if (age < 0 || age > 1.2) continue;

        const life = 1 - age / 1.2;
        const reach = 190 + age * 86 * pulse.force;
        const linkedNodes = nodes
          .map((node) => {
            const dx = node.x - pulse.x;
            const dy = node.y - pulse.y;
            return { node, distance: Math.hypot(dx, dy) };
          })
          .filter(({ distance }) => distance < reach)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 14);

        for (const { node, distance } of linkedNodes) {
          const strength = (1 - distance / reach) * life;
          const midX = pulse.x + (node.x - pulse.x) * 0.5;
          const midY = pulse.y + (node.y - pulse.y) * 0.5;

          ctx.strokeStyle = readHsl("--accent", 0.24 * strength);
          ctx.lineWidth = 0.6 + strength * 0.55;
          ctx.beginPath();
          ctx.moveTo(pulse.x, pulse.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          ctx.fillStyle = readHsl("--primary-deep", 0.16 * strength);
          ctx.fillRect(midX - 1, midY - 1, 2, 2);
        }
      }

      ctx.restore();
    }

    function drawNodes(time: number) {
      ctx.save();

      for (const node of nodes) {
        const shimmer = reduceMotion
          ? 0.3
          : (Math.sin(time * 2.2 + node.phase) + 1) * 0.5;
        const radius = node.r + shimmer * (node.accent ? 0.75 : 0.22);

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.accent
          ? readHsl("--primary-deep", 0.9)
          : readHsl("--ink", 0.5);
        ctx.fill();

        if (node.accent) {
          const chip = 3 + shimmer * 1.2;
          ctx.fillStyle = readHsl("--accent", 0.52);
          ctx.fillRect(node.x - chip * 0.5, node.y - chip * 0.5, chip, chip);
        }
      }

      ctx.restore();
    }

    function drawPointerNode(time: number) {
      if (!mouse.active) return;

      const shimmer = reduceMotion ? 0.4 : (Math.sin(time * 4) + 1) * 0.5;
      const size = 4.8 + shimmer * 1.2;
      const tick = 8 + shimmer * 1.8;

      ctx.save();
      ctx.translate(mouse.x, mouse.y);
      ctx.rotate(Math.PI / 4 + time * 0.12);
      ctx.fillStyle = readHsl("--primary-deep", 0.9);
      ctx.fillRect(-size * 0.5, -size * 0.5, size, size);
      ctx.strokeStyle = readHsl("--accent", 0.45);
      ctx.lineWidth = 0.65;
      ctx.strokeRect(-size * 0.5, -size * 0.5, size, size);
      ctx.restore();

      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = readHsl("--ink", 0.18);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(mouse.x - tick, mouse.y);
      ctx.lineTo(mouse.x - tick * 0.45, mouse.y);
      ctx.moveTo(mouse.x + tick * 0.45, mouse.y);
      ctx.lineTo(mouse.x + tick, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - tick);
      ctx.lineTo(mouse.x, mouse.y - tick * 0.45);
      ctx.moveTo(mouse.x, mouse.y + tick * 0.45);
      ctx.lineTo(mouse.x, mouse.y + tick);
      ctx.stroke();
      ctx.restore();
    }

    function draw(now: number) {
      const time = now * 0.001;

      pulses = pulses.filter((pulse) => time - pulse.start < 1.2);
      updatePointerNode();
      ctx.clearRect(0, 0, width, height);
      updateNodes(time);
      drawTraceGrid(time);
      drawLinks(time);
      drawPulseConnections(time);
      drawNodes(time);
      drawPointerNode(time);

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    }

    function setPointerFromEvent(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      const wasActive = mouse.active;

      mouse.targetX = nextX;
      mouse.targetY = nextY;
      mouse.active =
        nextX >= 0 && nextX <= width && nextY >= 0 && nextY <= height;

      if (!wasActive && mouse.active) {
        mouse.x = nextX;
        mouse.y = nextY;
      }
    }

    function onPointerDown(event: PointerEvent) {
      setPointerFromEvent(event);

      if (mouse.active) {
        createPulse(
          mouse.targetX,
          mouse.targetY,
          event.pointerType === "touch" ? 1.18 : 1,
        );
      }

      if (reduceMotion) {
        draw(performance.now());
      }
    }

    function onPointerMove(event: PointerEvent) {
      setPointerFromEvent(event);

      if (reduceMotion) draw(performance.now());
    }

    function onPointerLeave() {
      mouse.active = false;
      if (reduceMotion) draw(performance.now());
    }

    function onMotionPreferenceChange(event: MediaQueryListEvent) {
      reduceMotion = event.matches;
      cancelAnimationFrame(raf);
      draw(performance.now());
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement!);

    resize();
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    motionQuery.addEventListener("change", onMotionPreferenceChange);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-pan-y"
      aria-hidden="true"
    />
  );
}
