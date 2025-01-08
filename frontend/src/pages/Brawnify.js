import React, { useState, useEffect, useRef } from "react";

const API_KEY = "";

function Brawnify() {
    const [messages, setMessages] = useState([
        {
            user: "Brawnie",
            content: "Hey, welcome to Brawnify, how can I assist you?",
        },
    ]);
    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [requestType, setRequestType] = useState("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!userMessage.trim()) return;

        const newMessage = { user: "You", content: userMessage };
        setMessages([...messages, newMessage]);

        setLoading(true); // Show loading state

        const botResponse = await fetchGPTResponse(userMessage);
        setMessages((prevMessages) => [
            ...prevMessages,
            { user: "Brawnie", content: botResponse },
        ]);

        setUserMessage("");
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

    const handleRequestTypeSelect = async (type) => {
        setRequestType(type);
        let prompt = "";
        switch(type) {
            case "new-routine":
                prompt = "I want to create a new workout routine.";
                break;
            case "add-workout":
                prompt = "I want to add a workout to my existing routine.";
                break;
            case "advice":
                prompt = "I need general fitness advice.";
                break;
            default:
                return;
        }
        
        setLoading(true);
        const botResponse = await fetchGPTResponse(prompt);
        setMessages(prevMessages => [
            ...prevMessages,
            { user: "You", content: prompt },
            { user: "Brawnie", content: botResponse }
        ]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="flex-1 p-4 overflow-y-auto">
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
                            } max-w-md w-full p-3 rounded-lg shadow-sm`}
                        >
                            <span className="block font-medium">
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
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 pt-6">
                <div className="max-w-3xl mx-auto px-4 pb-6">
                    <div className="mb-4 flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => handleRequestTypeSelect("new-routine")}
                            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                                requestType === "new-routine"
                                    ? "bg-green-600 text-white"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                        >
                            Make a new routine
                        </button>
                        <button
                            onClick={() => handleRequestTypeSelect("add-workout")}
                            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                                requestType === "add-workout"
                                    ? "bg-green-600 text-white"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                        >
                            Add to existing routine
                        </button>
                        <button
                            onClick={() => handleRequestTypeSelect("advice")}
                            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                                requestType === "advice"
                                    ? "bg-green-600 text-white"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                        >
                            General advice
                        </button>
                    </div>

                    <form
                        onSubmit={handleSendMessage}
                        className="relative bg-white rounded-xl shadow-lg border border-gray-200"
                    >
                        <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Message Brawnie..."
                            className="w-full p-4 pr-14 focus:outline-none rounded-xl"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-1/2 pb-0 mb-10 -translate-y-1/2 p-2 text-gray-500 bg-white disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">
                                send
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Brawnify;
