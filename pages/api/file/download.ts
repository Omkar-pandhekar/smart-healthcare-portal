import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req, res) {
  // The S3 object key is passed in the URL
  const { key } = req.query;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const { Body, ContentType, Metadata } = await s3Client.send(command);

    // Set headers to trigger a download
    res.setHeader("Content-Type", ContentType);
    res.setHeader("Content-Disposition", `attachment; filename="${key}"`);

    // Stream the file body to the response
    Body.pipe(res);
  } catch (error) {
    console.error("Failed to download file from S3", error);
    res.status(500).json({ error: "Failed to download file" });
  }
}
