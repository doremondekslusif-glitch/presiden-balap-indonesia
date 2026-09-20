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

    // =========================
    // MATERIAL
    // =========================

    const paint =
      new THREE.MeshStandardMaterial({
        color: this.character.color,
        roughness: 0.28,
        metalness: 0.25
      });

    const black =
      new THREE.MeshStandardMaterial({
        color: 0x15171b,
        roughness: 0.75
      });

    // =========================
    // BADAN KART
    // =========================

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.15,
          0.42,
          3.35
        ),
        paint
      );

    body.position.y = 0.62;

    body.castShadow = true;
    body.receiveShadow = true;

    kart.add(body);

    // =========================
    // NOSE
    // =========================

    const nose =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.72,
          0.28,
          0.7
        ),
        paint
      );

    nose.position.set(
      0,
      0.56,
      1.88
    );

    nose.castShadow = true;

    kart.add(nose);

    // =========================
    // BUMPER
    // =========================

    const bumper =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.38,
          0.16,
          0.22
        ),
        black
      );

    bumper.position.set(
      0,
      0.43,
      2.23
    );

    kart.add(bumper);

    // =========================
    // SPOILER
    // =========================

    const spoiler =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.8,
          0.16,
          0.35
        ),
        paint
      );

    spoiler.position.set(
      0,
      1.32,
      -1.5
    );

    kart.add(spoiler);

    for (const x of [-0.9, 0.9]) {
      const post =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.1,
            0.7,
            0.1
          ),
          black
        );

      post.position.set(
        x,
        1.02,
        -1.43
      );

      kart.add(post);
    }

    // =========================
    // SEAT
    // =========================

    const seat =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.1,
          0.66,
          1.05
        ),
        black
      );

    seat.position.set(
      0,
      1.0,
      -0.22
    );

    kart.add(seat);

    // =========================
    // RODA
    // =========================

    for (const x of [-0.92, 0.92]) {
      for (const z of [-1.12, 1.18]) {
        const wheel =
          new THREE.Mesh(
            new THREE.CylinderGeometry(
              0.38,
              0.38,
              0.3,
              12
            ),
            black
          );

        wheel.rotation.z =
          Math.PI / 2;

        wheel.position.set(
          x,
          0.4,
          z
        );

        wheel.userData.wheel = true;

        wheel.castShadow = true;

        kart.add(wheel);
      }
    }

    // =========================
    // STEERING
    // =========================

    const steering =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.3,
          0.05,
          7,
          12
        ),
        black
      );

    steering.rotation.x =
      Math.PI / 2;

    steering.position.set(
      0,
      1.36,
      0.62
    );

    kart.add(steering);

    // =========================
    // CHARACTER
    // =========================

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

  // =====================================================
  // GENERIC CHARACTER
  // =====================================================

  addGenericCharacter(kart) {
    const skin =
      new THREE.MeshStandardMaterial({
        color: 0xe8ae82,
        roughness: 0.8
      });

    const shirt =
      new THREE.MeshStandardMaterial({
        color: this.character.color,
        roughness: 0.7
      });

    // BADAN
    const torso =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.34,
          0.45,
          0.8,
          8
        ),
        shirt
      );

    torso.position.set(
      0,
      1.55,
      -0.1
    );

    torso.castShadow = true;

    kart.add(torso);

    // KEPALA
    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.36,
          12,
          10
        ),
        skin
      );

    head.position.set(
      0,
      2.2,
      -0.03
    );

    head.castShadow = true;

    kart.add(head);

    // RAMBUT
    const hair =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.38,
          12,
          8,
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

    hair.castShadow = true;

    kart.add(hair);

    // TANGAN & KAKI
    for (const x of [-0.38, 0.38]) {
      const arm =
        new THREE.Mesh(
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

      arm.castShadow = true;

      kart.add(arm);

      const leg =
        new THREE.Mesh(
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

      leg.castShadow = true;

      kart.add(leg);
    }
  }

  // =====================================================
  // LOAD GLB CHARACTER
  // =====================================================

  loadCharacterModel(kart, modelPath) {
    console.log(
      '================================'
    );

    console.log(
      'MULAI LOAD MODEL:',
      modelPath
    );

    gltfLoader.load(
      modelPath,

      // =========================
      // SUCCESS
      // =========================

      (gltf) => {
        console.log(
          'MODEL BERHASIL DIMUAT:',
          modelPath
        );

        const model =
          gltf.scene;

        if (!model) {
          console.error(
            'GLB TIDAK MEMILIKI SCENE'
          );

          this.addGenericCharacter(
            kart
          );

          return;
        }

        // =========================
        // AKTIFKAN SEMUA MESH
        // =========================

        model.traverse(
          (object) => {
            if (object.isMesh) {
              object.visible = true;

              object.castShadow = true;
              object.receiveShadow = true;

              if (object.material) {
                object.material.needsUpdate =
                  true;
              }
            }
          }
        );

        // =========================
        // HITUNG UKURAN ASLI
        // =========================

        const originalBox =
          new THREE.Box3()
            .setFromObject(model);

        const originalSize =
          originalBox.getSize(
            new THREE.Vector3()
          );

        console.log(
          'UKURAN GLB ASLI:',
          originalSize
        );

        if (
          originalSize.x <= 0 ||
          originalSize.y <= 0 ||
          originalSize.z <= 0
        ) {
          console.error(
            'UKURAN MODEL TIDAK VALID'
          );

          this.addGenericCharacter(
            kart
          );

          return;
        }

        // =========================
        // PUSATKAN MODEL
        // =========================

        const originalCenter =
          originalBox.getCenter(
            new THREE.Vector3()
          );

        model.position.sub(
          originalCenter
        );

        // =========================
        // SKALA MODEL
        // =========================

        const maxSize =
          Math.max(
            originalSize.x,
            originalSize.y,
            originalSize.z
          );

        const targetSize = 2.8;

        const scale =
          targetSize / maxSize;

        model.scale.setScalar(
          scale
        );

        // =========================
        // HITUNG ULANG BOX
        // SETELAH SCALE
        // =========================

        const scaledBox =
          new THREE.Box3()
            .setFromObject(model);

        const scaledSize =
          scaledBox.getSize(
            new THREE.Vector3()
          );

        console.log(
          'UKURAN GLB SETELAH SCALE:',
          scaledSize
        );

        // =========================
        // LETAKKAN KAKI DI ATAS KART
        // =========================

        const desiredBottom =
          1.12;

        const currentBottom =
          scaledBox.min.y;

        model.position.y +=
          desiredBottom -
          currentBottom;

        // =========================
        // ARAH KARAKTER
        // =========================

        model.rotation.y = 0;

        // =========================
        // SIMPAN DATA
        // =========================

        model.userData.characterModel =
          true;

        model.userData.modelPath =
          modelPath;

        // =========================
        // TAMBAHKAN KE KART
        // =========================

        kart.add(model);

        console.log(
          'MODEL DITEMPEL KE KART'
        );

        console.log(
          'POSISI MODEL:',
          model.position
        );

        console.log(
          'SCALE MODEL:',
          model.scale
        );

        console.log(
          '================================'
        );
      },

      // =========================
      // PROGRESS
      // =========================

      (progress) => {
        if (progress.total > 0) {
          const percent =
            Math.round(
              (progress.loaded /
                progress.total) *
                100
            );

          console.log(
            'LOAD MODEL:',
            percent + '%'
          );
        }
      },

      // =========================
      // ERROR
      // =========================

      (error) => {
        console.error(
          '================================'
        );

        console.error(
          'GAGAL LOAD MODEL:',
          modelPath
        );

        console.error(
          error
        );

        console.error(
          'Menggunakan karakter cadangan.'
        );

        console.error(
          '================================'
        );

        this.addGenericCharacter(
          kart
        );
      }
    );
  }

  // =====================================================
  // RESET
  // =====================================================

  reset(pos, heading) {
    this.mesh.position.copy(pos);

    this.heading = heading;

    this.mesh.rotation.y =
      heading;

    this.speed = 0;

    this.lap = 0;

    this.finished = false;

    this.boost = 100;

    this.progress = 0;

    this.previousProgress = 0;
  }

  // =====================================================
  // PLAYER
  // =====================================================

  updatePlayer(
    dt,
    input,
    track
  ) {
    const accel =
      this.character.acceleration *
      22;

    const max =
      30 *
      this.character.speed;

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
        accel *
        1.15 *
        dt;
    }

    if (
      !forward &&
      !backward
    ) {
      this.speed *=
        Math.pow(
          0.55,
          dt
        );
    }

    this.speed =
      Math.max(
        -9,
        Math.min(
          max +
            (boost ? 12 : 0),
          this.speed
        )
      );

    if (boost) {
      this.boost =
        Math.max(
          0,
          this.boost -
            31 * dt
        );
    } else {
      this.boost =
        Math.min(
          100,
          this.boost +
            10 * dt
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
        Math.abs(
          this.speed
        ) / 9
      ) *
      (this.speed >= 0
        ? 1
        : -1) *
      this.character.handling;

    this.move(
      dt,
      track
    );
  }

  // =====================================================
  // AI
  // =====================================================

  updateAI(
    dt,
    track,
    target
  ) {
    const to =
      target
        .clone()
        .sub(
          this.mesh.position
        );

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

    this.speed =
      Math.min(
        25 *
          this.character.speed,
        this.speed +
          15 * dt
      );

    this.move(
      dt,
      track
    );
  }

  // =====================================================
  // MOVE
  // =====================================================

  move(
    dt,
    track
  ) {
    const forward =
      new THREE.Vector3(
        Math.sin(
          this.heading
        ),
        0,
        Math.cos(
          this.heading
        )
      );

    this.mesh.position
      .addScaledVector(
        forward,
        this.speed * dt
      );

    const nearest =
      track.nearest(
        this.mesh.position
      );

    if (
      nearest.distance >
      track.spec.width *
        0.52
    ) {
      const tangent =
        track.curve
          .getTangentAt(
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

      this.speed *=
        0.48;

      this.heading +=
        Math.sign(
          offset || 1
        ) *
        0.12;
    }

    if (
      nearest.distance >
      track.spec.width *
        1.1
    ) {
      this.mesh.position.lerp(
        track.points[
          nearest.index
        ],
        dt * 1.8
      );

      this.speed *=
        0.75;
    }

    this.mesh.rotation.y =
      this.heading;

    // =========================
    // RODA BERPUTAR
    // =========================

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

    // =========================
    // PROGRESS
    // =========================

    this.previousProgress =
      this.progress;

    this.progress =
      nearest.progress;

    // =========================
    // LAP
    // =========================

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

  // =====================================================
  // SCORE
  // =====================================================

  score() {
    return this.finished
      ? 9999 + this.lap
      : this.lap +
          this.progress;
  }
}
