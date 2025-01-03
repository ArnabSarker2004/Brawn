import { Input } from "./input";
import { Button, buttonVariants } from "./button";
import BrawnLogo from "../../assets/Brawn_Logo.png";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import React, { useState } from "react";
import axios from "axios";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");
    const { username, password } = formData;
    const MemberSince = new Date().toISOString();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";
    const { verify, login } = useAuth();
    const onSubmitLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${URL}/api/auth/login`,
                { username, password },
                { withCredentials: true }
            );
            if (res) {
                setMessage("Logged in successfully");
                await verify();
                login(username);
                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err.response?.data || err.message);
            setMessage("Failed to login - wrong credentials");
        }
    };

    const onSubmitSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${URL}/api/auth/register`,
                { username, password, MemberSince },
                { withCredentials: true }
            );
            if (res) {
                setMessage("Registered successfully, redirecting...");
                navigate("/dashboard");
            }
            login(username);
        } catch (err) {
            console.error("Error occurred during sign-up:", err);
            if (err.response && err.response.data) {
                setMessage(`Failed to register: ${err.response.data.message}`);
            } else {
                setMessage("Failed to register, please try again.");
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-y-hidden overflow-x-hidden">
            {!isMobile && (
                <div className="w-1/2 bg-white p-12 flex flex-col text-white">
                    <img
                        src={BrawnLogo}
                        alt="Brawn Logo"
                        className="h-20 w-20"
                    />
                    <div className="flex flex-1 items-center justify-center">
                        <h1 className="text-5xl font-semibold text-brand">
                            Brawn
                        </h1>
                    </div>
                </div>
            )}

            <div
                className={
                    isMobile
                        ? "flex items-center justify-center m-auto w-auto max-w-screen-sm"
                        : "w-1/2 flex items-center justify-center p-12"
                }
            >
                <Tabs defaultValue="Sign Up" className="w-auto max-w-screen-md">
                    <TabsList className="flex w-auto gap-2">
                        <TabsTrigger
                            value="Sign Up"
                            className="w-1/2 font-semibold hover:shadow-lg transition-shadow duration-300	text-center"
                        >
                            Sign Up
                        </TabsTrigger>
                        <TabsTrigger
                            value="Sign In"
                            className="w-1/2 hover:shadow-lg transition-shadow duration-300 font-semibold	text-center"
                        >
                            Sign In
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="Sign Up">
                        <div className="w-auto max-w-sm">
                            <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Create an account
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter username and password to Create an
                                    account
                                </p>
                                <form
                                    onSubmit={onSubmitSignUp}
                                    className="mb-0 space-y-6"
                                >
                                    <div>
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Username"
                                            value={username}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-green text-white"
                                        >
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
                                                buttonVariants({
                                                    variant: "googleButton",
                                                }),
                                                "w-full bg-blue-500 text-white"
                                            )}
                                        >
                                            Google
                                        </Button>
                                    </div>
                                </form>
                                <p className="mt-6 text-xs text-gray-500">
                                    By clicking continue, you agree to our{" "}
                                    <a href="/" className="underline">
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="/" className="underline">
                                        Privacy Policy
                                    </a>
                                    .
                                </p>
                                <p className="message mt-4">{message}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="Sign In">
                        <div className="w-auto max-w-sm">
                            <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Sign In
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter username and password to Sign In
                                </p>
                                <form
                                    onSubmit={onSubmitLogin}
                                    className="mb-0 space-y-6"
                                >
                                    <div>
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Username"
                                            value={username}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-green text-white"
                                        >
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
                                                buttonVariants({
                                                    variant: "googleButton",
                                                }),
                                                "w-full bg-blue-500 text-white"
                                            )}
                                        >
                                            Google
                                        </Button>
                                    </div>
                                </form>
                                <p className="mt-6 text-xs text-gray-500">
                                    By clicking continue, you agree to our{" "}
                                    <a href="/" className="underline">
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="/" className="underline">
                                        Privacy Policy
                                    </a>
                                    .
                                </p>
                                <p className="message mt-4">{message}</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
