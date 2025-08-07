import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ClientDetails.css';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`https://localhost:7111/clients/${id}`);
        const formattedClient = {
          id: response.data.id,
          name: response.data.name,
          address: response.data.address || 'Не указан',
          archivingState: response.data.archivingState
        };
        setClient(formattedClient);
        setLoading(false);
      } 
      catch (error) {
        console.error('Ошибка при получении клиента:', error);
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) {
    return <div className="item-details-loading">Загрузка...</div>;
  }

  if (!client) {
    return <div className="item-details-error">Клиент не найден</div>;
  }

  const handleInputChange = (field, value) => {
    setClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const requestBody = {
        newName: client.name,
        newAddress: client.address
      };
      await axios.put(`https://localhost:7111/clients/${id}`, requestBody);
      navigate('/clients');
    } 
    catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7111/clients/${id}`);
      navigate('/clients');
    }
    catch (error) {
      if (error.status === 409) {
        alert("Нельзя удалить этого клиента, так как он задействован в одном или более документах");
      }
      else{
        console.error("Ошибка при удалении: ", error);
      }
    }
  };

  const handleArchive = async () => {
    try {
      await axios.post(`https://localhost:7111/clients/${id}/archive`);
      setClient(prev => ({ ...prev, archivingState: 0 }));
      navigate("/clients");
    }
    catch (error) {
      console.error("Ошибка при архивации: ", error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.post(`https://localhost:7111/clients/${id}/unarchive`);
      setClient(prev => ({ ...prev, archivingState: 1 }));
      navigate(`/clients/archived`);
    } catch (error) {
      console.error('Ошибка при возврате из архива:', error);
    }
  };

  return (
    <div className="item-details">
      <div className="item-details-header">
        <h1>Клиент: {client.name}</h1>
        <div className="item-details-actions">
          <button className="btn btn-add-save" onClick={handleSave}>Сохранить</button>
          <button className="btn btn-delete" onClick={handleDelete}>Удалить</button>
          {client.archivingState === 0 ? (
            <button className="btn btn-archive" onClick={handleArchive}>В архив</button>
          ) : (
            <button className="btn btn-apply-to-work" onClick={handleUnarchive}>В работу</button>
          )}
        </div>
      </div>

      <div className="item-form">
        <div className="form-group">
          <label className="form-label">Наименование:</label>
          <input
            type="text"
            className="form-input"
            value={client.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Адрес:</label>
          <input
            type="text"
            className="form-input"
            value={client.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;