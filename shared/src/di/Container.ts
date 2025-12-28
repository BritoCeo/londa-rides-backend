import 'reflect-metadata';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';

/**
 * Dependency injection container wrapper
 */
export class Container {
  private static instance: DependencyContainer = container;

  /**
   * Get the container instance
   */
  public static getInstance(): DependencyContainer {
    return this.instance;
  }

  /**
   * Register a singleton
   */
  public static registerSingleton<T>(token: InjectionToken<T>, implementation: any): void {
    this.instance.registerSingleton(token, implementation);
  }

  /**
   * Register a transient (new instance each time)
   */
  public static register<T>(token: InjectionToken<T>, implementation: any): void {
    this.instance.register(token, implementation);
  }

  /**
   * Resolve a dependency
   */
  public static resolve<T>(token: InjectionToken<T>): T {
    return this.instance.resolve<T>(token);
  }

  /**
   * Check if a token is registered
   */
  public static isRegistered(token: InjectionToken<any>): boolean {
    return this.instance.isRegistered(token);
  }

  /**
   * Register an instance (for singletons that are already created)
   */
  public static registerInstance<T>(token: InjectionToken<T>, instance: T): void {
    this.instance.register(token, {
      useValue: instance
    });
  }

  /**
   * Clear all registrations
   */
  public static clear(): void {
    this.instance.clearInstances();
  }
}

