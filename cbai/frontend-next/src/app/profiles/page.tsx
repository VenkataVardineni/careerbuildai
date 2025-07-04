'use client';

import { useEffect, useState } from 'react';
import { profilesAPI } from '@/lib/api';
import { Brain, UserCircle, Edit, Trash2, PlusCircle, Loader2, AlertCircle, Save, X, Upload } from 'lucide-react';

interface ProfileForm {
  full_name: string;
  career_role: string;
  skills: string;
  resume_content?: string;
  resume_file_name?: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>({ full_name: '', career_role: '', skills: '', resume_content: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeUploadLoading, setResumeUploadLoading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState('');

  const loadProfiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await profilesAPI.getAll();
      setProfiles(res);
    } catch (err: any) {
      setError('Failed to load profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('email');
      if (!email) {
        window.location.href = '/login';
        return;
      }
    }
    loadProfiles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    setFormLoading(true);
    setError('');
    try {
      await profilesAPI.delete(id);
      await loadProfiles();
    } catch (err: any) {
      setError('Failed to delete profile.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (profile: any) => {
    setEditingProfile(profile);
    setForm({
      full_name: profile.full_name,
      career_role: profile.career_role,
      skills: profile.skills,
      resume_content: profile.resume_content || '',
      resume_file_name: profile.resume_file_name || '',
    });
    if (profile.resume_file_name) {
      setResumeFileName(profile.resume_file_name);
    } else if (profile.resume_file_path) {
      const parts = profile.resume_file_path.split('/');
      setResumeFileName(parts[parts.length - 1]);
    } else if (profile.resume_content) {
      setResumeFileName('Uploaded Resume');
    } else {
      setResumeFileName('');
    }
    setResumeFile(null);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setForm({ full_name: '', career_role: '', skills: '', resume_content: '' });
    setResumeFile(null);
    setResumeFileName('');
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeFileName(file.name);
    setResumeUploadLoading(true);
    setResumeUploadError('');
    try {
      const response = await profilesAPI.uploadResume(file);
      setForm((prev) => ({ ...prev, resume_content: response.resume_content, resume_file_name: file.name }));
    } catch (err: any) {
      setResumeUploadError('Failed to upload and extract resume. Please try again.');
      setResumeFile(null);
      setResumeFileName('');
      setForm((prev) => ({ ...prev, resume_file_name: '' }));
    } finally {
      setResumeUploadLoading(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeFileName('');
    setForm((prev) => ({ ...prev, resume_content: '', resume_file_name: '' }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      if (editingProfile) {
        await profilesAPI.update(editingProfile.id, form);
      } else {
        await profilesAPI.create(form);
      }
      setShowForm(false);
      await loadProfiles();
    } catch (err: any) {
      setError('Failed to save profile.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Manage Your Profiles</h1>
          <p className="mt-2 text-lg text-gray-600">Create, edit, or delete your interview profiles</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Profiles</h2>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <PlusCircle className="h-5 w-5 mr-1" />Create New Profile
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(profiles) && profiles.length === 0 ? (
                <div className="text-gray-500 text-center">No profiles found. Click 'Create New Profile' to add one.</div>
              ) : (
                (Array.isArray(profiles) ? profiles : []).map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between border rounded-lg p-4 bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-indigo-500" />
                        <span className="font-bold text-gray-900 text-lg">{profile.full_name}</span>
                      </div>
                      <div className="text-gray-700 text-sm mt-1">{profile.career_role}</div>
                      <div className="text-gray-500 text-xs mt-1">Skills: {profile.skills.substring(0, 80)}{profile.skills.length > 80 ? '...' : ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(profile)}
                        className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                        title="Delete"
                        disabled={formLoading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {/* Modal or inline form for create/edit */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowForm(false)}
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-indigo-500" />
                {editingProfile ? 'Edit Profile' : 'Create New Profile'}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                    style={{ color: '#000' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Role *</label>
                  <input
                    name="career_role"
                    type="text"
                    value={form.career_role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                    style={{ color: '#000' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills & Experience *</label>
                  <textarea
                    name="skills"
                    rows={3}
                    value={form.skills}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                    style={{ color: '#000' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume Upload (optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {resumeFileName ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Upload className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            {resumeFileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="resume-upload" className="cursor-pointer text-indigo-600 hover:text-indigo-500 font-medium">
                            Upload a resume
                          </label>
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.docx,.doc"
                            onChange={handleResumeUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or DOC up to 10MB</p>
                      </div>
                    )}
                    {resumeUploadLoading && (
                      <div className="flex items-center justify-center mt-2">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                        <span className="ml-2 text-sm text-gray-500">Extracting resume...</span>
                      </div>
                    )}
                    {resumeUploadError && (
                      <div className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{resumeUploadError}</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading || resumeUploadLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {editingProfile ? 'Save Changes' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 