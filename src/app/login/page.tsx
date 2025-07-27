"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import FadeContent from "@/components/animations/FadeContent/FadeContent";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    console.log("Login attempt with:", { identifier, password });
    // Add authentication logic here
    try {
      const response = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });
      if (response?.error) {
        setLoginError("Invalid email or password");
        console.log(response.error);
      } else {
        setLoginError("");
        console.log(response);
        router.push("/");
        Swal.fire({
          position: "bottom-end",
          icon: "success",
          title: "Login successful!",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          customClass: {
            popup: "border border-border shadow-lg",
          },
        });
      }
    } catch (error) {
      setLoginError("Something went wrong. Please try again.");
      console.log(error);
      throw new Error("Error at Login !");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      {/* Login Form */}
      <FadeContent
        blur={true}
        easing="ease-in-out"
        duration={1000}
        className="w-full"
      >
        <div className="max-w-lg w-full p-8 mx-auto shadow-xl border border-gray-100 rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome Back !{" "}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-md font-medium  mb-1"
                >
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border-2  rounded-md "
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-md font-medium"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-white hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border-2 rounded-md "
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition"
              >
                Login
              </Button>
            </div>
          </form>
          {loginError && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              {loginError}
            </div>
          )}

          <p className="mt-8 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </FadeContent>
    </div>
  );
};

export default LoginPage;
