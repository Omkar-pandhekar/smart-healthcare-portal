import type { NextApiRequest, NextApiResponse } from "next";
import { ConnectDB } from "@/dbConfig/dbConfig";
import FileModel from "@/models/File.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ConnectDB();
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { owner, doctor, category } = req.query;
    const filter: any = {};
    if (owner) filter.owner = owner;
    if (doctor) filter.doctor = doctor;
    if (category) filter.category = category;
    const files = await FileModel.find(filter)
      .populate("owner", "fullname email")
      .populate("doctor", "name email")
      .sort({ uploadDate: -1 });
    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
