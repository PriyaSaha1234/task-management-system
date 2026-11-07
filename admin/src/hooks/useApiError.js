import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Returns a function that handles API errors:
// expired/invalid login -> back to the login page, anything else -> alert
export default function useApiError(setError) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (err) => {
    if (err.status === 401 || err.status === 403) {
      logout();
      navigate('/login');
    } else if (setError) {
      setError(err.message);
    } else {
      window.alert(err.message);
    }
  };
}
