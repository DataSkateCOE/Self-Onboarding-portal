// Component removed as part of progress tracking removal
// If needed in the future, create a new component instead of reusing this one

// Simple interface to replace the removed Step type
interface StepItem {
  id: number;
  label: string;
  description?: string;
}

interface StepProgressProps {
  steps?: StepItem[];
  currentStep?: number;
}

// Placeholder to maintain import references until we can clean up all imports
const StepProgress = (_props: StepProgressProps) => null;

export default StepProgress;
