export type UserWithRoles = { id: string; login: string; roles: string[] };

export type UserRoleRequest = Request & { user: UserWithRoles };

export type UserRoleSocket = { user: UserWithRoles };
