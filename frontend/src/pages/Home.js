import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { useParams, useNavigate } from 'react-router-dom';
import WorkoutDetails from '../Mcomponents/WorkoutDetails';
import WorkoutFormModal from '../Mcomponents/WorkoutFormModal';

const Home = () => {
  const { workouts, dispatch: workoutsDispatch } = useWorkoutsContext();
  const [showModal, setShowModal] = useState(false);
  const { routineId } = useParams(); // Get the routine ID from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      const response = await fetch(`/api/routines/${routineId}/workouts`);
      const data = await response.json();

      if (response.ok) {
        workoutsDispatch({ type: 'SET_WORKOUTS', payload: data });
      }
    };

    fetchWorkouts();
  }, [routineId, workoutsDispatch]);

  return (
    <div className="home">
      <div className="back-btn" onClick={() => navigate('/routines')}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back to Routines</span>
      </div>

      <div className="add-workout-btn" onClick={() => setShowModal(true)}>
        Add Workout
      </div>

      {showModal && <WorkoutFormModal setShowModal={setShowModal} routineId={routineId} />}

      <div className="workout-grid">
        {workouts && workouts.map((workout) => (
          <WorkoutDetails key={workout._id} workout={workout} routineId={routineId} />
        ))}
      </div>
    </div>
  );
};

export default Home;
