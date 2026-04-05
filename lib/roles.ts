export const APP_ROLES = ["admin", "employee"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const DEFAULT_APP_ROLE: AppRole = "employee";

type ClaimsWithRole = {
    metadata?: { role?: unknown };
    publicMetadata?: { role?: unknown };
    public_metadata?: { role?: unknown };
    role?: unknown;
};

export const isAppRole = (value: unknown): value is AppRole => {
    return APP_ROLES.includes(value as AppRole);
};

export const getRoleFromSessionClaims = (sessionClaims: unknown): AppRole => {
    const claims = (sessionClaims ?? {}) as ClaimsWithRole;

    const roleFromMetadata = claims.metadata?.role;
    if (isAppRole(roleFromMetadata)) {
        return roleFromMetadata;
    }

    const roleFromPublicMetadata = claims.publicMetadata?.role ?? claims.public_metadata?.role;
    if (isAppRole(roleFromPublicMetadata)) {
        return roleFromPublicMetadata;
    }

    if (isAppRole(claims.role)) {
        return claims.role;
    }

    return DEFAULT_APP_ROLE;
};

export const checkRole = (sessionClaims: unknown, role: AppRole): boolean => {
    return getRoleFromSessionClaims(sessionClaims) === role;
};

export const isAdmin = (sessionClaims: unknown): boolean => {
    return checkRole(sessionClaims, "admin");
};
