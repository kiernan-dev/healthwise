import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Add mobile-specific viewport and iOS optimizations
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Add mobile-specific styles to prevent zoom on input focus
    const style = document.createElement('style');
    style.textContent = `
      @media screen and (max-width: 768px) {
        input, textarea, select {
          font-size: 16px !important;
          transform: translateZ(0);
          -webkit-appearance: none;
          -webkit-transform: translateZ(0);
        }
        
        body {
          -webkit-touch-callout: none;
          -webkit-text-size-adjust: 100%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          overscroll-behavior: none;
        }
        
        #root {
          height: 100vh;
          height: 100dvh;
        }
        
        /* iOS Safari bottom bar handling */
        @supports (padding: max(0px)) {
          .pb-safe {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          basename="/healthwise"
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
