import * as THREE from 'three';
import { Track } from './Track.js';
import { Kart } from './Kart.js?v=2';

export class Race {
  constructor({
    scene,
    camera,
    input,
    circuit,
    characters,
    onUpdate,
    onState
  }) {
    this.scene = scene;
    this.camera = camera;
    this.input = input;

    this.track = new Track(scene, circuit);
    this.circuit = circuit;

    this.karts = characters.map(
      (character, index) =>
        new Kart(
          character,
          index === 0
        )
    );

    this.karts.forEach((kart) => {
      scene.add(kart.mesh);
    });

    this.onUpdate = onUpdate;
    this.onState = onState;

    this.clock = new THREE.Clock();

    this.state = 'menu';
    this.elapsed = 0;
    this.count = 3;

    this.finishOrder = [];

    this.setup();
  }

  setup() {
    const point =
      this.track.point(0);

    const tangent =
      this.track.curve.getTangentAt(0);

    const heading =
      Math.atan2(
        tangent.x,
        tangent.z
      );

    const side =
      new THREE.Vector3(
        -tangent.z,
        0,
        tangent.x
      );

    this.finishOrder = [];

    this.karts.forEach(
      (kart, index) => {
        kart.finished = false;

        const startPosition =
          point
            .clone()
            .addScaledVector(
              tangent,
              -8 - index * 3
            )
            .addScaledVector(
              side,
              (index % 2 ? 1 : -1) * 2
            );

        kart.reset(
          startPosition,
          heading
        );

        kart.progress = 0;
        kart.lap = 1;
      }
    );
  }

  start() {
    this.setup();

    this.state =
      'countdown';

    this.count = 3;
    this.elapsed = 0;

    this.clock.start();

    this.onState(
      'countdown',
      this.count
    );

    setTimeout(() => {
      this.tickCountdown(2);
    }, 1000);
  }

  tickCountdown(n) {
    if (
      this.state !==
      'countdown'
    ) {
      return;
    }

    this.count = n;

    if (n > 0) {
      this.onState(
        'countdown',
        n
      );

      setTimeout(() => {
        this.tickCountdown(
          n - 1
        );
      }, 1000);
    } else {
      this.onState('go');

      this.state =
        'racing';

      setTimeout(() => {
        if (
          this.state ===
          'racing'
        ) {
          this.onState(
            'clear'
          );
        }
      }, 750);
    }
  }

  update() {
    const dt =
      Math.min(
        this.clock.getDelta(),
        0.05
      );

    if (
      this.state ===
      'racing'
    ) {
      this.elapsed += dt;

      const player =
        this.karts[0];

      player.updatePlayer(
        dt,
        this.input,
        this.track
      );

      this.checkFinish(
        player
      );

      this.karts
        .slice(1)
        .forEach(
          (kart, index) => {
            if (
              kart.finished
            ) {
              return;
            }

            kart.updateAI(
              dt,
              this.track,
              this.track.point(
                kart.progress +
                  0.018 +
                  index * 0.001
              )
            );

            this.checkFinish(
              kart
            );
          }
        );

      this.resolveKarts();

      if (
        player.finished
      ) {
        this.state =
          'finished';

        this.onState(
          'finished',
          this.rankings()
        );
      }
    }

    this.follow();

    this.onUpdate(this);
  }

  checkFinish(kart) {
    if (
      kart.finished
    ) {
      return;
    }

    if (
      kart.lap >=
      this.circuit.laps
    ) {
      kart.finished = true;

      if (
        !this.finishOrder.includes(
          kart
        )
      ) {
        this.finishOrder.push(
          kart
        );
      }
    }
  }

  resolveKarts() {
    for (
      let i = 0;
      i < this.karts.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < this.karts.length;
        j++
      ) {
        const a =
          this.karts[i];

        const b =
          this.karts[j];

        const distance =
          a.mesh.position.distanceTo(
            b.mesh.position
          );

        if (
          distance < 2.1
        ) {
          const normal =
            a.mesh.position
              .clone()
              .sub(
                b.mesh.position
              )
              .normalize();

          a.mesh.position.addScaledVector(
            normal,
            0.04
          );

          b.mesh.position.addScaledVector(
            normal,
            -0.04
          );

          a.speed *= 0.96;
          b.speed *= 0.96;
        }
      }
    }
  }

  rankings() {
    const unfinished =
      this.karts
        .filter(
          (kart) =>
            !this.finishOrder.includes(
              kart
            )
        )
        .sort(
          (a, b) =>
            this.progressScore(b) -
            this.progressScore(a)
        );

    return [
      ...this.finishOrder,
      ...unfinished
    ];
  }

  progressScore(kart) {
    return (
      kart.lap +
      kart.progress
    );
  }

  follow() {
    const player =
      this.karts[0];

    const position =
      player.mesh.position;

    const forward =
      new THREE.Vector3(
        Math.sin(
          player.heading
        ),
        0,
        Math.cos(
          player.heading
        )
      );

    const wanted =
      position
        .clone()
        .addScaledVector(
          forward,
          -10
        )
        .add(
          new THREE.Vector3(
            0,
            6,
            0
          )
        );

    this.camera.position.lerp(
      wanted,
      0.09
    );

    this.camera.lookAt(
      position
        .clone()
        .addScaledVector(
          forward,
          7
        )
        .add(
          new THREE.Vector3(
            0,
            1,
            0
          )
        )
    );
  }
}
