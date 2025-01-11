import React, { useState, useEffect, useRef } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectScrollUpButton,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const API_KEY =
    "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";

function Brawnify() {
    const [messages, setMessages] = useState([
        {
            user: "Brawnie",
            content: "Hey, welcome to Brawnify, how can I assist you?",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [inputState, setInputState] = useState({
        show: false,
        type: null,
        placeholder: "",
    });
    const [selectedRoutine, setSelectedRoutine] = useState("");
    const [userInput, setUserInput] = useState("");
    const [showRoutineSelect, setShowRoutineSelect] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchRoutines();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchRoutines = async () => {
        try {
            const response = await fetch("/api/routines");
            const data = await response.json();
            setRoutines(data);
        } catch (error) {
            console.error("Error fetching routines:", error);
        }
    };

    const handleButtonClick = (type) => {
        setShowRoutineSelect(type === "add-workout");
        setInputState({
            show: type !== "add-workout",
            type: type,
            placeholder: getPlaceholder(type),
        });
        setUserInput("");
    };

    const getPlaceholder = (type) => {
        switch (type) {
            case "new-routine":
                return "Describe the routine you want to create...";
            case "add-workout":
                return "Describe the workout you want to add...";
            case "advice":
                return "What fitness advice do you need?";
            default:
                return "";
        }
    };

    const handleRoutineSelect = (routineId) => {
        setSelectedRoutine(routineId);
        setInputState({
            show: true,
            type: "add-workout",
            placeholder: "Describe the workout you want to add...",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setLoading(true);
        let prompt = "";

        switch (inputState.type) {
            case "new-routine":
                prompt = `Create a new workout routine based on this description: ${userInput}. 
                            Return the response as a JSON object with the following schema: 
                            { name: string, exercises: [{ name: string, sets: number, reps: number }] }`;
                break;
            case "add-workout":
                prompt = `Create a new workout for the routine based on this description: ${userInput}. 
                            Return the response as a JSON object with the following schema:
                            { name: string, sets: number, reps: number }`;
                break;
            case "advice":
                prompt = userInput;
                break;
        }

        const botResponse = await fetchGPTResponse(prompt);

        // Handle the response based on the type
        if (inputState.type === "new-routine") {
            try {
                const routineData = JSON.parse(botResponse);
                await handleCreateRoutine(routineData);
            } catch (error) {
                console.error("Error parsing routine data:", error);
            }
        } else if (inputState.type === "add-workout" && selectedRoutine) {
            try {
                const workoutData = JSON.parse(botResponse);
                await handleAddWorkout(selectedRoutine, workoutData);
            } catch (error) {
                console.error("Error parsing workout data:", error);
            }
        }

        // Add messages to chat
        setMessages((prev) => [
            ...prev,
            { user: "You", content: userInput },
            { user: "Brawnie", content: botResponse },
        ]);

        // Reset state
        setUserInput("");
        setInputState({ show: false, type: null, placeholder: "" });
        setShowRoutineSelect(false);
        setSelectedRoutine("");
        setLoading(false);
    };

    const fetchGPTResponse = async (message) => {
        try {
            const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: message }],
                    }),
                }
            );

            const responseBody = await response.json();

            if (!response.ok) {
                console.error("API Error:", responseBody);
                throw new Error(`Error: ${responseBody.error.message}`);
            }

            return responseBody.choices[0].message.content;
        } catch (error) {
            console.error("Error fetching GPT response:", error);
            return "Sorry, there was an error processing your request.";
        }
    };

    const handleCreateRoutine = async (routineData) => {
        // Implementation of handleCreateRoutine
    };

    const handleAddWorkout = async (routineId, workoutData) => {
        // Implementation of handleAddWorkout
    };

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            msg.user === "You" ? "justify-end" : "justify-start"
                        } my-2`}
                    >
                        <div
                            className={`${
                                msg.user === "You"
                                    ? "bg-gray-200 text-black"
                                    : "bg-green-100 text-green-800"
                            } max-w-[85%] md:max-w-md p-3 rounded-lg shadow-sm`}
                        >
                            <span className="block font-medium break-words">
                                {msg.content}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-green-100 text-green-800 max-w-md w-full p-3 rounded-lg shadow-sm">
                            <span className="block font-medium">
                                Loading...
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="flex flex-col overflow-x-hidden overflow-y-auto p-4">
                {isMobile && <div className="grid gap-2 md:grid-cols-3 grid-cols-1 w-full">
                    <Button
                        variant="secondary"
                        onClick={() => handleButtonClick("new-routine")}
                        className="w-full"
                    >
                        Make a new routine
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleButtonClick("add-workout")}
                        className="w-full"
                    >
                        Add to existing routine
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleButtonClick("advice")}
                        className="w-full"
                    >
                        General advice
                    </Button>
                </div>}
                {!isMobile && <div className="grid gap-2 md:grid-cols-3 grid-cols-1 w-auto">
                    <Button
                        variant="secondary"
                        onClick={() => handleButtonClick("new-routine")}
                    >
                        Make a new routine
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleButtonClick("add-workout")}
                    >
                        Add to existing routine
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleButtonClick("advice")}
                    >
                        General advice
                    </Button>
                </div>}
                {showRoutineSelect && (
                    <Select onValueChange={handleRoutineSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a routine" />
                        </SelectTrigger>
                        <SelectContent>
                            {routines.map((routine) => (
                                <SelectItem
                                    key={routine._id}
                                    value={routine._id}
                                >
                                    {routine.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {inputState.show && (
                    <form onSubmit={handleSubmit} className="w-full mx-10">
                    <div className="relative flex items-center w-full">
                        <Input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={inputState.placeholder}
                            className="w-full p-4 pr-14 rounded-xl border shadow-lg mx-2 mt-2"
                        />
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={loading}
                            className=" mb-2 pb-2"
                        >
                            <span className="material-symbols-outlined hover:text-brand">send</span>
                        </Button>
                    </div>
                </form>
                )}
            </CardFooter>
        </Card>
    );
}

export default Brawnify;
