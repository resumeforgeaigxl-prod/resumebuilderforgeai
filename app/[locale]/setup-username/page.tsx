import SetupUsernameClient from './SetupUsernameClient';

export default function SetupUsernamePage({ params }: { params: { locale: string } }) {
  return <SetupUsernameClient locale={params.locale} />;
}
