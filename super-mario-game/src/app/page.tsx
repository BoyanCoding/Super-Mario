import Game from '@/components/Game';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Super Mario Platformer
          </h1>
          <p className="text-lg text-gray-600">
            A Next.js TypeScript implementation of the classic platformer
          </p>
        </header>
        
        <main className="flex justify-center">
          <Game 
            width={800}
            height={480}
            className="shadow-lg rounded-lg overflow-hidden"
          />
        </main>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Built with Next.js, TypeScript, and HTML5 Canvas</p>
        </footer>
      </div>
    </div>
  );
}
