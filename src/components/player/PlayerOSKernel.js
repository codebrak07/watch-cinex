// PlayerOSKernel.js - Central Service Container (Dependency Injection Framework)

class ServiceContainer {
  constructor() {
    this.services = {};
  }

  // Register a service or dependency
  register(name, concreteInstance) {
    if (this.services[name]) {
      console.warn(`[PlayerOSKernel] Service "${name}" is already registered. Overwriting.`);
    }
    this.services[name] = concreteInstance;
    console.log(`[PlayerOSKernel] Registered Service: ${name}`);
  }

  // Get/Inject a registered service
  get(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(`[PlayerOSKernel] Service "${name}" is not registered in the container.`);
    }
    return service;
  }

  // Clear all registered services
  clear() {
    this.services = {};
  }
}

export const kernel = new ServiceContainer();
