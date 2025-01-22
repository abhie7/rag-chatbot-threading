import { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/Dashboard';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <ThemeProvider>
            <div className='min-h-screen bg-background'>
                {!isAuthenticated ? (
                    <div className='flex items-center justify-center min-h-screen'>
                        <LoginForm onLogin={() => setIsAuthenticated(true)} />
                    </div>
                ) : (
                    <Dashboard />
                )}
            </div>
        </ThemeProvider>
    );
}
