/* eslint-disable react-hooks/exhaustive-deps */
// AdminPage.jsx
import { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

const AdminSeo = () => {
  const { tenantData, setTenantData } = useTenant();
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: '',
    url: ''
  });
  const [whatsapp, setWhatsapp] = useState({
    phoneNumber: '',
    accountName: '',
    chatMessage: '',
    avatar: '',
    statusMessage: ''
  });

  useEffect(() => {
    if (tenantData) {
      // Initialize form fields if data exists
      setSeo(tenantData.seo || seo);
      setWhatsapp(tenantData.whatsapp || whatsapp);
    }
  }, [tenantData]);

  const handleSeoChange = (e) => {
    setSeo({ ...seo, [e.target.name]: e.target.value });
  };

  const handleWhatsappChange = (e) => {
    setWhatsapp({ ...whatsapp, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Combine the updated SEO and WhatsApp data with any additional tenantData
    const updatedData = { ...tenantData, seo, whatsapp };

    try {
      const response = await fetch('/api/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Failed to update data');
      const data = await response.json();
      setTenantData(data);
      alert('Data updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating data');
    }
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <form onSubmit={handleSubmit}>
        <h2>SEO Data</h2>
        <div>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={seo.title}
              onChange={handleSeoChange}
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={seo.description}
              onChange={handleSeoChange}
            />
          </label>
        </div>
        <div>
          <label>
            Keywords:
            <input
              type="text"
              name="keywords"
              value={seo.keywords}
              onChange={handleSeoChange}
            />
          </label>
        </div>
        <div>
          <label>
            URL:
            <input
              type="text"
              name="url"
              value={seo.url}
              onChange={handleSeoChange}
            />
          </label>
        </div>

        <h2>WhatsApp Data</h2>
        <div>
          <label>
            Phone Number:
            <input
              type="text"
              name="phoneNumber"
              value={whatsapp.phoneNumber}
              onChange={handleWhatsappChange}
            />
          </label>
        </div>
        <div>
          <label>
            Account Name:
            <input
              type="text"
              name="accountName"
              value={whatsapp.accountName}
              onChange={handleWhatsappChange}
            />
          </label>
        </div>
        <div>
          <label>
            Chat Message:
            <input
              type="text"
              name="chatMessage"
              value={whatsapp.chatMessage}
              onChange={handleWhatsappChange}
            />
          </label>
        </div>
        <div>
          <label>
            Avatar URL:
            <input
              type="text"
              name="avatar"
              value={whatsapp.avatar}
              onChange={handleWhatsappChange}
            />
          </label>
        </div>
        <div>
          <label>
            Status Message:
            <input
              type="text"
              name="statusMessage"
              value={whatsapp.statusMessage}
              onChange={handleWhatsappChange}
            />
          </label>
        </div>

        <button type="submit">Update Data</button>
      </form>
    </div>
  );
};

export default AdminSeo;
