import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResourceDetails.css';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`https://localhost:7111/resources/${id}`);
        const formattedClient = {
          id: response.data.id,
          name: response.data.name,
          archivingState: response.data.archivingState
        };
        setResource(formattedClient);
        setLoading(false);
      } 
      catch (error) {
        console.error('Ошибка при получении ресурса:', error);
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) {
    return <div className="item-details-loading">Загрузка...</div>;
  }

  if (!resource) {
    return <div className="item-details-error">Ресурс не найден</div>;
  }

  const handleInputChange = (field, value) => {
    setResource(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const requestBody = {
        newName: resource.name
      };
      await axios.put(`https://localhost:7111/resources/${id}`, requestBody);
      navigate('/resources');
    } 
    catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7111/resources/${id}`);
      navigate('/resources');
    }
    catch (error) {
      if (error.status === 409) {
        alert("Нельзя удалить этот ресурс, так как он задействован.");
      }
      else{
        console.error("Ошибка при удалении: ", error);
      }
    }
  };

  const handleArchive = async () => {
    try {
      await axios.post(`https://localhost:7111/resources/${id}/archive`);
      setResource(prev => ({ ...prev, archivingState: 0 }));
      navigate("/resources");
    }
    catch (error) {
      console.error("Ошибка при архивации: ", error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.post(`https://localhost:7111/resources/${id}/unarchive`);
      setResource(prev => ({ ...prev, archivingState: 1 }));
      navigate(`/resources/archived`);
    } catch (error) {
      console.error('Ошибка при возврате из архива:', error);
    }
  };

  return (
    <div className="item-details">
      <div className="item-details-header">
        <h1>Ресурс: {resource.name}</h1>
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

export default ResourceDetails;