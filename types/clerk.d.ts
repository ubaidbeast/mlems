import type { AppRole } from "@/lib/roles";

declare module "@clerk/types" {
    interface CustomJwtSessionClaims {
        metadata?: {
            role?: AppRole;
        };
        publicMetadata?: {
            role?: AppRole;
        };
        public_metadata?: {
            role?: AppRole;
        };
        role?: AppRole;
    }
}
