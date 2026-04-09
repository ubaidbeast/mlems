import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

type ClerkEmailAddress = {
    id: string;
    email_address: string;
};

type ClerkUserPayload = {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email_addresses?: ClerkEmailAddress[];
    primary_email_address_id?: string | null;
    created_at?: number;
    updated_at?: number;
};

type ClerkWebhookEvent =
    | {
          type: "user.created" | "user.updated";
          data: ClerkUserPayload;
      }
    | {
          type: "user.deleted";
          data: {
              id: string;
          };
      };

function getPrimaryEmail(user: ClerkUserPayload) {
    const emailAddresses = user.email_addresses ?? [];

    if (emailAddresses.length === 0) {
        return null;
    }

    const primaryEmail = emailAddresses.find((emailAddress) => {
        return emailAddress.id === user.primary_email_address_id;
    });

    return primaryEmail?.email_address ?? emailAddresses[0]?.email_address ?? null;
}

export async function POST(req: NextRequest) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
        return NextResponse.json({ error: "missing webhook secret" }, { status: 500 });
    }

    const payload = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "missing webhook headers" }, { status: 400 });
    }

    let event: ClerkWebhookEvent;

    try {
        event = new Webhook(secret).verify(payload, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as ClerkWebhookEvent;
    } catch {
        return NextResponse.json({ error: "invalid webhook signature" }, { status: 400 });
    }

    try {
        if (event.type === "user.deleted") {
            await db.delete(users).where(eq(users.clerkId, event.data.id));

            return NextResponse.json({ data: { id: event.data.id } });
        }

        const createdAt = event.data.created_at ? new Date(event.data.created_at) : new Date();
        const updatedAt = event.data.updated_at ? new Date(event.data.updated_at) : new Date();

        await db
            .insert(users)
            .values({
                id: createId(),
                clerkId: event.data.id,
                firstName: event.data.first_name ?? null,
                lastName: event.data.last_name ?? null,
                email: getPrimaryEmail(event.data),
                createdAt,
                updatedAt,
            })
            .onConflictDoUpdate({
                target: users.clerkId,
                set: {
                    createdAt,
                    firstName: event.data.first_name ?? null,
                    lastName: event.data.last_name ?? null,
                    email: getPrimaryEmail(event.data),
                    updatedAt,
                },
            });

        return NextResponse.json({ data: { id: event.data.id } });
    } catch {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}