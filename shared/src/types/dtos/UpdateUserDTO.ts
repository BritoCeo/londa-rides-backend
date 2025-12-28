/**
 * Data Transfer Object for updating a user
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  notificationToken?: string;
}

/**
 * Factory method to create DTO from request body
 */
export class UpdateUserDTOFactory {
  public static fromRequest(body: any): UpdateUserDTO {
    return {
      name: body.name,
      email: body.email,
      notificationToken: body.notification_token || body.notificationToken
    };
  }
}

