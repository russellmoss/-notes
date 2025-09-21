export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Notes Middleware</h1>
        <p className="text-gray-600 mb-6">
          Middleware for processing notes from Otter, MyScript, and Manual sources.
        </p>
        
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">API Endpoints</h2>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/health</code> - Health check</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/ingest</code> - Ingest notes</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Sources Supported</h2>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Otter</strong> - Audio transcription</li>
              <li>• <strong>MyScript</strong> - Handwritten notes</li>
              <li>• <strong>Manual</strong> - Direct input</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
