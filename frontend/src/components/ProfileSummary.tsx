'use client';

import { CareerProfile } from '@/lib/api';

export default function ProfileSummary({
  profile,
  meta,
}: {
  profile: CareerProfile;
  meta?: { aiProvider: string; storage: string; aiConfigured?: boolean; availableProviders?: string[]; warning?: string } | null;
}) {
  return (
    <div className="panel-stack">
      <section className="surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>{profile.fullName}</h2>
          </div>
          <span className="status-pill">{profile.targetRole}</span>
        </div>

        <p className="lead-copy">{profile.analysis.summary}</p>

        <div className="metrics-grid">
          <div className="metric-box">
            <strong>{profile.skillGap.missingSkills.length}</strong>
            <span>Priority skill gaps</span>
          </div>
          <div className="metric-box">
            <strong>{profile.projects.length}</strong>
            <span>Suggested projects</span>
          </div>
          <div className="metric-box">
            <strong>{profile.progress.completionScore}%</strong>
            <span>Progress score</span>
          </div>
        </div>

        <div className="tag-row">
          <span className="tag">AI: {meta?.aiProvider ?? 'unknown'}</span>
          <span className="tag">Storage: {meta?.storage ?? 'saved profile'}</span>
          <span className="tag">{profile.email}</span>
        </div>
        {meta?.warning ? <p className="muted-copy">{meta.warning}</p> : null}
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Skill Analysis</p>
            <h2>Strengths and gaps</h2>
          </div>
        </div>

        <div className="two-column">
          <div>
            <h3>Strengths</h3>
            <ul className="list">
              {profile.analysis.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Weaknesses</h3>
            <ul className="list">
              {profile.analysis.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="two-column">
          <div>
            <h3>Missing Skills</h3>
            <div className="tag-row">
              {profile.skillGap.missingSkills.map((item) => (
                <span key={item} className="tag tag-warn">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3>Learning Path</h3>
            <ul className="list">
              {profile.skillGap.learningPath.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
