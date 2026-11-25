// 五大垂直共生奇观建筑：巨樱树屋+彩灯串、飞瀑水车坊+空中缆车、浮水番茄茶亭+流沙、玻璃暗房+水上小飞机、云顶浑天仪灯塔
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { COLORS } from "./palette";
import type { IslandTextures } from "./textures";
import { TIER_LEVELS, zones, type ZoneKey } from "./zones";

export interface LandmarksParts {
  landmarks: Map<ZoneKey, THREE.Group>;
  halos: Map<ZoneKey, THREE.Mesh>;
  windowMat: THREE.MeshStandardMaterial;
  beaconCoreMat: THREE.MeshStandardMaterial;
  beamMat: THREE.MeshBasicMaterial;
  beamPivot: THREE.Object3D;
  armillaryRings: [THREE.Object3D, THREE.Object3D, THREE.Object3D];
  pennant: THREE.Mesh;
  waterWheel: THREE.Object3D;
  gears: THREE.Object3D[];
  cableCar: THREE.Group;
  cableCurve: THREE.CatmullRomCurve3;
  seaplaneGroup: THREE.Group;
  seaplaneProp: THREE.Object3D;
  hourglassGroup: THREE.Group;
  stringBulbMat: THREE.MeshStandardMaterial;
  forgeMat: THREE.MeshStandardMaterial;
  sakuraCanopyGroup: THREE.Group;
  chimneyTipWorld: THREE.Vector3;
  attachments: THREE.Group;
}

