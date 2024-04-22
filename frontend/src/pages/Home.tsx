import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/app/dashboard');
    }, []);

    return (
        <div className="container py-4 px-3 mx-auto">
        </div>
    );
};

export default Home;
