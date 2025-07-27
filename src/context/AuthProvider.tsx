"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ImageKitProvider } from "imagekitio-next";
import { authenticator } from "@/utils/backendUtils";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoints = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  return (
    <SessionProvider>
      <ImageKitProvider
        publicKey={publicKey}
        urlEndpoint={urlEndpoints}
        authenticator={authenticator}
      >
        {children}
      </ImageKitProvider>
    </SessionProvider>
  );
};

export default AuthProvider;