export function buildLandmarks(tex: IslandTextures, shadows: boolean): LandmarksParts {
  const landmarks = new Map<ZoneKey, THREE.Group>();
  const halos = new Map<ZoneKey, THREE.Mesh>();

  const shadowify = <T extends THREE.Object3D>(obj: T): T => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = shadows;
        child.receiveShadow = shadows;
      }
    });
    return obj;
  };

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xa2dcf0,
    emissive: new THREE.Color(COLORS.windowWarm),
    emissiveIntensity: 0,
    roughness: 0.16,
    metalness: 0.1,
  });
  const beaconCoreMat = new THREE.MeshStandardMaterial({
    color: 0xfff5bd,
    emissive: new THREE.Color(0xffd058),
    emissiveIntensity: 0.75,
    roughness: 0.18,
  });
  const stringBulbMat = new THREE.MeshStandardMaterial({
    color: COLORS.lanternWarm,
    emissive: new THREE.Color(COLORS.lanternWarm),
    emissiveIntensity: 0,
    roughness: 0.25,
  });
  const forgeMat = new THREE.MeshStandardMaterial({
    color: 0xff7b36,
    emissive: new THREE.Color(0xff5e1a),
    emissiveIntensity: 0.9,
    roughness: 0.35,
  });
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff0a8,
    alphaMap: tex.beamAlphaTex,
    transparent: true,
    opacity: 0.04,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const creamMat = new THREE.MeshStandardMaterial({
    color: COLORS.creamWall,
    map: tex.stuccoTex,
    roughness: 0.85,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: COLORS.cedarWood,
    map: tex.woodPlankTex,
    roughness: 0.78,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: COLORS.darkTimber,
    roughness: 0.82,
  });
  const slateMat = new THREE.MeshStandardMaterial({
    color: COLORS.slateLight,
    roughness: 0.86,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: COLORS.brassGold,
    roughness: 0.28,
    metalness: 0.84,
  });
  const coralRoofMat = new THREE.MeshStandardMaterial({
    color: COLORS.coralRoof,
    bumpMap: tex.roofTileTex,
    bumpScale: 0.035,
    roughness: 0.58,
  });

  const beamPivot = new THREE.Object3D();
  const armillaryRings: [THREE.Object3D, THREE.Object3D, THREE.Object3D] = [
    new THREE.Object3D(),
    new THREE.Object3D(),
    new THREE.Object3D(),
  ];
  let pennant = new THREE.Mesh();
  const waterWheel = new THREE.Group();
  const gears: THREE.Object3D[] = [];
  const cableCar = new THREE.Group();
  const seaplaneGroup = new THREE.Group();
  const seaplaneProp = new THREE.Object3D();
  const hourglassGroup = new THREE.Group();
  const sakuraCanopyGroup = new THREE.Group();
  const chimneyTipLocal = new THREE.Vector3(-0.72, 2.55, -0.45);

  const builders: Record<ZoneKey, () => THREE.Group> = {
    // 1. Level 2 · 巨樱树屋书斋
    office: () => {
      const g = new THREE.Group();

      const barkMat = new THREE.MeshStandardMaterial({ color: 0x6c462b, roughness: 0.88 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 2.65, 10), barkMat);
      trunk.position.set(0, 1.3, -0.15);
      g.add(trunk);

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.2;
        const rootLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.72, 7), barkMat);
        rootLeg.position.set(Math.cos(a) * 0.55, 0.2, -0.15 + Math.sin(a) * 0.55);
        rootLeg.rotation.z = -Math.cos(a) * 0.65;
        rootLeg.rotation.x = Math.sin(a) * 0.65;
        g.add(rootLeg);
      }

      const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.32, 0.16, 8), woodMat);
      deck.position.set(0, 1.28, 0.05);
      g.add(deck);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.42, 6), darkWoodMat);
        post.position.set(Math.cos(a) * 1.26, 1.54, 0.05 + Math.sin(a) * 1.26);
        g.add(post);
      }
      const railRing = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.035, 6, 8), darkWoodMat);
      railRing.rotation.x = Math.PI / 2;
      railRing.rotation.z = Math.PI / 8;
      railRing.position.set(0, 1.72, 0.05);
      g.add(railRing);

      for (let s = 0; s < 7; s++) {
        const step = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.07, 0.22, 2, 0.02), woodMat);
        step.position.set(-0.95, 0.16 + s * 0.18, 0.85 - s * 0.08);
        step.rotation.y = 0.4;
        g.add(step);
      }

      const cabin = new THREE.Mesh(new RoundedBoxGeometry(1.42, 1.05, 1.28, 3, 0.06), creamMat);
      cabin.position.set(0.15, 1.88, 0.05);
      const cabinRoof = new THREE.Mesh(new THREE.ConeGeometry(1.18, 0.72, 4), coralRoofMat);
      cabinRoof.position.set(0.15, 2.74, 0.05);
      cabinRoof.rotation.y = Math.PI / 4;
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.72, 0.08, 2, 0.02), darkWoodMat);
      door.position.set(0.15, 1.74, 0.69);
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.08), windowMat);
      win1.position.set(-0.56, 1.92, 0.25);
      win1.rotation.y = Math.PI / 2;
      const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.08), windowMat);
      win2.position.set(0.86, 1.92, 0.15);
      win2.rotation.y = Math.PI / 2;
      g.add(cabin, cabinRoof, door, win1, win2);

      const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.14, 0.44, 6), darkWoodMat);
      tripod.position.set(-0.82, 1.56, 0.78);
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.48, 10), brassMat);
      scope.position.set(-0.82, 1.8, 0.86);
      scope.rotation.x = Math.PI / 2 - 0.3;
      g.add(tripod, scope);

      const sakDeep = new THREE.MeshStandardMaterial({ color: COLORS.sakuraDeep, roughness: 0.78 });
      const sakSoft = new THREE.MeshStandardMaterial({ color: COLORS.sakuraSoft, roughness: 0.76 });
      const puffs: Array<[number, number, number, number, THREE.Material]> = [
        [-0.55, 3.05, -0.35, 1.15, sakDeep],
        [0.45, 3.35, -0.45, 1.05, sakSoft],
        [-1.15, 2.75, 0.25, 0.78, sakSoft],
        [1.05, 2.82, 0.15, 0.82, sakDeep],
        [0.05, 3.72, -0.15, 0.85, sakSoft],
        [-0.3, 2.88, -0.95, 0.78, sakDeep],
      ];
      for (const [px, py, pz, pr, mat] of puffs) {
        const sp = new THREE.Mesh(new THREE.SphereGeometry(pr, 14, 12), mat);
        sp.position.set(px, py, pz);
        sp.scale.set(1.12, 0.84, 1.08);
        sakuraCanopyGroup.add(sp);
      }
      g.add(sakuraCanopyGroup);

      for (const [lx, ly, lz] of [
        [0.9, 1.55, 0.92],
        [-0.6, 1.55, 0.96],
      ]) {
        const lan = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), stringBulbMat);
        lan.scale.set(0.85, 1.15, 0.85);
        lan.position.set(lx, ly, lz);
        g.add(lan);
      }

      return shadowify(g);
    },

    // 2. Level 1 · 飞瀑水车机关坊
    workshop: () => {
      const g = new THREE.Group();

      const base = new THREE.Mesh(new RoundedBoxGeometry(2.15, 0.22, 1.85, 3, 0.05), slateMat);
      base.position.y = 0.11;
      const body = new THREE.Mesh(new RoundedBoxGeometry(1.92, 1.36, 1.65, 3, 0.06), woodMat);
      body.position.y = 0.88;
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-1.18, 0);
      roofShape.lineTo(1.18, 0);
      roofShape.lineTo(0, 0.92);
      roofShape.closePath();
      const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
        depth: 1.95,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      });
      roofGeo.translate(0, 0, -0.975);
      const roof = new THREE.Mesh(
        roofGeo,
        new THREE.MeshStandardMaterial({
          color: COLORS.terracottaRoof,
          bumpMap: tex.roofTileTex,
          bumpScale: 0.035,
          roughness: 0.62,
        })
      );
      roof.position.y = 1.52;
      g.add(base, body, roof);

      const chimney = new THREE.Mesh(
        new RoundedBoxGeometry(0.36, 1.12, 0.36, 2, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xb75b46, roughness: 0.85 })
      );
      chimney.position.set(-0.72, 2.02, -0.45);
      g.add(chimney);

      const hearth = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.68, 0.2, 2, 0.03), slateMat);
      hearth.position.set(-0.45, 0.56, 0.84);
      const fireCore = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.36, 0.16, 2, 0.03), forgeMat);
      fireCore.position.set(-0.45, 0.48, 0.88);
      const anvil = new THREE.Mesh(
        new RoundedBoxGeometry(0.32, 0.22, 0.2, 2, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x3b414c, metalness: 0.72, roughness: 0.35 })
      );
      anvil.position.set(-0.42, 0.32, 1.24);
      g.add(hearth, fireCore, anvil);

      const win = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.08), windowMat);
      win.position.set(0.48, 0.96, 0.84);
      g.add(win);

      const makeGear = (r: number, teeth: number) => {
        const gr = new THREE.Group();
        gr.add(new THREE.Mesh(new THREE.TorusGeometry(r * 0.76, r * 0.18, 8, 16), brassMat));
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * Math.PI * 2;
          const t = new THREE.Mesh(new THREE.BoxGeometry(r * 0.28, r * 0.28, 0.1), brassMat);
          t.position.set(Math.cos(a) * r * 0.96, Math.sin(a) * r * 0.96, 0);
          t.rotation.z = a;
          gr.add(t);
        }
        return gr;
      };
      const g1 = makeGear(0.34, 9);
      g1.position.set(-0.15, 1.88, 0.98);
      g1.userData.speed = 1.0;
      const g2 = makeGear(0.22, 7);
      g2.position.set(0.34, 1.72, 0.98);
      g2.userData.speed = -1.4;
      gears.push(g1, g2);
      g.add(g1, g2);

      waterWheel.position.set(1.22, 0.86, 0.15);
      const wheelRim1 = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.06, 8, 22), darkWoodMat);
      wheelRim1.rotation.y = Math.PI / 2;
      wheelRim1.position.x = -0.14;
      const wheelRim2 = wheelRim1.clone();
      wheelRim2.position.x = 0.14;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 10), brassMat);
      hub.rotation.z = Math.PI / 2;
      waterWheel.add(wheelRim1, wheelRim2, hub);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.07), darkWoodMat);
        spoke.rotation.x = a;
        waterWheel.add(spoke);
        const paddle = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.06, 0.24, 2, 0.015), woodMat);
        paddle.position.set(0, Math.cos(a) * 0.76, Math.sin(a) * 0.76);
        paddle.rotation.x = a;
        waterWheel.add(paddle);
      }
      g.add(waterWheel);

      return shadowify(g);
    },

    // 3. Level 0 · 浮水朱桥番茄茶亭
    pomo: () => {
      const g = new THREE.Group();

      const raft = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.44, 0.18, 24), woodMat);
      raft.position.y = 0.05;
      g.add(raft);

      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.07, 1.15, 8),
          new THREE.MeshStandardMaterial({ color: COLORS.vermilionBridge, roughness: 0.55 })
        );
        col.position.set(Math.cos(a) * 0.88, 0.7, Math.sin(a) * 0.88);
        g.add(col);
      }

      const domeGeo = new THREE.SphereGeometry(1.22, 28, 18);
      const pos = domeGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const th = Math.atan2(vz, vx);
        const lobe = 1 + 0.075 * Math.cos(8 * th) * Math.max(0, 1 - Math.abs(vy / 1.22) * 0.5);
        pos.setXYZ(i, vx * lobe, vy * 0.72, vz * lobe);
      }
      domeGeo.computeVertexNormals();
      const dome = new THREE.Mesh(
        domeGeo,
        new THREE.MeshStandardMaterial({ color: COLORS.tomatoRed, roughness: 0.36 })
      );
      dome.position.y = 1.56;
      g.add(dome);

      const leafMat = new THREE.MeshStandardMaterial({ color: COLORS.leafGreen, roughness: 0.55 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const leaf = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.07, 0.18, 2, 0.025), leafMat);
        leaf.position.set(Math.cos(a) * 0.28, 2.38, Math.sin(a) * 0.28);
        leaf.rotation.y = -a;
        leaf.rotation.z = -0.35;
        g.add(leaf);
      }
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.32, 7), leafMat);
      stem.position.y = 2.52;
      g.add(stem);

      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 14), darkWoodMat);
      table.position.y = 0.22;
      g.add(table);

      hourglassGroup.position.set(0, 0.52, 0);
      const hgCap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), brassMat);
      hgCap1.position.y = 0.2;
      const hgCap2 = hgCap1.clone();
      hgCap2.position.y = -0.2;
      const hgBulb1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.2, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffe48f,
          emissive: new THREE.Color(0xffc845),
          emissiveIntensity: 0.75,
          roughness: 0.2,
        })
      );
      hgBulb1.position.y = -0.09;
      const hgBulb2 = hgBulb1.clone();
      hgBulb2.rotation.x = Math.PI;
      hgBulb2.position.y = 0.09;
      hourglassGroup.add(hgCap1, hgCap2, hgBulb1, hgBulb2);
      g.add(hourglassGroup);

      const lilyMat = new THREE.MeshStandardMaterial({ color: 0x5bbd63, roughness: 0.7 });
      const lotusMat = new THREE.MeshStandardMaterial({ color: 0xffb3cd, roughness: 0.5 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        const lr = 1.65 + (i % 2) * 0.28;
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 12), lilyMat);
        pad.position.set(Math.cos(a) * lr, -0.08, Math.sin(a) * lr);
        g.add(pad);
        if (i % 2 === 0) {
          const lot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), lotusMat);
          lot.position.set(Math.cos(a) * lr, -0.02, Math.sin(a) * lr);
          g.add(lot);
        } else {
          const rLan = new THREE.Mesh(
            new RoundedBoxGeometry(0.16, 0.16, 0.16, 2, 0.03),
            stringBulbMat
          );
          rLan.position.set(Math.cos(a) * lr, 0.02, Math.sin(a) * lr);
          g.add(rLan);
        }
      }

      return shadowify(g);
    },

    // 4. Level 0 · 海湾玻璃暗房 + 水上小飞机
    studio: () => {
      const g = new THREE.Group();

      const mintIronMat = new THREE.MeshStandardMaterial({
        color: COLORS.mintIron,
        roughness: 0.45,
        metalness: 0.25,
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: COLORS.glassTint,
        roughness: 0.1,
        transparent: true,
        opacity: 0.48,
      });

      const base = new THREE.Mesh(new RoundedBoxGeometry(2.25, 0.22, 1.85, 3, 0.05), slateMat);
      base.position.y = 0.11;
      const body = new THREE.Mesh(new RoundedBoxGeometry(2.05, 1.12, 1.65, 3, 0.06), creamMat);
      body.position.y = 0.76;
      g.add(base, body);

      const glassShape = new THREE.Shape();
      glassShape.moveTo(-1.05, 0);
      glassShape.lineTo(1.05, 0);
      glassShape.lineTo(0, 0.85);
      glassShape.closePath();
      const glassRoofGeo = new THREE.ExtrudeGeometry(glassShape, {
        depth: 1.62,
        bevelEnabled: false,
      });
      glassRoofGeo.translate(0, 0, -0.81);
      const glassRoof = new THREE.Mesh(glassRoofGeo, glassMat);
      glassRoof.position.y = 1.32;
      g.add(glassRoof);

      for (const rz of [-0.82, 0, 0.82]) {
        const rib = new THREE.Mesh(new RoundedBoxGeometry(2.18, 0.08, 0.09, 2, 0.02), mintIronMat);
        rib.position.set(0, 1.34, rz);
        g.add(rib);
      }
      const ridge = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.1, 1.72, 2, 0.02), mintIronMat);
      ridge.position.set(0, 2.17, 0);
      g.add(ridge);

      const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.26, 22), mintIronMat);
      lensRing.rotation.x = Math.PI / 2;
      lensRing.position.set(0.35, 0.86, 0.86);
      const lensGlass = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
        new THREE.MeshStandardMaterial({ color: 0x4b70d4, roughness: 0.08, metalness: 0.35 })
      );
      lensGlass.rotation.x = Math.PI / 2;
      lensGlass.position.set(0.35, 0.86, 0.86);
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.82, 0.08, 2, 0.03), darkWoodMat);
      door.position.set(-0.55, 0.62, 0.84);
      g.add(lensRing, lensGlass, door);

      for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.44, 0.44, 2, 0.02), darkWoodMat);
        f.position.set(1.06, 0.82, -0.52 + i * 0.52);
        const pic = new THREE.Mesh(
          new THREE.PlaneGeometry(0.36, 0.36),
          new THREE.MeshStandardMaterial({ map: tex.photoPrints[i], roughness: 0.45 })
        );
        pic.rotation.y = Math.PI / 2;
        pic.position.set(1.095, 0.82, -0.52 + i * 0.52);
        g.add(f, pic);
      }

      // 水上小飞机
      seaplaneGroup.position.set(2.35, -0.1, 1.35);
      seaplaneGroup.rotation.y = 0.85;
      const planeMat = new THREE.MeshStandardMaterial({
        color: COLORS.seaplaneYellow,
        roughness: 0.38,
      });
      const floatMat = new THREE.MeshStandardMaterial({ color: COLORS.creamWall, roughness: 0.48 });

      const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.72, 6, 12), planeMat);
      fuselage.rotation.x = Math.PI / 2;
      fuselage.position.y = 0.28;
      const wing = new THREE.Mesh(new RoundedBoxGeometry(1.48, 0.06, 0.36, 2, 0.02), planeMat);
      wing.position.set(0, 0.44, 0.06);
      const tailFin = new THREE.Mesh(
        new RoundedBoxGeometry(0.06, 0.32, 0.24, 2, 0.02),
        coralRoofMat
      );
      tailFin.position.set(0, 0.46, -0.45);
      const cabinGlass = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.2, 0.32, 2, 0.04), glassMat);
      cabinGlass.position.set(0, 0.4, 0.14);
      seaplaneGroup.add(fuselage, wing, tailFin, cabinGlass);

      for (const fx of [-0.26, 0.26]) {
        const pontoon = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.72, 4, 8), floatMat);
        pontoon.rotation.x = Math.PI / 2;
        pontoon.position.set(fx, 0.02, 0.06);
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 6), darkWoodMat);
        strut.position.set(fx, 0.15, 0.06);
        seaplaneGroup.add(pontoon, strut);
      }

      seaplaneProp.position.set(0, 0.28, 0.58);
      const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.055, 0.02), darkWoodMat);
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.48, 0.02), darkWoodMat);
      const noseCap = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), coralRoofMat);
      seaplaneProp.add(blade1, blade2, noseCap);
      seaplaneGroup.add(seaplaneProp);
      g.add(seaplaneGroup);

      return shadowify(g);
    },

    // 5. Level 3 · 云顶浑天仪灯塔（紧凑敦实比例，适配首页 580px 视锥）
    tower: () => {
      const g = new THREE.Group();

      const octBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.26, 0.46, 8), slateMat);
      octBase.position.y = 0.23;
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.64, 0.14, 2, 0.04), darkWoodMat);
      door.position.set(0, 0.36, 1.06);
      g.add(octBase, door);

      // 收分灯塔主体（总高 2.38，观景台在 2.94）
      const towerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.92, 2.38, 20), creamMat);
      towerBody.position.y = 1.65;
      const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.822, 0.87, 0.36, 20), coralRoofMat);
      band1.position.y = 1.18;
      const band2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.706, 0.754, 0.36, 20),
        coralRoofMat
      );
      band2.position.y = 2.12;
      g.add(towerBody, band1, band2);

      for (const [wy, wa] of [
        [0.86, 0.0],
        [1.66, 0.55],
        [2.46, -0.35],
      ]) {
        const wg = new THREE.Group();
        wg.rotation.y = wa;
        const rY = 0.92 - ((wy - 0.46) / 2.38) * 0.3;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 8, 14), darkWoodMat);
        rim.position.set(0, wy, rY + 0.02);
        const glass = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), windowMat);
        glass.position.set(0, wy, rY + 0.03);
        wg.add(rim, glass);
        g.add(wg);
      }

      const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 0.78, 0.16, 16), slateMat);
      deck.position.y = 2.92;
      const railRing = new THREE.Mesh(new THREE.TorusGeometry(0.89, 0.034, 8, 22), brassMat);
      railRing.rotation.x = Math.PI / 2;
      railRing.position.y = 3.24;
      g.add(deck, railRing);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.28, 6), brassMat);
        bal.position.set(Math.cos(a) * 0.89, 3.1, Math.sin(a) * 0.89);
        g.add(bal);
      }

      const coreCenterY = 3.62;
      const beaconCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), beaconCoreMat);
      beaconCore.position.y = coreCenterY;
      g.add(beaconCore);

      const ringRadii = [0.74, 0.6, 0.46];
      ringRadii.forEach((rr, idx) => {
        const ringPivot = armillaryRings[idx];
        ringPivot.position.set(0, coreCenterY, 0);
        const torus = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.036, 8, 28), brassMat);
        ringPivot.add(torus);
        g.add(ringPivot);
      });

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.3, 12), coralRoofMat);
      cap.position.y = 4.44;
      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.36, 8), brassMat);
      finial.position.y = 4.74;
      g.add(cap, finial);

      const flagShape = new THREE.Shape();
      flagShape.moveTo(0, 0.09);
      flagShape.lineTo(0.38, 0);
      flagShape.lineTo(0, -0.09);
      flagShape.closePath();
      pennant = new THREE.Mesh(
        new THREE.ShapeGeometry(flagShape),
        new THREE.MeshStandardMaterial({
          color: COLORS.brassGold,
          roughness: 0.55,
          side: THREE.DoubleSide,
        })
      );
      pennant.position.set(0.02, 4.86, 0);
      g.add(pennant);

      shadowify(g);

      const makeBeam = (dir: 1 | -1) => {
        const coneGeo = new THREE.ConeGeometry(1.15, 7.2, 24, 1, true);
        coneGeo.translate(0, -3.6, 0);
        coneGeo.rotateZ(dir * (Math.PI / 2));
        const bm = new THREE.Mesh(coneGeo, beamMat);
        bm.castShadow = false;
        bm.receiveShadow = false;
        return bm;
      };
      beamPivot.position.set(0, coreCenterY, 0);
      beamPivot.add(makeBeam(1), makeBeam(-1));
      g.add(beamPivot);

      return g;
    },
  };

  for (const z of zones) {
    const group = builders[z.key]();
    group.position.set(z.x, z.groundY, z.z);
    group.rotation.y = z.facingAngle;
    group.userData.zoneKey = z.key;
    landmarks.set(z.key, group);

    const haloRadius = z.key === "tower" ? 1.45 : 1.68;
    const haloMat = new THREE.MeshBasicMaterial({
      color: COLORS.haloCyan,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(haloRadius - 0.13, haloRadius, 36), haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(z.x, z.groundY + 0.04, z.z);
    halos.set(z.key, halo);
  }

  // 空中缆车与跨谷彩灯串
  const pOffice = new THREE.Vector3(1.1, TIER_LEVELS.office + 2.4, -2.05);
  const pMid = new THREE.Vector3(-0.7, 3.25, -0.8);
  const pWorkshop = new THREE.Vector3(-2.5, TIER_LEVELS.workshop + 2.1, 0.25);
  const cableCurve = new THREE.CatmullRomCurve3([pOffice, pMid, pWorkshop]);

  const attachments = new THREE.Group();
  attachments.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 24, 0.022, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x3b414c, metalness: 0.7, roughness: 0.4 })
    )
  );

  const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6), darkWoodMat);
  hanger.position.y = -0.17;
  const carCabin = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 0.36, 0.36, 2, 0.05),
    new THREE.MeshStandardMaterial({ color: COLORS.cableCarRed, roughness: 0.45 })
  );
  carCabin.position.y = -0.46;
  const carWindow = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.22), windowMat);
  carWindow.position.y = -0.44;
  cableCar.add(hanger, carCabin, carWindow);
  cableCar.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = shadows;
  });
  attachments.add(cableCar);

  const stringCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.45, TIER_LEVELS.tower + 0.55, -3.15),
    new THREE.Vector3(-0.5, TIER_LEVELS.office + 0.85, -3.05),
    new THREE.Vector3(0.45, TIER_LEVELS.office + 0.65, -2.95),
  ]);
  attachments.add(
    new THREE.Mesh(new THREE.TubeGeometry(stringCurve, 16, 0.014, 5, false), darkWoodMat)
  );
  for (let i = 1; i <= 6; i++) {
    const pt = stringCurve.getPointAt(i / 7);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), stringBulbMat);
    bulb.position.copy(pt).setY(pt.y - 0.05);
    attachments.add(bulb);
  }

  const workshopZone = zones.find((z) => z.key === "workshop")!;
  const chimneyTipWorld = chimneyTipLocal
    .clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), workshopZone.facingAngle)
    .add(new THREE.Vector3(workshopZone.x, workshopZone.groundY, workshopZone.z));

  return {
    landmarks,
    halos,
    windowMat,
    beaconCoreMat,
    beamMat,
    beamPivot,
    armillaryRings,
    pennant,
    waterWheel,
    gears,
    cableCar,
    cableCurve,
    seaplaneGroup,
    seaplaneProp,
    hourglassGroup,
    stringBulbMat,
    forgeMat,
    sakuraCanopyGroup,
    chimneyTipWorld,
    attachments,
  };
}
