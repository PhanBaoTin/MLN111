import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/main-layout';
import { AdminPage } from '../../features/admin/pages/admin-page';
import { GamePage } from '../../features/game/pages/game-page';
import { HomePage } from '../../features/room/pages/home-page';
import { WaitingPage } from '../../features/room/pages/waiting-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
     // { index: true, element: <HomePage /> },
      { index: true, element: <AdminPage /> },
      { path: 'waiting', element: <WaitingPage /> },
      { path: 'game', element: <GamePage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <HomePage /> }
    ],
  },
]);
