import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../apiClient';
import Notification from '../../../Notification/Notification';
import './ResourcesList.css';

const ResourcesList = () => {
  const [resources, setResources] = useState([]);
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
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/resources/active');
        const formattedResources = response.data.map(resource => ({
          id: resource.id,
          name: resource.name,
          archivingState: resource.archivingState
        }));
        setResources(formattedResources);
      } 
      catch (error) {
        showNotification('Ошибка при получении клиентов.');
        console.error(`Ошибка при получении клиентов:`, error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return <div className="items-loading">Загрузка архивных единиц измерения...</div>;
  }

	return(
		<div className="items-list">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="items-header">
        <h1>Ресурсы</h1>
        <div className="items-actions">
          <Link to="/resources/new" className="btn btn-add-save">Добавить</Link>
          <Link to="/resources/archived" className="btn btn-archive">К архиву</Link>
        </div>
      </div>
      
      <div className="items-table-container">
        {resources.length === 0 ? (
          <div className="no-items">
            Нет ресурсов
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Наименование</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="item-row">
                  <td>
                    <Link to={`/resources/${resource.id}`} className="item-link">
                      {resource.name}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
	);
}

export default ResourcesList;