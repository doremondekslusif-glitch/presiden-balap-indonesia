import * as THREE from 'three';

export class Track {
  constructor(scene, spec) {
    this.spec = spec;

    this.curve = new THREE.CatmullRomCurve3(
      spec.points.map(
        (p) => new THREE.Vector3(...p)
      ),
      true,
      'centripetal'
    );

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

    // =========================================
    // GROUND
    // =========================================

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(230, 190),
      new THREE.MeshStandardMaterial({
        color: 0x63a651,
        roughness: 1
      })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.16;
    ground.receiveShadow = true;

    group.add(ground);

    // =========================================
    // TRACK EDGE POINTS
    // =========================================

    const left = [];
    const right = [];

    for (let i = 0; i < n; i++) {
      const p = this.points[i];

      const q =
        this.points[
          (i + 1) % n
        ];

      const direction = q
        .clone()
        .sub(p)
        .normalize();

      const side = new THREE.Vector3(
        -direction.z,
        0,
        direction.x
      )
        .normalize()
        .multiplyScalar(
          this.spec.width / 2
        );

      left.push(
        p.clone().add(side)
      );

      right.push(
        p.clone().sub(side)
      );
    }

    // =========================================
    // ROAD
    // =========================================

    const roadShape = new THREE.Shape();

    roadShape.moveTo(
      left[0].x,
      left[0].z
    );

    for (let i = 1; i < n; i++) {
      roadShape.lineTo(
        left[i].x,
        left[i].z
      );
    }

    for (
      let i = n - 1;
      i >= 0;
      i--
    ) {
      roadShape.lineTo(
        right[i].x,
        right[i].z
      );
    }

    roadShape.closePath();

    const road = new THREE.Mesh(
      new THREE.ShapeGeometry(
        roadShape
      ),
      new THREE.MeshStandardMaterial({
        color: 0x30343b,
        roughness: 0.9
      })
    );

    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.receiveShadow = true;

    group.add(road);

    // =========================================
    // EDGE MARKERS
    // =========================================

    const edgeMat =
      new THREE.MeshBasicMaterial({
        color: 0xf5f5ef
      });

    for (
      let i = 0;
      i < n;
      i += 4
    ) {
      const p =
        this.points[i];

      const q =
        this.points[
          (i + 1) % n
        ];

      const direction = q
        .clone()
        .sub(p)
        .normalize();

      const rotation =
        -Math.atan2(
          direction.z,
          direction.x
        );

      for (const edge of [
        left,
        right
      ]) {
        const marker =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.45,
              0.05,
              1.4
            ),
            edgeMat
          );

        marker.position.copy(
          edge[i]
        );

        marker.position.y =
          0.06;

        marker.rotation.y =
          rotation;

        group.add(marker);
      }
    }

    // =========================================
    // START / FINISH LINE
    // =========================================

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
      0.07;

    startLine.rotation.y =
      -Math.atan2(
        tangent.z,
        tangent.x
      );

    group.add(startLine);

    // =========================================
    // TRACK RAILS
    // =========================================

    this.addRails(
      group,
      left,
      right
    );

    // =========================================
    // FINISH GATE
    // =========================================

    this.addFinishGate(
      group,
      start,
      tangent
    );

    // =========================================
    // BARRIERS
    // =========================================

    this.addBarriers(
      group,
      left,
      right
    );

    // =========================================
    // CONES
    // =========================================

    this.addCones(
      group,
      left,
      right
    );

    // =========================================
    // LIGHT POLES
    // =========================================

    this.addLightPoles(
      group,
      left,
      right
    );

    // =========================================
    // SIGNS
    // =========================================

    this.addSigns(
      group,
      left
    );

    // =========================================
    // SCENERY
    // =========================================

    this.addScenery(group);
  }

  // =========================================
  // RAILS
  // =========================================

  addRails(
    group,
    left,
    right
  ) {
    const railMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb7bdc5,
        roughness: 0.7
      });

    for (
      let i = 0;
      i < this.samples;
      i += 8
    ) {
      const p =
        this.points[i];

      const q =
        this.points[
          (i + 1) %
            this.samples
        ];

      const direction = q
        .clone()
        .sub(p)
        .normalize();

      const rotation =
        -Math.atan2(
          direction.z,
          direction.x
        );

      for (const edge of [
        left,
        right
      ]) {
        const rail =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.18,
              0.45,
              3
            ),
            railMaterial
          );

        rail.position.copy(
          edge[i]
        );

        rail.position.y =
          0.35;

        rail.rotation.y =
          rotation;

        group.add(rail);
      }
    }
  }

  // =========================================
  // FINISH GATE
  // =========================================

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

    leftPole.position.set(
      -(this.spec.width / 2),
      2.75,
      0
    );

    gate.add(leftPole);

    // Tiang kanan
    const rightPole =
      leftPole.clone();

    rightPole.position.x =
      this.spec.width / 2;

    gate.add(rightPole);

    // Bagian atas
    const top =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          this.spec.width + 1,
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
          this.spec.width - 1,
          1.5,
          0.12
        ),
        new THREE.MeshStandardMaterial({
          color: 0xd71920,
          roughness: 0.7
        })
      );

    banner.position.y =
      4.55;

    gate.add(banner);

    // Kotak hitam putih
    for (
      let i = -3;
      i <= 3;
      i++
    ) {
      const square =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.7,
            0.7,
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
        i * 0.8,
        4.55,
        0
      );

      gate.add(square);
    }

    group.add(gate);
  }

  // =========================================
  // BARRIERS
  // =========================================

  addBarriers(
    group,
    left,
    right
  ) {
    const barrierMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd9dce0,
        roughness: 0.8
      });

    const stripeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd92332
      });

    for (
      let i = 6;
      i < this.samples;
      i += 8
    ) {
      const p =
        this.points[i];

      const q =
        this.points[
          (i + 1) %
            this.samples
        ];

      const direction = q
        .clone()
        .sub(p)
        .normalize();

      const rotation =
        -Math.atan2(
          direction.z,
          direction.x
        );

      for (const edge of [
        left,
        right
      ]) {
        const barrier =
          new THREE.Group();

        const base =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              2.6,
              0.65,
              0.55
            ),
            barrierMaterial
          );

        barrier.add(base);

        const stripe =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              2.6,
              0.16,
              0.57
            ),
            stripeMaterial
          );

        stripe.position.y =
          0.15;

        barrier.add(stripe);

        barrier.position.copy(
          edge[i]
        );

        barrier.position.y =
          0.33;

        barrier.rotation.y =
          rotation;

        group.add(barrier);
      }
    }
  }

  // =========================================
  // CONES
  // =========================================

  addCones(
    group,
    left,
    right
  ) {
    const coneMaterial =
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
          coneMaterial
        );

      cone.position.copy(
        edge[i]
      );

      cone.position.y =
        0.4;

      group.add(cone);
    }
  }

  // =========================================
  // LIGHT POLES
  // =========================================

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

      const poleGroup =
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

      poleGroup.add(shaft);

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

      poleGroup.add(lamp);

      poleGroup.position.copy(
        edge[i]
      );

      group.add(poleGroup);
    }
  }

  // =========================================
  // SIGNS
  // =========================================

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

  // =========================================
  // SCENERY
  // =========================================

  addScenery(group) {
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

    // Pohon
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

    // Sawah
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

    // Laut
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
      63,
      -0.12,
      -52
    );

    group.add(ocean);

    // Gunung
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

  // =========================================
  // NEAREST
  // =========================================

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

  // =========================================
  // POINT
  // =========================================

  point(progress) {
    return this.curve.getPointAt(
      ((progress % 1) + 1) % 1
    );
  }
}
