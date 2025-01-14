import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardFooter
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../components/ui/select";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const API_KEY ="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";

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

        try {
            switch (inputState.type) {
                case "new-routine":
                    // First, get a name for the routine
                    const routineNamePrompt = `Based on this description: "${userInput}", generate a technical name for this workout routine that describes the series of workouts and the muscles it develops. Avoid using adjectives like "Blast" or "Strong". Return only the name, nothing else.`;
                    const routineName = await fetchGPTResponse(routineNamePrompt);
                    
                    // Add initial message showing the generated name
                    setMessages(prev => [
                        ...prev,
                        { user: "You", content: userInput },
                        { user: "Brawnie", content: `Creating a new routine called "${routineName}"` }
                    ]);

                    // Now get the full routine details
                    prompt = `Create a new workout routine based on this description: ${userInput}. 
                                Ensure the routine is in-depth and takes 1hr 30mins to 2hrs to complete unless the user specifies a faster completion time or a quick routine. 
                                Use technical fitness terminology for the names of the workouts. 
                                Avoid workouts like "warm up". 
                                Ensure all workouts have 3 sets. 
                                If the workout involves heavy weight, set reps to 6-8. 
                                If the workout involves light weight, set reps to 10-12. 
                                Include 8 popular workouts in the routine. 
                                Make it sound like Jeff Nippard or Hussein Farhat named it.
                                Return the response as a JSON object with the following schema: 
                                { name: "${routineName}", workouts: [{ title: string, timeBased: boolean, cardio: boolean, sets: [{ weight: number, reps: number, time: number }] }] }`;
                    
                    const routineResponse = await fetchGPTResponse(prompt);
                    const routineData = JSON.parse(routineResponse);

                    // Post the new routine to the backend
                    await handleCreateRoutine(routineData);
                    break;

                case "add-workout":
                    const selectedRoutineName = routines.find(r => r._id === selectedRoutine)?.name || '';
                    
                    // First, get a name for the workout
                    const workoutNamePrompt = `Based on this description: "${userInput}", generate an appropriate name for this exercise using technical fitness terminology. 
                                                Ensure the name is correct and appropriate for the user. Return only the name, nothing else.`;
                    const workoutName = await fetchGPTResponse(workoutNamePrompt);
                    
                    // Add initial message showing the generated name
                    setMessages(prev => [
                        ...prev,
                        { user: "You", content: userInput },
                        { user: "Brawnie", content: `New workout called "${workoutName}" to the ${selectedRoutineName} routine` }
                    ]);

                    // Now get the full workout details
                    prompt = `Create a new workout based on this description: ${userInput}. 
                                Use technical fitness terminology for the name of the workout. 
                                Ensure the workout has 3 sets. 
                                Make sure to check if the workouts in the routine are cardio or time-based. Workouts that stress your cardiovascular system are usually cardio workouts. Workouts that are isometric or involve holding a position for a certain amount of time are time-based workouts.
                                If the workout involves heavy weight, set reps to 6-8. 
                                If the workout involves light weight, set reps to 10-12. 
                                Make it sound like Jeff Nippard or Hussein Farhat named it.
                                Return the response as a JSON object with the following schema:
                                { title: "${workoutName}", timeBased: boolean, cardio: boolean, sets: [{ weight: number, reps: number, time: number }] }`;
                    
                    const workoutResponse = await fetchGPTResponse(prompt);
                    const workoutData = JSON.parse(workoutResponse);

                    // Post the new workout to the existing routine
                    await handleAddWorkout(selectedRoutine, workoutData);
                    break;

                case "advice":
                    prompt = userInput;
                    setMessages(prev => [
                        ...prev,
                        { user: "You", content: userInput }
                    ]);
                    break;
            }
        } catch (error) {
            console.error("Error processing request:", error);
            setMessages(prev => [
                ...prev,
                { user: "Brawnie", content: "Sorry, there was an error processing your request." }
            ]);
        } finally {
            setLoading(false);
        }
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
        const URL = process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";

        try {
            const response = await fetch(`${URL}/api/routines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(routineData),
                credentials: "include",
            });

            if (response.ok) {
                const newRoutine = await response.json();
                setRoutines((prevRoutines) => [...prevRoutines, newRoutine]);
            } else {
                console.error("Failed to create routine");
            }
        } catch (error) {
            console.error("Error creating routine:", error);
        }
    };

    const handleAddWorkout = async (routineId, workoutData) => {
        const URL = process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";

        try {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(workoutData),
                credentials: "include",
            });

            if (response.ok) {
                const updatedRoutine = await response.json();
                setRoutines((prevRoutines) =>
                    prevRoutines.map((routine) =>
                        routine._id === routineId ? updatedRoutine : routine
                    )
                );
            } else {
                console.error("Failed to add workout");
            }
        } catch (error) {
            console.error("Error adding workout:", error);
        }
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
