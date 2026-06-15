import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  targetId?: string; // HTML ID of element to highlight
}

interface GuideTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideTour({ isOpen, onClose }: GuideTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  const steps: TourStep[] = [
    {
      title: 'Welcome to Echo!',
      description: 'Echo is a fast, local-first REST client. Let\'s take a 1-minute quick tour to help you get familiar with the interface.',
    },
    {
      title: 'Sidebar (Collections & History)',
      description: 'Manage request folders in Collections (supports folder duplication and drag-and-drop movement) or view past calls in History.',
      targetId: 'tour-sidebar',
    },
    {
      title: 'Workspace Tab Bar',
      description: 'Create multiple requests and run them in parallel. Easily switch tabs using Alt + [1-9] or close them.',
      targetId: 'tour-tabbar',
    },
    {
      title: 'Request Bar',
      description: 'Select HTTP method, enter your API URL, and hit "Send" or press Ctrl+Enter. Requests are CORS-free natively!',
      targetId: 'tour-urlbar',
    },
    {
      title: 'Request Settings',
      description: 'Manage query parameters, request headers, body formats (JSON/Form), and Auth methods. Supports {{variable}} inputs.',
      targetId: 'tour-reqtabs',
    },
    {
      title: 'Environment Selector',
      description: 'Click here or press Ctrl+Alt+E to manage and switch variable environments (e.g. localhost url vs production url).',
      targetId: 'tour-env-selector',
    },
    {
      title: 'Code Generator & Save',
      description: 'Generate copy-pasteable request code in cURL, Fetch, Python, or Rust, or save this request to your collections.',
      targetId: 'tour-actionsbar',
    },
    {
      title: 'Response Panel',
      description: 'Inspect status code, execution duration, response size, headers, and formatted JSON. Drag the resizer handle above it to resize!',
      targetId: 'tour-response-panel',
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Press "?" outside inputs to see all hotkeys (like Ctrl+B to toggle sidebar, Ctrl+Enter to send). Enjoy using Echo!',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('echo_tour_done', 'true');
    onClose();
    setCurrentStep(0);
  };

  // Auto-position and highlight effect
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];

    if (!step || !step.targetId) {
      // Centered overlay layout
      setCardStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '340px',
        zIndex: 51,
      });
      return;
    }

    const el = document.getElementById(step.targetId);
    if (!el) {
      // Fallback center
      setCardStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '340px',
        zIndex: 51,
      });
      return;
    }

    // Add CSS spotlight highlight
    el.classList.add('tour-highlight');

    const updatePosition = () => {
      const rect = el.getBoundingClientRect();
      const cardWidth = 320;
      
      // Calculate top position (default below, fallback above if it goes offscreen)
      let top = rect.bottom + 12;
      let left = rect.left + (rect.width - cardWidth) / 2;

      // Clamps
      if (left < 12) left = 12;
      if (left + cardWidth > window.innerWidth - 12) {
        left = window.innerWidth - cardWidth - 12;
      }
      
      // Check if card overflows bottom
      if (top + 160 > window.innerHeight - 12) {
        top = rect.top - 160 - 12; // place above
      }

      setCardStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${cardWidth}px`,
        zIndex: 51,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      el.classList.remove('tour-highlight');
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[49] pointer-events-none select-none">
      {/* Dark backdrop overlay (spotlight is created by box-shadow on target, but we need a fallback background for step 0/end) */}
      {!step.targetId && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto" />
      )}
      
      {/* Invisible overlay to prevent clicking behind tour card during spotlight steps */}
      {step.targetId && (
        <div className="absolute inset-0 pointer-events-auto cursor-default" />
      )}

      {/* Floating Tour Card */}
      <div
        className="pointer-events-auto bg-zinc-900 border border-orange-500/30 rounded-xl p-5 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
        style={cardStyle}
      >
        {/* Close Button */}
        <button
          onClick={handleComplete}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-350 p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Step Indicator */}
        <span className="text-[10px] uppercase font-bold text-orange-450 tracking-wider">
          Tour Step {currentStep + 1} of {steps.length}
        </span>

        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-100 mt-1.5">{step.title}</h3>

        {/* Description */}
        <p className="text-[11px] leading-relaxed text-zinc-350 mt-2 min-h-[48px]">
          {step.description}
        </p>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-4">
          <button
            onClick={handleComplete}
            className="text-[11px] font-semibold text-zinc-550 hover:text-zinc-400 cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex gap-1.5">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center justify-center p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-650 hover:bg-orange-600 text-white text-[11px] font-bold rounded-md transition-colors cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
