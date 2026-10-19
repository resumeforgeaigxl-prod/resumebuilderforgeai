import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobArtifactCard } from '@/components/agent/JobArtifactCard';

it('shows three results, expands in canonical order, and prepares the selected ID', () => {
  const prepare = jest.fn();
  const jobs = Array.from({length: 10}, (_, i) => ({
    id: `job-${i}`,
    title: `Senior distributed systems software engineer ${i}`,
    company: 'Long company name',
    location: 'Hyderabad'
  }));
  render(<JobArtifactCard artifact={{jobs}} locale="en-in" onPrepareApplication={prepare} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  fireEvent.click(screen.getAllByRole('button', {name: 'Prepare →'})[0]);
  expect(prepare).toHaveBeenCalledWith('job-0');
  fireEvent.click(screen.getByRole('button', {name: /Show all 10/}));
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
  expect(screen.getAllByRole('heading')[9].textContent).toContain(jobs[9].title);
});
