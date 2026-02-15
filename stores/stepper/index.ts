import { create } from 'zustand';

export interface StepState<T> {
  state: 'completed' | 'not-completed';
  additionalInfo: string;
  data?: T[];
  selectionData?: Record<string, string | undefined>;
}

export interface StepStore<T extends string> {
  currentStep: T;
  lastStep: T;
  stepHistory: T[];
  stepState: Record<T, StepState<T>>;
  goToStep: (step: T) => void;
  goBack: () => void;
  goBackToStep: (steps: number) => void;
  goToFirstPage: () => void;
  resetState: () => void;
  resetToInitialStep: (initialStep: T) => void;
  complete: (onComplete?: () => void) => void;
  updateStepState: (step: T, state: StepState<T>) => void;
  setAdditionalInfo: (step: T, info: string) => void;
  setLastStep: (step: T) => void;
  canGoBack: boolean;
}

export const createStepperStore = <T extends string>(initialStep: T) =>
  create<StepStore<T>>()((set) => ({
    currentStep: initialStep,
    lastStep: '' as T, // Will be set explicitly by wizard - empty string prevents accidental match
    stepHistory: [initialStep],
    stepState: {
      [initialStep]: { state: 'not-completed', additionalInfo: '' },
    } as Record<T, StepState<T>>,

    setLastStep: (step: T) =>
      set(() => ({
        lastStep: step,
      })),

    goToStep: (step) =>
      set((state) => ({
        currentStep: step,
        stepHistory: [...state.stepHistory, step],
        canGoBack: true,
      })),
    goBack: () =>
      set((state) => {
        if (state.stepHistory.length > 1) {
          const newHistory = [...state.stepHistory];
          newHistory.pop();
          const previousStep = state.stepHistory[state.stepHistory.length - 2];
          return {
            currentStep: newHistory[newHistory.length - 1],
            stepState: {
              ...state.stepState,
              [previousStep]: {
                state: 'not-completed',
                additionalInfo:
                  state.stepState[previousStep]?.additionalInfo || '',
              },
            },
            stepHistory: newHistory,
            canGoBack: newHistory.length > 1,
          };
        }
        return state;
      }),
    goBackToStep: (steps = 1) =>
      set((state) => {
        if (state.stepHistory.length > steps) {
          const newHistory = state.stepHistory.slice(0, -steps);
          const previousStep = newHistory[newHistory.length - 1];

          const updatedStepState = { ...state.stepState };
          for (
            let i = state.stepHistory.length - steps - 1;
            i < state.stepHistory.length;
            i++
          ) {
            const step = state.stepHistory[i];
            updatedStepState[step] = {
              state: 'not-completed',
              additionalInfo: updatedStepState[step]?.additionalInfo || '',
              data: updatedStepState[step]?.data,
              selectionData: updatedStepState[step]?.selectionData,
            };
          }

          return {
            currentStep: previousStep,
            stepState: updatedStepState,
            stepHistory: newHistory,
            canGoBack: newHistory.length > 1,
          };
        }
        return state;
      }),
    complete: (onComplete) => {
      if (onComplete) {
        onComplete();
      }
    },
    updateStepState: (step, newState) =>
      set((state) => ({
        stepState: {
          ...state.stepState,
          [step]: newState,
        },
      })),
    setAdditionalInfo: (step: T, info: string) =>
      set((state) => ({
        stepState: {
          ...state.stepState,
          [step]: {
            ...state.stepState[step],
            additionalInfo: info,
          },
        },
      })),
    goToFirstPage: () =>
      set((state) => {
        const updatedStepState = { ...state.stepState };
        for (const step in updatedStepState) {
          updatedStepState[step] = {
            state: 'not-completed',
            additionalInfo: updatedStepState[step]?.additionalInfo || '',
            data: updatedStepState[step]?.data,
            selectionData: updatedStepState[step]?.selectionData,
          };
        }
        return {
          currentStep: initialStep,
          stepHistory: [initialStep],
          stepState: updatedStepState,
          canGoBack: false,
        };
      }),
    resetState: () =>
      set(() => ({
        currentStep: initialStep,
        stepHistory: [initialStep],
        stepState: {
          [initialStep]: { state: 'not-completed', additionalInfo: '' },
        } as Record<T, StepState<T>>,
        canGoBack: false,
      })),
    resetToInitialStep: (initialStep: T) =>
      set(() => ({
        currentStep: initialStep,
        stepHistory: [initialStep],
        stepState: {
          [initialStep]: { state: 'not-completed', additionalInfo: '' },
        } as Record<T, StepState<T>>,
        canGoBack: false,
      })),
    canGoBack: false,
  }));
