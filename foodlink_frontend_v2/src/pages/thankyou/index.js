import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Thank You!</h1>
      <p>Thank you for contacting us. We will get back to you soon.</p>
      <Link to="/" className="mt-4 inline-block bg-black text-white px-4 py-2 rounded">
        Go Home
      </Link>
    </div>
  );
};

export default ThankYou;
