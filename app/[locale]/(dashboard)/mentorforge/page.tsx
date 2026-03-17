import MentorForgeClient from './MentorForgeClient';

export default function MentorForgePage({ params }: { params: { locale: string } }) {
  return <MentorForgeClient locale={params.locale} />;
}
