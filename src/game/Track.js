import * as THREE from 'three';

export class Track {
  constructor(scene, spec) {
    this.spec = spec;

    this.curve = new THREE.CatmullRomCurve3(
      spec.points.map((p) => new THREE.Vector3(...p)),
      true,
      'centripetal'
    );

    this.samples = 240;

    this.points = Array.from(
      { length: this.samples },
      (_, i) => this.curve.getPointAt(i / this.samples)
    );

    this.build(scene);
  }

  build(scene) {
    const group = new THREE.Group();
    scene.add(group);

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

    const roadShape = new THREE.Shape();
    const n = this.samples;
    const left = [];
    const right = [];

    for (let i = 0; i < n; i++) {
      const p = this.points[i];
      const q = this.points[(i + 1) % n];

      const d = q.clone().sub(p).normalize();

      const side = new THREE.Vector3(
        -d.z,
        0,
        d.x
      ).multiplyScalar(this.spec.width / 2);

      left.push(p.clone().add(side));
      right.push(p.clone().sub(side));
    }

    roadShape.moveTo(
      left[0].x,
      left[0].z
    );

    left.slice(1).forEach((p) => {
      roadShape.lineTo(p.x, p.z);
    });

    right.reverse().forEach((p) => {
      roadShape.lineTo(p.x, p.z);
    });

    roadShape.closePath();

    const road = new THREE.Mesh(
      new THREE.ShapeGeometry(roadShape),
      new THREE.MeshStandardMaterial({
        color: 0x30343b,
        roughness: 0.9
      })
    );

    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.receiveShadow = true;
    group.add(road);

    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xf5f5ef
    });

    for (let i = 0; i < n; i += 4) {
      for (const arr of [left, right]) {
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(
            0.45,
            0.05,
            1.4
          ),
          edgeMat
        );

        marker.position.copy(arr[i]);
        marker.position.y = 0.06;

        marker.rotation.y = -Math.atan2(
          this.points[(i + 1) % n].z -
            this.points[i].z,
          this.points[(i + 1) % n].x -
            this.points[i].x
        );

        group.add(marker);
      }
    }

    // Start line
    const start = this.points[0];
    const tangent = this.curve.getTangentAt(0);

    const line = new THREE.Mesh(
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

    line.rotation.y = -Math.atan2(
      tangent.z,
      tangent.x
    );

    group.add(line);

    // Track rails
    for (let i = 0; i < n; i += 12) {
      const p = this.points[i];
      const q = this.points[(i + 1) % n];

      const d = q.clone().sub(p).normalize();

      const side = new THREE.Vector3(
        -d.z,
        0,
        d.x
      );

      for (const sign of [-1, 1]) {
        const rail = new THREE.Mesh(
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

        rail.rotation.y = -Math.atan2(
          d.z,
          d.x
        );

        group.add(rail);
      }
    }

    // Start banner
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(
        8,
        2,
        0.25
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd9293a,
        emissive: 0x220000
      })
    );

    banner.position.copy(start).add(
      new THREE.Vector3(0, 5, -3)
    );

    group.add(banner);

    this.addScenery(group);
  }

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

    for (let i = 0; i < 52; i++) {
      const a = i * 2.399;
      const r = 54 + (i % 5) * 7;

      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;

      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.35,
          0.45,
          4,
          7
        ),
        trunk
      );

      t.position.set(x, 2, z);
      group.add(t);

      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(
          2.3,
          5,
          8
        ),
        leaf
      );

      crown.position.set(x, 6, z);
      group.add(crown);
    }

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
        const patch = new THREE.Mesh(
          new THREE.BoxGeometry(
            3.6,
            0.08,
            3.6
          ),
          rice
        );

        patch.position.set(x, 0, z);
        group.add(patch);
      }
    }

    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(95, 65),
      new THREE.MeshStandardMaterial({
        color: 0x159bd3,
        roughness: 0.25,
        metalness: 0.1
      })
    );

    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(
      63,
      -0.12,
      -52
    );

    group.add(ocean);

    const mountain = new THREE.Mesh(
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

    for (const x of [-8, 8]) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,
          0.08,
          7
        ),
        new THREE.MeshBasicMaterial({
          color: 0x555555
        })
      );

      pole.position.set(
        x,
        3,
        6
      );

      group.add(pole);

      for (const [y, c] of [
        [4.8, 0xe61f32],
        [4.1, 0xffffff]
      ]) {
        const f = new THREE.Mesh(
          new THREE.PlaneGeometry(
            2.3,
            0.7
          ),
          new THREE.MeshBasicMaterial({
            color: c,
            side: THREE.DoubleSide
          })
        );

        f.position.set(
          x + 1.1,
          y,
          6
        );

        group.add(f);
      }
    }
  }

  nearest(position) {
    let best = 0;
    let d = Infinity;

    this.points.forEach((p, i) => {
      const v =
        p.distanceToSquared(position);

      if (v < d) {
        d = v;
        best = i;
      }
    });

    return {
      index: best,
      distance: Math.sqrt(d),
      progress: best / this.samples
    };
  }

  point(progress) {
    return this.curve.getPointAt(
      ((progress % 1) + 1) % 1
    );
  }
}