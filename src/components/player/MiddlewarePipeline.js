// MiddlewarePipeline.js - Runs EventBus signals through middleware pipelines

export class MiddlewarePipeline {
  constructor() {
    this.middlewares = [];
  }

  // Register a middleware interceptor function
  use(fn) {
    this.middlewares.push(fn);
  }

  // Execute middleware chain
  run(event, data, next) {
    let index = 0;
    const execute = (i) => {
      if (i < this.middlewares.length) {
        try {
          this.middlewares[i](event, data, () => execute(i + 1));
        } catch (err) {
          console.error(`[MiddlewarePipeline] Error running index ${i}:`, err);
          execute(i + 1); // Fail-safe fallback continuation
        }
      } else {
        next();
      }
    };
    execute(0);
  }
}

export const pipeline = new MiddlewarePipeline();

// Standard validation middleware
pipeline.use((event, data, next) => {
  // console.log(`[Middleware] Event log: ${event}`, data);
  next();
});
