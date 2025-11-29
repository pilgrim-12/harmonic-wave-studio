"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, Download, Box, Layers, Circle, Mountain } from "lucide-react";
import { Radius } from "@/services/projectService";
import { Button } from "@/components/ui/Button";
import * as THREE from "three";

interface Visualization3DModalProps {
  radii: Radius[];
  onClose: () => void;
}

type BuildMethod = "tube" | "extrude" | "lathe" | "surface";

/**
 * 3D Visualization Modal for Harmonic Wave Studio
 * Renders trajectories as 3D meshes using Three.js
 */
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

  // Build parameters
  const [buildMethod, setBuildMethod] = useState<BuildMethod>("tube");
  const [thickness, setThickness] = useState(0.5);
  const [detail, setDetail] = useState(200);
  const [timeRotations, setTimeRotations] = useState(5);

  // Camera control state
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0, phi: Math.PI / 4 });
  const cameraDistanceRef = useRef(15);

  // Calculate total amplitude for auto-scaling
  const totalAmplitude = radii.reduce((sum, r) => sum + r.amplitude, 0);
  const autoScale = totalAmplitude > 0 ? 5 / totalAmplitude : 1;

  // Generate curve points from harmonics (flat XY trajectory for tube)
  const generateCurvePoints = useCallback(
    (numPoints: number, maxTime: number): THREE.Vector3[] => {
      const points: THREE.Vector3[] = [];

      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * maxTime;
        let x = 0,
          y = 0;

        for (const r of radii) {
          const angle = 2 * Math.PI * r.frequency * t + r.phase;
          x += r.amplitude * Math.cos(angle);
          y += r.amplitude * Math.sin(angle);
        }

        // Scale to fit nicely in view, trajectory in XY plane
        points.push(new THREE.Vector3(x * autoScale, y * autoScale, 0));
      }

      return points;
    },
    [radii, autoScale]
  );

  // Create tube geometry - trajectory as tube centerline
  const createTube = useCallback(
    (thicknessVal: number, detailVal: number, maxTime: number): THREE.Mesh => {
      // Use more points for smoother curve
      const numPoints = detailVal * 4;
      const points: THREE.Vector3[] = [];

      // Generate 3D curve with Z as time progression for tube
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * maxTime;
        let x = 0,
          y = 0;

        for (const r of radii) {
          const angle = 2 * Math.PI * r.frequency * t + r.phase;
          x += r.amplitude * Math.cos(angle);
          y += r.amplitude * Math.sin(angle);
        }

        // Z progresses with time for 3D spiral effect
        const zProgress = (i / numPoints) * 6; // 6 units of Z depth
        points.push(new THREE.Vector3(x * autoScale, y * autoScale, zProgress - 3));
      }

      // Use CatmullRom for smooth interpolation
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);

      const geometry = new THREE.TubeGeometry(
        curve,
        numPoints,
        thicknessVal * 0.12,
        16,
        false
      );

      const material = new THREE.MeshStandardMaterial({
        color: 0x667eea,
        roughness: 0.3,
        metalness: 0.6,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geometry, material);
    },
    [radii, autoScale]
  );

  // Create extrude geometry (contour extruded along z-axis)
  const createExtrude = useCallback(
    (heightVal: number, detailVal: number, maxTime: number): THREE.Mesh => {
      // Use more points for smoother curve
      const numPoints = detailVal * 3;
      const points2D: THREE.Vector2[] = [];

      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * maxTime;
        let x = 0,
          y = 0;

        for (const r of radii) {
          const angle = 2 * Math.PI * r.frequency * t + r.phase;
          x += r.amplitude * Math.cos(angle);
          y += r.amplitude * Math.sin(angle);
        }

        points2D.push(new THREE.Vector2(x * autoScale, y * autoScale));
      }

      // Create smooth spline curve from points
      const curve = new THREE.SplineCurve(points2D);
      const smoothPoints = curve.getPoints(numPoints);

      const shape = new THREE.Shape(smoothPoints);

      const extrudeSettings = {
        depth: heightVal * 3,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.1,
        bevelSegments: 4,
        curveSegments: 24,
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.translate(0, 0, -heightVal * 1.5);

      const material = new THREE.MeshStandardMaterial({
        color: 0x764ba2,
        roughness: 0.4,
        metalness: 0.5,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geometry, material);
    },
    [radii, autoScale]
  );

  // Create lathe geometry (profile rotated around Y-axis)
  const createLathe = useCallback(
    (scaleVal: number, detailVal: number, maxTime: number): THREE.Mesh => {
      const points2D: THREE.Vector2[] = [];

      for (let i = 0; i <= detailVal; i++) {
        const t = (i / detailVal) * maxTime;
        let x = 0,
          y = 0;

        for (const r of radii) {
          const angle = 2 * Math.PI * r.frequency * t + r.phase;
          x += r.amplitude * Math.cos(angle);
          y += r.amplitude * Math.sin(angle);
        }

        const radius = Math.sqrt(x * x + y * y) * autoScale * scaleVal;
        const height = (i / detailVal) * 6; // Height along Y axis
        points2D.push(new THREE.Vector2(Math.abs(radius) + 0.05, height - 3));
      }

      const geometry = new THREE.LatheGeometry(points2D, 48);

      const material = new THREE.MeshStandardMaterial({
        color: 0x667eea,
        roughness: 0.3,
        metalness: 0.6,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geometry, material);
    },
    [radii, autoScale]
  );

  // Create surface geometry (wave surface)
  const createSurface = useCallback(
    (
      heightScaleVal: number,
      detailVal: number,
      maxTime: number
    ): THREE.Mesh => {
      const gridSize = Math.floor(Math.sqrt(detailVal)) + 10;
      const geometry = new THREE.PlaneGeometry(12, 12, gridSize, gridSize);
      const positions = geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const px = positions.getX(i);
        const pz = positions.getY(i);
        const t = ((px + 6) / 12) * maxTime;

        let waveX = 0,
          waveY = 0;

        for (const r of radii) {
          const angle = 2 * Math.PI * r.frequency * t + r.phase + pz * 0.3;
          waveX += r.amplitude * Math.cos(angle);
          waveY += r.amplitude * Math.sin(angle);
        }

        const height = Math.sqrt(waveX * waveX + waveY * waveY) * autoScale * 0.3 * heightScaleVal;
        positions.setZ(i, height);
      }

      geometry.computeVertexNormals();
      geometry.rotateX(-Math.PI / 2);

      const material = new THREE.MeshStandardMaterial({
        color: 0x764ba2,
        roughness: 0.4,
        metalness: 0.5,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geometry, material);
    },
    [radii, autoScale]
  );

  // Update camera position from angles
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;

    const { theta, phi } = cameraAngleRef.current;
    const distance = cameraDistanceRef.current;

    cameraRef.current.position.x = distance * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.y = distance * Math.cos(phi);
    cameraRef.current.position.z = distance * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Rebuild the 3D mesh
  const rebuildMesh = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove old mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    const maxTime = timeRotations * 2 * Math.PI;
    let mesh: THREE.Mesh;

    switch (buildMethod) {
      case "tube":
        mesh = createTube(thickness, detail, maxTime);
        break;
      case "extrude":
        mesh = createExtrude(thickness, detail, maxTime);
        break;
      case "lathe":
        mesh = createLathe(thickness, detail, maxTime);
        break;
      case "surface":
        mesh = createSurface(thickness, detail, maxTime);
        break;
      default:
        mesh = createTube(thickness, detail, maxTime);
    }

    sceneRef.current.add(mesh);
    meshRef.current = mesh;
  }, [
    buildMethod,
    thickness,
    detail,
    timeRotations,
    createTube,
    createExtrude,
    createLathe,
    createSurface,
  ]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights - enhanced for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Fill light from opposite side
    const directionalLight2 = new THREE.DirectionalLight(0x667eea, 0.6);
    directionalLight2.position.set(-10, 5, -10);
    scene.add(directionalLight2);

    // Top light for better definition
    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(0, 20, 0);
    scene.add(topLight);

    // Point light for highlights
    const pointLight = new THREE.PointLight(0x764ba2, 0.8, 30);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x222222);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
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
  }, [updateCameraPosition]);

  // Rebuild mesh when parameters change
  useEffect(() => {
    if (sceneRef.current && radii.length > 0) {
      rebuildMesh();
    }
  }, [rebuildMesh, radii]);

  // Mouse controls for camera
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

      cameraAngleRef.current.theta += deltaX * 0.01;
      cameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, cameraAngleRef.current.phi + deltaY * 0.01)
      );

      previousMouseRef.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(
        5,
        Math.min(50, cameraDistanceRef.current + e.deltaY * 0.01)
      );
      updateCameraPosition();
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [updateCameraPosition]);

  // Keyboard handler for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Export to STL
  const exportSTL = useCallback(() => {
    if (!meshRef.current) return;

    const geometry = meshRef.current.geometry;
    const positions = geometry.attributes.position;
    const indices = geometry.index;

    let stl = "solid mesh\n";

    const getVertex = (index: number): THREE.Vector3 => {
      return new THREE.Vector3(
        positions.getX(index),
        positions.getY(index),
        positions.getZ(index)
      );
    };

    const writeTriangle = (a: number, b: number, c: number) => {
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
        writeTriangle(indices.getX(i), indices.getX(i + 1), indices.getX(i + 2));
      }
    } else {
      for (let i = 0; i < positions.count; i += 3) {
        writeTriangle(i, i + 1, i + 2);
      }
    }

    stl += "endsolid mesh\n";

    const blob = new Blob([stl], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "harmonic-wave-3d.stl";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Export to OBJ
  const exportOBJ = useCallback(() => {
    if (!meshRef.current) return;

    const geometry = meshRef.current.geometry;
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const indices = geometry.index;

    let obj = "# Harmonic Wave Studio 3D Export\n";
    obj += `# Generated: ${new Date().toISOString()}\n\n`;

    // Vertices
    for (let i = 0; i < positions.count; i++) {
      obj += `v ${positions.getX(i)} ${positions.getY(i)} ${positions.getZ(i)}\n`;
    }

    obj += "\n";

    // Normals
    if (normals) {
      for (let i = 0; i < normals.count; i++) {
        obj += `vn ${normals.getX(i)} ${normals.getY(i)} ${normals.getZ(i)}\n`;
      }
      obj += "\n";
    }

    // Faces
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
        if (normals) {
          obj += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
        } else {
          obj += `f ${a} ${b} ${c}\n`;
        }
      }
    }

    const blob = new Blob([obj], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "harmonic-wave-3d.obj";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const buildMethods: { id: BuildMethod; label: string; icon: React.ReactNode }[] = [
    { id: "tube", label: "Tube", icon: <Circle size={14} /> },
    { id: "extrude", label: "Extrude", icon: <Layers size={14} /> },
    { id: "lathe", label: "Lathe", icon: <Box size={14} /> },
    { id: "surface", label: "Surface", icon: <Mountain size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex">
      {/* Left panel - Controls */}
      <div className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">3D Visualization</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Build Method */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Build Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {buildMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setBuildMethod(method.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  buildMethod === method.id
                    ? "bg-[#667eea] text-white"
                    : "bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]"
                }`}
              >
                {method.icon}
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thickness/Height slider */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            {buildMethod === "tube" ? "Thickness" : buildMethod === "extrude" ? "Height" : "Scale"}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={thickness}
            onChange={(e) => setThickness(parseFloat(e.target.value))}
            className="w-full accent-[#667eea]"
          />
          <div className="text-right text-xs text-gray-500">{thickness.toFixed(1)}</div>
        </div>

        {/* Detail slider */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Detail
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={detail}
            onChange={(e) => setDetail(parseInt(e.target.value))}
            className="w-full accent-[#667eea]"
          />
          <div className="text-right text-xs text-gray-500">{detail}</div>
        </div>

        {/* Time (Rotations) slider */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Time (Rotations)
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={timeRotations}
            onChange={(e) => setTimeRotations(parseInt(e.target.value))}
            className="w-full accent-[#667eea]"
          />
          <div className="text-right text-xs text-gray-500">{timeRotations}</div>
        </div>

        {/* Export buttons */}
        <div className="mt-auto space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Export
          </label>
          <div className="flex gap-2">
            <Button
              onClick={exportSTL}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <Download size={14} className="mr-1" />
              STL
            </Button>
            <Button
              onClick={exportOBJ}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <Download size={14} className="mr-1" />
              OBJ
            </Button>
          </div>
        </div>

        {/* Controls hint */}
        <div className="text-[10px] text-gray-500 space-y-1 border-t border-[#2a2a2a] pt-3">
          <p>🖱️ Drag to rotate</p>
          <p>🔄 Scroll to zoom</p>
          <p>⎋ Esc to close</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="flex-1 cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
