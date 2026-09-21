import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

const previewContainer =
  document.querySelector('#character-preview');

const previewScene = new THREE.Scene();
previewScene.background = new THREE.Color(0x061525);

const previewCamera = new THREE.PerspectiveCamera(
  35,
  1,
  0.1,
  100
);

previewCamera.position.set(4.2, 2.8, 6);

const previewRenderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

previewRenderer.setPixelRatio(
  Math.min(devicePixelRatio, 2)
);

previewRenderer.toneMapping =
  THREE.ACESFilmicToneMapping;

previewRenderer.toneMappingExposure = 1.15;

previewContainer.appendChild(
  previewRenderer.domElement
);

previewScene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x182638,
    2.8
  )
);

const previewLight = new THREE.DirectionalLight(
  0xffedc4,
  3
);

previewLight.position.set(3, 6, 4);
previewScene.add(previewLight);

const previewFloor = new THREE.Mesh(
  new THREE.CylinderGeometry(1.65, 1.65, 0.16, 48),
  new THREE.MeshStandardMaterial({
    color: 0x173b58,
    roughness: 0.65,
    metalness: 0.15
  })
);

previewFloor.position.y = -0.08;
previewScene.add(previewFloor);

const previewLoader = new GLTFLoader();
let previewModel = null;
let previewRequest = 0;

function resizeCharacterPreview() {
  const width = Math.max(
    1,
    previewContainer.clientWidth
  );

  const height = Math.max(
    1,
    previewContainer.clientHeight
  );

  previewCamera.aspect = width / height;
  previewCamera.updateProjectionMatrix();

  previewRenderer.setSize(
    width,
    height,
    false
  );
}

function showCharacterPreview(character) {
  previewRequest++;

  const requestId = previewRequest;

  if (previewModel) {
    previewScene.remove(previewModel);
    previewModel = null;
  }

  document.querySelector(
    '#character-preview-name'
  ).textContent = character.name;

  if (!character.model) {
    return;
  }

  previewLoader.load(
    character.previewModel || character.model,
    (gltf) => {
      if (requestId !== previewRequest) {
        return;
      }

      const model = gltf.scene;

      model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());

      if (size.y > 0) {
        model.scale.setScalar(3.0 / size.y);
      }

      const scaledBox =
        new THREE.Box3().setFromObject(model);

      const center =
        scaledBox.getCenter(new THREE.Vector3());

      model.position.x -= center.x;
      model.position.z -= center.z;

      const groundedBox =
        new THREE.Box3().setFromObject(model);

      model.position.y -= groundedBox.min.y;

      previewModel = model;
      previewScene.add(previewModel);

      previewCamera.lookAt(0, 1.35, 0);
    }
  );
}


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
    race.karts.forEach((kart) => {
      scene.remove(kart.mesh);
    });

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

  showCharacterPreview(selectedCharacter);

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

    resizeCharacterPreview();
  }
);

renderer.setAnimationLoop(() => {
  if (race) {
    race.update();
  }

  if (previewModel) {
    previewModel.rotation.y += 0.006;
  }

  renderer.render(
    scene,
    camera
  );

  previewRenderer.render(
    previewScene,
    previewCamera
  );
});

resizeCharacterPreview();
showCharacterPreview(selectedCharacter);
