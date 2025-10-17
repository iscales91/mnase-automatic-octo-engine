import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Eye, Tag, ArrowLeft } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function News() {
  const { postId } = useParams();
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null,
    tag: null
  });

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    } else {
      fetchPosts();
      fetchCategories();
      fetchTags();
    }
  }, [postId, filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        published_only: true,
        limit: 20
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.tag) params.tag = filters.tag;
      
      const response = await axios.get(`${API}/api/news`, { params });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPost = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/news/${id}`);
      setCurrentPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/api/news/categories/list`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API}/api/news/tags/list`);
      setTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      news: '#3b82f6',
      announcement: '#10b981',
      feature: '#8b5cf6',
      tournament: '#f59e0b',
      'success-story': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      news: 'News',
      announcement: 'Announcement',
      feature: 'Feature',
      tournament: 'Tournament',
      'success-story': 'Success Story'
    };
    return labels[category] || category;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Single Post View
  if (postId && currentPost) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          padding: '2rem 0'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <Link 
              to="/news"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                textDecoration: 'none',
                marginBottom: '1rem',
                opacity: 0.9
              }}
            >
              <ArrowLeft size={20} />
              Back to News
            </Link>
          </div>
        </div>

        {/* Post Content */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
          <article style={{ background: 'white', borderRadius: '12px', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Category Badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                background: getCategoryColor(currentPost.category) + '20',
                color: getCategoryColor(currentPost.category),
                marginBottom: '1.5rem'
              }}
            >
              {getCategoryLabel(currentPost.category)}
            </span>

            {/* Title */}
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem',
              lineHeight: '1.2',
              color: '#1e293b'
            }}>
              {currentPost.title}
            </h1>

            {/* Meta Info */}
            <div style={{ 
              display: 'flex', 
              gap: '2rem', 
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} />
                {currentPost.author_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                {formatDate(currentPost.published_at || currentPost.created_at)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} />
                {currentPost.views} views
              </div>
            </div>

            {/* Featured Image */}
            {currentPost.featured_image && (
              <img
                src={currentPost.featured_image}
                alt={currentPost.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  marginBottom: '2rem'
                }}
              />
            )}

            {/* Content */}
            <div 
              style={{ 
                fontSize: '1.1rem',
                lineHeight: '1.8',
                color: '#334155'
              }}
              dangerouslySetInnerHTML={{ __html: currentPost.content.replace(/\n/g, '<br/>') }}
            />

            {/* Tags */}
            {currentPost.tags && currentPost.tags.length > 0 && (
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Tag size={20} style={{ color: '#64748b' }} />
                  {currentPost.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/news?tag=${tag}`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f1f5f9',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#475569',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    );
  }

  // Posts List View
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '4rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            News & Updates
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Stay up to date with the latest from MNASE Basketball League
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>
          {/* Posts Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <p>No posts found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {posts.map(post => (
                  <Link
                    key={post.id}
                    to={`/news/${post.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <article
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '2rem' }}>
                        {/* Featured Image */}
                        {post.featured_image && (
                          <div style={{ width: '280px', flexShrink: 0 }}>
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div style={{ padding: '2rem', flex: 1 }}>
                          {/* Category */}
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: getCategoryColor(post.category) + '20',
                              color: getCategoryColor(post.category),
                              marginBottom: '1rem'
                            }}
                          >
                            {getCategoryLabel(post.category)}
                          </span>

                          {/* Title */}
                          <h2 style={{ 
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            marginBottom: '0.75rem',
                            color: '#1e293b'
                          }}>
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p style={{ 
                            fontSize: '0.95rem',
                            color: '#64748b',
                            marginBottom: '1rem',
                            lineHeight: '1.6'
                          }}>
                            {post.excerpt}
                          </p>

                          {/* Meta */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '1.5rem',
                            fontSize: '0.85rem',
                            color: '#94a3b8'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <User size={14} />
                              {post.author_name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={14} />
                              {formatDate(post.published_at || post.created_at)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Eye size={14} />
                              {post.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Categories */}
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                Categories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setFilters({ ...filters, category: null })}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    background: !filters.category ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#334155'
                  }}
                >
                  All Posts
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.category}
                    onClick={() => setFilters({ ...filters, category: cat.category })}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem',
                      background: filters.category === cat.category ? '#f1f5f9' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#334155',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{getCategoryLabel(cat.category)}</span>
                    <span style={{ color: '#94a3b8' }}>({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Popular Tags
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tags.slice(0, 10).map(tag => (
                    <button
                      key={tag.tag}
                      onClick={() => setFilters({ ...filters, tag: tag.tag })}
                      style={{
                        padding: '0.5rem 1rem',
                        background: filters.tag === tag.tag ? '#3b82f6' : '#f1f5f9',
                        color: filters.tag === tag.tag ? 'white' : '#475569',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      #{tag.tag} ({tag.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
