import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.subject) {
      try {
        const response = await axios.post('/api/contact', formData);
        console.log(response.data); // handle response as needed
        navigate('/thankyou'); // Navigate to Thank You page on successful submission
        alert('Form submitted successfully!');
      } catch (error) {
        console.error('Submission error:', error);
        alert('Error submitting the form.');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="contact-form bg-white p-4 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name:"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email:"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone:"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <select
              name="subject"
              required
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Donations">Donations</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Technical Support">Technical Support</option>
            </select>
            <textarea
              name="message"
              placeholder="Message (Optional):"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded h-32"
            />
            <button type="submit" className="w-full bg-black text-white px-4 py-2 rounded">
              Submit
            </button>
          </form>
        </div>
        <div className="contact-info p-4">
          <h2 className="text-2xl font-bold mb-4">General Inquiries</h2>
          <p>
            <strong>Email:</strong> info@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 123-456-7890
          </p>
          <p>
            <strong>Address:</strong> 123 Food Link Ave, City, State, ZIP Code
          </p>
          <h3 className="text-xl font-bold mt-4">Donations</h3>
          <p>
            <strong>Email:</strong> donations@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 123-456-7891
          </p>
          <h3 className="text-xl font-bold mt-4">Volunteer Services</h3>
          <p>
            <strong>Email:</strong> volunteer@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 123-456-7892
          </p>
          <h3 className="text-xl font-bold mt-4">Technical Support</h3>
          <p>
            <strong>Email:</strong> support@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 123-456-7893
          </p>
        </div>
        <div className="picture-space">
          <img src="/images/contact-us.jpg" alt="Display" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Contact;
