import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { characters } from './data/characters.js';
import { circuits } from './data/circuits.js';
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
let selectedCircuit = circuits[0];

const MUSIC = {
  home: './music home.mp3',
  'bali-circuit': './music bali track.mp3',
  'garuda-speedway': './music garuda speedway track.mp3',
  'merapi-mountain': './music merapi mountain track.mp3',
  'nusantara-ring': './music nusantara ring track.mp3',
  'raja-ampat-coast': './music raja ampat coast track.mp3'
};

const musicPlayer = new Audio();
musicPlayer.loop = true;
musicPlayer.preload = 'auto';
musicPlayer.autoplay = true;

// SFX countdown diputar sekali saat hitungan 3 dimulai.
// File ini berisi rangkaian suara hitungan mundur.
const COUNTDOWN_SFX = './3,2,1 Oldtime Countdown.mp3';

const countdownSfx = new Audio(COUNTDOWN_SFX);
countdownSfx.preload = 'auto';
countdownSfx.volume = 0.9;

// SFX klakson tiap karakter.
// SFX yang sama dipakai saat preview/pemilihan karakter
// dan saat karakter tersebut membunyikan klakson ketika balapan.
const HORN_SFX = {
  prabowo: './wowok sound.mp3',
  jokowi: './owi sound.mp3',
  bahlil: './bahlil sound.mp3',
  gibran: './gibran sound.mp3'
};

const hornSfxPlayers = new Map();

Object.entries(HORN_SFX).forEach(
  ([characterId, src]) => {
    const player = new Audio(src);
    player.preload = 'auto';
    player.volume = 0.9;
    hornSfxPlayers.set(characterId, player);
  }
);

const savedMusicVolume = Number(
  localStorage.getItem('musicVolume')
);

let musicVolume = Number.isFinite(savedMusicVolume)
  ? THREE.MathUtils.clamp(savedMusicVolume, 0, 1)
  : 0.7;

let musicMuted =
  localStorage.getItem('musicMuted') === 'true';

let currentMusicKey = null;

function applyMusicSettings() {
  musicPlayer.volume = musicMuted
    ? 0
    : musicVolume;

  const slider = document.querySelector('#music-volume');
  const output = document.querySelector('#music-volume-value');
  const mute = document.querySelector('#music-muted');

  if (slider) {
    slider.value = String(
      Math.round(musicVolume * 100)
    );
  }

  if (output) {
    output.textContent =
      `${Math.round(musicVolume * 100)}%`;
  }

  if (mute) {
    mute.checked = musicMuted;
  }
}

function playMusic(key) {
  const src = MUSIC[key];

  if (!src) {
    return;
  }

  if (currentMusicKey !== key) {
    musicPlayer.pause();
    musicPlayer.src = src;
    musicPlayer.currentTime = 0;
    currentMusicKey = key;
  }

  applyMusicSettings();

  musicPlayer.play().catch(() => {
    // Browser dapat menolak autoplay sebelum ada interaksi pengguna.
    // Listener interaksi pertama di bawah akan mencoba memutarnya lagi.
  });
}

function playHomeMusic() {
  playMusic('home');
}

function playCircuitMusic(circuit) {
  playMusic(circuit.id);
}

function stopMusic() {
  musicPlayer.pause();
  currentMusicKey = null;
}

function playCountdownSfx() {
  countdownSfx.pause();
  countdownSfx.currentTime = 0;
  countdownSfx.play().catch(() => {
    // Pemutaran diizinkan setelah pengguna menekan tombol MULAI BALAP.
  });
}

function stopCountdownSfx() {
  countdownSfx.pause();
  countdownSfx.currentTime = 0;
}

function playHornSfx(character = selectedCharacter) {
  const hornSfx =
    hornSfxPlayers.get(character?.id);

  if (!hornSfx) {
    return;
  }

  hornSfx.pause();
  hornSfx.currentTime = 0;
  hornSfx.play().catch(() => {
    // Browser dapat menolak pemutaran sampai ada interaksi pengguna.
  });
}

applyMusicSettings();

const previewContainer =
  document.querySelector('#character-preview');

// Render UI dasar secepat mungkin agar game langsung terlihat
// tanpa menunggu model 3D selesai dimuat.
document.querySelector('#menu').classList.remove('hidden');

const previewScene = new THREE.Scene();
previewScene.background = new THREE.Color(0x061525);

const previewCamera = new THREE.PerspectiveCamera(
  35,
  1,
  0.1,
  100
);

previewCamera.position.set(4.2, 2.8, 6);

