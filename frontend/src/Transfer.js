import React, { useState } from 'react';

const Transfer = () => {
  const [fromNumber, setFromNumber] = useState('');
  const [toNumber, setToNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle the logic of transferring numbers
    alert(`Transferring from ${fromNumber} to ${toNumber}`);
  };

  return (
    <div className="container mt-5">
      <h1>TRANSFER</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="label-form"><strong>FROM</strong></label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter number to transfer from"
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="label-form"><strong>TO</strong></label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter number to transfer to"
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default Transfer;
