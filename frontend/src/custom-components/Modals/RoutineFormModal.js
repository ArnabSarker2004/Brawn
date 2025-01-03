import React, { useState } from "react";
import { useRoutinesContext } from "../../hooks/useRoutinesContext";
import "./modal.css";
import { Button } from "../../components/ui/button";

const RoutineFormModal = ({ onClose }) => {
    const { dispatch } = useRoutinesContext();
    const [name, setName] = useState("");
    const [error, setError] = useState(null);
    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim() === "") {
            setError("Please fill in all the fields");
            return;
        }

        setError(null);

        try {
            const response = await fetch(`${URL}/api/routines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create routine");
            } else {
                dispatch({ type: "CREATE_ROUTINE", payload: data });

                onClose();
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error("Error submitting form:", err);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h4 className="modal-text">Add New Routine</h4>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Routine Name"
                />
                <div className="modal-buttons">
                    <Button variant="default" onClick={handleSubmit}>
                        Add
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
};

export default RoutineFormModal;
