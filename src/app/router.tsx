import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HomePage } from '../pages/home/HomePage';
import { SessionPage } from '../pages/session/SessionPage';
import { PlanDetailPage } from '../pages/plan-detail/PlanDetailPage';
import { PlanEditorPage } from '../pages/plan-editor/PlanEditorPage';
import { HistoryPage } from '../pages/history/HistoryPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { PlanService } from '../services/plan.service';
import { HistoryService } from '../services/history.service';
import { Spinner } from '../components/ui/Spinner';
import type { Plan } from '../models/plan.model';

const planService = new PlanService();
const historyService = new HistoryService();

// Home
function HomeRoute() {
  const navigate = useNavigate();

  return (
    <HomePage
      onSelectPlan={(id) => navigate(`/plan/${id}`)}
      onCreatePlan={() => navigate('/plan/new')}
      onImport={() => {
        // TODO: Wire up file picker + JSON import
        console.log('Import plan');
      }}
      onHistory={() => navigate('/history')}
      onSettings={() => navigate('/settings')}
    />
  );
}

// New plan editor (no existing plan)
function NewPlanRoute() {
  const navigate = useNavigate();

  return (
    <PlanEditorPage
      onSave={(plan) => navigate(`/plan/${plan.id}`)}
      onCancel={() => navigate('/')}
    />
  );
}

// Edit existing plan, loaded by :planId
function EditPlanRoute() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!planId) return;
    let active = true;
    planService
      .getPlanById(planId)
      .then((p) => { if (active) setPlan(p ?? null); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [planId]);

  if (!loaded) return <Spinner />;
  if (!plan) return <Navigate to="/" replace />;

  return (
    <PlanEditorPage
      plan={plan}
      onSave={(updated) => navigate(`/plan/${updated.id}`)}
      onCancel={() => navigate(`/plan/${plan.id}`)}
    />
  );
}

// Plan detail + session, loaded by :planId
function PlanDetailRoute() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!planId) return;
    let active = true;
    planService
      .getPlanById(planId)
      .then((p) => { if (active) setPlan(p ?? null); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [planId]);

  if (!loaded) return <Spinner />;
  if (!plan) return <Navigate to="/" replace />;

  return (
    <PlanDetailPage
      plan={plan}
      onStartSession={() => navigate(`/session/${planId}`)}
      onEdit={() => navigate(`/plan/${planId}/edit`)}
      onBack={() => navigate('/')}
    />
  );
}

// Active session, loaded by :planId
function SessionRoute() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!planId) return;
    let active = true;
    planService
      .getPlanById(planId)
      .then((p) => { if (active) setPlan(p ?? null); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [planId]);

  if (!loaded) return <Spinner />;
  if (!plan) return <Navigate to="/" replace />;

  const handleComplete = async (duration: number, stagesCompleted: number) => {
    await historyService.logSession({
      planId: plan.id,
      planName: plan.name,
      startedAt: Date.now() - duration * 1000,
      completedAt: Date.now(),
      totalDuration: duration,
      stagesCompleted,
      completed: true,
    });
    navigate('/');
  };

  return (
    <SessionPage
      plan={plan}
      onComplete={handleComplete}
      onCancel={() => navigate(`/plan/${planId}`)}
    />
  );
}

// History
function HistoryRoute() {
  const navigate = useNavigate();
  return <HistoryPage onBack={() => navigate('/')} />;
}

// Settings
function SettingsRoute() {
  const navigate = useNavigate();
  return <SettingsPage onBack={() => navigate('/')} />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/plan/new" element={<NewPlanRoute />} />
        <Route path="/plan/:planId" element={<PlanDetailRoute />} />
        <Route path="/plan/:planId/edit" element={<EditPlanRoute />} />
        <Route path="/session/:planId" element={<SessionRoute />} />
        <Route path="/history" element={<HistoryRoute />} />
        <Route path="/settings" element={<SettingsRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