let previewRenderer = null;

function ensurePreviewRenderer() {
  if (previewRenderer) {
    return;
  }

  previewRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  previewRenderer.setPixelRatio(
    Math.min(devicePixelRatio, 1.5)
  );

  previewRenderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  previewRenderer.toneMappingExposure = 1.15;

  previewContainer.appendChild(
    previewRenderer.domElement
  );
}

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
const previewCache = new Map();
let previewModel = null;
let mapIconRenderer = null;
let mapIconScene = null;
let mapIconCamera = null;
let previewRequest = 0;
let previewPreloadStarted = false;

function showInitialCharacterPreviewPlaceholder() {
  document.querySelector('#character-preview-name').textContent =
    selectedCharacter.name;

  ensurePreviewRenderer();
  previewRenderer.setClearColor(0x061525, 1);
  resizeCharacterPreview();
}

function resizeCharacterPreview() {
  if (!previewRenderer) {
    return;
  }

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

function preparePreviewScene(source) {
  const model = SkeletonUtils.clone(source);

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

  return model;
}

function loadPreviewAsset(character) {
  const url =
    character.previewModel || character.model;

  if (!url) {
    return Promise.resolve(null);
  }

  if (previewCache.has(url)) {
    return Promise.resolve(previewCache.get(url));
  }

  const promise = new Promise((resolve, reject) => {
    previewLoader.load(
      url,
      (gltf) => {
        previewCache.set(url, gltf.scene);
        resolve(gltf.scene);
      },
      undefined,
      reject
    );
  });

  previewCache.set(url, promise);
  return promise;
}

function ensureMapIconRenderer() {
  if (mapIconRenderer) {
    return;
  }

  mapIconRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });

  mapIconRenderer.setPixelRatio(1);
  mapIconRenderer.setSize(128, 128, false);
  mapIconRenderer.setClearColor(0x000000, 0);

  mapIconRenderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  mapIconRenderer.toneMappingExposure = 1.15;

  mapIconScene = new THREE.Scene();

  mapIconScene.add(
    new THREE.HemisphereLight(
      0xffffff,
      0x4a5b70,
      2.8
    )
  );

  const light =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  light.position.set(2, 5, 4);
  mapIconScene.add(light);

  mapIconCamera =
    new THREE.OrthographicCamera(
      -1.6,
      1.6,
      3.2,
      -0.2,
      0.1,
      20
    );

  mapIconCamera.position.set(
    0,
    1.5,
    6
  );

  mapIconCamera.lookAt(
    0,
    1.5,
    0
  );
}

