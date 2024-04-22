import { useKeycloak } from '@react-keycloak/web';
import { FC, PropsWithChildren } from 'react';

const Protected: FC<PropsWithChildren> = ({ children }) => {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) return <div>Loading...</div>;

    if (!keycloak.authenticated) {
        return (
            <div className="d-flex h-100 w-100 align-items-center justify-content-center ">
                <div className='alert alert-danger d-flex flex-column gap-2 align-items-center justify-content-center' style={{ width: '36rem', height: '12rem' }}>
                    <h4>Please login to continue...</h4>
                    <button className="btn btn-primary" onClick={() => keycloak.login()}>
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default Protected;
