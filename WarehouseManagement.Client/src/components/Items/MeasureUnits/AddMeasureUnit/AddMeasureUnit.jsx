import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AddMeasureUnit.css';

const AddMeasureUnit = () => {
	const navigate = useNavigate();
  const [resourceData, setResourceData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setResourceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!resourceData.name.trim()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      setLoading(true);
      const requestBody = {
        name: resourceData.name
      };
      await axios.post('https://localhost:7111/measureunits', requestBody);
      navigate('/measureunits');
    } catch (error) {
      console.error('Ошибка при создании единиц измерения:', error);
      alert('Ошибка при создании единиц измерения! Единица измерения с таким названием уже существует.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/measureunits');
  };

  return (
    <div className="add-item">
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