async function createCharacterMapIcon(character) {
  const source =
    await loadPreviewAsset(character);

  if (!source) {
    return null;
  }

  ensureMapIconRenderer();

  const model =
    preparePreviewScene(source);

  mapIconScene.clear();

  mapIconScene.add(
    new THREE.HemisphereLight(
      0xffffff,
      0x4a5b70,
      2.8
    )
  );

  const light =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  light.position.set(2, 5, 4);
  mapIconScene.add(light);
  mapIconScene.add(model);

  // Framing mengikuti bounding box model supaya seluruh kepala/wajah
  // selalu masuk kamera, termasuk karakter yang bentuknya berbeda.
  const modelBox =
    new THREE.Box3().setFromObject(model);

  const modelSize =
    modelBox.getSize(new THREE.Vector3());

  const modelCenter =
    modelBox.getCenter(new THREE.Vector3());

  const viewSize =
    Math.max(modelSize.x, modelSize.y) * 1.12;

  const halfView =
    Math.max(viewSize / 2, 1.7);

  mapIconCamera.left = -halfView;
  mapIconCamera.right = halfView;
  mapIconCamera.top =
    modelCenter.y + halfView;
  mapIconCamera.bottom =
    modelCenter.y - halfView;
  mapIconCamera.updateProjectionMatrix();

  mapIconCamera.position.set(
    0,
    modelCenter.y,
    6
  );

  mapIconCamera.lookAt(
    0,
    modelCenter.y,
    0
  );

  mapIconRenderer.clear();
  mapIconRenderer.render(
    mapIconScene,
    mapIconCamera
  );

  // Buang ruang transparan di sekeliling model supaya
  // karakter benar-benar memenuhi area ikon, bukan terlihat kecil
  // dengan banyak ruang kosong di dalam bulatan.
  const sourceCanvas =
    mapIconRenderer.domElement;

  const cropCanvas =
    document.createElement('canvas');

  cropCanvas.width = 128;
  cropCanvas.height = 128;

  const cropContext =
    cropCanvas.getContext('2d');

  cropContext.clearRect(
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  cropContext.drawImage(
    sourceCanvas,
    0,
    0,
    128,
    128
  );

  const pixels =
    cropContext.getImageData(
      0,
      0,
      128,
      128
    ).data;

  let minX = 128;
  let minY = 128;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < 128; y += 1) {
    for (let x = 0; x < 128; x += 1) {
      const alpha =
        pixels[
          (y * 128 + x) * 4 + 3
        ];

      if (alpha > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX >= minX && maxY >= minY) {
    // Sisakan sedikit margin supaya wajah tidak terasa menempel
    // atau terpotong oleh tepi bulatan.
    const padding = 7;

    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(127, maxX + padding);
    maxY = Math.min(127, maxY + padding);

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    const fittedCanvas =
      document.createElement('canvas');

    fittedCanvas.width = 128;
    fittedCanvas.height = 128;

    const fittedContext =
      fittedCanvas.getContext('2d');

    const targetSize = 112;
    const scale =
      Math.min(
        targetSize / cropWidth,
        targetSize / cropHeight
      );

    const drawWidth = cropWidth * scale;
    const drawHeight = cropHeight * scale;

    fittedContext.clearRect(
      0,
      0,
      128,
      128
    );

    // Setiap karakter mendapat background berbeda berdasarkan warna kartunya.
    // Background dibuat sedikit lebih gelap agar wajah/model tetap terbaca.
    const iconColor = new THREE.Color(
      character.color ?? 0x2d5f7a
    );

    iconColor.lerp(
      new THREE.Color(0x061525),
      0.28
    );

    fittedContext.fillStyle =
      '#' + iconColor.getHexString();

    fittedContext.fillRect(
      0,
      0,
      128,
      128
    );

    fittedContext.drawImage(
      cropCanvas,
      minX,
      minY,
      cropWidth,
      cropHeight,
      (128 - drawWidth) / 2,
      (128 - drawHeight) / 2,
      drawWidth,
      drawHeight
    );

    const imageSource =
      fittedCanvas.toDataURL('image/png');

    mapIconScene.remove(model);

    return imageSource;
  }

  mapIconScene.remove(model);

  return sourceCanvas.toDataURL('image/png');
}

function preloadCharacterMapIcons() {
  characters.forEach((character, index) => {
    const loadIcon = () => {
      createCharacterMapIcon(character)
        .then((imageSource) => {
          if (imageSource) {
            hud.setCharacterIcon(
              character.id,
              imageSource
            );
          }
        })
        .catch(() => {
          // Jika ikon gagal dirender,
          // minimap tetap memakai marker cadangan.
        });
    };

    if (index === 0) {
      loadIcon();
    } else if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        loadIcon,
        { timeout: 1200 + index * 300 }
      );
    } else {
      setTimeout(
        loadIcon,
        250 * index
      );
    }
  });
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

  loadPreviewAsset(character)
    .then((source) => {
      if (
        requestId !== previewRequest ||
        !source
      ) {
        return;
      }

      previewModel = preparePreviewScene(source);
      previewScene.add(previewModel);
      previewCamera.lookAt(0, 1.35, 0);
    })
    .catch(() => {
      if (requestId === previewRequest) {
        document.querySelector(
          '#character-preview'
        ).classList.add('preview-error');
      }
    });
}

function preloadCharacterPreviews() {
  if (previewPreloadStarted) {
    return;
  }

  previewPreloadStarted = true;

  // Karakter terpilih dimuat lebih dulu. Sisanya dipanaskan
  // di background supaya saat kartu diklik model sudah tersedia.
  const ordered = [
    selectedCharacter,
    ...characters.filter(
      (character) =>
        character.id !== selectedCharacter.id
    )
  ];

  const warmNext = (index) => {
    if (index >= ordered.length) {
      return;
    }

    loadPreviewAsset(ordered[index])
      .catch(() => {})
      .finally(() => {
        const schedule =
          window.requestIdleCallback ||
          ((callback) => setTimeout(callback, 120));

        schedule(() => warmNext(index + 1));
      });
  };

  warmNext(0);
}


function state(kind, value) {
  const count =
    document.querySelector('#countdown');

  if (kind === 'countdown') {
    // SFX hanya dimulai sekali pada angka 3.
    if (value === 3) {
      playCountdownSfx();
    }

    count.textContent = race.count;
    count.classList.add('show');
    return;
  }

  if (kind === 'go') {
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
    stopCountdownSfx();
    playHomeMusic();

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
    circuit: selectedCircuit,
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

    onState: state,

    onHorn: (character) => {
      playHornSfx(character);
    }
  });
}

