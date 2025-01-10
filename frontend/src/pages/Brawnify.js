import React, { useState, useEffect, useRef } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";

const API_KEY = "";

function Brawnify() {
    const [messages, setMessages] = useState([
        { user: "Brawnie", content: "Hey, welcome to Brawnify, how can I assist you?" },
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
            const response = await fetch('/api/routines');
            const data = await response.json();
            setRoutines(data);
        } catch (error) {
            console.error('Error fetching routines:', error);
        }
    };

    const handleButtonClick = (type) => {
        setShowRoutineSelect(type === "add-workout");
        setInputState({
            show: type !== "add-workout",
            type: type,
            placeholder: getPlaceholder(type)
        });
        setUserInput("");
    };

    const getPlaceholder = (type) => {
        switch(type) {
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
            placeholder: "Describe the workout you want to add..."
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setLoading(true);
        let prompt = "";

        switch(inputState.type) {
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
                console.error('Error parsing routine data:', error);
            }
        } else if (inputState.type === "add-workout" && selectedRoutine) {
            try {
                const workoutData = JSON.parse(botResponse);
                await handleAddWorkout(selectedRoutine, workoutData);
            } catch (error) {
                console.error('Error parsing workout data:', error);
            }
        }

        // Add messages to chat
        setMessages(prev => [
            ...prev,
            { user: "You", content: userInput },
            { user: "Brawnie", content: botResponse }
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
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <div className="flex-1 p-4 overflow-hidden h-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.user === "You" ? "justify-end" : "justify-start"} my-2`}>
                        <div className={`${
                            msg.user === "You" 
                                ? "bg-gray-200 text-black" 
                                : "bg-green-100 text-green-800"
                            } max-w-[85%] md:max-w-md p-3 rounded-lg shadow-sm`}
                        >
                            <span className="block font-medium break-words">{msg.content}</span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-green-100 text-green-800 max-w-md w-full p-3 rounded-lg shadow-sm">
                            <span className="block font-medium">Loading...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 pt-6">
                <div className="max-w-3xl mx-auto px-4 pb-6">
                    <div className="mb-4 flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => handleButtonClick("new-routine")}
                            className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-50"
                        >
                            Make a new routine
                        </button>
                        <button
                            onClick={() => handleButtonClick("add-workout")}
                            className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-50"
                        >
                            Add to existing routine
                        </button>
                        <button
                            onClick={() => handleButtonClick("advice")}
                            className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-50"
                        >
                            General advice
                        </button>
                    </div>

                    {showRoutineSelect && (
                        <div className="mb-4">
                            <Select onValueChange={handleRoutineSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a routine" />
                                </SelectTrigger>
                                <SelectContent>
                                    {routines.map((routine) => (
                                        <SelectItem key={routine._id} value={routine._id}>
                                            {routine.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {inputState.show && (
                        <form onSubmit={handleSubmit} className="relative">
                            <Input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={inputState.placeholder}
                                className="w-full p-4 pr-14 rounded-xl border shadow-lg"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent	hover:bg-transparent  text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Brawnify;
