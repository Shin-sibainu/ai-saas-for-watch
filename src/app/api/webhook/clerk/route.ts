import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// PrismaClientのインスタンスをグローバルに保持（ホットリロード対策）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, ...attributes } = evt.data;
    const email = email_addresses[0].email_address;

    try {
      // ユーザーをデータベースに作成
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email: email,
          credits: 10, // デフォルトクレジット
          subscriptionStatus: 'FREE'
        },
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0].email_address;

    try {
      // ユーザー情報を更新
      const user = await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email,
        },
      });

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
      // ユーザーを削除
      const user = await prisma.user.delete({
        where: { clerkId: id },
      });

      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Error deleting user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}