function showMenu() {
  stopCountdownSfx();
  playHomeMusic();

  document
    .querySelector('#results')
    .classList.add('hidden');

  document
    .querySelector('#character-select')
    .classList.add('hidden');

  document
    .querySelector('#circuit-select')
    .classList.add('hidden');

  document
    .querySelector('#settings-screen')
    .classList.add('hidden');

  document
    .querySelector('#hud')
    .classList.add('hidden');

  document
    .querySelector('#menu')
    .classList.remove('hidden');
}

function renderCircuits() {
  const container = document.querySelector('#circuit-cards');

  container.innerHTML = circuits.map((circuit) => `
    <article class="circuit-card ${circuit.id === selectedCircuit.id ? 'selected' : ''}" data-id="${circuit.id}">
      <div class="circuit-preview">
        <svg viewBox="0 0 240 120" aria-label="${circuit.name}">
          <polyline points="${circuit.points.map((p) => `${120 + p[0] * 1.9},${60 + p[2] * 1.25}`).join(' ')}" />
        </svg>
      </div>
      <div class="circuit-info">
        <b>${circuit.name}</b>
        <span>${Math.round(circuit.lapLength)}M / LAP · LEBAR ${circuit.width}M</span>
      </div>
    </article>
  `).join('');

  document.querySelector('#menu-circuit-name').textContent = selectedCircuit.name;
  document.querySelector('#minimap-circuit-name').textContent = selectedCircuit.name.toUpperCase();

  document.querySelectorAll('.circuit-card').forEach((card) => {
    card.onclick = () => {
      const circuit = circuits.find((item) => item.id === card.dataset.id);
      if (!circuit) return;
      selectedCircuit = circuit;
      renderCircuits();
    };
  });
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
  resizeCharacterPreview();

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

        playHornSfx(character);

        renderCharacters();
      };
    });
}

document.querySelector(
  '#choose-character'
).onclick = () => {
  renderCharacters();
  preloadCharacterPreviews();

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

document.querySelector('#choose-circuit').onclick = () => {
  playHomeMusic();
  renderCircuits();

  document.querySelector('#menu').classList.add('hidden');
  document.querySelector('#circuit-select').classList.remove('hidden');
};

document.querySelector('#circuit-back').onclick = () => {
  document.querySelector('#circuit-select').classList.add('hidden');
  document.querySelector('#menu').classList.remove('hidden');
};

document.querySelector(
  '#settings'
).onclick = () => {
  playHomeMusic();

  document
    .querySelector('#menu')
    .classList.add('hidden');

  document
    .querySelector('#settings-screen')
    .classList.remove('hidden');

  applyMusicSettings();
};

document.querySelector(
  '#settings-back'
).onclick = () => {
  document
    .querySelector('#settings-screen')
    .classList.add('hidden');

  document
    .querySelector('#menu')
    .classList.remove('hidden');

  playHomeMusic();
};

document.querySelector(
  '#music-volume'
).oninput = (event) => {
  musicVolume =
    Number(event.target.value) / 100;

  localStorage.setItem(
    'musicVolume',
    String(musicVolume)
  );

  applyMusicSettings();
};

document.querySelector(
  '#music-muted'
).onchange = (event) => {
  musicMuted = event.target.checked;

  localStorage.setItem(
    'musicMuted',
    String(musicMuted)
  );

  applyMusicSettings();

  if (!musicMuted) {
    playMusic(
      currentMusicKey || 'home'
    );
  }
};

document.querySelector(
  '#start'
).onclick = () => {
  createRace();
  playCircuitMusic(selectedCircuit);

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
  playCircuitMusic(selectedCircuit);

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

  if (previewRenderer) {
    previewRenderer.render(
      previewScene,
      previewCamera
    );
  }
});

showInitialCharacterPreviewPlaceholder();
preloadCharacterMapIcons();

// Coba mulai musik home segera saat game dibuka.
// Jika browser memblokir autoplay, interaksi pertama pengguna
// (klik/tap/tekan tombol) langsung membuka kunci pemutaran musik.
const unlockHomeMusic = () => {
  if (musicMuted) {
    return;
  }

  playHomeMusic();
};

window.addEventListener('pointerdown', unlockHomeMusic);
window.addEventListener('keydown', unlockHomeMusic);

playHomeMusic();
