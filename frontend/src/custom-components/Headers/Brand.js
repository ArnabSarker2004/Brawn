import { useTimer } from '../../context/TimerContext';
import BrawnLogo from '../../assets/Brawn_Logo.png';
import './brand.css';
import TimerHeader from './TimerHeader';
    const Brand = () => {
        const {completed} = useTimer();
        return (
            <div className="brand-container">
                {!completed &&<TimerHeader/>}  
                <div className="brand-shell">
                    <img src={BrawnLogo} alt="Brawn Logo" /> 
                    <div>
                        <h1>Brawn</h1>
                        <p>Training Workspace</p>
                    </div>
                </div>
        </div>
    );
};

export default Brand;
