import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { 
    createBrowserRouter, 
    RouterProvider
} from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
