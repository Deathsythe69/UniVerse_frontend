import React, { useState, useEffect, useContext, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Calendar, MapPin, Building, Plus } from 'lucide-react';
import moment from 'moment';

const BASE_URL = 'http://localhost:5000';

const EventsPage = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '', description: '', type: 'seminar', date: '', location: '', organizer: ''
  });
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'supervisor';

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (image) formData.append('image', image);

      await api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsCreating(false);
      setForm({ title: '', description: '', type: 'seminar', date: '', location: '', organizer: '' });
      setImage(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] items-center flex gap-3">
          <Calendar className="w-8 h-8 text-[var(--neon-cyan)]"/> Campus Events
        </h2>
        {isAdminOrMod && (
          <button onClick={() => setIsCreating(true)} className="btn-neon btn-neon-primary px-4 py-2 flex items-center gap-2">
            <Plus className="w-5 h-5"/> New Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500 font-bold text-xl">No upcoming events found.</div>
        ) : (
          events.map(event => (
            <div key={event._id} className="glass-card p-6 flex flex-col md:flex-row gap-6 hover:-translate-y-1 transition-transform group">
              <div className="md:w-1/3 h-48 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative border border-[var(--glass-border)] group-hover:border-[var(--neon-cyan)] transition-colors">
                {event.image ? (
                  <img src={`${BASE_URL}${event.image}`} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--neon-purple)]">
                    <Calendar className="w-16 h-16 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--neon-pink)] uppercase tracking-wider border border-[var(--neon-pink)]/30">
                  {event.type}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 text-[var(--neon-cyan)]" />
                    <span className="font-medium">{moment(event.date).format('MMMM Do YYYY, h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--neon-pink)]" />
                    <span>{event.location}</span>
                  </div>
                  {event.organizer && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Building className="w-4 h-4 text-[var(--neon-purple)]" />
                      <span>{event.organizer}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-8 relative my-8">
            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-2xl font-bold text-white mb-6">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required type="text" placeholder="Event Title" className="input-glass w-full" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <textarea required placeholder="Description" className="input-glass w-full h-32 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="datetime-local" className="input-glass w-full text-white" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                <select className="input-glass w-full bg-[#111]" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="placement">Placement Drive</option>
                  <option value="internship">Internship</option>
                  <option value="other">Other</option>
                </select>
                <input required type="text" placeholder="Location" className="input-glass w-full" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                <input type="text" placeholder="Organizer (Optional)" className="input-glass w-full" value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} />
              </div>

              <div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImage(e.target.files[0])} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current.click()} className="btn-neon text-white w-full py-3 opacity-80 hover:opacity-100 flex justify-center items-center border border-dashed border-gray-500 rounded-xl">
                  {image ? `Selected: ${image.name}` : 'Upload Event Poster (Optional)'}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-neon btn-neon-primary w-full py-3 mt-4 text-lg">
                {loading ? 'Creating...' : 'Publish Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default EventsPage;
