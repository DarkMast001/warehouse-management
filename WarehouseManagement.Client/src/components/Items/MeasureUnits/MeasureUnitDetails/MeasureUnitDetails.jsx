import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../../../Notification/Notification';
import apiClient from '../../../apiClient';
import './MeasureUnitDetails.css';

const MeasureUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
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
        const response = await apiClient.get(`/measureunits/${id}`);
        const formattedClient = {
          id: response.data.id,
          name: response.data.name,
          archivingState: response.data.archivingState
        };
        setResource(formattedClient);
      } 
      catch (error) {
        showNotification(`Ошибка при получении единиц измерения.`);
        console.error('Ошибка при получении единиц измерения:', error);
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

  if (!resource) {
    return <div className="item-details-error">Единица измерения не найдена</div>;
  }

  const handleInputChange = (field, value) => {
    setResource(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const requestBody = {
        newName: resource.name
      };
      await apiClient.put(`/measureunits/${id}`, requestBody);
      navigate('/measureunits');
    } 
    catch (error) {
      if (error.status == 409) {
        showNotification('Единицы измерения с таким именем уже существуют.');
      }
      else {
        showNotification(`Ошибка при сохранении.`)
        console.error('Ошибка при сохранении:', error);
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/measureunits/${id}`);
      navigate('/measureunits');
    }
    catch (error) {
      if (error.status === 409) {
        showNotification('Нельзя удалить эту единицу измерения, так как она задействована.');
      }
      else{
        showNotification(`Ошибка при удалении.`);
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const handleArchive = async () => {
    try {
      await apiClient.post(`/measureunits/${id}/archive`);
      setResource(prev => ({ ...prev, archivingState: 0 }));
      navigate("/measureunits");
    }
    catch (error) {
      if (error.status == 409) {
        showNotification('Единица измерения уже в архиве.');
      }
      else {
        showNotification(`Ошибка при архивации.`);
        console.error('Ошибка при архивации:', error);
      }
    }
  };

  const handleUnarchive = async () => {
    try {
      await apiClient.post(`/measureunits/${id}/unarchive`);
      setResource(prev => ({ ...prev, archivingState: 1 }));
      navigate(`/measureunits/archived`);
    } catch (error) {
      if (error.status == 409) {
        showNotification('Единица измерения уже в работе.');
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
        <h1>Единица измерения: {resource.name}</h1>
        <div className="item-details-actions">
          <button className="btn btn-add-save" onClick={handleSave}>Сохранить</button>
          <button className="btn btn-delete" onClick={handleDelete}>Удалить</button>
          {resource.archivingState === 0 ? (
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
            value={resource.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default MeasureUnitDetails;