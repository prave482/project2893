'use client';

import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import { FileText, LoaderCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeCareerProfile, CareerProfile } from '@/lib/api';

type ProfileMeta = {
  aiProvider: string;
  storage: string;
  aiConfigured?: boolean;
  availableProviders?: string[];
  warning?: string;
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
  resumeFileBase64: string;
  resumeFileName: string;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  targetRole: '',
  skills: '',
  careerGoals: '',
  resumeText: '',
  resumeFileBase64: '',
  resumeFileName: '',
};

function splitCommaList(input: string) {
  return input.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export default function ProfileForm({ onProfileReady }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, resumeFileBase64: '', resumeFileName: '' }));
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.txt') && !lowerName.endsWith('.md')) {
      toast.error('Upload a PDF, TXT, or MD file.');
      event.target.value = '';
      return;
    }

    try {
      const resumeFileBase64 = await readFileAsBase64(file);
      setForm((current) => ({
        ...current,
        resumeFileBase64,
        resumeFileName: file.name,
      }));
      toast.success(`${file.name} is ready for analysis.`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to read the file.');
    }
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
          resumeFileBase64: form.resumeFileBase64,
          resumeFileName: form.resumeFileName || undefined,
        });
        onProfileReady(result.profile, result.meta);
        toast.success('Career analysis created.');
      } catch (error: any) {
        const errMsg = error?.response?.data?.error || error?.message || 'Failed to analyze profile.';
        toast.error(errMsg);
      }
    });
  };

  return (
    <form className="surface panel-stack" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Resume Analyzer</p>
          <h1>Analyze your profile</h1>
        </div>
        <span className="status-pill">AI-Powered</span>
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
          <input className="input" value={form.targetRole} onChange={handleChange('targetRole')} placeholder="Frontend Developer" />
        </label>
        <label>
          Skills
          <input className="input" value={form.skills} onChange={handleChange('skills')} placeholder="React, TypeScript, Node.js" />
        </label>
      </div>

      <label>
        Career goals
        <textarea className="textarea" rows={3} value={form.careerGoals} onChange={handleChange('careerGoals')} placeholder="Describe your career goals and what you want to improve." />
      </label>

      <label>
        Resume text
        <textarea className="textarea" rows={10} value={form.resumeText} onChange={handleChange('resumeText')} placeholder="Paste your resume text here..." />
      </label>

      <label className="upload-box">
        <span>Resume file</span>
        <input type="file" accept=".pdf,.txt,.md" onChange={handleFileChange} />
        <span className="tag-row">
          <span className="tag">
            <Upload size={14} />
            Upload PDF or TXT
          </span>
          {form.resumeFileName ? (
            <span className="tag">
              <FileText size={14} />
              {form.resumeFileName}
            </span>
          ) : null}
        </span>
      </label>

      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? <LoaderCircle className="spin" size={18} /> : null}
        <span>{isPending ? 'Analyzing...' : 'Run Analysis'}</span>
      </button>
    </form>
  );
}
