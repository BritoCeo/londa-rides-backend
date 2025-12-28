/**
 * Test helper utilities
 */
export class TestHelpers {
  /**
   * Create a mock logger
   */
  public static createMockLogger() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jestFn = (global as any).jest?.fn || (() => () => {});
    return {
      debug: jestFn(),
      info: jestFn(),
      warn: jestFn(),
      error: jestFn(),
    };
  }

  /**
   * Create test user data
   */
  public static createTestUserData() {
    return {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      userType: 'STUDENT' as const,
    };
  }

  /**
   * Wait for async operations
   */
  public static async wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      if (typeof setTimeout !== 'undefined') {
        setTimeout(resolve, ms);
      } else {
        resolve();
      }
    });
  }
}

