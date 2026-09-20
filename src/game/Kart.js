import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

export class Kart {
  constructor(character, isPlayer = false) {
    this.character = character;
    this.isPlayer = isPlayer;
    this.speed = 0;
    this.heading = 0;
    this.lap = 0;
    this.progress = 0;
    this.previousProgress = 0;
    this.finished = false;
    this.boost = 100;
    this.mesh = this.makeMesh();
  }

  makeMesh() {
    const kart = new THREE.Group();

    const paint = new THREE.MeshStandardMaterial({
      color: this.character.color,
      roughness: 0.28,
      metalness: 0.25
    });

    const black = new THREE.MeshStandardMaterial({
      color: 0x15171b,
      roughness: 0.75
    });

    // BADAN KART
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.42, 3.35),
      paint
    );

    body.position.y = 0.62;
    body.castShadow = true;
    body.receiveShadow = true;
    kart.add(body);

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.28, 0.7),
      paint
    );

    nose.position.set(0, 0.56, 1.88);
    kart.add(nose);

    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(2.38, 0.16, 0.22),
      black
    );

    bumper.position.set(0, 0.43, 2.23);
    kart.add(bumper);

    const spoiler = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.16, 0.35),
      paint
    );

    spoiler.position.set(0, 1.32, -1.5);
    kart.add(spoiler);

    for (const x of [-0.9, 0.9]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.7, 0.1),
        black
      );

      post.position.set(x, 1.02, -1.43);
      kart.add(post);
    }

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.66, 1.05),
      black
    );

    seat.position.set(0, 1.0, -0.22);
    kart.add(seat);

    // RODA
    for (const x of [-0.92, 0.92]) {
      for (const z of [-1.12, 1.18]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.38,
            0.38,
            0.3,
            12
          ),
          black
        );

        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.4, z);
        wheel.userData.wheel = true;

        kart.add(wheel);
      }
    }

    // STEERING
    const steering = new THREE.Mesh(
      new THREE.TorusGeometry(
        0.3,
        0.05,
        7,
        12
      ),
      black
    );

    steering.rotation.x = Math.PI / 2;
    steering.position.set(0, 1.36, 0.62);
    kart.add(steering);

    /*
     * Jika karakter mempunyai file GLB,
     * gunakan GLB sebagai pengganti model
     * kepala/tubuh generik.
     */
    if (this.character.model) {
      this.loadCharacterModel(
        kart,
        this.character.model
      );
    } else {
      this.addGenericCharacter(kart);
    }

    return kart;
  }

  addGenericCharacter(kart) {
    const skin = new THREE.MeshStandardMaterial({
      color: 0xe8ae82
    });

    const shirt = new THREE.MeshStandardMaterial({
      color: this.character.color
    });

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.34,
        0.45,
        0.8,
        8
      ),
      shirt
    );

    torso.position.set(0, 1.55, -0.1);
    kart.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.36,
        10,
        8
      ),
      skin
    );

    head.position.set(
      0,
      2.2,
      -0.03
    );

    kart.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.38,
        10,
        6,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      new THREE.MeshStandardMaterial({
        color: 0x15171b
      })
    );

    hair.position.set(
      0,
      2.28,
      -0.03
    );

    kart.add(hair);

    for (const x of [-0.38, 0.38]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.1,
          0.12,
          0.65,
          7
        ),
        skin
      );

      arm.position.set(
        x,
        1.55,
        0.36
      );

      arm.rotation.z =
        x * 0.8;

      kart.add(arm);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.13,
          0.16,
          0.7,
          7
        ),
        new THREE.MeshStandardMaterial({
          color: 0x15171b
        })
      );

      leg.position.set(
        x * 0.65,
        1.0,
        0.43
      );

      leg.rotation.x =
        Math.PI / 2;

      kart.add(leg);
    }
  }

