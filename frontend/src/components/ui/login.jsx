import { Input } from "./input";
import { Button, buttonVariants } from "./button";
import BrawnLogo from '../../assets/Brawn_Logo.png'; // Import the logo
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"; // Import the required components for Tabs


import { cn } from "../../lib/utils";

export function Login() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/2 bg-white p-12 flex flex-col text-white">
        <img src={BrawnLogo} alt="Brawn Logo" className="h-20 w-20" /> {/* Use the imported logo */}

        <div className="flex flex-1 items-center justify-center">
          {/* Center the "Brawn" text */}
          <h1 className="text-5xl font-semibold text-brand">Brawn</h1>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-12">
        <Tabs defaultValue="Sign Up" className="w-[400px]">
          {/* Adjust TabsList to make the tabs spread across the top */}
          <TabsList className="flex w-full">
            <TabsTrigger value="Sign Up" className="w-1/2 text-center">
              Sign Up
            </TabsTrigger>
            <TabsTrigger value="Sign In" className="w-1/2 text-center">
              Sign In
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Sign Up">
            <div className="w-full max-w-md">
              <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter your email below to create your account
                  </p>
                </div>
                <form className="mb-0 space-y-6">
                  <div>
                    <Input id="email" placeholder="name@example.com" />
                  </div>
                  <div>
                    <Input id="pass" placeholder="password" />
                  </div>
                  <div>
                    <Button className="w-full bg-green text-white">
                      Create Account
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        OR CONTINUE WITH
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button
                      className={cn(
                        buttonVariants({ variant: "googleButton" }),
                        "w-full bg-blue-500 text-white"
                      )}
                    >
                      Google
                    </Button>
                  </div>
                </form>
                <p className="mt-6 text-xs text-gray-500">
                  By clicking continue, you agree to our Terms of Service and
                  Privacy Policy.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="Sign In">
            <div className="w-full max-w-md">
              <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter your information below to sign in
                  </p>
                </div>
                <form className="mb-0 space-y-6">
                  <div>
                    <Input id="email" placeholder="name@example.com" />
                  </div>
                  <div>
                    <Input id="pass" placeholder="password" />
                  </div>
                  <div>
                    <Button className="w-full bg-green text-white">
                      Sign In
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        OR CONTINUE WITH
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button
                      className={cn(
                        buttonVariants({ variant: "googleButton" }),
                        "w-full bg-blue-500 text-white"
                      )}
                    >
                      Google
                    </Button>
                  </div>
                </form>
                <p className="mt-6 text-xs text-gray-500">
                  By clicking continue, you agree to our Terms of Service and
                  Privacy Policy.
                </p>


              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
