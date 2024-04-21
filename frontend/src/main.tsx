import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '@/lib/keycloak.ts';

import Home from '@/pages/Home.tsx';
import Dashboard from '@/pages/Dashboard.tsx';
import Protected from '@/components/util/Protected.tsx';
import Room from '@/pages/Room';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/app/dashboard',
        element: <Protected><Dashboard /></Protected>,
    },
    {
        path: '/app/room/:roomId',
        element: <Protected><Room /></Protected>,
        // element: <Room />,
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={keycloak}>
        {/* <React.StrictMode> */}
        <RouterProvider router={router} />
        {/* </React.StrictMode> */}
    </ReactKeycloakProvider>
);
