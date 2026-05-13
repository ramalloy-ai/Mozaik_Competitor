import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Cabinet } from "../domain/types";

interface Props {
  cabinet: Cabinet;
}

export function Viewer({ cabinet }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cabinetGroup: THREE.Group;
    dispose: () => void;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1115);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      1,
      10000,
    );
    camera.position.set(1200, 900, 1400);
    camera.lookAt(300, 400, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x202028, 0.55);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(1500, 2000, 1200);
    dir.castShadow = true;
    scene.add(dir);

    const grid = new THREE.GridHelper(4000, 40, 0x444444, 0x2a2d33);
    grid.position.y = 0;
    scene.add(grid);

    const cabinetGroup = new THREE.Group();
    scene.add(cabinetGroup);

    // Simple orbit interaction.
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    const spherical = new THREE.Spherical();
    const target = new THREE.Vector3(300, 400, 300);
    const offset = new THREE.Vector3();
    offset.copy(camera.position).sub(target);
    spherical.setFromVector3(offset);

    const updateCamera = () => {
      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      spherical.theta -= dx * 0.005;
      spherical.phi -= dy * 0.005;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius *= 1 + e.deltaY * 0.001;
      spherical.radius = Math.max(400, Math.min(6000, spherical.radius));
      updateCamera();
    };
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    let rafId = 0;
    const loop = () => {
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    stateRef.current = {
      renderer,
      scene,
      camera,
      cabinetGroup,
      dispose: () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
        renderer.domElement.removeEventListener("wheel", onWheel);
        renderer.dispose();
        mount.removeChild(renderer.domElement);
      },
    };

    return () => stateRef.current?.dispose();
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const { cabinetGroup } = state;
    while (cabinetGroup.children.length) {
      const child = cabinetGroup.children.pop()!;
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    for (const part of cabinet.parts) {
      const [sx, sy, sz] = part.size;
      const geo = new THREE.BoxGeometry(sx, sy, sz);
      const mat = new THREE.MeshStandardMaterial({
        color: part.material.color,
        roughness: 0.75,
        metalness: 0.02,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(part.position[0], part.position[1], part.position[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      cabinetGroup.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x1a1c20, transparent: true, opacity: 0.4 }),
      );
      edges.position.copy(mesh.position);
      cabinetGroup.add(edges);
    }
  }, [cabinet]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
