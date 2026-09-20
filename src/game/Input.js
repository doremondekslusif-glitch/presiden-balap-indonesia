export class Input {
  constructor() {
    this.keys = new Set();

    addEventListener('keydown', (e) => {
      // Simpan format event.code
      this.keys.add(e.code);

      // Simpan juga format e.key yang dinormalisasi
      this.keys.add(
        e.key.toLowerCase()
      );

      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Space'
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
    });

    addEventListener('keyup', (e) => {
      this.keys.delete(e.code);

      this.keys.delete(
        e.key.toLowerCase()
      );
    });

    addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  down(...keys) {
    return keys.some((key) => {
      return (
        this.keys.has(key) ||
        this.keys.has(
          key.toLowerCase()
        )
      );
    });
  }
}
