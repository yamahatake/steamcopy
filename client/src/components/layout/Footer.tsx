export default function Footer() {
  return (
    <footer className="bg-[#171a21] border-t border-[#2a3f5a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#1a9fff] to-[#66c0f4] rounded flex items-center justify-center font-bold text-white text-xs">
              S
            </div>
            <span className="text-[#acb2b8] text-sm">Steam Clone</span>
          </div>
          <p className="text-[#4c6b82] text-xs text-center">
            A full-stack demo built with React, TypeScript, Express, Drizzle ORM & PostgreSQL.
          </p>
        </div>
      </div>
    </footer>
  );
}
