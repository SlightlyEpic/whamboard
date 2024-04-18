import { useKeycloak } from '@react-keycloak/web';
import { FC, PropsWithChildren } from 'react';

const Protected: FC<PropsWithChildren> = ({ children }) => {
    const { keycloak, initialized } = useKeycloak();

    if(!initialized) return <div>Loading...</div>;

    if(!keycloak.authenticated) {
        return (
            <div className="alert alert-danger">
                <div>Not authenticated</div>
                <button className="btn btn-primary" onClick={() => keycloak.login()}>
                    Login
                </button>
            </div>
        );
    }

    return children;
};

export default Protected;
