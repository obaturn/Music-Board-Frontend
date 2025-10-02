
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WordPressPost } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const WordPressContentPage: React.FC = () => {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) {
        setError('Authentication required.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getWpPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch WordPress content');
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchPosts();
  }, [token]);

  const removeHtmlTags = (str: string) => str.replace(/<[^>]*>?/gm, '');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-4xl font-bold text-center text-white mb-8">Music Industry News</h2>
      <div className="space-y-6 max-w-4xl mx-auto">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="spotify-card p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 hover:text-spotify-green transition-colors">
                  {post.title?.rendered || 'Untitled Article'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-spotify-gray-light mb-4">
                  <span>{post.date ? new Date(post.date).toLocaleDateString() : 'Date not available'}</span>
                </div>
              </div>

              <div className="text-spotify-gray-light mb-4 line-clamp-3">
                {typeof post.excerpt?.rendered === 'string'
                  ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...'
                  : 'Content preview not available.'
                }
              </div>

              <div className="flex items-center justify-end">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-spotify-green hover:text-spotify-green-hover font-medium transition-colors"
                >
                  Read More →
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-spotify-gray-light mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-spotify-gray-light text-lg">No news articles available.</p>
            <p className="text-spotify-gray-light text-sm mt-2">Check back later for the latest music industry updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPressContentPage;
