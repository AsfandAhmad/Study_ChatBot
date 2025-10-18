'use client';

import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleAuthProvider, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FirefoxLogo } from '@/components/icons/firefox-logo';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // If Firebase is done loading and we have a user, redirect to the main app.
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Error initiating sign in with Google:', error);
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message || 'An unknown error occurred.',
      });
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect will handle the redirect on successful login
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message || 'Failed to sign in with email and password.',
      });
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // The useEffect will handle the redirect on successful sign-up
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message || 'Failed to create a new account.',
      });
      setIsLoading(false);
    }
  };


  // While Firebase is checking the auth state (especially after a redirect)
  // or if we're actively processing a login, show a loader.
  if (isUserLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not loading and no user, show the login UI.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <FirefoxLogo className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle>Welcome to Firefox Study Tutor</CardTitle>
          <CardDescription>Sign in or create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-in">Email</Label>
                    <Input id="email-in" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password-in">Password</Label>
                    <Input id="password-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    Sign In
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-up">Email</Label>
                    <Input id="email-up" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password-up">Password</Label>
                    <Input id="password-up" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    Create Account
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.5 56.2l-67.2 67.2C324.7 97.3 288.6 80 248 80c-82.6 0-150.2 67.5-150.2 150.2S165.4 406.2 248 406.2c47.4 0 88.8-19.4 118.8-51.5 15.4-16.3 25.4-38.6 27.9-64.2H248V261.8h239.9c.1 0 .1 0 .1.1z"></path></svg>
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    