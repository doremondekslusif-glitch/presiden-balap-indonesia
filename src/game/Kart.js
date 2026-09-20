import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

// Cache model GLB agar tidak download berulang kali
const modelCache = new Map();
const modelLoading = new Map();

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

  // =====================================================
  // BUAT KART
  // =====================================================

  makeMesh() {
    const kart = new THREE.Group();

    // ===================================================
    // MATERIAL
    // ===================================================

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

    // ===================================================
    // BADAN KART
    // ===================================================

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

    // ===================================================
    // NOSE
    // ===================================================

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

    // ===================================================
    // BUMPER
    // ===================================================

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

    // ===================================================
    // SPOILER
    // ===================================================

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

    // ===================================================
    // KURSI
    // ===================================================

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

    seat.castShadow = true;

    kart.add(seat);

    // ===================================================
    // RODA
    // ===================================================

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

    // ===================================================
    // STEERING
    // ===================================================

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

    // ===================================================
    // CHARACTER
    // ===================================================

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
  // KARAKTER GENERIK
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

    // TANGAN DAN KAKI

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
  // LOAD MODEL
  // =====================================================

  loadCharacterModel(kart, modelPath) {
    console.log(
      'LOAD CHARACTER:',
      modelPath
    );

    // ===================================================
    // JIKA SUDAH ADA DI CACHE
    // ===================================================

    if (modelCache.has(modelPath)) {
      const cached =
        modelCache.get(modelPath);

      const model =
        this.prepareCharacter(
          cached.clone(true)
        );

      kart.add(model);

      return;
    }

    // ===================================================
    // JIKA SEDANG DILOAD OLEH KART LAIN
    // ===================================================

    if (modelLoading.has(modelPath)) {
      modelLoading
        .get(modelPath)
        .then((sourceModel) => {
          const model =
            this.prepareCharacter(
              sourceModel.clone(true)
            );

          kart.add(model);
        })
        .catch(() => {
          this.addGenericCharacter(kart);
        });

      return;
    }

    // ===================================================
    // LOAD PERTAMA
    // ===================================================

    const loadingPromise =
      new Promise(
        (resolve, reject) => {
          gltfLoader.load(
            modelPath,

            (gltf) => {
              console.log(
                'MODEL BERHASIL DIMUAT:',
                modelPath
              );

              const sourceModel =
                gltf.scene;

              if (!sourceModel) {
                reject(
                  new Error(
                    'GLB tidak mempunyai scene'
                  )
                );

                return;
              }

              // Simpan model asli
              modelCache.set(
                modelPath,
                sourceModel
              );

              resolve(
                sourceModel
              );
            },

            undefined,

            (error) => {
              console.error(
                'GAGAL LOAD MODEL:',
                modelPath,
                error
              );

              reject(error);
            }
          );
        }
      );

    modelLoading.set(
      modelPath,
      loadingPromise
    );

    loadingPromise
      .then((sourceModel) => {
        const model =
          this.prepareCharacter(
            sourceModel.clone(true)
          );

        kart.add(model);

        // Loading selesai,
        // tidak perlu disimpan lagi
        // sebagai promise aktif.
        modelLoading.delete(
          modelPath
        );
      })
      .catch(() => {
        modelLoading.delete(
          modelPath
        );

        this.addGenericCharacter(
          kart
        );
      });
  }

  // =====================================================
  // SIAPKAN MODEL KARAKTER
  // =====================================================

prepareCharacter(model) {
  // ===================================================
  // AKTIFKAN SEMUA MESH
  // ===================================================

  model.traverse((object) => {
    if (object.isMesh) {
      object.visible = true;
      object.castShadow = true;
      object.receiveShadow = true;

      if (object.material) {
        object.material.needsUpdate = true;
      }
    }
  });

  // ===================================================
  // HITUNG UKURAN MODEL
  // ===================================================

  const box =
    new THREE.Box3().setFromObject(model);

  const size =
    box.getSize(
      new THREE.Vector3()
    );

  if (
    size.x <= 0 ||
    size.y <= 0 ||
    size.z <= 0
  ) {
    return model;
  }

  // ===================================================
  // PUSATKAN MODEL
  // ===================================================

  const center =
    box.getCenter(
      new THREE.Vector3()
    );

  model.position.sub(center);

  // ===================================================
  // SCALE
  // ===================================================

  const targetHeight = 2.35;

  const scale =
    targetHeight / size.y;

  model.scale.setScalar(scale);

  // ===================================================
  // HITUNG ULANG UKURAN
  // ===================================================

  const scaledBox =
    new THREE.Box3()
      .setFromObject(model);

  const scaledHeight =
    scaledBox.max.y -
    scaledBox.min.y;

  // ===================================================
  // POSISI DI KURSI
  // ===================================================

  /*
   * Kursi berada sekitar y = 1.0.
   *
   * Kita letakkan titik bawah model
   * sedikit masuk ke area kursi.
   */

  const seatY = 0.98;

  model.position.y +=
    seatY -
    scaledBox.min.y;

  // Mundurkan sedikit
  // agar posisi tubuh berada
  // di tengah kursi.
  model.position.z = -0.35;

  // ===================================================
  // POSE DUDUK
  // ===================================================

  model.traverse((object) => {
    if (!object.isBone) {
      return;
    }

    const name =
      object.name.toLowerCase();

    // -----------------------------------------------
    // PANGGUL
    // -----------------------------------------------

    if (
      name.includes('hip') ||
      name.includes('pelvis')
    ) {
      object.rotation.x -= 0.25;
    }

    // -----------------------------------------------
    // PAHA
    // -----------------------------------------------

    if (
      name.includes('thigh') ||
      name.includes('upleg') ||
      name.includes('upperleg')
    ) {
      object.rotation.x += 0.9;
    }

    // -----------------------------------------------
    // BETIS
    // -----------------------------------------------

    if (
      name.includes('calf') ||
      name.includes('lowerleg') ||
      name.includes('shin')
    ) {
      object.rotation.x -= 1.0;
    }

    // -----------------------------------------------
    // TANGAN
    // -----------------------------------------------

    if (
      name.includes('upperarm') ||
      name.includes('arm')
    ) {
      object.rotation.x += 0.25;
    }

    // -----------------------------------------------
    // LENGAN BAWAH
    // -----------------------------------------------

    if (
      name.includes('forearm') ||
      name.includes('lowerarm')
    ) {
      object.rotation.x += 0.35;
    }
  });

  // ===================================================
  // ARAH KARAKTER
  // ===================================================

  model.rotation.y = 0;

  // ===================================================
  // DATA
  // ===================================================

  model.userData.characterModel = true;

  return model;
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

    // ===================================================
    // ANIMASI RODA
    // ===================================================

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

    // ===================================================
    // PROGRESS
    // ===================================================

    this.previousProgress =
      this.progress;

    this.progress =
      nearest.progress;

    // ===================================================
    // LAP
    // ===================================================

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
