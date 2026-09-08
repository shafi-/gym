import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { HomePage } from '../pages/home/HomePage';
import { SessionPage } from '../pages/session/SessionPage';
import { PlanDetailPage } from '../pages/plan-detail/PlanDetailPage';
import { PlanEditorPage } from '../pages/plan-editor/PlanEditorPage';
import { HistoryPage } from '../pages/history/HistoryPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { PlanService } from '../services/plan.service';
import { HistoryService } from '../services/history.service';
import { useState, useCallback } from 'react';
import type { Plan } from '../models/plan.model';

const planService = new PlanService();
const historyService = new HistoryService();

function AppRoutes() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  const handleSelectPlan = useCallback(async (id: string) => {
    const plan = await planService.getPlanById(id);
    if (plan) {
      setCurrentPlan(plan);
      navigate(`/plan/${id}`);
    }
  }, [navigate]);

  const handleCreatePlan = useCallback(() => {
    navigate('/plan/new');
  }, [navigate]);

  const handleStartSession = useCallback(async (planId: string) => {
    const plan = await planService.getPlanById(planId);
    if (plan) {
      setCurrentPlan(plan);
      setSearchParams({ planId });
      navigate('/session');
    }
  }, [navigate, setSearchParams]);

  const handleSessionComplete = useCallback(async (duration: number, stagesCompleted: number) => {
    if (currentPlan) {
      await historyService.logSession({
        planId: currentPlan.id,
        planName: currentPlan.name,
        startedAt: Date.now() - duration * 1000,
        completedAt: Date.now(),
        totalDuration: duration,
        stagesCompleted,
        completed: true,
      });
    }
    navigate('/');
  }, [currentPlan, historyService, navigate]);

  const handleSessionCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleImport = useCallback(() => {
    // TODO: Wire up file picker + JSON import
    console.log('Import plan');
  }, []);

  return (
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
        path="/plan/new"
        element={
          <PlanEditorPage
            onSave={(plan) => {
              navigate(`/plan/${plan.id}`);
            }}
            onCancel={() => navigate('/')}
          />
        }
      />
      <Route
        path="/plan/:planId"
        element={
          currentPlan ? (
            <PlanDetailPage
              plan={currentPlan}
              onStartSession={() => handleStartSession(currentPlan.id)}
              onEdit={() => navigate(`/plan/${currentPlan.id}/edit`)}
              onBack={() => navigate('/')}
            />
          ) : (
            <Navigate to="/" replace />
          )
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
      <Route
        path="/history"
        element={<HistoryPage onBack={() => navigate('/')} />}
      />
      <Route
        path="/settings"
        element={<SettingsPage onBack={() => navigate('/')} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
