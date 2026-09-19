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

    // =========================
    // GROUND
    // =========================

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

    // =========================
    // ROAD
    // =========================

    const roadShape = new THREE.Shape();

    const n = this.samples;

    const left = [];
    const right = [];

    for (let i = 0; i < n; i++) {
      const p = this.points[i];
      const q =
        this.points[(i + 1) % n];

      const d = q
        .clone()
        .sub(p)
        .normalize();

      const side =
        new THREE.Vector3(
          -d.z,
          0,
          d.x
        ).multiplyScalar(
          this.spec.width / 2
        );

      left.push(
        p.clone().add(side)
      );

      right.push(
        p.clone().sub(side)
      );
    }

    roadShape.moveTo(
      left[0].x,
      left[0].z
    );

    left.slice(1).forEach((p) => {
      roadShape.lineTo(
        p.x,
        p.z
      );
    });

    right
      .slice()
      .reverse()
      .forEach((p) => {
        roadShape.lineTo(
          p.x,
          p.z
        );
      });

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

    // =========================
    // EDGE MARKERS
    // =========================

    const edgeMat =
      new THREE.MeshBasicMaterial({
        color: 0xf5f5ef
      });

    for (
      let i = 0;
      i < n;
      i += 4
    ) {
      for (const arr of [
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
          arr[i]
        );

        marker.position.y = 0.06;

        marker.rotation.y =
          -Math.atan2(
            this.points[
              (i + 1) % n
            ].z -
              this.points[i].z,
            this.points[
              (i + 1) % n
            ].x -
              this.points[i].x
          );

        group.add(marker);
      }
    }

    // =========================
    // START LINE
    // =========================

    const start =
      this.points[0];

    const tangent =
      this.curve.getTangentAt(0);

    const line =
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

    line.position.copy(start);
    line.position.y = 0.07;

    line.rotation.y =
      -Math.atan2(
        tangent.z,
        tangent.x
      );

    group.add(line);

    // =========================
    // TRACK RAILS
    // =========================

    for (
      let i = 0;
      i < n;
      i += 12
    ) {
      const p =
        this.points[i];

      const q =
        this.points[
          (i + 1) % n
        ];

      const d = q
        .clone()
        .sub(p)
        .normalize();

      const side =
        new THREE.Vector3(
          -d.z,
          0,
          d.x
        );

      for (const sign of [
        -1,
        1
      ]) {
        const rail =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.18,
              0.45,
              3
            ),
            new THREE.MeshStandardMaterial({
              color: 0xb7bdc5
            })
          );

        rail.position
          .copy(p)
          .addScaledVector(
            side,
            sign *
              (this.spec.width / 2 + 1)
          );

        rail.position.y = 0.35;

        rail.rotation.y =
          -Math.atan2(
            d.z,
            d.x
          );

        group.add(rail);
      }
    }

    // =========================
    // START FINISH GATE
    // =========================

    this.addFinishGate(
      group,
      start,
      tangent
    );

    // =========================
    // TRACK BARRIERS
    // =========================

    this.addBarriers(
      group,
      left,
      right
    );

    // =========================
    // CONES
    // =========================

    this.addCones(
      group,
      left,
      right
    );

    // =========================
    // LIGHT POLES
    // =========================

    this.addLightPoles(
      group,
      left,
      right
    );

    // =========================
    // TRACK SIGNS
    // =========================

    this.addSigns(
      group,
      left,
      right
    );

    // =========================
    // SCENERY
    // =========================

    this.addScenery(group);
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

    const angle =
      Math.atan2(
        tangent.x,
        tangent.z
      );

    gate.position.copy(
      position
    );

    gate.rotation.y =
      angle;

    const metal =
      new THREE.MeshStandardMaterial({
        color: 0x22252a,
        roughness: 0.7
      });

    // Tiang kiri
    const poleLeft =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.45,
          5.5,
          0.45
        ),
        metal
      );

    poleLeft.position.set(
      -(this.spec.width / 2),
      2.75,
      0
    );

    gate.add(poleLeft);

    // Tiang kanan
    const poleRight =
      poleLeft.clone();

    poleRight.position.x =
      this.spec.width / 2;

    gate.add(poleRight);

    // Atap
    const top =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          this.spec.width + 1,
          0.5,
          0.6
        ),
        metal
      );

    top.position.y = 5.5;

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

    banner.position.y = 4.55;

    gate.add(banner);

    // Kotak putih di banner
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

  // ==================================================
  // BARRIERS
  // ==================================================

  addBarriers(
    group,
    left,
    right
  ) {
    const barrierMat =
      new THREE.MeshStandardMaterial({
        color: 0xd9dce0,
        roughness: 0.8
      });

    const redMat =
      new THREE.MeshStandardMaterial({
        color: 0xd92332
      });

    for (
      let i = 6;
      i < this.samples;
      i += 10
    ) {
      for (const data of [
        {
          arr: left,
          side: 1
        },
        {
          arr: right,
          side: -1
        }
      ]) {
        const p =
          data.arr[i];

        const q =
          data.arr[
            (i + 1) %
              this.samples
          ];

        const d = q
          .clone()
          .sub(p)
          .normalize();

        const barrier =
          new THREE.Group();

        const base =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              2.8,
              0.65,
              0.55
            ),
            barrierMat
          );

        barrier.add(base);

        const stripe =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              2.8,
              0.18,
              0.57
            ),
            redMat
          );

        stripe.position.y =
          0.15;

        barrier.add(stripe);

        barrier.position.copy(
          p
        );

        barrier.position.y =
          0.33;

        barrier.rotation.y =
          -Math.atan2(
            d.z,
            d.x
          );

        group.add(barrier);
      }
    }
  }

  // ==================================================
  // CONES
  // ==================================================

  addCones(
    group,
    left,
    right
  ) {
    const orange =
      new THREE.MeshStandardMaterial({
        color: 0xff6b00
      });

    for (
      let i = 15;
      i < this.samples;
      i += 35
    ) {
      const arr =
        i % 70 === 15
          ? left
          : right;

      const p =
        arr[i];

      const cone =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            0.28,
            0.8,
            8
          ),
          orange
        );

      cone.position.copy(
        p
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
    const poleMat =
      new THREE.MeshStandardMaterial({
        color: 0x45484d
      });

    const lightMat =
      new THREE.MeshBasicMaterial({
        color: 0xffffcc
      });

    for (
      let i = 20;
      i < this.samples;
      i += 40
    ) {
      const arr =
        i % 80 === 20
          ? left
          : right;

      const p =
        arr[i];

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
          poleMat
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
          lightMat
        );

      lamp.position.y =
        4.5;

      pole.add(lamp);

      pole.position.copy(
        p
      );

      group.add(pole);
    }
  }

  // ==================================================
  // SIGNS
  // ==================================================

  addSigns(
    group,
    left,
    right
  ) {
    const poleMat =
      new THREE.MeshStandardMaterial({
        color: 0x55585c
      });

    const signMat =
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
          poleMat
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
          signMat
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
    const trunk =
      new THREE.MeshStandardMaterial({
        color: 0x765238
      });

    const leaf =
      new THREE.MeshStandardMaterial({
        color: 0x167a42
      });

    const rice =
      new THREE.MeshStandardMaterial({
        color: 0x8bba45
      });

    // Pohon di area luar
    for (
      let i = 0;
      i < 52;
      i++
    ) {
      const a =
        i * 2.399;

      const r =
        54 +
        (i % 5) * 7;

      const x =
        Math.cos(a) * r;

      const z =
        Math.sin(a) * r;

      const t =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.35,
            0.45,
            4,
            7
          ),
          trunk
        );

      t.position.set(
        x,
        2,
        z
      );

      group.add(t);

      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            2.3,
            5,
            8
          ),
          leaf
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
            rice
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

  // ==================================================
  // NEAREST
  // ==================================================

  nearest(position) {
    let best = 0;
    let d = Infinity;

    this.points.forEach(
      (p, i) => {
        const v =
          p.distanceToSquared(
            position
          );

        if (v < d) {
          d = v;
          best = i;
        }
      }
    );

    return {
      index: best,
      distance: Math.sqrt(d),
      progress:
        best /
        this.samples
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
