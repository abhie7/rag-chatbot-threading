import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Lock, Mail } from 'lucide-react';

export default function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulated login - TODO: replace with actual MongoDB authentication later
        setTimeout(() => {
            // Store a dummy token
            localStorage.setItem('token', 'dummy-token');
            localStorage.setItem(
                'user',
                JSON.stringify({
                    email,
                    name: 'Test User',
                    avatar:
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
                        email,
                })
            );
            setIsLoading(false);
            onLogin();
        }, 1000);
    };

    return (
        <div className='w-full max-w-md p-8 bg-card rounded-lg shadow-lg border'>
            <h2 className='text-3xl font-bold mb-8 text-center'>
                Welcome Back!
            </h2>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-2'>
                    <label htmlFor='email' className='text-sm font-medium'>
                        Email
                    </label>
                    <div className='relative'>
                        <Mail className='absolute left-3 top-3 h-5 w-5 text-muted-foreground' />
                        <Input
                            id='email'
                            type='email'
                            placeholder='Enter your email'
                            className='pl-10'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className='space-y-2'>
                    <label htmlFor='password' className='text-sm font-medium'>
                        Password
                    </label>
                    <div className='relative'>
                        <Lock className='absolute left-3 top-3 h-5 w-5 text-muted-foreground' />
                        <Input
                            id='password'
                            type='password'
                            placeholder='Enter your password'
                            className='pl-10'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
            <div className='mt-6 text-center text-sm'>
                <span className='text-muted-foreground'>
                    Don't have an account?{' '}
                </span>
                <Button variant='link' className='p-0'>
                    Sign up
                </Button>
            </div>
        </div>
    );
}
