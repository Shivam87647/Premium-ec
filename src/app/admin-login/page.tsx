"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "./actions";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);
    
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-serif">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your storefront
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              required 
            />
            <Input 
              label="Password" 
              name="password" 
              type="password" 
              required 
            />
          </div>

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign in to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
