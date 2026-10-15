class Observer {
  listeners: {
    [eventName: string]: Array<(data?) => void>
  }

  constructor() {
    this.listeners = {};
  }

  subscribe(eventName, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  emit(event) {
    if (this.listeners[event.name]) {
      this.listeners[event.name].forEach((listener) => listener(event));
    }
  }
}

export default Observer;
