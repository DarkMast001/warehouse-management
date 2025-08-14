import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../apiClient';
import Notification from '../../../Notification/Notification';
import './AddResource.css';

const AddResource = () => {
	const navigate = useNavigate();
  const [resourceData, setResourceData] = useState({
    name: ''
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
    setResourceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!resourceData.name.trim()) {
      showNotification('Пожалуйста, заполните все поля.');
      return;
    }

    try {
      setLoading(true);

      const requestBody = {
        name: resourceData.name
      };

      await apiClient.post('/resources', requestBody);

      navigate('/resources');
    } 
    catch (error) {
      if (error.status == 409) {
        showNotification('Ресурс с таким названием уже существует.');
      }
      else {
        console.error('Ошибка при создании ресурса:', error);
        showNotification('Ошибка при создании ресурса!');
      }
    } 
    finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/resources');
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
        <h1>Добавить ресурс</h1>
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
            value={resourceData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Введите наименование ресурса"
          />
        </div>
      </div>
    </div>
  );
}

export default AddResource;