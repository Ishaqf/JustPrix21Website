// Per spec: translate the known phone/laptop/tv-style keys; anything
// else (a category we haven't keyed yet) falls back to the raw key
// rather than disappearing or throwing.
const SPEC_LABELS = {
  ram: 'RAM',
  storage: 'Stockage',
  screen: 'Écran',
  battery: 'Batterie',
  processor: 'Processeur',
  camera: 'Appareil photo',
};

const formatLabel = (key) => SPEC_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);

const SpecsTable = ({ specs }) => {
  const entries = Object.entries(specs || {}).filter(([, value]) => value !== '' && value != null);

  if (entries.length === 0) return null;

  return (
    <table className="w-full text-sm">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key} className="border-b border-black/5">
            <td className="py-2 pr-4 font-medium text-(--color-ink)">{formatLabel(key)}</td>
            <td className="py-2 text-(--color-muted)">{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SpecsTable;
