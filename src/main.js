import * as THREE from 'three';
import { characters } from './data/characters.js';
import { baliCircuit } from './data/circuits.js';
import { Input } from './game/Input.js';
import { Race } from './game/Race.js';
import { Hud } from './ui/Hud.js';

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x68c8ed);
scene.fog = new THREE.Fog(
  0x68c8ed,
  55,
  180
);

const camera = new THREE.PerspectiveCamera(
  62,
  innerWidth / innerHeight,
  0.1,
  300
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setPixelRatio(
  Math.min(devicePixelRatio, 2)
);

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.1;

document
  .querySelector('#app')
  .prepend(renderer.domElement);

scene.add(
  new THREE.HemisphereLight(
    0xe9faff,
    0x315327,
    2.7
  )
);

const sun = new THREE.DirectionalLight(
  0xffefc4,
  2.5
);

sun.position.set(
  35,
  55,
  18
);

sun.castShadow = true;

sun.shadow.mapSize.set(
  1024,
  1024
);

sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;

scene.add(sun);

const input = new Input();
const hud = new Hud();

let race = null;
let selectedCharacter = characters[0];

function state(kind) {
  const count =
    document.querySelector('#countdown');

  if (
    kind === 'countdown' ||
    kind === 'go'
  ) {
    count.textContent =
      kind === 'go'
        ? 'GO!'
        : race.count;

    count.classList.add('show');

    return;
  }

  if (kind === 'clear') {
    count.classList.remove('show');
    return;
  }

  if (kind === 'finished') {
    count.classList.remove('show');

    document
      .querySelector('#hud')
      .classList.add('hidden');

    document
      .querySelector('#results')
      .classList.remove('hidden');

    document.querySelector(
      '#result-list'
    ).innerHTML = race
      .rankings()
      .map(
        (kart, index) => `
          <li class="${
            kart.isPlayer ? 'me' : ''
          }">
            <b>${index + 1}</b>
            <span>
              ${kart.character.avatar}
              ${kart.character.name}
            </span>
            <em>
              ${kart.isPlayer ? 'ANDA' : 'AI'}
            </em>
          </li>
        `
      )
      .join('');
  }
}

function createRace() {
  if (race) {
    race = null;
  }

  const roster = [
    selectedCharacter,
    ...characters.filter(
      (character) =>
        character.id !== selectedCharacter.id
    )
  ];

  race = new Race({
    scene,
    camera,
    input,
    circuit: baliCircuit,
    characters: roster,

    onUpdate: (currentRace) => {
      hud.update(currentRace);

      const kart =
        currentRace.karts[0];

      camera.fov =
        62 +
        (kart.boost < 99 ? 7 : 0);

      camera.updateProjectionMatrix();
    },

    onState: state
  });
}

function showMenu() {
  document
    .querySelector('#results')
    .classList.add('hidden');

  document
    .querySelector('#character-select')
    .classList.add('hidden');

  document
    .querySelector('#hud')
    .classList.add('hidden');

  document
    .querySelector('#menu')
    .classList.remove('hidden');
}

function renderCharacters() {
  const container =
    document.querySelector(
      '#character-cards'
    );

  container.innerHTML = characters
    .map(
      (character) => `
        <article
          class="character-card ${
            character.id ===
            selectedCharacter.id
              ? 'selected'
              : ''
          }"
          data-id="${character.id}"
        >
          <b>
            ${character.avatar}
            ${character.name}
          </b>

          <span>
            ${character.category}
          </span>

          <div class="stats">
            Speed ${character.speed}
            · Acceleration ${character.acceleration}
            · Handling ${character.handling}
            · Boost ${character.boost}
          </div>
        </article>
      `
    )
    .join('');

  document
    .querySelectorAll('.character-card')
    .forEach((card) => {
      card.onclick = () => {
        const character =
          characters.find(
            (item) =>
              item.id ===
              card.dataset.id
          );

        if (!character) {
          return;
        }

        selectedCharacter = character;
        renderCharacters();
      };
    });
}

document.querySelector(
  '#choose-character'
).onclick = () => {
  renderCharacters();

  document
    .querySelector('#menu')
    .classList.add('hidden');

  document
    .querySelector('#character-select')
    .classList.remove('hidden');
};

document.querySelector(
  '#character-back'
).onclick = () => {
  document
    .querySelector('#character-select')
    .classList.add('hidden');

  document
    .querySelector('#menu')
    .classList.remove('hidden');
};

document.querySelector(
  '#choose-circuit'
).onclick = () => {
  alert(
    'Bali Circuit tersedia pada prototype ini.'
  );
};

document.querySelector(
  '#settings'
).onclick = () => {
  alert(
    'Pengaturan akan tersedia pada tahap berikutnya.'
  );
};

document.querySelector(
  '#start'
).onclick = () => {
  createRace();

  document
    .querySelector('#menu')
    .classList.add('hidden');

  document
    .querySelector('#results')
    .classList.add('hidden');

  document
    .querySelector('#hud')
    .classList.remove('hidden');

  race.start();
};

document.querySelector(
  '#restart'
).onclick = () => {
  createRace();

  document
    .querySelector('#results')
    .classList.add('hidden');

  document
    .querySelector('#hud')
    .classList.remove('hidden');

  race.start();
};

addEventListener(
  'resize',
  () => {
    camera.aspect =
      innerWidth / innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      innerWidth,
      innerHeight
    );
  }
);

renderer.setAnimationLoop(() => {
  if (race) {
    race.update();
  }

  renderer.render(
    scene,
    camera
  );
});