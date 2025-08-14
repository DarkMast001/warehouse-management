import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../../../Notification/Notification';
import apiClient from '../../../apiClient';
import './ClientDetails.css';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'error'
  });

  const showNotification = (message, type = 'error') => {
    setNotification({
      isVisible: true,
      message,
      type
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }; 

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/clients/${id}`);
        const formattedClient = {
          id: response.data.id,
          name: response.data.name,
          address: response.data.address || 'Не указан',
          archivingState: response.data.archivingState
        };
        setClient(formattedClient);
      } 
      catch (error) {
        showNotification(`Ошибка при получении клиента.`);
        console.error('Ошибка при получении клиента:', error);
      }
      finally {
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
      setLoading(true)
      const requestBody = {
        newName: client.name,
        newAddress: client.address
      };
      await apiClient.put(`/clients/${id}`, requestBody);
      navigate('/clients');
    } 
    catch (error) {
      if (error.status == 409) {
        showNotification('Клиент с таким именем уже существует.');
      }
      else {
        showNotification(`Ошибка при сохранении.`);
        console.error('Ошибка при сохранении:', error);
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/clients/${id}`);
      navigate('/clients');
    }
    catch (error) {
      if (error.status === 409) {
        showNotification('Нельзя удалить этого клиента, так как он задействован в одном или более документах');
      }
      else{
        showNotification(`Ошибка при удалении.`);
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const handleArchive = async () => {
    try {
      await apiClient.post(`/clients/${id}/archive`);
      setClient(prev => ({ ...prev, archivingState: 0 }));
      navigate("/clients");
    }
    catch (error) {
      if (error.status == 409) {
        showNotification('Клиент уже в архиве.');
      }
      else {
        showNotification(`Ошибка при архивации.`);
        console.error('Ошибка при архивации:', error);
      }
    }
  };

  const handleUnarchive = async () => {
    try {
      await apiClient.post(`/clients/${id}/unarchive`);
      setClient(prev => ({ ...prev, archivingState: 1 }));
      navigate(`/clients/archived`);
    } catch (error) {
      if (error.status == 409) {
        showNotification('Клиент уже в работе.');
      }
      else {
        showNotification(`Ошибка при возврате из архива.`);
        console.error('Ошибка при возврате из архива:', error);
      }
    }
  };

  return (
    <div className="item-details">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

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