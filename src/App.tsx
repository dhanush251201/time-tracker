import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';

export const App = (): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Outlet />
    </div>
  );
};

export default App;
