import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Notification from '../../../Notification/Notification';
import apiClient from '../../../apiClient';
import './ArchivedClients.css';

const ArchivedClients = () => {
  const [clients, setClients] = useState([]);
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
    const fetchArchivedClients = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/clients/archived'); 
        const formattedClients = response.data.map(user => ({
          id: user.id,
          name: user.name,
          address: user.address || 'Не указан',
          archivingState: user.archivingState
        }));
        setClients(formattedClients);     
      } 
      catch (error) {
        showNotification(`Ошибка при получении архивных клиентов.`);
        console.error('Ошибка при получении архивных клиентов:', error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchArchivedClients();
  }, []);

  if (loading) {
    return <div className="archived-items-loading">Загрузка архивных клиентов...</div>;
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
        <h1>Архивные клиенты</h1>
        <div className="archived-items-actions">
          <Link to="/clients" className="btn btn-apply-to-work">Назад к клиентам</Link>
        </div>
      </div>
      
      <div className="archived-items-table-container">
        {clients.length === 0 ? (
          <div className="no-archived-items">
            Нет архивных клиентов
          </div>
        ) : (
          <table className="archived-items-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Адрес</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="archived-item-row">
                  <td>
                    <Link to={`/clients/${client.id}`} className="archived-item-link">
                      {client.name}
                    </Link>
                  </td>
                  <td>{client.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArchivedClients;