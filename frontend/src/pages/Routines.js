import { useEffect, useState } from "react";
import RoutineFormModal from "../custom-components/Modals/RoutineFormModal";
import Routine from "../custom-components/Workout/Routine";
import { useRoutinesContext } from "../hooks/useRoutinesContext";
const Routines = () => {
    const { routines, dispatch } = useRoutinesContext();
    const [showAddModal, setShowAddModal] = useState(false);
    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    useEffect(() => {
        const fetchRoutinesWithWorkouts = async () => {
            const response = await fetch(`${URL}/api/routines`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                const routinesData = await response.json();
                const routinesWithWorkouts = await Promise.all(
                    routinesData.map(async (routine) => {
                        const workoutsResponse = await fetch(
                            `${URL}/api/routines/${routine._id}/workouts`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                credentials: "include",
                            }
                        );

                        const workoutsData = workoutsResponse.ok
                            ? await workoutsResponse.json()
                            : [];
                        return { ...routine, workouts: workoutsData };
                    })
                );

                dispatch({
                    type: "SET_ROUTINES",
                    payload: routinesWithWorkouts,
                });
            } else {
                console.error("Failed to fetch routines");
            }
        };

        fetchRoutinesWithWorkouts();
    }, [URL, dispatch]);

    const handleDeleteRoutine = async (id) => {
        const response = await fetch(`${URL}/api/routines/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (response.ok) {
            const deletedRoutine = await response.json();
            dispatch({ type: "DELETE_ROUTINE", payload: deletedRoutine });
        } else {
            console.error("Failed to delete routine");
        }
    };

    return (
        <div className="routine-grid">
            <div className="routine-list">
                {routines &&
                    routines.map((routine) => (
                        <Routine
                            workouts={routine.workouts}
                            routine={routine}
                            onDelete={handleDeleteRoutine}
                        />
                    ))}
            </div>
            {showAddModal && (
                <RoutineFormModal onClose={() => setShowAddModal(false)} />
            )}
            <div
                className="fixed bottom-8 right-4 flex items-center space-x-2 cursor-pointer "
                onClick={() => setShowAddModal(true)}
            >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brawn">
                    <span className="material-symbols-outlined text-white">
                        add
                    </span>
                </div>
                {!isMobile && (
                    <span className="text-gray-600 font-medium">
                        Add Routine
                    </span>
                )}
            </div>
        </div>
    );
};

export default Routines;
