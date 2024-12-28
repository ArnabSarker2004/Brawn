import BrawnLogo from '../../assets/Brawn_Logo.png';
import './brand.css';
import TimerHeader from './TimerHeader';
    const Brand = () => {
        return (
            <div className="brand-container">
                <TimerHeader/>  
                <img src={BrawnLogo} alt="Brawn Logo" /> 
                <h1 className="text-xl font-bold">
                    Brawn
                </h1>
        </div>
    );
};

export default Brand;
