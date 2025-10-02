import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface PlaylistFormData {
  name: string;
  description: string;
}

interface PlaylistFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlaylistFormData) => Promise<void>;
  initialData?: PlaylistFormData;
  title: string;
}

const PlaylistForm: React.FC<PlaylistFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting playlist form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
            Playlist Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-brand-light border border-brand-gray rounded-md text-white placeholder-brand-subtext focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter playlist name"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-brand-light border border-brand-gray rounded-md text-white placeholder-brand-subtext focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            placeholder="Enter playlist description (optional)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-brand-subtext hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Playlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlaylistForm;