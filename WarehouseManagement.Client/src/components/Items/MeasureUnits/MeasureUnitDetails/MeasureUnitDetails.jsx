import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MeasureUnitDetails.css';

const MeasureUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`https://localhost:7111/measureunits/${id}`);
        const formattedClient = {
          id: response.data.id,
          name: response.data.name,
          archivingState: response.data.archivingState
        };
        setResource(formattedClient);
        setLoading(false);
      } 
      catch (error) {
        console.error('Ошибка при получении единиц измерения:', error);
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
      const requestBody = {
        newName: resource.name
      };
      await axios.put(`https://localhost:7111/measureunits/${id}`, requestBody);
      navigate('/measureunits');
    } 
    catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7111/measureunits/${id}`);
      navigate('/measureunits');
    }
    catch (error) {
      if (error.status === 409) {
        alert("Нельзя удалить эту единицу измерения, так как она задействована.");
      }
      else{
        console.error("Ошибка при удалении: ", error);
      }
    }
  };

  const handleArchive = async () => {
    try {
      await axios.post(`https://localhost:7111/measureunits/${id}/archive`);
      setResource(prev => ({ ...prev, archivingState: 0 }));
      navigate("/measureunits");
    }
    catch (error) {
      console.error("Ошибка при архивации: ", error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.post(`https://localhost:7111/measureunits/${id}/unarchive`);
      setResource(prev => ({ ...prev, archivingState: 1 }));
      navigate(`/measureunits/archived`);
    } catch (error) {
      console.error('Ошибка при возврате из архива:', error);
    }
  };

  return (
    <div className="item-details">
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