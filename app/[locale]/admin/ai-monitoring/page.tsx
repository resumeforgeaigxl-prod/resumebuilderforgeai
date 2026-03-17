import AIMonitoringClient from './AIMonitoringClient';

export default function AIMonitoringPage({ params }: { params: { locale: string } }) {
  return <AIMonitoringClient locale={params.locale} />;
}
