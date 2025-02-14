import React from 'react';
import Layout from '../../layout';

const Events = ({ userRole }) => {
  return (
    <Layout userRole={userRole}>
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Manage Events</h1>
        <p className="mb-4">This is the placeholder page for managing events.</p>
      </div>
    </Layout>
  );
};

export default Events;