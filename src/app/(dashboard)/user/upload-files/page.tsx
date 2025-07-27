"use client";
import Heading from "@/components/common/Heading";
import FileUpload from "@/components/layouts/FileUpload";
import { LoaderThree } from "@/components/ui/loader";
import { useSession } from "next-auth/react";
import React from "react";

const UploadFiles = () => {
  const { data: session, status } = useSession();
  if (status === "loading")
    return (
      <div>
        <LoaderThree />
      </div>
    );
  if (status === "unauthenticated") return <div>Unauthenticated</div>;

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading title="Upload Files" subtitle="Share with doctors and others" />
      <FileUpload owner={session?.user.id} />
    </div>
  );
};

export default UploadFiles;
