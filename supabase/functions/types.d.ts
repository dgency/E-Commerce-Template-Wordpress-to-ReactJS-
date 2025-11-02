// Ambient declarations to make Deno edge functions type-check in a Node/Vite workspace
// These are only for local tooling and do not affect Supabase runtime.

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/x/xhr@0.1.0/mod.ts" {
  // no types needed; module patches fetch/xhr in Deno
}

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};
