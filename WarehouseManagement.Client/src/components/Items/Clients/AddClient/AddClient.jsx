import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState({
    name: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!clientData.name.trim() || !clientData.address.trim()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      setLoading(true);
      
      const requestBody = {
        name: clientData.name,
        address: clientData.address
      };

      await axios.post('https://localhost:7111/clients', requestBody);
      
      navigate('/clients');
    } catch (error) {
      console.error('Ошибка при создании клиента:', error);
      alert('Ошибка при создании клиента! Клиент с таким именем уже существует.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <div className="add-item">
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