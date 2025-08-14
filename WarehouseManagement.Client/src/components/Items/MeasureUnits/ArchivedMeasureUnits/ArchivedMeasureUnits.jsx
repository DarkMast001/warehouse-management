import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Notification from '../../../Notification/Notification';
import apiClient from '../../../apiClient';
import './ArchivedMeasureUnits.css';

const ArchivedMeasureUnits = () => {
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
    const fetchArchivedResources = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/measureunits/archived'); 
		    const formattedClients = response.data.map(user => ({
          id: user.id,
          name: user.name,
          archivingState: user.archivingState
        }));
        setResources(formattedClients);    
      } 
      catch (error) {
        showNotification(`Ошибка при получении архивных единиц измерения.`);
        console.error('Ошибка при получении архивных единиц измерения:', error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchArchivedResources();
  }, []);

  if (loading) {
    return <div className="archived-items-loading">Загрузка архивных единиц измерения...</div>;
  }

  return (
    <div className="archived-items">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="archived-items-header">
        <h1>Архивные единицы измерения</h1>
        <div className="archived-items-actions">
          <Link to="/measureunits" className="btn btn-apply-to-work">Назад к единицам измерения</Link>
        </div>
      </div>
      
      <div className="archived-items-table-container">
        {resources.length === 0 ? (
          <div className="no-archived-items">
            Нет архивных единиц измерения
          </div>
        ) : (
          <table className="archived-items-table">
            <thead>
              <tr>
                <th>Наименование</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="archived-item-row">
                  <td>
                    <Link to={`/measureunits/${resource.id}`} className="archived-item-link">
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

export default ArchivedMeasureUnits;