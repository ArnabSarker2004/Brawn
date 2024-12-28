import { useTimer } from '../../context/TimerContext';
import BrawnLogo from '../../assets/Brawn_Logo.png';
import './brand.css';
import TimerHeader from './TimerHeader';
    const Brand = () => {
        const {completed} = useTimer();
        return (
            <div className="brand-container">
                {!completed &&<TimerHeader/>}  
                <img src={BrawnLogo} alt="Brawn Logo" /> 
                <h1 className="text-xl font-bold">
                    Brawn
                </h1>
        </div>
    );
};

export default Brand;
