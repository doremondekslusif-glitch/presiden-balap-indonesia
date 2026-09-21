export class Input {
  constructor() {
    this.keys = new Set();

    this.handleKeyDown = (event) => {
      this.keys.add(event.code);

      if (event.key) {
        this.keys.add(
          event.key.toLowerCase()
        );
      }

      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Space'
        ].includes(event.code)
      ) {
        event.preventDefault();
      }
    };

    this.handleKeyUp = (event) => {
      this.keys.delete(event.code);

      if (event.key) {
        this.keys.delete(
          event.key.toLowerCase()
        );
      }
    };

    this.handleBlur = () => {
      this.keys.clear();
    };

    window.addEventListener(
      'keydown',
      this.handleKeyDown
    );

    window.addEventListener(
      'keyup',
      this.handleKeyUp
    );

    window.addEventListener(
      'blur',
      this.handleBlur
    );
  }

  down(...keys) {
    return keys.some((key) => {
      if (!key) {
        return false;
      }

      return (
        this.keys.has(key) ||
        this.keys.has(
          String(key).toLowerCase()
        )
      );
    });
  }

  destroy() {
    window.removeEventListener(
      'keydown',
      this.handleKeyDown
    );

    window.removeEventListener(
      'keyup',
      this.handleKeyUp
    );

    window.removeEventListener(
      'blur',
      this.handleBlur
    );

    this.keys.clear();
  }
}
