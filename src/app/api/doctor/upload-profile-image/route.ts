import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("profileImage") as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file uploaded" },
      { status: 400 }
    );
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileExt = file.name.split(".").pop();
  const fileName = `profile-images/${uuidv4()}.${fileExt}`;
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("S3 upload error", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
