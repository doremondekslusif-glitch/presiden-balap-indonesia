export class Hud {
  constructor() {
    this.$ = (selector) =>
      document.querySelector(selector);

    this.map = this.$('#map');
    this.ctx = this.map.getContext('2d');

    // Ikon wajah karakter dirender dari model GLB
    // dan dipakai sebagai marker di minimap.
    this.characterIcons = new Map();
  }

  setCharacterIcon(characterId, imageSource) {
    if (!characterId || !imageSource) {
      return;
    }

    const image = new Image();

    image.onload = () => {
      this.characterIcons.set(characterId, image);
    };

    image.src = imageSource;
  }

  update(race) {
    const player = race.karts[0];
    const rank =
      race.rankings().indexOf(player) + 1;

    this.$('#position').innerHTML =
      `${rank}<small>/${race.karts.length}</small>`;

    this.$('#lap').textContent =
      `LAP ${Math.min(
        player.lap + 1,
        race.circuit.laps
      )}/${race.circuit.laps}`;

    this.$('#speed').textContent =
      String(
        Math.round(Math.abs(player.speed) * 8)
      ).padStart(3, '0');

    this.$('#boost-fill').style.width =
      player.boost + '%';

    const t = race.elapsed;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 1000);

    this.$('#timer').textContent =
      `${String(m).padStart(2, '0')}:${String(
        s
      ).padStart(2, '0')}.${String(
        ms
      ).padStart(3, '0')}`;

    this.drawMap(race, player);
  }

  drawMap(race, player) {
    const c = this.ctx;
    const w = this.map.width;
    const h = this.map.height;

    c.clearRect(0, 0, w, h);

    const pts = race.track.points;

    c.strokeStyle = '#f4c542';
    c.lineWidth = 5;
    c.beginPath();

    pts.forEach((q, i) => {
      const x = w / 2 + q.x * 1.35;
      const y = h / 2 + q.z * 1.35;

      if (i) {
        c.lineTo(x, y);
      } else {
        c.moveTo(x, y);
      }
    });

    c.closePath();
    c.stroke();

    race.karts.forEach((kart) => {
      const x =
        w / 2 +
        kart.mesh.position.x * 1.35;

      const y =
        h / 2 +
        kart.mesh.position.z * 1.35;

      const icon =
        this.characterIcons.get(
          kart.character.id
        );

      const radius =
        kart === player ? 11 : 9;

      if (icon && icon.complete) {
        c.save();

        c.beginPath();
        c.arc(
          x,
          y,
          radius,
          0,
          Math.PI * 2
        );
        c.clip();

        c.drawImage(
          icon,
          x - radius,
          y - radius,
          radius * 2,
          radius * 2
        );

        c.restore();

        c.beginPath();
        c.arc(
          x,
          y,
          radius,
          0,
          Math.PI * 2
        );

        c.lineWidth =
          kart === player ? 2.5 : 1.5;

        c.strokeStyle =
          kart === player
            ? '#f5c541'
            : '#ffffff';

        c.stroke();
      } else {
        c.fillStyle =
          kart === player
            ? '#e63946'
            : '#e9eef5';

        c.beginPath();

        c.arc(
          x,
          y,
          kart === player ? 5 : 3,
          0,
          Math.PI * 2
        );

        c.fill();
      }
    });
  }
}
