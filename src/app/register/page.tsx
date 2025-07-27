"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const RegisterPage = () => {
  const [role, setRole] = useState("user"); // user, doctor, hospital
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const router = useRouter();

  // Password validation rules
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number.";
    if (!/[^A-Za-z0-9]/.test(pwd))
      return "Password must contain a special character.";
    return "";
  };

  // Real-time validation
  React.useEffect(() => {
    setPasswordError(validatePassword(password));
    setConfirmPasswordError(
      confirmPassword && password !== confirmPassword
        ? "Passwords do not match."
        : ""
    );
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError || confirmPasswordError) return;
    const userData = {
      fullname: name,
      email,
      password,
      username,
      role,
    };
    try {
      const response = await axios.post("/api/user/signup", userData);
      if (response.data.success) {
        router.push("/login");
        Swal.fire({
          position: "bottom-end",
          icon: "success",
          title: "Account created successfully",
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
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: error?.response?.data?.error || "Something went wrong.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      {/* Register Form */}
      <div className="max-w-[600px] w-full p-8 mx-auto shadow-xl border border-gray-100 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-md font-medium  mb-1">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border-2 rounded-md "
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="email-address"
                className="block text-md font-medium mb-1"
              >
                Email address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border-2  rounded-md "
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="username"
                className="block text-md font-medium  mb-1"
              >
                Username
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border-2  rounded-md "
                  placeholder="Choose a username"
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="password"
                className="block text-md font-medium mb-1"
              >
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border-2 rounded-md "
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" />
                  )}
                </button>
              </div>
              {password.length > 0 && passwordError && (
                <div className="text-red-500 text-xs mt-1">{passwordError}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor="confirm-password"
                className="block text-md font-medium mb-1"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border-2 rounded-md "
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="text-red-500 text-xs mt-1">
                  {confirmPasswordError}
                </div>
              )}
            </div>
          </div>
          {/* Role Selector at the end */}
          <div>
            <Label className="block text-md font-medium mb-2">Role</Label>
            <RadioGroup
              value={role}
              onValueChange={setRole}
              className="flex flex-col gap-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="user" />
                <span>User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="doctor" />
                <span>Doctor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="hospital" />
                <span>Hospital</span>
              </label>
            </RadioGroup>
          </div>
          <div>
            <Button
              type="submit"
              className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition"
              disabled={!!passwordError || !!confirmPasswordError}
            >
              Register
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
