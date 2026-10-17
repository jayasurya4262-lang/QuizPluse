import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AvailableQuizzesPage } from './pages/student/AvailableQuizzesPage';
import { QuizDetailPage } from './pages/student/QuizDetailPage';
import { ActiveQuizPage } from './pages/student/ActiveQuizPage';
import { QuizResultPage } from './pages/student/QuizResultPage';
import { AttemptHistoryPage } from './pages/student/AttemptHistoryPage';
import { StudentAnalyticsPage } from './pages/student/StudentAnalyticsPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { StudentDashboard } from './pages/student/StudentDashboard';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { MyQuizzesPage } from './pages/teacher/MyQuizzesPage';
import { QuizEditorPage } from './pages/teacher/QuizEditorPage';
import { QuizResultsPage } from './pages/teacher/QuizResultsPage';

// Not Found
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public & Common Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/quizzes" element={<AvailableQuizzesPage />} />
              <Route path="/quizzes/:id" element={<QuizDetailPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attempts"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <AttemptHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/analytics"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/attempt/:attemptId"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <ActiveQuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results/:attemptId"
                element={
                  <ProtectedRoute>
                    <QuizResultPage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <MyQuizzesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes/create"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <QuizEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <QuizEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes/:id/results"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <QuizResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
