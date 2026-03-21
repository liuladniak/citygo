import { LoginForm } from "./LoginForm";

export function LoginWithGoogle() {
  return (
    <div className="flex min-h-svh w-full">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80"
          alt="Istanbul skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20" />

        <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">
              CG
            </div>
            <span className="font-semibold text-lg">CityGo</span>
          </div>

          <div className="space-y-4">
            <blockquote className="text-2xl font-semibold leading-snug">
              "Istanbul is not a city. It is a universe."
            </blockquote>
            <p className="text-sm text-white/70">— Orhan Pamuk</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">CityGo Tours</p>
            <p className="text-xs text-white/60">
              Istanbul's premier guided tour experience
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm text-white">
              CG
            </div>
            <span className="font-semibold text-lg">CityGo</span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
