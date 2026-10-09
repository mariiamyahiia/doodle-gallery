// src/components/Gallery.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DoodleCard from './DoodleCard';
import Lightbox from './Lightbox';

function mergeDoodles(existing, incoming) {
  const byId = new Map();
  [...existing, ...incoming].forEach((d) => byId.set(d.id, d));
  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

function Gallery() {
  const [doodles, setDoodles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel('doodles-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'doodles' },
        (payload) => {
          setDoodles((prev) => mergeDoodles(prev, [payload.new]));
        }
      )
      .subscribe();

    async function fetchDoodles() {
      const { data, error } = await supabase
        .from('doodles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message);
      } else {
        setDoodles((prev) => mergeDoodles(prev, data));
      }
      setLoading(false);
    }

    fetchDoodles();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p className="status">Loading gallery...</p>;
  if (fetchError) return <p className="error">Error: {fetchError}</p>;
  if (doodles.length === 0) {
    return <p className="status">No doodles yet. Be the first!</p>;
  }

  return (
    <>
      <div className="gallery-grid">
        {doodles.map((doodle) => (
          <DoodleCard key={doodle.id} doodle={doodle} onOpen={setSelected} />
        ))}
      </div>

      {selected && (
        <Lightbox doodle={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default Gallery;