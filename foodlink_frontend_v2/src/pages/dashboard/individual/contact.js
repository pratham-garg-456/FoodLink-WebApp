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

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/contact`,
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log(response.data);
        alert('Form submitted successfully!');
      } catch (error) {
        console.error('Submission error:', error);
        alert('Error submitting the form.');
      }
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
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email:"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="tel"
              name="phone"
              placeholder="Phone:"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

            <select
              name="subject"
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
        <div className="contact-info p-4 flex flex-col items-center justify-center">
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
          <h2 className="text-2xl font-bold mb-4 mt-6">Donations</h2>
          <p>
            <strong>Email:</strong> donations@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 234-567-8901
          </p>
          <h2 className="text-2xl font-bold mb-4 mt-6">Volunteer</h2>
          <p>
            <strong>Email:</strong> volunteer@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 345-678-9012
          </p>
          <h2 className="text-2xl font-bold mb-4 mt-6">Technical Support</h2>
          <p>
            <strong>Email:</strong> support@foodlink.com
          </p>
          <p>
            <strong>Phone:</strong> 456-789-0123
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
