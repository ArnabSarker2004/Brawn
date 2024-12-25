import { useEffect, useState } from 'react';
import { Profile } from '../components/ui/profile';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const URL = process.env.NODE_ENV === 'production'
        ? 'https://brawn-tedx.onrender.com'
        : 'http://localhost:4000';

    const [error, setError] = useState(null);
    const [body, setBody] = useState(null);
    const { user } = useAuth();

    const updateUserDetails = async (updatedData) => {
        try {
            const response = await fetch(`${URL}/api/user/updatebody`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user, 
                    ...updatedData,
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                setError(data.error || 'Failed to update user details');
            }
        } catch (err) {
            setError('An error occurred while updating user details');
        }
    };
    const getUserdata = async() =>{
        try{
            const response = await fetch(`${URL}/api/user/getbodyinfo`,{
                method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    username:user
                }),
                credentials:'include'
            });
            if (response.ok){
                const data = await response.json();
                setBody(data); 
            }
        }
        catch{
            setError("no information found");
        }
    }
    useEffect(() =>{
        if (user) getUserdata(user);
    }, [user]);

    return (
        <Profile error={error}data={body} onSave={updateUserDetails} />
    );
};

export default ProfilePage;
