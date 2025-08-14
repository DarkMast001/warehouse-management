import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../../../Notification/Notification';
import apiClient from '../../../apiClient';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState({
    name: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

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

  const handleInputChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!clientData.name.trim() || !clientData.address.trim()) {
      showNotification('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      setLoading(true);
      const requestBody = {
        name: clientData.name,
        address: clientData.address
      };
      await apiClient.post('/clients', requestBody);
      navigate('/clients');
    } 
    catch (error) {
      if (error.status == 409) {
        showNotification('Клиент с таким именем уже существует.');
      }
      else {
        showNotification(`Ошибка при создании клиента: ${error}`);
        console.error('Ошибка при создании клиента:', error);
      }
    } 
    finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <div className="add-item">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="add-item-header">
        <h1>Добавить клиента</h1>
        <div className="add-item-actions">
          <button 
            className="btn btn-add-save" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="btn btn-cancel" onClick={handleCancel}>Отмена</button>
        </div>
      </div>

      <div className="item-form">
        <div className="form-group">
          <label className="form-label">Наименование:</label>
          <input
            type="text"
            className="form-input"
            value={clientData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Введите наименование клиента"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Адрес:</label>
          <input
            type="text"
            className="form-input"
            value={clientData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Введите адрес клиента"
          />
        </div>
      </div>
    </div>
  );
};

export default AddClient;