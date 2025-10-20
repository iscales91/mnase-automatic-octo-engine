import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2, Edit, Search, Image, Video, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MediaManagement = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    category: 'general',
    title: '',
    description: '',
    tags: ''
  });
  const [editingMedia, setEditingMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = localStorage.getItem('token');
  const categories = ['events', 'programs', 'facilities', 'general'];

  useEffect(() => {
    fetchMedia();
  }, [activeCategory]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/media/category/${activeCategory}`);
      setMedia(response.data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 500 * 1024 * 1024; // 10MB for images, 500MB for videos
      if (file.size > maxSize) {
        toast.error(`File too large. Max size: ${file.type.startsWith('image/') ? '10MB' : '500MB'}`);
        return;
      }
      setUploadFile(file);
      if (!uploadData.title) {
        setUploadData({...uploadData, title: file.name});
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadData.category);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('tags', uploadData.tags);

    try {
      await axios.post(`${API}/media/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Media uploaded successfully!');
      setUploadFile(null);
      setUploadData({ category: 'general', title: '', description: '', tags: '' });
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    }
  };

  const handleUpdate = async (mediaId) => {
    try {
      await axios.put(`${API}/media/update`, {
        media_id: mediaId,
        ...editingMedia
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Media updated successfully!');
      setEditingMedia(null);
      fetchMedia();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;
    
    try {
      await axios.delete(`${API}/media/${mediaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Media deleted successfully!');
      fetchMedia();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchMedia();
      return;
    }

    try {
      const response = await axios.get(`${API}/media/search/${searchQuery}`, {
        params: { category: activeCategory !== 'all' ? activeCategory : null }
      });
      setMedia(response.data.results || []);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Media Gallery Management</h2>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={24} /> Upload Media
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>File *</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                required
              />
              {uploadFile && (
                <p className="text-sm text-gray-600 mt-1">
                  {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div>
              <Label>Category *</Label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                {categories.map(cat => (
                  <key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={uploadData.tags}
                onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                placeholder="tournament, 2024, championship"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              rows={3}
            />
          </div>
          <Button type="submit">Upload Media</Button>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Search</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or tags..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <Button
          onClick={() => setActiveCategory('all')}
          variant={activeCategory === 'all' ? 'default' : 'outline'}
        >
          All Media
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            variant={activeCategory === cat ? 'default' : 'outline'}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No media found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Media Preview */}
              <div className="relative aspect-square bg-gray-100">
                {item.file_type === 'image' ? (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye size={12} /> {item.views || 0}
                </div>
              </div>

              {/* Media Info */}
              {editingMedia?.id === item.id ? (
                <div className="p-3 space-y-2">
                  <Input
                    value={editingMedia.title}
                    onChange={(e) => setEditingMedia({...editingMedia, title: e.target.value})}
                    placeholder="Title"
                  />
                  <Textarea
                    value={editingMedia.description}
                    onChange={(e) => setEditingMedia({...editingMedia, description: e.target.value})}
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(item.id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingMedia(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <h4 className="font-semibold truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 truncate">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMedia(item)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
