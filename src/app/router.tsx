import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/home/HomePage';
import { SessionPage } from '../pages/session/SessionPage';
import type { Plan } from '../models/plan.model';

// Temporary state management for navigation
// In a full app, this would be handled by a proper state management solution
let currentPlan: Plan | null = null;
let sessionCompleteHandler: ((duration: number, stagesCompleted: number) => void) | null = null;

export function setPlanForSession(plan: Plan) {
  currentPlan = plan;
}

export function onSessionComplete(handler: (duration: number, stagesCompleted: number) => void) {
  sessionCompleteHandler = handler;
}

export function AppRouter() {
  function handleSelectPlan(id: string) {
    // TODO: Load plan from service and navigate to detail
    console.log('Select plan:', id);
  }

  function handleCreatePlan() {
    // TODO: Navigate to plan editor
    console.log('Create plan');
  }

  function handleImport() {
    // TODO: Open file picker for import
    console.log('Import plan');
  }

  function handleSessionComplete(duration: number, stagesCompleted: number) {
    sessionCompleteHandler?.(duration, stagesCompleted);
    currentPlan = null;
  }

  function handleSessionCancel() {
    currentPlan = null;
    window.history.back();
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onSelectPlan={handleSelectPlan}
              onCreatePlan={handleCreatePlan}
              onImport={handleImport}
            />
          }
        />
        <Route
          path="/session"
          element={
            currentPlan ? (
              <SessionPage
                plan={currentPlan}
                onComplete={handleSessionComplete}
                onCancel={handleSessionCancel}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
