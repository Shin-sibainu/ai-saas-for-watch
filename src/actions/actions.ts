"use server";

import { GenerateImageState, RemoveBackgroundState } from "@/types/actions";
import { currentUser } from "@clerk/nextjs/server";
import { decrementUserCredits, getUserCredits } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function generateImage(
  state: GenerateImageState,
  formData: FormData
): Promise<GenerateImageState> {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("認証が必要です");
    }

    // クレジット残高をチェック
    const credits = await getUserCredits();
    if (credits === null || credits < 1) {
      throw new Error("クレジットが不足しています");
    }

    const keyword = formData.get("keyword");

    if (!keyword || typeof keyword !== "string") {
      return {
        status: "error",
        error: "キーワードを入力してください。",
      };
    }

    const response = await fetch(`${process.env.BASE_URL}/api/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    });

    const data = await response.json();

    // 生成成功後にクレジットを減らす
    await decrementUserCredits(user.id);

    // ダッシュボードのパスを再検証
    revalidatePath("/dashboard");

    return {
      status: "success",
      imageUrl: data.imageUrl,
      keyword: keyword,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      error: "画像の生成に失敗しました。",
    };
  }
}

export async function removeBackground(
  state: RemoveBackgroundState,
  formData: FormData
): Promise<RemoveBackgroundState> {
  const image = formData.get("image") as File;

  if (!image) {
    return {
      status: "error",
      error: "画像ファイルを選択してください。",
    };
  }

  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/remove-background`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("背景の削除に失敗しました。");
    }

    const data = await response.json();

    return {
      status: "success",
      processedImage: data.imageUrl,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      error: "背景の削除に失敗しました。",
    };
  }
}
