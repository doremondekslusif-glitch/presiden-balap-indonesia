import * as THREE from 'three';

export class Track {
  constructor(scene, spec) {
    this.spec = spec;

    const rawPoints = spec.points.map(
      (p) => new THREE.Vector3(...p)
    );

    // Setiap circuit memiliki target panjang lap yang
    // konsisten. Skala diterapkan ke seluruh control points
    // sehingga bentuk lintasan tetap sama.
    const rawCurve = new THREE.CatmullRomCurve3(
      rawPoints,
      true,
      'centripetal'
    );

    rawCurve.arcLengthDivisions = 1000;

    const rawLength = rawCurve.getLength();
    const targetLength = Number(spec.lapLength) || rawLength;
    const scale =
      rawLength > 0
        ? targetLength / rawLength
        : 1;

    const scaledPoints = rawPoints.map(
      (point) =>
        point.clone().multiplyScalar(scale)
    );

    this.curve = new THREE.CatmullRomCurve3(
      scaledPoints,
      true,
      'centripetal'
    );

    this.curve.arcLengthDivisions = 1000;

    this.lapLength = this.curve.getLength();

    this.samples = 240;

    this.points = Array.from(
      { length: this.samples },
      (_, i) =>
        this.curve.getPointAt(
          i / this.samples
        )
    );

    this.build(scene);
  }

  build(scene) {
    const group = new THREE.Group();
    scene.add(group);

    const n = this.samples;

    // ==================================================
    // GROUND
    // ==================================================

    const theme = this.spec.theme || 'bali';

    const groundColors = {
      bali: 0x63a651,
      forest: 0x416f3f,
      city: 0x52585f,
      mountain: 0x64734d,
      island: 0x7eaa5b
    };

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(230, 190),
      new THREE.MeshStandardMaterial({
        color: groundColors[theme] || groundColors.bali,
        roughness: 1
      })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.16;
    ground.receiveShadow = true;

    group.add(ground);

    // ==================================================
    // TRACK EDGE POINTS
    // ==================================================

    const left = [];
    const right = [];

    for (let i = 0; i < n; i++) {
      const p = this.points[i];

      const tangent =
        this.curve
          .getTangentAt(i / n)
          .normalize();

      const side = new THREE.Vector3(
        -tangent.z,
        0,
        tangent.x
      );

      left.push(
        p.clone().add(
          side.clone().multiplyScalar(
            this.spec.width / 2
          )
        )
      );

      right.push(
        p.clone().sub(
          side.clone().multiplyScalar(
            this.spec.width / 2
          )
        )
      );
    }

    // ==================================================
    // ROAD
    // ==================================================

    // Gunakan strip mesh langsung dari pasangan
    // kiri/kanan agar permukaan jalan benar-benar rata
    // dan tidak mengalami triangulasi ShapeGeometry yang aneh.
    const roadVertices = [];
    const roadIndices = [];

    for (let i = 0; i < n; i++) {
      roadVertices.push(
        left[i].x,
        0.025,
        left[i].z,

        right[i].x,
        0.025,
        right[i].z
      );
    }

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;

      const li = i * 2;
      const ri = i * 2 + 1;
      const ln = next * 2;
      const rn = next * 2 + 1;

      roadIndices.push(
        li, ln, ri,
        ri, ln, rn
      );
    }

    const roadGeometry =
      new THREE.BufferGeometry();

    roadGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        roadVertices,
        3
      )
    );

    roadGeometry.setIndex(
      roadIndices
    );

    roadGeometry.computeVertexNormals();

    const road = new THREE.Mesh(
      roadGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x30343b,
        roughness: 0.9,
        side: THREE.DoubleSide
      })
    );

    road.receiveShadow = true;

    group.add(road);

    // ==================================================
    // KERB MERAH PUTIH
    // ==================================================

    this.addKerbs(
      group,
      left,
      right
    );

    // ==================================================
    // PEMBATAS / GUARDRAIL
    // ==================================================

    this.addGuardRails(
      group,
      left,
      right
    );

    // ==================================================
    // EDGE MARKERS
    // ==================================================

    this.addEdgeMarkers(
      group,
      left,
      right
    );

    // ==================================================
    // START / FINISH LINE
    // ==================================================

    const start =
      this.points[0];

    const tangent =
      this.curve.getTangentAt(0);

    const startLine =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          this.spec.width,
          0.05,
          1
        ),
        new THREE.MeshBasicMaterial({
          color: 0xffffff
        })
      );

    startLine.position.copy(
      start
    );

    startLine.position.y =
      0.08;

    // Lebar garis harus melintang terhadap arah jalan.
    // Local-X BoxGeometry diputar mengikuti sisi kiri/kanan track.
    startLine.rotation.y =
      Math.atan2(
        tangent.x,
        tangent.z
      );

    group.add(startLine);

    // ==================================================
    // FINISH GATE
    // ==================================================

    this.addFinishGate(
      group,
      start,
      tangent
    );

    // ==================================================
    // CONES
    // ==================================================

    this.addCones(
      group,
      left,
      right
    );

    // ==================================================
    // LIGHT POLES
    // ==================================================

    this.addLightPoles(
      group,
      left,
      right
    );

    // ==================================================
    // SIGNS
    // ==================================================

    this.addSigns(
      group,
      left
    );

    // ==================================================
    // SCENERY
    // ==================================================

    this.addScenery(group);
  }

  // ==================================================
  // KERB
  // ==================================================

  addKerbs(
    group,
    left,
    right
  ) {
    const redMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd71920,
        roughness: 0.8
      });

    const whiteMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8
      });

    const createKerb = (
      points
    ) => {
      for (
        let i = 0;
        i < this.samples;
        i += 2
      ) {
        const p =
          points[i];

        const tangent =
          this.curve
            .getTangentAt(
              i / this.samples
            )
            .normalize();

        const side =
          new THREE.Vector3(
            -tangent.z,
            0,
            tangent.x
          );

        const next =
          points[
            (i + 2) %
              this.samples
          ];

        const segmentLength =
          p.distanceTo(next) + 0.15;

        const offset =
          side
            .clone()
            .multiplyScalar(0.30);

        const kerb =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              segmentLength,
              0.10,
              0.85
            ),
            Math.floor(i / 2) % 2 === 0
              ? redMaterial
              : whiteMaterial
          );

        kerb.position.copy(
          p.clone().add(offset)
        );

        kerb.position.y =
          0.09;

        kerb.rotation.y =
          -Math.atan2(
            tangent.z,
            tangent.x
          );

        group.add(kerb);
      }
    };

    createKerb(left);
    createKerb(right);
  }

  // ==================================================
  // CONTINUOUS GUARD RAIL
  // ==================================================

  addGuardRails(
    group,
    left,
    right
  ) {
    const metalMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb7bdc5,
        roughness: 0.7,
        metalness: 0.25
      });

    const postMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x666b70,
        roughness: 0.8
      });

    const createRail = (
      points
    ) => {
      // -------------------------------
      // RAIL UTAMA
      // -------------------------------

      const railGeometry =
        new THREE.BufferGeometry();

      const vertices = [];

      const railHeight = 0.95;

      for (
        let i = 0;
        i < this.samples;
        i++
      ) {
        const p =
          points[i];

        vertices.push(
          p.x,
          railHeight,
          p.z
        );
      }

      railGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          vertices,
          3
        )
      );

      const railLine =
        new THREE.Line(
          railGeometry,
          new THREE.LineBasicMaterial({
            color: 0xb7bdc5
          })
        );

      group.add(railLine);

      // -------------------------------
      // RAIL BAWAH
      // -------------------------------

      const lowerGeometry =
        new THREE.BufferGeometry();

      const lowerVertices = [];

      for (
        let i = 0;
        i < this.samples;
        i++
      ) {
        const p =
          points[i];

        lowerVertices.push(
          p.x,
          0.55,
          p.z
        );
      }

      lowerGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          lowerVertices,
          3
        )
      );

      const lowerRail =
        new THREE.Line(
          lowerGeometry,
          new THREE.LineBasicMaterial({
            color: 0x8f959b
          })
        );

      group.add(lowerRail);

      // -------------------------------
      // TIANG
      // -------------------------------

      for (
        let i = 0;
        i < this.samples;
        i += 8
      ) {
        const p =
          points[i];

        const post =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.12,
              1.1,
              0.12
            ),
            postMaterial
          );

        post.position.set(
          p.x,
          0.55,
          p.z
        );

        group.add(post);
      }
    };

    createRail(left);
    createRail(right);
  }

  // ==================================================
  // EDGE MARKERS
  // ==================================================

  addEdgeMarkers(
    group,
    left,
    right
  ) {
    const material =
      new THREE.MeshBasicMaterial({
        color: 0xf5f5ef
      });

    for (
      let i = 0;
      i < this.samples;
      i += 5
    ) {
      const tangent =
        this.curve
          .getTangentAt(
            i / this.samples
          )
          .normalize();

      const rotation =
        -Math.atan2(
          tangent.z,
          tangent.x
        );

      for (const edge of [
        left,
        right
      ]) {
        const marker =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.35,
              0.05,
              1.1
            ),
            material
          );

        marker.position.copy(
          edge[i]
        );

        marker.position.y =
          0.13;

        marker.rotation.y =
          rotation;

        group.add(marker);
      }
    }
  }

  // ==================================================
  // FINISH GATE
  // ==================================================

  addFinishGate(
    group,
    position,
    tangent
  ) {
    const gate =
      new THREE.Group();

    gate.position.copy(
      position
    );

    // Arah local-X gate mengikuti lebar jalan,
    // sehingga kedua kaki berada di luar kiri/kanan track.
    gate.rotation.y =
      Math.atan2(
        tangent.x,
        tangent.z
      );

    const metal =
      new THREE.MeshStandardMaterial({
        color: 0x22252a,
        roughness: 0.7
      });

    // Tiang kiri
    const leftPole =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.45,
          5.5,
          0.45
        ),
        metal
      );

    const gateHalfWidth =
      this.spec.width / 2 + 0.65;

    leftPole.position.set(
      -gateHalfWidth,
      2.75,
      0
    );

    gate.add(leftPole);

    // Tiang kanan
    const rightPole =
      leftPole.clone();

    rightPole.position.x =
      gateHalfWidth;

    gate.add(rightPole);

    // Atas
    const top =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          this.spec.width + 1.3,
          0.5,
          0.6
        ),
        metal
      );

    top.position.y =
      5.5;

    gate.add(top);

    // Banner
    const banner =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          this.spec.width + 0.2,
          1.5,
          0.12
        ),
        new THREE.MeshStandardMaterial({
          color: 0xd71920
        })
      );

    banner.position.y =
      4.55;

    gate.add(banner);

    // Kotak hitam-putih
    for (
      let i = -4;
      i <= 4;
      i++
    ) {
      const square =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.65,
            0.65,
            0.14
          ),
          new THREE.MeshBasicMaterial({
            color:
              i % 2 === 0
                ? 0xffffff
                : 0x111111
          })
        );

      square.position.set(
        i * 0.72,
        4.55,
        0
      );

      gate.add(square);
    }

    group.add(gate);
  }

  // ==================================================
  // CONES
  // ==================================================

  addCones(
    group,
    left,
    right
  ) {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0xff6b00
      });

    for (
      let i = 15;
      i < this.samples;
      i += 35
    ) {
      const edge =
        i % 70 === 15
          ? left
          : right;

      const cone =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            0.28,
            0.8,
            8
          ),
          material
        );

      cone.position.copy(
        edge[i]
      );

      cone.position.y =
        0.4;

      group.add(cone);
    }
  }

  // ==================================================
  // LIGHT POLES
  // ==================================================

  addLightPoles(
    group,
    left,
    right
  ) {
    const poleMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x45484d
      });

    const lightMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffcc
      });

    for (
      let i = 20;
      i < this.samples;
      i += 40
    ) {
      const edge =
        i % 80 === 20
          ? left
          : right;

      const pole =
        new THREE.Group();

      const shaft =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.09,
            0.13,
            4.5,
            8
          ),
          poleMaterial
        );

      shaft.position.y =
        2.25;

      pole.add(shaft);

      const lamp =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.55,
            0.22,
            0.35
          ),
          lightMaterial
        );

      lamp.position.y =
        4.5;

      pole.add(lamp);

      pole.position.copy(
        edge[i]
      );

      group.add(pole);
    }
  }

  // ==================================================
  // SIGNS
  // ==================================================

  addSigns(
    group,
    left
  ) {
    const poleMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x55585c
      });

    const signMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff
      });

    for (
      let i = 30;
      i < this.samples;
      i += 60
    ) {
      const p =
        left[i];

      const pole =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.07,
            0.07,
            2.3,
            8
          ),
          poleMaterial
        );

      pole.position.copy(
        p
      );

      pole.position.y =
        1.15;

      group.add(pole);

      const sign =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.4,
            0.9,
            0.12
          ),
          signMaterial
        );

      sign.position.copy(
        p
      );

      sign.position.y =
        2.2;

      group.add(sign);
    }
  }

  // ==================================================
  // SCENERY
  // ==================================================

  addScenery(group) {
    const theme = this.spec.theme || 'bali';

    if (theme === 'city') {
      this.addCityScenery(group);
      return;
    }

    if (theme === 'mountain') {
      this.addMountainScenery(group);
      return;
    }

    if (theme === 'island') {
      this.addIslandScenery(group);
      return;
    }

    const trunkMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x765238
      });

    const leafMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x167a42
      });

    const riceMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x8bba45
      });

    // -------------------------------
    // POHON
    // -------------------------------

    for (
      let i = 0;
      i < 52;
      i++
    ) {
      const angle =
        i * 2.399;

      const radius =
        54 +
        (i % 5) * 7;

      const x =
        Math.cos(angle) *
        radius;

      const z =
        Math.sin(angle) *
        radius;

      const trunk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.35,
            0.45,
            4,
            7
          ),
          trunkMaterial
        );

      trunk.position.set(
        x,
        2,
        z
      );

      group.add(trunk);

      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            2.3,
            5,
            8
          ),
          leafMaterial
        );

      crown.position.set(
        x,
        6,
        z
      );

      group.add(crown);
    }

    // -------------------------------
    // SAWAH
    // -------------------------------

    for (
      let x = -92;
      x < -52;
      x += 4
    ) {
      for (
        let z = -34;
        z < 28;
        z += 4
      ) {
        const patch =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              3.6,
              0.08,
              3.6
            ),
            riceMaterial
          );

        patch.position.set(
          x,
          0,
          z
        );

        group.add(patch);
      }
    }

    // -------------------------------
    // LAUT
    // -------------------------------

    const ocean =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          95,
          65
        ),
        new THREE.MeshStandardMaterial({
          color: 0x159bd3,
          roughness: 0.25,
          metalness: 0.1
        })
      );

    ocean.rotation.x =
      -Math.PI / 2;

    ocean.position.set(
      78,
      -0.12,
      -68
    );

    group.add(ocean);

    // -------------------------------
    // GUNUNG
    // -------------------------------

    const mountain =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          19,
          34,
          7
        ),
        new THREE.MeshStandardMaterial({
          color: 0x496a53
        })
      );

    mountain.position.set(
      -8,
      16,
      -86
    );

    group.add(mountain);
  }



  addCityScenery(group) {
    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x8a9098 }),
      new THREE.MeshStandardMaterial({ color: 0xb8a98d }),
      new THREE.MeshStandardMaterial({ color: 0x59636e })
    ];

    for (let i = 0; i < 28; i++) {
      const angle = i * 2.399;
      const radius = 58 + (i % 4) * 8;
      const h = 8 + (i % 6) * 3;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(5 + (i % 3) * 2, h, 5 + (i % 2) * 2),
        buildingMaterials[i % buildingMaterials.length]
      );
      building.position.set(
        Math.cos(angle) * radius,
        h / 2,
        Math.sin(angle) * radius
      );
      group.add(building);
    }

    const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x20252a });
    const lampLight = new THREE.MeshBasicMaterial({ color: 0xffe9a6 });

    for (let i = 0; i < 18; i++) {
      const angle = i * 2.7;
      const radius = 52;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 5, 8),
        lampMaterial
      );
      pole.position.set(Math.cos(angle) * radius, 2.5, Math.sin(angle) * radius);
      group.add(pole);

      const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.2, 0.4),
        lampLight
      );
      light.position.set(Math.cos(angle) * radius, 5, Math.sin(angle) * radius);
      group.add(light);
    }
  }

  addMountainScenery(group) {
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x596653 });
    const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xc9d0c5 });

    for (let i = 0; i < 10; i++) {
      const angle = i * 0.63;
      const radius = 70 + (i % 3) * 8;
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(10 + (i % 3) * 4, 20 + (i % 4) * 5, 7),
        rockMaterial
      );
      mountain.position.set(
        Math.cos(angle) * radius,
        10 + (i % 4) * 2,
        Math.sin(angle) * radius
      );
      group.add(mountain);

      if (i % 2 === 0) {
        const cap = new THREE.Mesh(
          new THREE.ConeGeometry(3, 4, 7),
          snowMaterial
        );
        cap.position.set(
          mountain.position.x,
          mountain.position.y + 11,
          mountain.position.z
        );
        group.add(cap);
      }
    }
  }

  addIslandScenery(group) {
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x776c58 });
    const palmTrunk = new THREE.MeshStandardMaterial({ color: 0x765238 });
    const palmLeaf = new THREE.MeshStandardMaterial({ color: 0x207b42 });

    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 190),
      new THREE.MeshStandardMaterial({
        color: 0x159bd3,
        roughness: 0.2,
        metalness: 0.05
      })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.2;
    group.add(ocean);

    for (let i = 0; i < 22; i++) {
      const angle = i * 2.17;
      const radius = 58 + (i % 4) * 6;

      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2 + (i % 3)),
        rockMaterial
      );
      rock.position.set(
        Math.cos(angle) * radius,
        1.5,
        Math.sin(angle) * radius
      );
      group.add(rock);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 4, 7),
        palmTrunk
      );
      trunk.position.set(
        Math.cos(angle) * (radius + 3),
        2,
        Math.sin(angle) * (radius + 3)
      );
      group.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 7, 4),
        palmLeaf
      );
      leaves.position.set(
        trunk.position.x,
        4.8,
        trunk.position.z
      );
      leaves.scale.y = 0.45;
      group.add(leaves);
    }
  }

  // ==================================================
  // NEAREST
  // ==================================================

  nearest(position) {
    let best = 0;
    let d = Infinity;

    this.points.forEach(
      (p, i) => {
        const distance =
          p.distanceToSquared(
            position
          );

        if (distance < d) {
          d = distance;
          best = i;
        }
      }
    );

    return {
      index: best,
      distance: Math.sqrt(d),
      progress:
        best / this.samples
    };
  }

  // ==================================================
  // POINT
  // ==================================================

  point(progress) {
    return this.curve.getPointAt(
      ((progress % 1) + 1) % 1
    );
  }
}