loadCharacterModel(kart, modelPath) {
  console.log('MULAI LOAD MODEL:', modelPath);

  gltfLoader.load(
    modelPath,

    (gltf) => {
      console.log(
        'MODEL BERHASIL DIMUAT:',
        modelPath
      );

      const model = gltf.scene;

      // Hitung ukuran asli
      const box =
        new THREE.Box3()
          .setFromObject(model);

      const size =
        box.getSize(
          new THREE.Vector3()
        );

      const center =
        box.getCenter(
          new THREE.Vector3()
        );

      // Pusatkan model
      model.position.sub(
        center
      );

      // Ukuran karakter
      const maxSize =
        Math.max(
          size.x,
          size.y,
          size.z
        );

      const targetSize = 2.5;

      if (maxSize > 0) {
        const scale =
          targetSize / maxSize;

        model.scale.setScalar(
          scale
        );
      }

      // Posisi di atas kart
      model.position.y = 0.65;

      // Arah karakter
      model.rotation.y = 0;

      model.traverse(
        (object) => {
          if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;

            if (object.material) {
              object.material.needsUpdate = true;
            }
          }
        }
      );

      model.userData.characterModel =
        true;

      kart.add(model);

      console.log(
        'MODEL DITEMPEL KE KART'
      );
    },

    (progress) => {
      if (progress.total > 0) {
        console.log(
          'LOAD:',
          Math.round(
            (progress.loaded /
              progress.total) *
              100
          ) + '%'
        );
      }
    },

    (error) => {
      console.error(
        'GAGAL LOAD MODEL:',
        modelPath,
        error
      );

      this.addGenericCharacter(
        kart
      );
    }
  );
}
  reset(pos, heading) {
    this.mesh.position.copy(pos);
    this.heading = heading;
    this.mesh.rotation.y = heading;
    this.speed = 0;
    this.lap = 0;
    this.finished = false;
    this.boost = 100;
    this.progress = 0;
    this.previousProgress = 0;
  }

  updatePlayer(dt, input, track) {
    const accel =
      this.character.acceleration * 22;

    const max =
      30 * this.character.speed;

    const forward =
      input.down(
        'KeyW',
        'ArrowUp'
      );

    const backward =
      input.down(
        'KeyS',
        'ArrowDown'
      );

    const boost =
      input.down(
        'ShiftLeft',
        'ShiftRight',
        'Space'
      ) &&
      this.boost > 0 &&
      forward;

    if (forward) {
      this.speed +=
        accel * dt;
    }

    if (backward) {
      this.speed -=
        accel * 1.15 * dt;
    }

    if (!forward && !backward) {
      this.speed *=
        Math.pow(0.55, dt);
    }

    this.speed = Math.max(
      -9,
      Math.min(
        max + (boost ? 12 : 0),
        this.speed
      )
    );

    if (boost) {
      this.boost = Math.max(
        0,
        this.boost - 31 * dt
      );
    } else {
      this.boost = Math.min(
        100,
        this.boost + 10 * dt
      );
    }

    const steer =
      (input.down(
        'KeyA',
        'ArrowLeft'
      )
        ? 1
        : 0) -
      (input.down(
        'KeyD',
        'ArrowRight'
      )
        ? 1
        : 0);

    this.heading +=
      steer *
      dt *
      2.25 *
      Math.min(
        1,
        Math.abs(this.speed) / 9
      ) *
      (this.speed >= 0
        ? 1
        : -1) *
      this.character.handling;

    this.move(dt, track);
  }

  updateAI(dt, track, target) {
    const to = target
      .clone()
      .sub(this.mesh.position);

    const desired =
      Math.atan2(
        to.x,
        to.z
      );

    const delta =
      Math.atan2(
        Math.sin(
          desired -
            this.heading
        ),
        Math.cos(
          desired -
            this.heading
        )
      );

    this.heading +=
      Math.max(
        -1.7 * dt,
        Math.min(
          1.7 * dt,
          delta
        )
      );

    this.speed = Math.min(
      25 *
        this.character.speed,
      this.speed +
        15 * dt
    );

    this.move(dt, track);
  }

  move(dt, track) {
    const forward =
      new THREE.Vector3(
        Math.sin(this.heading),
        0,
        Math.cos(this.heading)
      );

    this.mesh.position.addScaledVector(
      forward,
      this.speed * dt
    );

    const nearest =
      track.nearest(
        this.mesh.position
      );

    if (
      nearest.distance >
      track.spec.width * 0.52
    ) {
      const tangent =
        track.curve.getTangentAt(
          nearest.progress
        );

      const side =
        new THREE.Vector3(
          -tangent.z,
          0,
          tangent.x
        );

      const offset =
        this.mesh.position
          .clone()
          .sub(
            track.points[
              nearest.index
            ]
          )
          .dot(side);

      const safe =
        Math.sign(
          offset || 1
        ) *
        track.spec.width *
        0.5;

      this.mesh.position
        .copy(
          track.points[
            nearest.index
          ]
        )
        .addScaledVector(
          side,
          safe
        );

      this.speed *= 0.48;

      this.heading +=
        Math.sign(
          offset || 1
        ) *
        0.12;
    }

    if (
      nearest.distance >
      track.spec.width * 1.1
    ) {
      this.mesh.position.lerp(
        track.points[
          nearest.index
        ],
        dt * 1.8
      );

      this.speed *= 0.75;
    }

    this.mesh.rotation.y =
      this.heading;

    this.mesh.traverse(
      (object) => {
        if (
          object.userData.wheel
        ) {
          object.rotation.y -=
            this.speed *
            dt *
            2;
        }
      }
    );

    this.previousProgress =
      this.progress;

    this.progress =
      nearest.progress;

    if (
      this.previousProgress >
        0.88 &&
      this.progress <
        0.12 &&
      this.speed > 2
    ) {
      this.lap++;
    }
  }

  score() {
    return this.finished
      ? 9999 + this.lap
      : this.lap +
          this.progress;
  }
}
