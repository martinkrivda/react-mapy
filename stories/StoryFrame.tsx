import type { ReactNode } from 'react';

interface StoryFrameProps {
  children: ReactNode;
  note?: string | undefined;
  summary: string;
  title: string;
}

export function StoryFrame({ children, note, summary, title }: StoryFrameProps) {
  return (
    <div className="story-shell">
      <div className="story-shell__content">
        <p className="story-shell__eyebrow">react-mapy story</p>
        <h1 className="story-shell__title">{title}</h1>
        <p className="story-shell__body">{summary}</p>
        {note ? <div className="story-shell__note">{note}</div> : null}
        <div className="story-shell__map">{children}</div>
      </div>
    </div>
  );
}
