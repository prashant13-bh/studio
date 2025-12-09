import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Download } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="flex justify-center items-center gap-4 mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-4xl">GravityAI</CardTitle>
          </div>
          <p className="text-muted-foreground text-lg">
            Your intelligent assistant, seamlessly integrated into your browser.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            GravityAI enhances your browsing experience by providing contextual help, summarizing pages, and assisting with tasks right where you are.
          </p>
          <div className="flex flex-col items-center gap-4">
            <h3 className="font-semibold text-xl">Get Started</h3>
            <p className="text-muted-foreground">
              To use GravityAI, you'll need to load it as an extension in a compatible browser.
            </p>
            <a href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked" target="_blank" rel="noopener noreferrer">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Learn How to Load an Unpacked Extension
              </Button>
            </a>
            <p className="text-xs text-muted-foreground/80 mt-2">
              Follow the instructions and select the 'dist' folder from this project.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
