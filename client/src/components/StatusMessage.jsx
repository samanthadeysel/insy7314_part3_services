function StatusMessage({ message, type = 'info' }) {
  if (!message) {
    return null;
  }

  const style = {
    padding: '10px 14px',
    borderRadius: '4px',
    margin: '10px 0',
    fontSize: '0.9rem',
    backgroundColor: type === 'error' ? '#fee2e2' : '#e0f2fe',
    color: type === 'error' ? '#991b1b' : '#0369a1',
    border: `1px solid ${type === 'error' ? '#fca5a5' : '#bae6fd'}`
  };

  return <p style={style}>{message}</p>;
}

export default StatusMessage;