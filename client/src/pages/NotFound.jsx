import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404</h1>
    <p>Page introuvable.</p>
    <Link to="/">Retour à l'accueil</Link>
  </div>
);

export default NotFound;
