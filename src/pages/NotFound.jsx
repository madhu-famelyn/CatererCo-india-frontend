import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-8xl">404</div>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This route doesn't exist. Head back home or explore our caterers.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/"><Button>Go home</Button></Link>
          <Link to="/browse"><Button variant="outline">Browse caterers</Button></Link>
        </div>
      </div>
    </div>
  );
}
