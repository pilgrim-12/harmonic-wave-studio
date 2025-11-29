"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { X, Download, Circle, Layers, Box, Mountain, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import * as THREE from "three";

interface RadiusData {
  id: string;
  name: string;
  frequency: number;
  amplitude: number;
  phase: number;
  color: string;
  isActive: boolean;
}

interface Visualization3DModalProps {
  radii: RadiusData[];
  onClose: () => void;
}

type BuildMethod = "tube" | "extrude" | "lathe" | "surface";
type ColorMode = "original" | "uniform" | "gradient";

export const Visualization3DModal: React.FC<Visualization3DModalProps> = ({
  radii,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [buildMethod, setBuildMethod] = useState<BuildMethod>("tube");
  const [thickness, setThickness] = useState(15);
  const [detail, setDetail] = useState(500);
  const [timeRotations, setTimeRotations] = useState(10);
  const [colorMode, setColorMode] = useState<ColorMode>("original");
  const [enabledRadii, setEnabledRadii] = useState<Set<string>>(() => new Set(radii.map(r => r.id)));

  // Filter active radii based on selection
  const activeRadii = useMemo(() =>
    radii.filter(r => r.isActive && enabledRadii.has(r.id)),
    [radii, enabledRadii]
  );

  const toggleRadius = (id: string) => {
    setEnabledRadii(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllRadii = () => {
    if (enabledRadii.size === radii.filter(r => r.isActive).length) {
      setEnabledRadii(new Set());
    } else {
      setEnabledRadii(new Set(radii.filter(r => r.isActive).map(r => r.id)));
    }
  };

  // Camera control - exactly like demo
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 600 });

  // Calculate cumulative point at time t up to and including radius at index
  // This is how epicycles work - each radius adds to the previous position
  const getPointUpToIndex = useCallback((t: number, upToIndex: number): { x: number; y: number } => {
    let x = 0, y = 0;
    for (let i = 0; i <= upToIndex; i++) {
      const h = activeRadii[i];
      if (h) {
        x += h.amplitude * Math.cos(2 * Math.PI * h.frequency * t + h.phase);
        y += h.amplitude * Math.sin(2 * Math.PI * h.frequency * t + h.phase);
      }
    }
    return { x, y };
  }, [activeRadii]);

  // Calculate point at time t using ALL active/enabled radii (for combined mode)
  const getPoint = useCallback((t: number): { x: number; y: number } => {
    return getPointUpToIndex(t, activeRadii.length - 1);
  }, [activeRadii, getPointUpToIndex]);

  // Generate 2D curve points for all radii combined
  const generateCurvePoints = useCallback((numPoints: number, maxTime: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxTime;
      const p = getPoint(t);
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
    return points;
  }, [getPoint]);

  // Generate curve points for trajectory up to specific radius index
  const generateCurvePointsForRadius = useCallback((numPoints: number, maxTime: number, radiusIndex: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxTime;
      const p = getPointUpToIndex(t, radiusIndex);
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
    return points;
  }, [getPointUpToIndex]);

  // 1. TUBE - exactly like demo
  const createTube = useCallback((thicknessVal: number, detailVal: number, maxTime: number): THREE.BufferGeometry => {
    const points = generateCurvePoints(detailVal, maxTime);
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, detailVal, thicknessVal, 16, false);
    return geometry;
  }, [generateCurvePoints]);

  // Create tube for specific radius trajectory
  const createTubeForRadius = useCallback((thicknessVal: number, detailVal: number, maxTime: number, radiusIndex: number): THREE.BufferGeometry => {
    const points = generateCurvePointsForRadius(detailVal, maxTime, radiusIndex);
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, detailVal, thicknessVal, 16, false);
    return geometry;
  }, [generateCurvePointsForRadius]);

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

  // Rebuild mesh - creates separate tube for each radius with its own color
  const rebuildMesh = useCallback(() => {
    if (!sceneRef.current) return;

    // Clean up old group
    if (meshGroupRef.current) {
      meshGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
      sceneRef.current.remove(meshGroupRef.current);
    }

    if (activeRadii.length === 0) {
      meshGroupRef.current = null;
      return;
    }

    const maxTime = timeRotations;
    const group = new THREE.Group();

    // For Tube mode with Original colors: create separate tube for each radius
    if (buildMethod === "tube" && colorMode === "original") {
      // Create a tube for each radius showing cumulative trajectory
      activeRadii.forEach((radius, index) => {
        const geometry = createTubeForRadius(thickness, detail, maxTime, index);

        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(radius.color),
          metalness: 0.3,
          roughness: 0.4,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Add subtle wireframe overlay
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(radius.color).multiplyScalar(1.3),
          wireframe: true,
          transparent: true,
          opacity: 0.05,
        });
        const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
        mesh.add(wireframe);

        group.add(mesh);
      });
    } else {
      // For other modes: create single combined geometry
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

      // Determine color
      let mainColor = "#6366f1";
      if (colorMode === "uniform") {
        mainColor = "#6366f1";
      } else if (activeRadii.length > 0) {
        // Use color of largest amplitude radius
        let maxAmp = 0;
        activeRadii.forEach(r => {
          if (r.amplitude > maxAmp) {
            maxAmp = r.amplitude;
            mainColor = r.color;
          }
        });
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(mainColor),
        metalness: 0.3,
        roughness: 0.4,
        side: THREE.DoubleSide,
      });

      // For tube with gradient colors, add vertex colors
      if (buildMethod === "tube" && colorMode === "gradient") {
        const positions = geometry.attributes.position;
        const colors = new Float32Array(positions.count * 3);

        for (let i = 0; i < positions.count; i++) {
          const t = (i / positions.count) * maxTime;
          const hue = (t * 30) % 360;
          const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        material.vertexColors = true;
      }

      const mesh = new THREE.Mesh(geometry, material);

      // Add wireframe overlay
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      });
      const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
      mesh.add(wireframe);

      group.add(mesh);
    }

    sceneRef.current.add(group);
    meshGroupRef.current = group;
  }, [buildMethod, thickness, detail, timeRotations, activeRadii, colorMode, createTube, createTubeForRadius, createExtrude, createLathe, createSurface]);

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
    if (sceneRef.current) {
      rebuildMesh();
    }
  }, [rebuildMesh]);

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
    if (!meshGroupRef.current) return;
    const mesh = meshGroupRef.current.children[0] as THREE.Mesh;
    if (!mesh) return;
    const geometry = mesh.geometry;
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
    if (!meshGroupRef.current) return;
    const mesh = meshGroupRef.current.children[0] as THREE.Mesh;
    if (!mesh) return;
    const geometry = mesh.geometry;
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

  const buildMethods: { id: BuildMethod; label: string; icon: React.ReactNode }[] = [
    { id: "tube", label: "Tube", icon: <Circle size={14} /> },
    { id: "extrude", label: "Extrude", icon: <Layers size={14} /> },
    { id: "lathe", label: "Lathe", icon: <Box size={14} /> },
    { id: "surface", label: "Surface", icon: <Mountain size={14} /> },
  ];

  const colorModes: { id: ColorMode; label: string }[] = [
    { id: "original", label: "Original" },
    { id: "uniform", label: "Uniform" },
    { id: "gradient", label: "Gradient" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex">
      {/* Sidebar */}
      <div className="w-72 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h1 className="text-base font-semibold text-white">3D Visualization</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Radii Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs text-gray-400 uppercase tracking-wide">Radii</h2>
              <button
                onClick={toggleAllRadii}
                className="text-[10px] text-[#667eea] hover:text-white transition-colors"
              >
                {enabledRadii.size === radii.filter(r => r.isActive).length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
              {radii.filter(r => r.isActive).map((radius) => (
                <button
                  key={radius.id}
                  onClick={() => toggleRadius(radius.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                    enabledRadii.has(radius.id)
                      ? "bg-[#2a2a2a] text-white"
                      : "bg-transparent text-gray-500 hover:bg-[#222]"
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: radius.color }}
                  />
                  <span className="truncate flex-1 text-left">{radius.name}</span>
                  {enabledRadii.has(radius.id) ? (
                    <Eye size={12} className="text-[#667eea] flex-shrink-0" />
                  ) : (
                    <EyeOff size={12} className="text-gray-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Mode */}
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Color Mode</h2>
            <div className="flex gap-1">
              {colorModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setColorMode(mode.id)}
                  className={`flex-1 px-2 py-1.5 rounded text-[10px] transition-colors ${
                    colorMode === mode.id
                      ? "bg-[#667eea] text-white"
                      : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Build Method */}
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Build Method</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {buildMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setBuildMethod(method.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded text-xs transition-colors ${
                    buildMethod === method.id
                      ? "bg-[#667eea] text-white"
                      : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
                  }`}
                >
                  {method.icon}
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            <h2 className="text-xs text-gray-400 uppercase tracking-wide">Parameters</h2>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>Thickness</span>
                <span className="text-[#667eea]">{thickness}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value))}
                className="w-full accent-[#667eea]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>Detail</span>
                <span className="text-[#667eea]">{detail}</span>
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                value={detail}
                onChange={(e) => setDetail(parseInt(e.target.value))}
                className="w-full accent-[#667eea]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>Time (rotations)</span>
                <span className="text-[#667eea]">{timeRotations}</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={timeRotations}
                onChange={(e) => setTimeRotations(parseInt(e.target.value))}
                className="w-full accent-[#667eea]"
              />
            </div>
          </div>

          {/* Export */}
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Export</h2>
            <div className="flex gap-2">
              <Button onClick={exportSTL} variant="secondary" size="sm" className="flex-1" disabled={activeRadii.length === 0}>
                <Download size={12} className="mr-1" />
                STL
              </Button>
              <Button onClick={exportOBJ} variant="secondary" size="sm" className="flex-1" disabled={activeRadii.length === 0}>
                <Download size={12} className="mr-1" />
                OBJ
              </Button>
            </div>
          </div>
        </div>

        {/* Controls hint */}
        <div className="p-4 border-t border-[#2a2a2a] text-[10px] text-gray-500">
          <p>Drag to rotate • Scroll to zoom • Esc to close</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} className="flex-1 cursor-grab active:cursor-grabbing" />
    </div>
  );
};
