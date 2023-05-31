import React, { useState } from 'react';
import axios from 'axios';

const UserPrompt: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/prompt', 
      { prompt: input },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(res.data);
      setResponse(res.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Enter your prompt"
          rows={10}
          style={{ width: '100%', resize: 'none' }}
        />
        <button type="submit">Submit</button>
      </form>
      {isLoading && <div>Loading...</div>}
      {response && <div>{response}</div>}
    </div>
  );
};

export default UserPrompt;
