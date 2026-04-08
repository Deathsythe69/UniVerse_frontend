import React, { useState, useEffect, useContext, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Calendar, MapPin, Building, Plus } from 'lucide-react';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = 'http://localhost:5000';

const mockEventsData = [
  { _id: 'mock1', title: 'Holi Festival', description: 'Google Calendar (Hindu Holidays) - Festival of Colors', type: 'holiday', date: '2026-03-03T00:00:00.000Z', organizer: 'Google Calendar' },
  { _id: 'mock2', title: 'Odd Semester Final Exam Notice', description: 'Official notice regarding the upcoming final examination schedule for BTech 3rd, 5th, and 7th Sems.', type: 'academic', date: '2026-05-15T09:00:00.000Z', organizer: 'BPUT' },
  { _id: 'mock3', title: 'Diwali', description: 'Google Calendar (Hindu Holidays) - Festival of Lights', type: 'holiday', date: '2026-11-08T00:00:00.000Z', organizer: 'Google Calendar' },
  { _id: 'mock4', title: 'Registration for Even Semester', description: 'Late registration dates announced for the upcoming even semester.', type: 'academic', date: '2026-04-20T10:00:00.000Z', organizer: 'BPUT' },
  { _id: 'mock5', title: 'Dussehra', description: 'Google Calendar (Hindu Holidays) - Victory of Good over Evil', type: 'holiday', date: '2026-10-18T00:00:00.000Z', organizer: 'Google Calendar' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

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
      const combined = [...res.data, ...mockEventsData].sort((a,b) => new Date(a.date) - new Date(b.date));
      setEvents(combined);
    } catch (err) {
      console.error(err);
      setEvents(mockEventsData);
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

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 gap-6"
      >
        {events.length === 0 ? (
          <motion.div variants={itemVariants} className="glass-card backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-10 text-center text-gray-500 font-bold text-xl rounded-2xl">No upcoming events found.</motion.div>
        ) : (
          events.map(event => (
            <motion.div 
              variants={itemVariants} 
              key={event._id} 
              whileHover={{ y: -5, scale: 1.01 }}
              className="glass-card backdrop-blur-xl bg-black/40 border border-white/10 hover:border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,255,65,0.15)] p-6 flex flex-col md:flex-row gap-6 transition-all duration-300 group rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="md:w-1/3 h-48 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative border border-[var(--glass-border)] group-hover:border-[var(--neon-cyan)] transition-colors">
                {event.image ? (
                  <img src={`${BASE_URL}${event.image}`} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--neon-purple)] group-hover:scale-110 transition-transform duration-500">
                    <Calendar className="w-16 h-16 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--neon-cyan)] uppercase tracking-wider border border-[var(--neon-cyan)]/30 shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                  {event.type}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col z-10">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--neon-cyan)] transition-colors">{event.title}</h3>
                <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 text-[var(--neon-cyan)]" />
                    <span className="font-medium">{moment(event.date).format('MMMM Do YYYY, h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    {event.location ? (
                      <>
                        <MapPin className="w-4 h-4 text-[var(--neon-pink)]" />
                        <span>{event.location}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 italic text-xs">No location specified</span>
                    )}
                  </div>
                  {event.organizer && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Building className="w-4 h-4 text-[var(--neon-purple)]" />
                      <span className="text-white/80 font-medium">{event.organizer}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

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
