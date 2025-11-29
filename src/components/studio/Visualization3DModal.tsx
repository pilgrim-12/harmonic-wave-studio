"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, Download, Circle, Layers, Box, Mountain } from "lucide-react";
import { Button } from "@/components/ui/Button";
import * as THREE from "three";

interface Radius {
  frequency: number;
  amplitude: number;
  phase: number;
}

interface Visualization3DModalProps {
  radii: Radius[];
  onClose: () => void;
}

type BuildMethod = "tube" | "extrude" | "lathe" | "surface";

export const Visualization3DModal: React.FC<Visualization3DModalProps> = ({
  radii,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [buildMethod, setBuildMethod] = useState<BuildMethod>("tube");
  const [thickness, setThickness] = useState(15);
  const [detail, setDetail] = useState(500);
  const [timeRotations, setTimeRotations] = useState(10);

  // Camera control - exactly like demo
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 600 });

  // Calculate point at time t - exactly like demo
  const getPoint = useCallback((t: number): { x: number; y: number } => {
    let x = 0, y = 0;
    radii.forEach(h => {
      x += h.amplitude * Math.cos(2 * Math.PI * h.frequency * t + h.phase);
      y += h.amplitude * Math.sin(2 * Math.PI * h.frequency * t + h.phase);
    });
    return { x, y };
  }, [radii]);

  // Generate 2D curve points - exactly like demo
  const generateCurvePoints = useCallback((numPoints: number, maxTime: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxTime;
      const p = getPoint(t);
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
    return points;
  }, [getPoint]);

  // 1. TUBE - exactly like demo
  const createTube = useCallback((thicknessVal: number, detailVal: number, maxTime: number): THREE.BufferGeometry => {
    const points = generateCurvePoints(detailVal, maxTime);
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, detailVal, thicknessVal, 16, false);
    return geometry;
  }, [generateCurvePoints]);

  // 2. EXTRUDE - exactly like demo
  const createExtrude = useCallback((height: number, detailVal: number, maxTime: number): THREE.BufferGeometry => {
    const points2D: THREE.Vector2[] = [];
    for (let i = 0; i <= detailVal; i++) {
      const t = (i / detailVal) * maxTime;
      const p = getPoint(t);
      points2D.push(new THREE.Vector2(p.x, p.y));
    }

    const shape = new THREE.Shape();
    shape.moveTo(points2D[0].x, points2D[0].y);
    for (let i = 1; i < points2D.length; i++) {
      shape.lineTo(points2D[i].x, points2D[i].y);
    }

    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelSegments: 3,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, [getPoint]);

  // 3. LATHE - exactly like demo
  const createLathe = useCallback((scale: number, detailVal: number, maxTime: number): THREE.BufferGeometry => {
    const points: THREE.Vector2[] = [];
    const segments = Math.floor(detailVal / 2);

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * maxTime * 0.5;
      const p = getPoint(t);
      const r = Math.sqrt(p.x * p.x + p.y * p.y) * 0.5;
      const y = (i / segments) * scale * 3 - scale * 1.5;
      points.push(new THREE.Vector2(r, y));
    }

    const geometry = new THREE.LatheGeometry(points, 64);
    return geometry;
  }, [getPoint]);

  // 4. SURFACE - exactly like demo
  const createSurface = useCallback((heightScale: number, detailVal: number, maxTime: number): THREE.BufferGeometry => {
    const gridSize = Math.floor(Math.sqrt(detailVal));
    const geometry = new THREE.PlaneGeometry(400, 400, gridSize, gridSize);
    const positions = geometry.attributes.position;

    const curvePoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= 500; i++) {
      const t = (i / 500) * maxTime;
      curvePoints.push(getPoint(t));
    }

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      let minDist = Infinity;
      curvePoints.forEach(cp => {
        const dist = Math.sqrt((x - cp.x) ** 2 + (y - cp.y) ** 2);
        if (dist < minDist) minDist = dist;
      });

      const z = Math.max(0, heightScale - minDist * 0.5);
      positions.setZ(i, z);
    }

    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, [getPoint]);

  // Update camera position - exactly like demo
  const updateCamera = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Rebuild mesh - like demo's updateMesh
  const rebuildMesh = useCallback(() => {
    if (!sceneRef.current) return;

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (meshRef.current.children.length > 0) {
        meshRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
      }
    }

    const maxTime = timeRotations;
    let geometry: THREE.BufferGeometry;

    switch (buildMethod) {
      case "tube":
        geometry = createTube(thickness, detail, maxTime);
        break;
      case "extrude":
        geometry = createExtrude(thickness * 3, detail, maxTime);
        break;
      case "lathe":
        geometry = createLathe(thickness * 2, detail, maxTime);
        break;
      case "surface":
        geometry = createSurface(thickness * 2, detail, maxTime);
        break;
      default:
        geometry = createTube(thickness, detail, maxTime);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Add wireframe overlay like demo
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.add(wireframe);

    sceneRef.current.add(mesh);
    meshRef.current = mesh;
  }, [buildMethod, thickness, detail, timeRotations, createTube, createExtrude, createLathe, createSurface]);

  // Initialize scene - exactly like demo
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera - exactly like demo
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 5000);
    camera.position.set(300, 300, 400);
    cameraRef.current = camera;
    updateCamera();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights - exactly like demo
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(200, 400, 300);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x6366f1, 0.8, 1000);
    pointLight.position.set(-200, 200, 100);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [updateCamera]);

  // Rebuild mesh when parameters change
  useEffect(() => {
    if (sceneRef.current && radii.length > 0) {
      rebuildMesh();
    }
  }, [rebuildMesh, radii]);

  // Mouse controls - exactly like demo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMouseRef.current.x;
      const deltaY = e.clientY - previousMouseRef.current.y;

      sphericalRef.current.theta -= deltaX * 0.01;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.01));

      updateCamera();
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(100, Math.min(2000, sphericalRef.current.radius + e.deltaY));
      updateCamera();
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [updateCamera]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Export STL - exactly like demo
  const exportSTL = useCallback(() => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    const positions = geometry.attributes.position;
    const indices = geometry.index;

    let stl = "solid harmonic\n";

    const getVertex = (index: number) => new THREE.Vector3(
      positions.getX(index),
      positions.getY(index),
      positions.getZ(index)
    );

    const addFace = (a: number, b: number, c: number) => {
      const vA = getVertex(a);
      const vB = getVertex(b);
      const vC = getVertex(c);
      const cb = new THREE.Vector3().subVectors(vC, vB);
      const ab = new THREE.Vector3().subVectors(vA, vB);
      const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();

      stl += `  facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
      stl += `    outer loop\n`;
      stl += `      vertex ${vA.x} ${vA.y} ${vA.z}\n`;
      stl += `      vertex ${vB.x} ${vB.y} ${vB.z}\n`;
      stl += `      vertex ${vC.x} ${vC.y} ${vC.z}\n`;
      stl += `    endloop\n`;
      stl += `  endfacet\n`;
    };

    if (indices) {
      for (let i = 0; i < indices.count; i += 3) {
        addFace(indices.getX(i), indices.getX(i + 1), indices.getX(i + 2));
      }
    } else {
      for (let i = 0; i < positions.count; i += 3) {
        addFace(i, i + 1, i + 2);
      }
    }

    stl += "endsolid harmonic\n";

    const blob = new Blob([stl], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harmonic-${buildMethod}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildMethod]);

  // Export OBJ - exactly like demo
  const exportOBJ = useCallback(() => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const indices = geometry.index;

    let obj = "# Harmonic Wave 3D Export\n";
    obj += "# Generated from Harmonic Wave Studio\n\n";

    for (let i = 0; i < positions.count; i++) {
      obj += `v ${positions.getX(i)} ${positions.getY(i)} ${positions.getZ(i)}\n`;
    }
    obj += "\n";

    if (normals) {
      for (let i = 0; i < normals.count; i++) {
        obj += `vn ${normals.getX(i)} ${normals.getY(i)} ${normals.getZ(i)}\n`;
      }
      obj += "\n";
    }

    if (indices) {
      for (let i = 0; i < indices.count; i += 3) {
        const a = indices.getX(i) + 1;
        const b = indices.getX(i + 1) + 1;
        const c = indices.getX(i + 2) + 1;
        if (normals) {
          obj += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
        } else {
          obj += `f ${a} ${b} ${c}\n`;
        }
      }
    } else {
      for (let i = 0; i < positions.count; i += 3) {
        const a = i + 1;
        const b = i + 2;
        const c = i + 3;
        obj += `f ${a} ${b} ${c}\n`;
      }
    }

    const blob = new Blob([obj], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harmonic-${buildMethod}.obj`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildMethod]);

  const buildMethods: { id: BuildMethod; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: "tube", label: "Труба (Tube)", desc: "Траектория = центр трубы", icon: <Circle size={14} /> },
    { id: "extrude", label: "Выдавливание", desc: "Контур вытягивается вверх", icon: <Layers size={14} /> },
    { id: "lathe", label: "Вращение", desc: "Профиль вращается вокруг оси", icon: <Box size={14} /> },
    { id: "surface", label: "Поверхность", desc: "Радиус → высота", icon: <Mountain size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black flex">
      {/* Sidebar - like demo */}
      <div className="w-72 bg-[#12121a] border-r border-[#2a2a3a] p-5 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#a78bfa]">🌀 Harmonic → 3D</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white" title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Build Method */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Метод построения</h2>
          <div className="space-y-2">
            {buildMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setBuildMethod(method.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  buildMethod === method.id
                    ? "bg-[#3730a3] border-[#6366f1] text-white"
                    : "bg-[#1a1a2a] border-[#2a2a4a] text-white hover:bg-[#252540] hover:border-[#4a4a6a]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {method.icon}
                  {method.label}
                </div>
                <span className="text-xs text-gray-400 block mt-1">{method.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Параметры</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 flex justify-between">
                <span>Толщина / Высота:</span>
                <span className="text-[#6366f1]">{thickness}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between">
                <span>Детализация:</span>
                <span className="text-[#6366f1]">{detail}</span>
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                value={detail}
                onChange={(e) => setDetail(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between">
                <span>Время (обороты):</span>
                <span className="text-[#6366f1]">{timeRotations}</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={timeRotations}
                onChange={(e) => setTimeRotations(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* Export */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Экспорт 3D модели</h2>
          <div className="space-y-2">
            <button
              onClick={exportSTL}
              className="w-full py-3 px-4 bg-[#065f46] border border-[#10b981] rounded-lg text-white hover:bg-[#047857] transition-colors"
            >
              💾 Скачать STL
            </button>
            <button
              onClick={exportOBJ}
              className="w-full py-3 px-4 bg-[#065f46] border border-[#10b981] rounded-lg text-white hover:bg-[#047857] transition-colors"
            >
              💾 Скачать OBJ
            </button>
          </div>
        </div>

        {/* Harmonics info */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Гармоники</h2>
          <div className="text-xs text-gray-500 font-mono space-y-1">
            {radii.map((r, i) => (
              <div key={i}>A={r.amplitude.toFixed(0)}, f={r.frequency.toFixed(1)} Hz</div>
            ))}
          </div>
        </div>

        {/* Controls hint */}
        <div className="mt-auto pt-4 border-t border-[#2a2a3a] text-xs text-gray-500">
          <p><kbd className="bg-[#333] px-1.5 py-0.5 rounded font-mono">ЛКМ</kbd> вращать</p>
          <p className="mt-1"><kbd className="bg-[#333] px-1.5 py-0.5 rounded font-mono">Колесо</kbd> зум</p>
          <p className="mt-1"><kbd className="bg-[#333] px-1.5 py-0.5 rounded font-mono">Esc</kbd> закрыть</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} className="flex-1 cursor-grab active:cursor-grabbing" />
    </div>
  );
};
