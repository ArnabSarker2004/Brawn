import { Link, useNavigate } from "react-router-dom";

export function Logout({isExpanded}) {

  const navigate = useNavigate();
  const handleLogout = () =>{
    localStorage.removeItem('token');
    navigate('/');
  }
  return (
    (<Link onClick = {handleLogout} className="navbar-item">
      <LogOutIcon className="material-symbols-outlined navbar-logo" />
      {isExpanded && <span className="navbar-text">Logout</span>}
    </Link>)
  );
}

function LogOutIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>)
  );
}
