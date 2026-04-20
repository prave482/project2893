'use client';

import { useEffect, useState } from 'react';
import { CareerProfile, getCareerProfile } from '@/lib/api';

const PROFILE_ID_KEY = 'ai-career-copilot-profile-id';
const PROFILE_CACHE_KEY = 'ai-career-copilot-profile-cache';
const PROFILE_META_KEY = 'ai-career-copilot-profile-meta';

type ProfileMeta = {
  aiProvider: string;
  storage: string;
  aiConfigured?: boolean;
  availableProviders?: string[];
  warning?: string;
};

export function useCareerProfile() {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [meta, setMeta] = useState<ProfileMeta | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') {
        setIsBootstrapping(false);
        return;
      }

      const savedId = window.localStorage.getItem(PROFILE_ID_KEY);
      const cachedProfile = window.localStorage.getItem(PROFILE_CACHE_KEY);
      const cachedMeta = window.localStorage.getItem(PROFILE_META_KEY);

      if (cachedProfile) {
        try {
          setProfile(JSON.parse(cachedProfile) as CareerProfile);
          if (cachedMeta) {
            setMeta(JSON.parse(cachedMeta) as ProfileMeta);
          }
        } catch {
          window.localStorage.removeItem(PROFILE_CACHE_KEY);
          window.localStorage.removeItem(PROFILE_META_KEY);
        }
      }

      if (!savedId) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const result = await getCareerProfile(savedId);
        setProfile(result.profile);
      } catch {
        if (!cachedProfile) {
          window.localStorage.removeItem(PROFILE_ID_KEY);
          setError('We could not load your saved profile. Please analyze your resume again.');
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    void load();
  }, []);

  const persistProfile = (nextProfile: CareerProfile, nextMeta?: ProfileMeta | null) => {
    setProfile(nextProfile);
    if (nextMeta) {
      setMeta(nextMeta);
    }
    setError(null);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROFILE_ID_KEY, nextProfile.id);
      window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile));
      if (nextMeta) {
        window.localStorage.setItem(PROFILE_META_KEY, JSON.stringify(nextMeta));
      }
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setMeta(null);
    setError(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PROFILE_ID_KEY);
      window.localStorage.removeItem(PROFILE_CACHE_KEY);
      window.localStorage.removeItem(PROFILE_META_KEY);
    }
  };

  return {
    profile,
    meta,
    error,
    isBootstrapping,
    setMeta,
    persistProfile,
    clearProfile,
  };
}
