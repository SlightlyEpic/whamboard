import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '@/lib/keycloak.ts';

import Home from '@/pages/Home.tsx';
import Dashboard from '@/pages/Dashboard.tsx';
import Protected from '@/components/util/Protected.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/dashboard',
        element: <Protected><Dashboard /></Protected>,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={keycloak} isLoadingCheck={() => !keycloak.authenticated} onEvent={console.log}>
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>,
    </ReactKeycloakProvider>
);
