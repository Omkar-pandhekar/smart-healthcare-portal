import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable, { File as FormidableFile, Fields, Files } from "formidable";
import { ConnectDB } from "@/dbConfig/dbConfig";
import FileModel from "@/models/File.model";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function parseForm(
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ConnectDB();
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { fields, files } = await parseForm(req);
    let file = files.medicalFile as
      | FormidableFile
      | FormidableFile[]
      | undefined;
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }
    const fileData = fs.readFileSync(file.filepath);
    const fileName = `${Date.now()}_${file.originalFilename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: fileData,
      ContentType: file.mimetype || undefined,
    });
    await s3Client.send(command);

    const newFile = await FileModel.create({
      fileName: file.originalFilename,
      fileUrl: fileName,
      category: Array.isArray(fields.category)
        ? fields.category[0]
        : fields.category || undefined,
      owner: fields.owner,
      doctor: fields.doctor || undefined,
      fileType: file.mimetype,
      tags: fields.tags
        ? Array.isArray(fields.tags)
          ? fields.tags
          : [fields.tags]
        : undefined,
      sharedWith: fields.sharedWith
        ? Array.isArray(fields.sharedWith)
          ? fields.sharedWith
          : [fields.sharedWith]
        : undefined,
    });

    res
      .status(201)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
