import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DoodleCard from './DoodleCard';

function Gallery() {
  const [doodles, setDoodles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    async function fetchDoodles() {
      const { data, error } = await supabase
        .from('doodles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message);
      } else {
        setDoodles(data);
      }
      setLoading(false);
    }

    fetchDoodles();
  }, []);

  if (loading) return <p>Loading gallery...</p>;
  if (fetchError) return <p style={{ color: 'red' }}>Error: {fetchError}</p>;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      {doodles.map((doodle) => (
        <DoodleCard key={doodle.id} doodle={doodle} />
      ))}
    </div>
  );
}

export default Gallery;