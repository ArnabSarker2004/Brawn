import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { useParams, useNavigate } from 'react-router-dom';
import WorkoutDetails from '../custom-components/Workout/WorkoutDetails';
import WorkoutFormModal from '../custom-components/Modals/WorkoutFormModal';
import {Button} from '../components/ui/button';
const Home = () => {
  const token = localStorage.getItem('token');
  const { workouts, dispatch: workoutsDispatch } = useWorkoutsContext();
  const [showModal, setShowModal] = useState(false);
  const [routineName, setRoutineName] = useState(''); 
  const { routineId } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutineDetails = async () => {
      const response = await fetch(`/api/routines/${routineId}`,
        { method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`}
        }
      );
      const data = await response.json();

      if (response.ok) {
        setRoutineName(data.name); 
      }
    };

    const fetchWorkouts = async () => {
      const response = await fetch(`/api/routines/${routineId}/workouts`,
        { method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`}
        }
      );
      const data = await response.json();

      if (response.ok) {
        workoutsDispatch({ type: 'SET_WORKOUTS', payload: data });
      }
    };

    fetchRoutineDetails(); 
    fetchWorkouts(); 
  }, [routineId, workoutsDispatch]);

  return (
    <div className="home">
      <div className="Workout-Title">
        <h1>{routineName}</h1> 
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
        <Button variant ="outline" size="lg" onClick={() => navigate('/routines') }>
          Back
        </Button>
      </div>
    </div>
  );
};

export default Home;
