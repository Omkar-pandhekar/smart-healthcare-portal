import type { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { ConnectDB } from "@/dbConfig/dbConfig";
import UserModel from "@/models/user.models";
import clientPromise from "./mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      profileImage?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    profileImage?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await ConnectDB();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullname || user.email.split("@")[0],
            role: user.role,
            profileImage: user.profileImage,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role;
        token.profileImage = (user as any).profileImage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        // @ts-expect-error
        session.user.role = token.role as string;
        // @ts-expect-error
        session.user.profileImage = token.profileImage as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
