'use client';

import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeCareerProfile, CareerProfile } from '@/lib/api';

type ProfileMeta = {
  aiProvider: string;
  storage: string;
};

type Props = {
  onProfileReady: (profile: CareerProfile, meta: ProfileMeta) => void;
};

type FormState = {
  fullName: string;
  email: string;
  targetRole: string;
  skills: string;
  careerGoals: string;
  resumeText: string;
  resumeFileName: string;
  resumeFileBase64: string;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  targetRole: '',
  skills: '',
  careerGoals: '',
  resumeText: '',
  resumeFileName: '',
  resumeFileBase64: '',
};

function splitCommaList(input: string) {
  return input
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }

  return btoa(binary);
}

export default function ProfileForm({ onProfileReady }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');

    if (isText) {
      const text = await file.text();
      setForm((current) => ({
        ...current,
        resumeText: text,
        resumeFileName: file.name,
        resumeFileBase64: '',
      }));
      toast.success('Resume text loaded.');
      return;
    }

    const base64 = await fileToBase64(file);
    setForm((current) => ({
      ...current,
      resumeFileName: file.name,
      resumeFileBase64: base64,
    }));
    toast.success(`${file.name} uploaded.`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const result = await analyzeCareerProfile({
          fullName: form.fullName,
          email: form.email,
          targetRole: form.targetRole,
          skills: splitCommaList(form.skills),
          careerGoals: splitCommaList(form.careerGoals),
          resumeText: form.resumeText,
          resumeFileName: form.resumeFileName,
          resumeFileBase64: form.resumeFileBase64,
        });
        onProfileReady(result.profile, result.meta);
        toast.success('Career analysis created.');
      } catch (error: any) {
        if (!error?.response) {
          toast.error('Cannot reach the backend. Make sure the backend server is running on port 5000, then retry.');
          return;
        }

        toast.error(error?.response?.data?.error || 'Failed to analyze profile.');
      }
    });
  };

  return (
    <form className="surface panel-stack" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Resume Upload</p>
          <h1>Analyze your live profile</h1>
        </div>
        <span className="status-pill">No demo data</span>
      </div>

      <div className="field-grid">
        <label>
          Full name
          <input className="input" value={form.fullName} onChange={handleChange('fullName')} placeholder="Your name" />
        </label>
        <label>
          Email
          <input className="input" type="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" />
        </label>
        <label>
          Target role
          <input className="input" value={form.targetRole} onChange={handleChange('targetRole')} placeholder="Data Scientist" />
        </label>
        <label>
          Skills
          <input className="input" value={form.skills} onChange={handleChange('skills')} placeholder="Python, SQL, React" />
        </label>
      </div>

      <label>
        Career goals
        <textarea className="textarea" rows={4} value={form.careerGoals} onChange={handleChange('careerGoals')} placeholder="Describe the kind of role you want and what you want to improve." />
      </label>

      <label>
        Resume text
        <textarea className="textarea" rows={9} value={form.resumeText} onChange={handleChange('resumeText')} placeholder="Paste your resume text here, or upload a PDF/TXT file below." />
      </label>

      <label className="upload-box">
        <input type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" onChange={handleFileUpload} />
        <Upload size={20} />
        <div>
          <strong>Upload PDF or text resume</strong>
          <p>{form.resumeFileName || 'No file selected yet.'}</p>
        </div>
      </label>

      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? <LoaderCircle className="spin" size={18} /> : null}
        <span>{isPending ? 'Analyzing...' : 'Run Analysis'}</span>
      </button>
    </form>
  );
}
