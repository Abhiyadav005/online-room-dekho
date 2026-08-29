import { Outlet } from 'react-router-dom';
import { AiAssistant } from '../components/AiAssistant';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export function SiteLayout() {
  return <div className="flex min-h-screen flex-col"><Header /><main id="main-content" className="flex-1"><Outlet /></main><Footer /><AiAssistant /></div>;
}
