import BrawnLogo from '../../assets/Brawn_Logo.png';
import './brand.css';
const Brand = () => {
    return (
        <div className="brand-container">
            <img src={BrawnLogo} alt="Brawn Logo" /> 
            <h1 className="text-xl font-bold">
                Brawn
            </h1>
        </div>
    );
};

export default Brand;
