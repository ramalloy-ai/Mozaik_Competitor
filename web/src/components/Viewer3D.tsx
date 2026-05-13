import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Cabinet, Room } from "../domain/types";

interface Props {
  room: Room;
  cabinets: Cabinet[];
  selectedCabinetId: string | null;
  onSelectCabinet: (id: string | null) => void;
}

export function Viewer3D({
  room,
  cabinets,
  selectedCabinetId,
  onSelectCabinet,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    dispose: () => void;
    target: THREE.Vector3;
  } | null>(null);

  const target = useMemo(
    () => new THREE.Vector3(room.widthX / 2, 500, room.depthZ / 2),
    [room.widthX, room.depthZ],
  );

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef0f4);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      1,
      20000,
    );
    camera.position.set(room.widthX / 2 + 2400, 1800, room.depthZ + 2600);
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xe0e3e8, 0.7);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(2500, 3000, 2000);
    scene.add(dir);

    // Floor plane.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20000, 20000),
      new THREE.MeshStandardMaterial({ color: 0xf0f2f6, roughness: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    const grid = new THREE.GridHelper(8000, 80, 0xcdd3dc, 0xe3e6eb);
    scene.add(grid);

    const wallH = room.wallHeight || 2400;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf6f7fa,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    const walls = room.walls.length >= 2
      ? room.walls
      : [
          { x: 0, z: 0 },
          { x: room.widthX, z: 0 },
          { x: room.widthX, z: room.depthZ },
          { x: 0, z: room.depthZ },
          { x: 0, z: 0 },
        ];
    for (let i = 0; i + 1 < walls.length; i++) {
      const a = walls[i];
      const b = walls[i + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 1) continue;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, wallH), wallMat);
      mesh.position.set((a.x + b.x) / 2, wallH / 2, (a.z + b.z) / 2);
      mesh.rotation.y = -Math.atan2(dz, dx);
      scene.add(mesh);
    }

    const group = new THREE.Group();
    scene.add(group);

    // Picking.
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    let isDragging = false;
    let dragMoved = false;
    let prevX = 0;
    let prevY = 0;
    const spherical = new THREE.Spherical();
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
      dragMoved = false;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      prevX = e.clientX;
      prevY = e.clientY;
      spherical.theta -= dx * 0.005;
      spherical.phi -= dy * 0.005;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      updateCamera();
    };
    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      if (!dragMoved) {
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(group.children, true);
        const meshHit = hits.find((h) => h.object.userData.cabinetId);
        onSelectCabinet(meshHit?.object.userData.cabinetId ?? null);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius *= 1 + e.deltaY * 0.001;
      spherical.radius = Math.max(400, Math.min(12000, spherical.radius));
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
      group,
      target,
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
  }, [room.widthX, room.depthZ, target, onSelectCabinet]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const { group } = state;
    while (group.children.length) {
      const child = group.children.pop()!;
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      } else if (child instanceof THREE.LineSegments) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    for (const cab of cabinets) {
      const cabGroup = new THREE.Group();
      cabGroup.position.set(cab.spec.roomX, cab.spec.roomY, cab.spec.roomZ);
      cabGroup.rotation.y = cab.spec.roomRotation;
      group.add(cabGroup);

      for (const part of cab.parts) {
        const [sx, sy, sz] = part.size;
        const geo = new THREE.BoxGeometry(sx, sy, sz);
        const isSelected = selectedCabinetId === cab.spec.id;
        const mat = new THREE.MeshStandardMaterial({
          color: part.material.color,
          roughness: 0.75,
          metalness: 0.02,
          emissive: isSelected ? 0x0ea5e9 : 0x000000,
          emissiveIntensity: isSelected ? 0.15 : 0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...part.position);
        mesh.userData = { cabinetId: cab.spec.id };
        cabGroup.add(mesh);

        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({
            color: isSelected ? 0x0ea5e9 : 0x3b3f47,
            transparent: true,
            opacity: isSelected ? 0.9 : 0.35,
          }),
        );
        edges.position.copy(mesh.position);
        cabGroup.add(edges);
      }
    }
  }, [cabinets, selectedCabinetId]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
