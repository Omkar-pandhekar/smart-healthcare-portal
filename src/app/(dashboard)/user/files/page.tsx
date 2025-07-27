"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import Image from "next/image";
import { Input } from "@/components/ui/input";

const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";

interface UserFile {
  _id: string;
  fileName: string;
  category: string;
  uploadDate?: string;
  fileUrl: string;
}

const isImage = (fileName: string) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
};

const UserFilesPage = () => {
  const { data: session, status } = useSession();
  const [ownedFiles, setOwnedFiles] = useState<UserFile[]>([]);
  const [sharedFiles, setSharedFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewFile, setViewFile] = useState<UserFile | null>(null);
  const [shareFile, setShareFile] = useState<UserFile | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");

  const handleView = (file: UserFile) => setViewFile(file);
  const handleCloseDialog = () => setViewFile(null);
  const handleDownload = (url: string, fileName?: string) => {
    const link = document.createElement("a");
    link.href = url;
    if (fileName) link.download = fileName;
    else link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleOpenShare = (file: UserFile) => {
    setShareFile(file);
    setShareEmail("");
    setShareMessage("");
    setShareError("");
  };
  const handleCloseShare = () => {
    setShareFile(null);
    setShareEmail("");
    setShareMessage("");
    setShareError("");
  };
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareFile || !shareEmail) return;
    setShareLoading(true);
    setShareMessage("");
    setShareError("");
    try {
      const res = await fetch(`/api/files/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: shareFile._id, email: shareEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShareMessage("File shared successfully!");
        setShareEmail("");
      } else {
        setShareError(data.error || "Failed to share file");
      }
    } catch {
      setShareError("Failed to share file");
    } finally {
      setShareLoading(false);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        // Fetch owned files
        const ownedRes = await fetch(`/api/file/list?owner=${session.user.id}`);
        const ownedData = await ownedRes.json();
        if (ownedRes.ok && ownedData.success) {
          setOwnedFiles(ownedData.files || []);
        }

        // Fetch shared files
        const sharedRes = await fetch("/api/files/shared-with-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });
        const sharedData = await sharedRes.json();
        if (sharedRes.ok && sharedData.success) {
          setSharedFiles(sharedData.files || []);
        }
      } catch {
        setError("Failed to fetch files");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [session, status]);

  const FileCard = ({
    file,
    showShare = true,
  }: {
    file: UserFile;
    showShare?: boolean;
  }) => (
    <div className="border rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition">
      <div className="mb-2">
        {isImage(file.fileName) ? (
          <Image
            src={`${S3_BUCKET_URL}/${file.fileUrl}`}
            alt={file.fileName}
            width={96}
            height={96}
            className="h-24 w-24 object-cover rounded border"
          />
        ) : (
          <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded border text-4xl">
            📄
          </div>
        )}
      </div>
      <div className="font-semibold text-center break-all">{file.fileName}</div>
      <div className="text-gray-500 text-sm">{file.category}</div>
      <div className="text-gray-400 text-xs mb-2">
        {file.uploadDate ? new Date(file.uploadDate).toLocaleString() : "-"}
      </div>
      <div className="flex gap-2 mt-auto">
        <Button variant="outline" onClick={() => handleView(file)}>
          View
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            handleDownload(
              `/api/file/download?key=${encodeURIComponent(file.fileUrl)}`,
              file.fileName
            )
          }
        >
          Download
        </Button>
        {showShare && (
          <Button variant="outline" onClick={() => handleOpenShare(file)}>
            Share
          </Button>
        )}
      </div>
    </div>
  );

  if (status === "loading" || loading) return <>Loading...</>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="My Files"
        subtitle="Manage your uploaded and shared files"
      />
      {/* File View Dialog */}
      <Dialog open={!!viewFile} onOpenChange={handleCloseDialog}>
        {viewFile && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-zinc-300 dark:bg-zinc-900 rounded-lg shadow-lg max-w-4xl w-full p-4 relative flex flex-col items-center">
              <button
                className="absolute top-2 right-2 text-gray-500 text-3xl"
                onClick={handleCloseDialog}
              >
                &times;
              </button>
              <div className="w-full flex flex-col items-center">
                <div className="mb-4 font-bold text-lg">
                  {viewFile.fileName}
                </div>
                {isImage(viewFile.fileName) ? (
                  <Image
                    src={`${S3_BUCKET_URL}/${viewFile.fileUrl}`}
                    alt={viewFile.fileName}
                    width={1800}
                    height={1600}
                    className="max-h-[70vh] w-auto rounded border"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <iframe
                    src={`${S3_BUCKET_URL}/${viewFile.fileUrl}`}
                    title="File Preview"
                    className="w-full h-[70vh] rounded"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>
      <Dialog open={!!shareFile} onOpenChange={handleCloseShare}>
        {shareFile && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-zinc-300 dark:bg-zinc-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 text-2xl"
                onClick={handleCloseShare}
              >
                &times;
              </button>
              <div className="mb-4 font-bold text-lg">
                Share File: {shareFile.fileName}
              </div>
              <form onSubmit={handleShare} className="space-y-4">
                <Input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter user's email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={shareLoading}
                >
                  {shareLoading ? "Sharing..." : "Share"}
                </Button>
                {shareMessage && (
                  <div className="text-green-600">{shareMessage}</div>
                )}
                {shareError && <div className="text-red-600">{shareError}</div>}
              </form>
            </div>
          </div>
        )}
      </Dialog>

      <Tabs
        tabs={[
          {
            title: "Owned Files",
            value: "owned",
            content: (
              <div className="mt-6">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black shadow-sm p-6 min-h-[400px]">
                  {ownedFiles.length === 0 ? (
                    <div className="text-gray-600 text-center py-8">
                      No owned files found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {ownedFiles.map((file) => (
                        <FileCard key={file._id} file={file} showShare={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
          {
            title: "Shared Files",
            value: "shared",
            content: (
              <div className="mt-6">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black shadow-sm p-6 min-h-[400px]">
                  {sharedFiles.length === 0 ? (
                    <div className="text-gray-600 text-center py-8">
                      No shared files found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {sharedFiles.map((file) => (
                        <FileCard
                          key={file._id}
                          file={file}
                          showShare={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
        ]}
        containerClassName="w-full mt-6"
        contentClassName="mt-6"
      />
    </div>
  );
};

export default UserFilesPage;
