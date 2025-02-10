import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuth, isAdmin }) => {
  const token = localStorage.getItem('token');
  if (!token || (!isAuth && !isAdmin)) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
