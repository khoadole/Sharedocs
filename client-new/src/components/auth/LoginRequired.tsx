import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export function LoginRequired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Login Required</h2>
              <p className="text-muted-foreground">
                You need to login to use this feature
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/signin')}
              >
                Sign In
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
