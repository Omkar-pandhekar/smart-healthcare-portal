"use client";
import React, { useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import User from "@/models/user.models";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Files } from "lucide-react";
import { Label } from "../ui/label";

interface FileUploadProps {
  owner?: string;
  category?: string;
  tags?: string[];
  sharedWith?: string[];
}

function FileUpload(props: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState(props.category || "");
  const [tags, setTags] = useState<string[]>(props.tags || []);
  const [sharedWith, setSharedWith] = useState<string[]>(
    props.sharedWith || []
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("medicalFile", file);
    if (props.owner) formData.append("owner", props.owner);
    if (category) formData.append("category", category);
    tags.forEach((tag) => formData.append("tags", tag));
    const sharedWithIds = [];
    for (const email of sharedWith) {
      const user = await User.findOne({ email });
      if (user) sharedWithIds.push(user._id);
      // else: handle not found (skip or error)
    }
    // Save sharedWith: sharedWithIds

    try {
      const response = await axios.post("/api/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("File uploaded successfully!");
      console.log(response.data);
    } catch (error) {
      setMessage("File upload failed.");
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="w-full max-w-[40rem] p-8 mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <Files className="w-7 h-7 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Upload and Share Files
          </h3>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* File */}
          <div>
            <Label className="text-lg font-medium">Choose File :</Label>
            <Input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <div className="py-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mr-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
              >
                {file ? "Change File" : "Select File"}
              </Button>
            </div>
            {file && (
              <div className="mt-1 ml-1 text-sm text-gray-700 truncate max-w-xs">
                {file.name}
              </div>
            )}
          </div>
          {/* Category */}
          <div>
            <Label className="text-lg font-medium">Category :</Label>
            <Input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2.5  rounded"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-lg font-medium">Tags :</Label>
            <Input
              type="text"
              placeholder="Tags (comma separated)"
              className="w-full py-2  rounded"
              value={tags.join(",")}
              onChange={(e) =>
                setTags(e.target.value.split(",").map((t) => t.trim()))
              }
            />
          </div>
          {/* Shared With */}
          <div>
            <Label className="text-lg font-medium">Shared With :</Label>
            <Input
              type="text"
              className="w-full py-2  rounded"
              placeholder="Shared With Emails (comma separated)"
              value={sharedWith.join(",")}
              onChange={(e) =>
                setSharedWith(
                  e.target.value.split(",").map((email) => email.trim())
                )
              }
            />
          </div>
          {/* Upload Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-lg transition"
          >
            Upload
          </Button>
          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded text-center font-medium ${
                message.includes("success")
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default FileUpload;
