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

    this.maxSpeed =
      15 * (character.speed ?? 1);

    this.acceleration =
      8 * (character.acceleration ?? 1);

    this.handling =
      character.handling ?? 1;

    this.boostPower =
      character.boost ?? 1;

    this.mesh = this.makeMesh();
  }

  makeMesh() {
    const kart = new THREE.Group();

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

    // BODY
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.42, 3.35),
      paint
    );

    body.position.y = 0.62;
    body.castShadow = true;
    body.receiveShadow = true;

    kart.add(body);

    // NOSE
    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.28, 0.7),
      paint
    );

    nose.position.set(0, 0.56, 1.88);
    nose.castShadow = true;

    kart.add(nose);

    // BUMPER
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(2.38, 0.16, 0.22),
      black
    );

    bumper.position.set(0, 0.43, 2.23);

    kart.add(bumper);

    // SPOILER
    const spoiler = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.16, 0.35),
      paint
    );

    spoiler.position.set(0, 1.32, -1.5);

    kart.add(spoiler);

    // SPOILER POSTS
    for (const x of [-0.9, 0.9]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.7, 0.1),
        black
      );

      post.position.set(x, 1.02, -1.43);

      kart.add(post);
    }

    // SEAT
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.66, 1.05),
      black
    );

    seat.position.set(0, 1.0, -0.22);
    seat.castShadow = true;

    kart.add(seat);

    // WHEELS
    for (const x of [-0.9, 0.9]) {
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

    steering.position.set(
      0,
      1.36,
      0.62
    );

    kart.add(steering);

    // CHARACTER
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

    const torso = new THREE.Mesh(
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

    const head = new THREE.Mesh(
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
        black
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
    console.log(
      'LOAD CHARACTER:',
      modelPath
    );

    gltfLoader.load(
      modelPath,

      (gltf) => {
        console.log(
          'MODEL BERHASIL DIMUAT:',
          modelPath
        );

        const model =
          this.prepareCharacter(
            gltf.scene
          );

        kart.add(model);
      },

      undefined,

      (error) => {
        console.error(
          'GAGAL LOAD MODEL:',
          modelPath,
          error
        );

        this.addGenericCharacter(kart);
      }
    );
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

    const box =
      new THREE.Box3().setFromObject(
        model
      );

    const size =
      box.getSize(
        new THREE.Vector3()
      );

    const targetHeight = 2.35;

    if (size.y > 0) {
      const scale =
        targetHeight / size.y;

      model.scale.setScalar(scale);
    }

    const scaledBox =
      new THREE.Box3().setFromObject(
        model
      );

    const center =
      scaledBox.getCenter(
        new THREE.Vector3()
      );

    model.position.x -= center.x;
    model.position.z -= center.z;

    const bottomBox =
      new THREE.Box3().setFromObject(
        model
      );

    model.position.y -= bottomBox.min.y;

    model.position.y = 0.95;
    model.position.z = -0.35;

    model.rotation.set(0, 0, 0);

    return model;
  }

  reset(position, heading) {
    this.mesh.position.copy(position);

    this.mesh.rotation.y = heading;

    this.heading = heading;

    this.speed = 0;

    this.lap = 0;

    this.progress = 0;

    this.previousProgress = 0;

    this.finished = false;

    this.boost = 100;
  }

  updatePlayer(dt, input, track) {
    const forward =
      input.keys.has('KeyW') ||
      input.keys.has('ArrowUp') ||
      input.keys.has('w') ||
      input.keys.has('arrowup');

    const backward =
      input.keys.has('KeyS') ||
      input.keys.has('ArrowDown') ||
      input.keys.has('s') ||
      input.keys.has('arrowdown');

    const left =
      input.keys.has('KeyA') ||
      input.keys.has('ArrowLeft') ||
      input.keys.has('a') ||
      input.keys.has('arrowleft');

    const right =
      input.keys.has('KeyD') ||
      input.keys.has('ArrowRight') ||
      input.keys.has('d') ||
      input.keys.has('arrowright');

    const boosting =
      (
        input.keys.has('ShiftLeft') ||
        input.keys.has('ShiftRight') ||
        input.keys.has('Space') ||
        input.keys.has('shift') ||
        input.keys.has(' ')
      ) &&
      this.boost > 0 &&
      this.speed > 2;

    if (forward) {
      this.speed +=
        this.acceleration * dt;
    }

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

    if (!forward && !backward) {
      this.speed *=
        Math.pow(
          0.985,
          dt * 60
        );
    }

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
          this.boost + 8 * dt
        );
    }

    this.speed =
      THREE.MathUtils.clamp(
        this.speed,
        -6,
        topSpeed
      );

    // BELok
    let steer = 0;

    // A / LEFT
    if (left) {
      steer -= 1;
    }

    // D / RIGHT
    if (right) {
      steer += 1;
    }

    const steeringStrength =
      THREE.MathUtils.clamp(
        Math.abs(this.speed) / 8,
        0.25,
        1
      );

    if (steer !== 0) {
      this.heading +=
        steer *
        1.65 *
        this.handling *
        steeringStrength *
        dt *
        Math.sign(
          this.speed || 1
        );
    }

    this.move(
      dt,
      track
    );
  }

  updateAI(dt, track, target) {
    if (this.finished) {
      return;
    }

    const targetPoint =
      target.clone();

    const direction =
      targetPoint
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

    this.move(
      dt,
      track
    );
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
        if (object.userData.wheel) {
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
      this.previousProgress > 0.88 &&
      this.progress < 0.12 &&
      this.speed > 2
    ) {
      this.lap++;
    }
  }

  score() {
    return this.finished
      ? 9999 + this.lap
      : this.lap + this.progress;
  }
}
