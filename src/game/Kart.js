import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

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
    this.lapArmed = false;
    this.lapCheckpointPassed = false;

    this.finished = false;
    this.boost = 100;

    this.maxSpeed = 15 * (character.speed ?? 1);
    this.acceleration = 8 * (character.acceleration ?? 1);
    this.handling = character.handling ?? 1;
    this.boostPower = character.boost ?? 1;

    this.mesh = this.makeMesh();
  }

  makeMesh() {
    const kart = new THREE.Group();

    const paintMaterial = new THREE.MeshStandardMaterial({
      color: this.character.color ?? 0xff3333,
      roughness: 0.28,
      metalness: 0.25
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x15171b,
      roughness: 0.75,
      metalness: 0.05
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.42, 3.35),
      paintMaterial
    );

    body.position.set(0, 0.62, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    kart.add(body);

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.28, 0.7),
      paintMaterial
    );

    nose.position.set(0, 0.56, 1.88);
    nose.castShadow = true;
    kart.add(nose);

    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(2.38, 0.16, 0.22),
      darkMaterial
    );

    bumper.position.set(0, 0.43, 2.23);
    kart.add(bumper);

    const spoiler = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.16, 0.35),
      paintMaterial
    );

    spoiler.position.set(0, 1.32, -1.5);
    kart.add(spoiler);

    for (const x of [-0.9, 0.9]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.7, 0.1),
        darkMaterial
      );

      post.position.set(x, 1.02, -1.43);
      kart.add(post);
    }

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.66, 1.05),
      darkMaterial
    );

    seat.position.set(0, 1.0, -0.22);
    seat.castShadow = true;
    kart.add(seat);

    // ==================================================
    // BAN
    // ==================================================

    for (const x of [-1.03, 1.03]) {
      for (const z of [-1.12, 1.18]) {
        const tire = new THREE.Mesh(
          new THREE.TorusGeometry(
            0.38,
            0.13,
            8,
            14
          ),
          darkMaterial
        );

        // Sumbu ban = X
        tire.rotation.y =
          Math.PI / 2;

        tire.position.set(
          x,
          0.43,
          z
        );

        tire.userData.wheel = true;
        tire.castShadow = true;
        tire.receiveShadow = true;

        kart.add(tire);

        // Velg kecil di tengah ban
        const rimMaterial =
          new THREE.MeshStandardMaterial({
            color: 0x8d949c,
            roughness: 0.35,
            metalness: 0.65
          });

        const rim = new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.16,
            0.16,
            0.12,
            12
          ),
          rimMaterial
        );

        rim.rotation.z =
          Math.PI / 2;

        rim.position.set(
          x + (x > 0 ? 0.13 : -0.13),
          0.43,
          z
        );

        rim.userData.wheelRim = true;
        rim.castShadow = true;

        kart.add(rim);
      }
    }

    const steering = new THREE.Mesh(
      new THREE.TorusGeometry(
        0.3,
        0.05,
        7,
        12
      ),
      darkMaterial
    );

    steering.rotation.x = Math.PI / 2;
    steering.position.set(0, 1.36, 0.62);

    kart.add(steering);

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
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8ae82,
      roughness: 0.8
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: this.character.color ?? 0xff3333,
      roughness: 0.7
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x15171b,
      roughness: 0.75
    });

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.34,
        0.45,
        0.8,
        8
      ),
      shirtMaterial
    );

    torso.position.set(0, 1.55, -0.1);
    torso.castShadow = true;
    kart.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.36,
        12,
        10
      ),
      skinMaterial
    );

    head.position.set(0, 2.2, -0.03);
    head.castShadow = true;
    kart.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.38,
        12,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      darkMaterial
    );

    hair.position.set(0, 2.28, -0.03);
    hair.castShadow = true;
    kart.add(hair);

    for (const x of [-0.38, 0.38]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.1,
          0.12,
          0.65,
          7
        ),
        skinMaterial
      );

      arm.position.set(x, 1.55, 0.36);
      arm.rotation.z = x * 0.8;
      arm.castShadow = true;
      kart.add(arm);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.13,
          0.16,
          0.7,
          7
        ),
        darkMaterial
      );

      leg.position.set(
        x * 0.65,
        1.0,
        0.43
      );

      leg.rotation.x = Math.PI / 2;
      leg.castShadow = true;

      kart.add(leg);
    }
  }

  loadCharacterModel(kart, modelPath) {
    console.log('LOAD CHARACTER:', modelPath);

    if (modelCache.has(modelPath)) {
      const sourceModel = modelCache.get(modelPath);

      const model = this.prepareCharacter(
        sourceModel.clone(true)
      );

      kart.add(model);
      return;
    }

    if (modelLoading.has(modelPath)) {
      modelLoading
        .get(modelPath)
        .then((sourceModel) => {
          const model = this.prepareCharacter(
            sourceModel.clone(true)
          );

          kart.add(model);
        })
        .catch(() => {
          this.addGenericCharacter(kart);
        });

      return;
    }

    const loadingPromise = new Promise(
      (resolve, reject) => {
        gltfLoader.load(
          modelPath,

          (gltf) => {
            console.log(
              'MODEL BERHASIL DIMUAT:',
              modelPath
            );

            if (!gltf.scene) {
              reject(
                new Error(
                  'GLB tidak mempunyai scene'
                )
              );

              return;
            }

            modelCache.set(
              modelPath,
              gltf.scene
            );

            resolve(gltf.scene);
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
        const model = this.prepareCharacter(
          sourceModel.clone(true)
        );

        kart.add(model);

        modelLoading.delete(modelPath);
      })
      .catch(() => {
        modelLoading.delete(modelPath);
        this.addGenericCharacter(kart);
      });
  }

  prepareCharacter(model) {
    model.visible = true;

    model.traverse((child) => {
      if (child.isMesh) {
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(model);

    const size = box.getSize(
      new THREE.Vector3()
    );

    const targetHeight = 2.35;

    if (size.y > 0) {
      const scale =
        targetHeight / size.y;

      model.scale.setScalar(scale);
    }

    const scaledBox =
      new THREE.Box3().setFromObject(model);

    const center =
      scaledBox.getCenter(
        new THREE.Vector3()
      );

    model.position.x -= center.x;
    model.position.z -= center.z;

    const bottomBox =
      new THREE.Box3().setFromObject(model);

    model.position.y -= bottomBox.min.y;

    model.position.y = 0.95;
    model.position.z = -0.35;

    model.rotation.set(0, 0, 0);

    return model;
  }

  reset(position, heading) {
    this.mesh.position.copy(position);

    this.heading = heading;

    this.mesh.rotation.y =
      this.heading;

    this.speed = 0;
    this.lap = 0;
    this.progress = 0;
    this.previousProgress = 0;
    this.lapArmed = false;
    this.lapCheckpointPassed = false;
    this.finished = false;
    this.boost = 100;
  }

  updatePlayer(dt, input, track) {
    const forward = input.down(
      'KeyW',
      'ArrowUp',
      'w',
      'arrowup'
    );

    const backward = input.down(
      'KeyS',
      'ArrowDown',
      's',
      'arrowdown'
    );

    const left = input.down(
      'KeyA',
      'ArrowLeft',
      'a',
      'arrowleft'
    );

    const right = input.down(
      'KeyD',
      'ArrowRight',
      'd',
      'arrowright'
    );

    const boosting =
      input.down(
        'ShiftLeft',
        'ShiftRight',
        'Space',
        'shift'
      ) &&
      this.boost > 0 &&
      this.speed > 2;

    // GAS
    if (forward) {
      this.speed +=
        this.acceleration * dt;
    }

    // REM / MUNDUR
    if (backward) {
      if (this.speed > 0) {
        this.speed -=
          this.acceleration *
          1.5 *
          dt;
      } else {
        this.speed -=
          this.acceleration *
          0.75 *
          dt;
      }
    }

    // FRICTION
    if (!forward && !backward) {
      this.speed *= Math.pow(
        0.985,
        dt * 60
      );
    }

    // BOOST
    const topSpeed =
      this.maxSpeed *
      (
        boosting
          ? 1.65 * this.boostPower
          : 1
      );

    if (boosting) {
      this.speed +=
        this.acceleration *
        1.8 *
        dt;

      this.boost -=
        35 * dt;

      if (this.boost < 0) {
        this.boost = 0;
      }
    } else {
      this.boost =
        Math.min(
          100,
          this.boost +
          8 * dt
        );
    }

    this.speed =
      THREE.MathUtils.clamp(
        this.speed,
        -6,
        topSpeed
      );

    // STEERING
    let steer = 0;

    if (left) {
      steer = -1;
    }

    if (right) {
      steer = 1;
    }

    const steeringStrength =
      THREE.MathUtils.clamp(
        Math.abs(this.speed) / 8,
        0.25,
        1
      );

    if (
      steer !== 0 &&
      Math.abs(this.speed) > 0.15
    ) {
      const direction =
        this.speed >= 0
          ? 1
          : -1;

      const turnRate =
        1.65 *
        this.handling *
        steeringStrength;

      this.heading -=
        steer *
        turnRate *
        dt *
        direction;
    }

    this.move(dt, track);
  }

  updateAI(dt, track, target) {
    if (this.finished) {
      return;
    }

    const direction =
      target
        .clone()
        .sub(this.mesh.position)
        .normalize();

    const desiredHeading =
      Math.atan2(
        direction.x,
        direction.z
      );

    let difference =
      desiredHeading -
      this.heading;

    while (difference > Math.PI) {
      difference -= Math.PI * 2;
    }

    while (difference < -Math.PI) {
      difference += Math.PI * 2;
    }

    this.heading +=
      THREE.MathUtils.clamp(
        difference,
        -1.5 * dt,
        1.5 * dt
      );

    this.speed +=
      this.acceleration * dt;

    this.speed =
      Math.min(
        this.speed,
        this.maxSpeed * 0.82
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
        Math.min(
          dt * 1.8,
          1
        )
      );

      this.speed *= 0.75;
    }

    this.mesh.rotation.y =
      this.heading;

    this.mesh.traverse(
      (object) => {
        if (object.userData.wheel) {
          // Ban berputar pada sumbu aslinya (X),
          // bukan sumbu Y.
          object.rotation.x -=
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

    // Kart wajib melewati checkpoint setelah garis start
    // sebelum crossing berikutnya boleh dihitung sebagai lap.
    // Ini mencegah posisi grid yang berada dekat garis start
    // langsung dianggap sudah menyelesaikan satu putaran.
    if (
      !this.lapCheckpointPassed &&
      this.progress > 0.30 &&
      this.progress < 0.70 &&
      this.speed > 1
    ) {
      this.lapCheckpointPassed = true;
    }

    // Lap hanya bertambah saat benar-benar melewati
    // garis start/finish dari arah balapan yang benar.
    if (
      this.lapCheckpointPassed &&
      this.previousProgress > 0.85 &&
      this.progress < 0.15 &&
      this.speed > 2
    ) {
      this.lap++;
      this.lapCheckpointPassed = false;
    }
  }

  score() {
    return this.finished
      ? 9999 + this.lap
      : this.lap +
        this.progress;
  }
}
