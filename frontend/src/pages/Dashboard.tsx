import { FC } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const Dashboard: FC = () => {
    const { keycloak } = useKeycloak();

    return (
        <div className='container-fluid p-2'>
            <button className='btn btn-danger' onClick={() => keycloak.logout()}>Logout</button>
            <header className='d-flex flex-column'>
                <pre>{JSON.stringify(keycloak, null, 2)}</pre>
            </header>
            <main>
                <h1>Dashboard</h1>
            </main>
        </div>
    );
};

export default Dashboard;
