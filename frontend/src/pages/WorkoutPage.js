import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { useParams, useNavigate } from 'react-router-dom';
import WorkoutDetails from '../custom-components/WorkoutDetails';
import WorkoutFormModal from '../custom-components/WorkoutFormModal';

const Home = () => {
  const { workouts, dispatch: workoutsDispatch } = useWorkoutsContext();
  const [showModal, setShowModal] = useState(false);
  const [routineName, setRoutineName] = useState(''); // State to hold the routine name
  const { routineId } = useParams(); // Get the routine ID from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutineDetails = async () => {
      // Fetch the routine details including the name
      const response = await fetch(`/api/routines/${routineId}`);
      const data = await response.json();

      if (response.ok) {
        setRoutineName(data.name); // Assuming 'name' is the field for the routine name
      }
    };

    const fetchWorkouts = async () => {
      const response = await fetch(`/api/routines/${routineId}/workouts`);
      const data = await response.json();

      if (response.ok) {
        workoutsDispatch({ type: 'SET_WORKOUTS', payload: data });
      }
    };

    fetchRoutineDetails(); // Fetch routine details including name
    fetchWorkouts(); // Fetch the workouts
  }, [routineId, workoutsDispatch]);

  return (
    <div className="home">
      <div className="Workout-Title">
        <h1>{routineName}</h1> {/* Display the routine name here */}
      </div>
      <div className='add-workout-btn-row'>
        <div className="add-workout-btn" onClick={() => setShowModal(true)}>
          Add Workout
        </div>
      </div>

      {showModal && <WorkoutFormModal setShowModal={setShowModal} routineId={routineId} />}

      <div className="workout-grid">
        {workouts && workouts.map((workout) => (
          <WorkoutDetails key={workout._id} workout={workout} routineId={routineId} />
        ))}
      </div>
      <div className="back-buttons-row">
        <div className="back-btn" onClick={() => navigate('/routines')}>
          <span>Back</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
