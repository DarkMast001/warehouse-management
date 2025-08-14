import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../../../Notification/Notification';
import apiClient from '../../../apiClient';
import './AddMeasureUnit.css';

const AddMeasureUnit = () => {
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
      showNotification('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      setLoading(true);
      const requestBody = {
        name: resourceData.name
      };
      await apiClient.post('/measureunits', requestBody);
      navigate('/measureunits');
    } 
    catch (error) {
      if (error.status == 409) {
        showNotification('Единица измерения с таким названием уже существует.');
      }
      else {
        showNotification(`Ошибка при создании единиц измерения.`);
        console.error('Ошибка при создании единиц измерения:', error);
      }
    } 
    finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/measureunits');
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
        <h1>Добавить единицу измерения</h1>
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
            placeholder="Введите наименование единицы измерения"
          />
        </div>
      </div>
    </div>
  );
}

export default AddMeasureUnit;