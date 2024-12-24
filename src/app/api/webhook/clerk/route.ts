import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
      throw new Error(
        "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
      );
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      );
    }

    const payload = await req.json();
    if (!payload) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const body = JSON.stringify(payload);
    const wh = new Webhook(SIGNING_SECRET);

    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification error:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses } = evt.data;
      if (!email_addresses?.[0]?.email_address) {
        return NextResponse.json(
          { error: "No email address provided" },
          { status: 400 }
        );
      }

      const email = email_addresses[0].email_address;

      try {
        const user = await prisma.user.create({
          data: {
            clerkId: id,
            email: email,
            credits: 10,
            subscriptionStatus: "FREE",
          },
        });

        revalidatePath("/dashboard");
        return NextResponse.json({ user }, { status: 201 });
      } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
          { error: "Error creating user in database" },
          { status: 500 }
        );
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses } = evt.data;
      const email = email_addresses[0].email_address;

      try {
        const user = await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email,
          },
        });

        revalidatePath("/dashboard");

        return NextResponse.json({ user }, { status: 200 });
      } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
          { error: "Error updating user" },
          { status: 500 }
        );
      }
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      try {
        const user = await prisma.user.delete({
          where: { clerkId: id },
        });

        revalidatePath("/dashboard");

        return NextResponse.json({ user }, { status: 200 });
      } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
          { error: "Error deleting user" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
