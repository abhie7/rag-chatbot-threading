import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className='w-full max-w-md p-6 bg-card rounded-lg shadow-md border'>
            <h2 className='text-2xl font-bold mb-6 text-center'>Register</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label
                        htmlFor='email'
                        className='block text-sm font-medium mb-1'
                    >
                        Email
                    </label>
                    <Input
                        id='email'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor='password'
                        className='block text-sm font-medium mb-1'
                    >
                        Password
                    </label>
                    <Input
                        id='password'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor='confirmPassword'
                        className='block text-sm font-medium mb-1'
                    >
                        Confirm Password
                    </label>
                    <Input
                        id='confirmPassword'
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type='submit' className='w-full'>
                    Register
                </Button>
            </form>
        </div>
    );
}
