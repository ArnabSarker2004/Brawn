import { Survey } from 'survey-react-ui';
import { json } from './survey-json';
import { useNavigate } from 'react-router-dom';

function SurveyPage() {
    const navigate = useNavigate();

    const calculateBMR = (weight, height, age, gender) => {
        // Mifflin-St Jeor Equation
        if (gender === "Item 1") { // Male
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else { // Female
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    };

    const onComplete = async (survey) => {
        const data = survey.data;
        
        // Calculate BMR before sending
        const bmr = calculateBMR(
            Number(data.question4),
            Number(data.question3), 
            Number(data.question5), 
            data.question6        
        );

        const profileData = {
            name: data.question1,
            email: data.question2,
            height: Number(data.question3),
            weight: Number(data.question4),
            age: Number(data.question5),
            gender: data.question6 === "Item 1" ? "Male" : "Female",
            bmr: bmr,
            yearsOfExperience: Number(data.question8)
        };

        try {

            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            navigate('/profile');

        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Survey 
                json={json}
                onComplete={onComplete}
                showCompletedPage={false}
            />
        </div>
    );
}

export default SurveyPage;